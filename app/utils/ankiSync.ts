import {
  AnkiCard,
  setAnkiCardAnkiNoteId,
  Highlight,
  setAnkiCardSyncWaiting,
  setAnkiCardSyncError,
  setAnkiCardSyncSuccess,
  setCollectionSyncWaiting,
  setCollectionSyncError,
  setCollectionSyncSuccess
} from '../ducks/bookReader';
import { Dispatch } from 'redux';
import { BookRecord } from '../ducks/bookManager';

type AddNoteParams = {
  note: {
    deckName: string;
    modelName: string;
    fields: {
      Text: string;
    };
    options: {
      allowDuplicate: boolean;
    };
    tags: string[];
    audio?: unknown;
  };
};

type UpdateNoteFieldsParams = {
  note: {
    id: string;
    fields: {
      Text: string;
    };
  };
};

type AnkiSyncResult = {
  status: 'success' | 'error';
  ankiNoteId?: string;
  error?: string;
};

async function invoke(action, version, params = {}) {
  return fetch('http://127.0.0.1:8765', {
    method: 'post',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action, version, params })
  })
    .then(async res => res.json())
    .then(response => {
      if (Object.getOwnPropertyNames(response).length !== 2) {
        throw new Error('response has an unexpected number of fields');
      }
      if (!response.hasOwnProperty('error')) {
        throw new Error('response is missing required error field');
      }
      if (!response.hasOwnProperty('result')) {
        throw new Error('response is missing required result field');
      }
      if (response.error) {
        throw response.error;
      }
      return response.result;
    });
}

async function syncAnkiCardCreate(
  ankiCard: AnkiCard,
  highlight: Highlight,
  book: BookRecord
): Promise<AnkiSyncResult> {
  const tags =
    book.tags
      ?.filter(tag => tag.startsWith('anki::'))
      .map(tag => tag.substr('anki::'.length)) || [];
  const params: AddNoteParams = {
    note: {
      deckName: 'Polar',
      modelName: 'Cloze',
      fields: {
        Text: ankiCard.fields[0]
      },
      options: {
        allowDuplicate: false
      },
      tags
    }
  };
  const ankiNoteId: string = await invoke('addNote', 6, params);
  return { status: 'success', ankiNoteId };
}

async function syncAnkiCardUpdate(
  ankiCard: AnkiCard,
  highlight: Highlight,
  book: BookRecord
): Promise<AnkiSyncResult> {
  if (!ankiCard.sync.ankiNoteId)
    throw new Error(
      'attempted to sync ankicards without an anki note id. create instead.'
    );

  const params: UpdateNoteFieldsParams = {
    note: {
      id: ankiCard.sync.ankiNoteId,
      fields: {
        Text: ankiCard.fields[0]
      }
    }
  };
  const response = await invoke('updateNoteFields', 6, params);
  return { status: 'success', ankiNoteId: ankiCard.sync.ankiNoteId };
}

async function testAnkiConnect() {
  try {
    const ret = await invoke('version', 6);
    if (ret === 6) return true;
  } catch (err) {
    console.error(err);
  }
  return false;
}

export default async function syncAllCards(
  dispatch: Dispatch,
  ankiCards: AnkiCard[],
  highlights: Highlight[],
  book: BookRecord
) {
  dispatch(setCollectionSyncWaiting());
  const isAnkiConnectedAvailable = await testAnkiConnect();
  if (!isAnkiConnectedAvailable) {
    console.error('AnkiConnect isnt available!');
    dispatch(setCollectionSyncError('AnkiConnect isnt available!'));
    return [];
  }

  // determine what notes we are updating and what we are creating
  const nidArray = ankiCards.map(ankiCard => ankiCard.sync?.ankiNoteId || null);
  let infoArray = [];
  try {
    infoArray = await invoke('notesInfo', 6, { notes: nidArray });
  } catch (err) {
    console.error('Couldnt retrieve note info array!');
    console.error(err);
    dispatch(setCollectionSyncError('Couldnt retrieve note info array!'));
    return [];
  }

  dispatch(setCollectionSyncWaiting());
  return Promise.all(
    ankiCards.map(async (ankiCard, index) => {
      dispatch(setAnkiCardSyncWaiting(ankiCard.id));
      const highlight = highlights.find(hl => hl.id === ankiCard.highlightId);
      if (!highlight) {
        dispatch(
          setAnkiCardSyncError(ankiCard.id, 'card is missing highlight')
        );
        console.error('card is missing highlight');
        return 'error';
      }

      let result = null;
      if (Object.keys(infoArray[index]).length === 0) {
        try {
          result = await syncAnkiCardCreate(ankiCard, highlight, book);
        } catch (err) {
          dispatch(
            setAnkiCardSyncError(
              ankiCard.id,
              'error trying to create card: ' + err
            )
          );
          console.error('error trying to create card');
          console.error(err);
          return 'error';
        }
      } else {
        try {
          result = await syncAnkiCardUpdate(ankiCard, highlight, book);
        } catch (err) {
          dispatch(
            setAnkiCardSyncError(
              ankiCard.id,
              'error trying to update card: ' + err
            )
          );
          console.error('error trying to update card');
          console.error(err);
          return 'error';
        }
      }

      console.log(result);

      if (result.status === 'error') {
        dispatch(setAnkiCardSyncError(ankiCard.id, 'error: ' + result.error));
        console.error(result.error);
        return 'error';
      }
      if (result.status === 'success') {
        if (result.ankiNoteId !== ankiCard.sync.ankiNoteId) {
          if (!result.ankiNoteId) throw new Error("this hosuldn't happen");
          dispatch(setAnkiCardAnkiNoteId(ankiCard.id, result.ankiNoteId));
        }
        dispatch(setAnkiCardSyncSuccess(ankiCard.id));
        return 'success';
      }
      dispatch(
        setAnkiCardSyncError(ankiCard.id, 'received unexpected response')
      );
      console.error('received unexpected response');
      return 'error';
    })
  )
    .then(() => {
      dispatch(setCollectionSyncSuccess());
      return 'success';
    })
    .catch(() => {
      dispatch(setCollectionSyncError('Some cards could not be synced'));
    });
}
