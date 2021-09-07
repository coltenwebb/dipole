import { BookRecord } from './bookManager';

// State

// TOC
export type TocElement = {
  id: string;
  label: string;
  href: string;
  subitems: Array<TocElement>;
};

export type LocationDescription = {
  pageNumberOfSection: number;
  totalPagesOfSection: number;
  currentSectionHref: string;
  progress?: number;
};

// ANNOTATIONS
export type Highlight = {
  id: string;
  text: string;
  cfiRange: string;
  color: 'yellow';
  addDate: number;
};

// ANKICARDS
type AnkiCardType = 'cloze' | 'basic';

type SyncStatus = 'waiting' | 'error' | 'success' | 'unsynced';

export type AnkiCard = {
  id: string;
  highlightId: string;
  type: AnkiCardType;
  fields: string[];
  additionalTags: string[];
  sync: {
    status: SyncStatus;
    ankiNoteId?: string;
    errorMsg?: string;
  };
  addDate: number;
  editDate: number;
};

export type State = {
  bookData: {
    toc?: TocElement[];
    cfi?: string;
    highlights?: Highlight[];
    ankiCards?: AnkiCard[];
  };
  bookRecord?: BookRecord;
  locationDescription?: LocationDescription;
  highlightIdInTable?: string;
  collectionSyncStatus: SyncStatus;
  collectionSyncErrorMsg?: string;
};

const initialState: State = {
  bookData: {},
  bookRecord: undefined,
  locationDescription: undefined,
  collectionSyncStatus: 'unsynced'
};

// Actions
const LOAD_BOOK = 'LOAD_BOOK';
const LOAD_TOC = 'LOAD_TOC';
const LOAD_ANKICARDS = 'LOAD_ANKICARDS';
const LOAD_HIGHLIGHTS = 'LOAD_HIGHLIGHTS';

const LOCATE = 'LOCATE';
const LOCATE_HIGHLIGHT_IN_TABLE = 'LOCATE_HIGHLIGHT_IN_TABLE';
const UPDATE_LOCATION_DESCRIPTION = 'UPDATE_LOCATION_DESCRIPTION';

const ADD_ANKICARD = 'ADD_ANKICARD';
const REMOVE_ANKICARD = 'REMOVE_ANKICARD';
const UPDATE_ANKICARD = 'UPDATE_ANKICARD';

const ADD_HIGHLIGHT = 'ADD_HIGHLIGHT';
const REMOVE_HIGHLIGHT = 'REMOVE_HIGHLIGHT';
const SORT_HIGHLIGHTS = 'SORT_HIGHLIGHTS';

const UPDATE_COLLECTION_SYNC_STATUS = 'UPDATE_ANKI_SYNC_STATUS';

const UNLOAD_BOOK = 'UNLOAD_BOOK';

// Action Creators
export const loadBook = (bookRecord: BookRecord) => ({
  type: LOAD_BOOK,
  payload: { bookRecord }
});

export const loadToc = (toc: TocElement[]) => ({
  type: LOAD_TOC,
  payload: { toc }
});

export const loadAnkiCards = (ankiCards: AnkiCard[]) => ({
  type: LOAD_ANKICARDS,
  payload: { ankiCards }
});

export const loadHighlights = (highlights: Highlight[]) => ({
  type: LOAD_HIGHLIGHTS,
  payload: { highlights }
});

export const locate = (cfi: string) => ({
  type: LOCATE,
  payload: { cfi }
});

export const locateHighlightInTable = (highlightIdInTable: string) => ({
  type: LOCATE_HIGHLIGHT_IN_TABLE,
  payload: { highlightIdInTable }
});

export const clearLocatedHighlightInTable = () => ({
  type: LOCATE_HIGHLIGHT_IN_TABLE,
  payload: { highlightIdInTable: '' }
});

export const updateLocationDescription = (
  locationDescription: LocationDescription
) => ({
  type: UPDATE_LOCATION_DESCRIPTION,
  payload: { locationDescription }
});

export const addAnkiCard = (ankiCard: AnkiCard) => ({
  type: ADD_ANKICARD,
  payload: { ankiCard }
});

export const removeAnkiCard = (id: string) => ({
  type: REMOVE_ANKICARD,
  payload: { id }
});

export const updateAnkiCardFields = (id: string, fields: string[]) => ({
  type: UPDATE_ANKICARD,
  payload: {
    ankiCard: { id, fields, editDate: Date.now(), sync: { status: 'unsynced' } }
  }
});

export const setAnkiCardSyncWaiting = (id: string) => ({
  type: UPDATE_ANKICARD,
  payload: { ankiCard: { id, sync: { status: 'waiting' } } }
});

export const setAnkiCardSyncSuccess = (id: string) => ({
  type: UPDATE_ANKICARD,
  payload: { ankiCard: { id, sync: { status: 'success' } } }
});

export const setAnkiCardAnkiNoteId = (id: string, ankiNoteId: string) => ({
  type: UPDATE_ANKICARD,
  payload: { ankiCard: { id, sync: { ankiNoteId } } }
});

export const setAnkiCardSyncError = (id: string, errorMsg: string) => ({
  type: UPDATE_ANKICARD,
  payload: {
    ankiCard: { id, sync: { status: 'error', errorMsg } }
  }
});

export const addHighlight = (highlight: Highlight) => ({
  type: ADD_HIGHLIGHT,
  payload: { highlight }
});

export const removeHighlight = (id: string) => ({
  type: REMOVE_HIGHLIGHT,
  payload: { id }
});

export const sortHighlights = (highlights: Highlight[]) => ({
  type: SORT_HIGHLIGHTS,
  payload: { highlights }
});

export const setCollectionSyncError = (errorMsg: string) => ({
  type: UPDATE_COLLECTION_SYNC_STATUS,
  payload: {
    collectionSyncStatus: 'error',
    collectionSyncErrorMsg: errorMsg
  }
});

export const setCollectionSyncSuccess = () => ({
  type: UPDATE_COLLECTION_SYNC_STATUS,
  payload: {
    collectionSyncStatus: 'success'
  }
});

export const setCollectionSyncUnsynced = () => ({
  type: UPDATE_COLLECTION_SYNC_STATUS,
  payload: {
    collectionSyncStatus: 'unsynced'
  }
});

export const setCollectionSyncWaiting = () => ({
  type: UPDATE_COLLECTION_SYNC_STATUS,
  payload: {
    collectionSyncStatus: 'waiting'
  }
});

export const unloadBook = () => ({
  type: UNLOAD_BOOK
});

// Reducer

export default function reducer(state: State, action: unknown): State {
  if (typeof state === 'undefined') return initialState;

  switch (action.type) {
    case LOAD_BOOK:
      return {
        ...state,
        bookRecord: action.payload.bookRecord
      };
    case LOAD_TOC:
      return {
        ...state,
        bookData: {
          ...(state.bookData || {}),
          toc: action.payload.toc
        }
      };
    case LOAD_ANKICARDS:
      return {
        ...state,
        bookData: {
          ...(state.bookData || {}),
          ankiCards: action.payload.ankiCards
        }
      };
    case LOAD_HIGHLIGHTS:
      return {
        ...state,
        bookData: {
          ...(state.bookData || {}),
          highlights: action.payload.highlights
        }
      };
    case LOCATE:
      return {
        ...state,
        bookData: {
          ...(state.bookData || {}),
          cfi: action.payload.cfi
        }
      };
    case LOCATE_HIGHLIGHT_IN_TABLE:
      return {
        ...state,
        highlightIdInTable: action.payload.highlightIdInTable
      };
    case UPDATE_LOCATION_DESCRIPTION:
      return {
        ...state,
        locationDescription: action.payload.locationDescription
      };
    case ADD_ANKICARD:
      return {
        ...state,
        bookData: {
          ...(state.bookData || {}),
          ankiCards: [
            ...(state.bookData?.ankiCards || []),
            action.payload.ankiCard
          ]
        }
      };
    case REMOVE_ANKICARD:
      return {
        ...state,
        bookData: {
          ...(state.bookData || {}),
          ankiCards: (state.bookData.ankiCards || []).filter(
            ankiCard => ankiCard.id !== action.payload.id
          )
        }
      };
    case UPDATE_ANKICARD:
      return {
        ...state,
        bookData: {
          ...(state.bookData || {}),
          ankiCards: (state.bookData.ankiCards || []).map(ankiCard =>
            ankiCard.id === action.payload.ankiCard.id
              ? {
                  ...ankiCard,
                  ...action.payload.ankiCard,
                  sync: { ...ankiCard.sync, ...action.payload.ankiCard.sync }
                }
              : ankiCard
          )
        }
      };
    case ADD_HIGHLIGHT:
      return {
        ...state,
        bookData: {
          ...(state.bookData || {}),
          highlights: [
            ...(state.bookData?.highlights || []),
            action.payload.highlight
          ]
        }
      };
    case REMOVE_HIGHLIGHT:
      // NOTE: REMOVES THE ANKICARDS ASSOCIATED WITH THE HIGHLIGHT
      return {
        ...state,
        bookData: {
          ...(state.bookData || {}),
          highlights: (state.bookData.highlights || []).filter(
            highlight => highlight.id !== action.payload.id
          ),
          ankiCards: (state.bookData.ankiCards || []).filter(
            ankiCard => ankiCard.highlightId !== action.payload.id
          )
        }
      };
    case SORT_HIGHLIGHTS:
      return {
        ...state,
        bookData: {
          ...(state.bookData || {}),
          highlights: action.payload.highlights
        }
      };
    case UPDATE_COLLECTION_SYNC_STATUS:
      return {
        ...state,
        collectionSyncErrorMsg: action.payload.collectionSyncErrorMsg,
        collectionSyncStatus: action.payload.collectionSyncStatus
      };
    case UNLOAD_BOOK:
      return initialState;
    default:
      return state;
  }
}
