import React, { useEffect, useRef, MutableRefObject } from 'react';
import ePub, { Rendition, EpubCFI, Contents } from 'epubjs';
import { useSelector, useDispatch } from 'react-redux';
import { v4 } from 'uuid';
import { ApplicationState } from '../../../ducks';
import { BookRecord } from '../../../ducks/bookManager';
import styles from './EpubViewer.css';
import { getBookArchivePath } from '../../../utils/fileManager';
import { remote } from 'electron';
import {
  Highlight,
  loadToc,
  locate,
  updateLocationDescription,
  addHighlight,
  sortHighlights,
  locateHighlightInTable,
  TocElement,
  LocationDescription
} from '../../../ducks/bookReader';

export default function EpubViewer() {
  const dispatch = useDispatch();

  const cfi = useSelector<ApplicationState, string>(
    state => state.bookReader.bookData?.cfi || ''
  );
  const highlights = useSelector<ApplicationState, Highlight[]>(
    state => state.bookReader.bookData?.highlights || []
  );

  const epubJsViewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>() as MutableRefObject<Rendition | null>;

  const highlightsRef = useRef<Highlight[] | null>() as MutableRefObject<
    Highlight[] | null
  >;
  highlightsRef.current = highlights;

  const bookRecord = useSelector<ApplicationState, BookRecord | undefined>(
    state => state.bookReader.bookRecord
  );

  const paginatePrev = () => {
    renditionRef?.current?.prev();
  };

  const paginateNext = () => {
    renditionRef?.current?.next();
  };

  const showContextMenu = () => {};

  const initReader = () => {
    if (epubJsViewerRef.current === null) return () => {};
    if (!bookRecord) return () => {};

    const book = ePub(getBookArchivePath(bookRecord.id, bookRecord.baseName), {
      openAs: 'epub'
    });

    book.ready.then(() => book.locations.generate(600));
    // const rendition = book.renderTo(epubJsViewerRef.current, {
    //   manager: 'continuous',
    //   flow: 'scrolled',
    //   width: '100%',
    //   height: '100%'
    // });
    const rendition = book.renderTo(epubJsViewerRef.current, {
      //flow: 'scrolled-doc',
      width: '100%',
      height: '100%',
      minSpreadWidth: 999999
    });
    renditionRef.current = rendition;

    if (cfi) rendition.display(cfi);
    else rendition.display();

    book.loaded.navigation
      .then(nav => {
        return dispatch(loadToc(nav.toc as TocElement[]));
      })
      .catch(() => {});

    rendition.on('relocated', (e: Rendition['location']) => {
      const progress =
        e.start.location && e.start.location !== -1
          ? book.locations.percentageFromCfi(e.start.cfi)
          : undefined;

      dispatch(locate(e.start.cfi));
      dispatch(
        updateLocationDescription({
          pageNumberOfSection: e.start.displayed.page,
          totalPagesOfSection: e.start.displayed.total,
          currentSectionHref: e.start.href,
          progress
        })
      );
      rendition.views().forEach(a => {
        a.iframe.focus();
      });
    });

    const highlight = (cont: Contents, selection: Selection, range: Range) => {
      const cfiRange = cont.cfiFromRange(range);

      dispatch(
        addHighlight({
          id: v4(),
          cfiRange: cfiRange.toString(),
          text: range.toString(),
          color: 'yellow',
          addDate: Date.now()
        })
      );

      const compare = (a: Highlight, b: Highlight) =>
        new EpubCFI(cfiRange).compare(a.cfiRange, b.cfiRange);
      const newHighlights = highlightsRef.current?.slice() || [];
      newHighlights.sort(compare);
      dispatch(sortHighlights(newHighlights));

      selection.removeAllRanges();
    };

    const onMouseUp = (cont: Contents) => {
      const selection = cont.window.getSelection();
      if (!selection) return;
      if (selection.rangeCount < 1) return;

      const range = selection.getRangeAt(0);
      if (range.collapsed) return;

      remote.Menu.buildFromTemplate([
        {
          label: 'Highlight',
          click: () => {
            highlight(cont, selection, range);
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Copy',
          role: 'copy'
        }
      ]).popup({ window: remote.getCurrentWindow() });
    };

    rendition.hooks.content.register((cont: Contents, rend: Rendition) => {
      cont.document.addEventListener('mouseup', () => {
        onMouseUp(cont);
      });
    });

    const keyListener = e => {
      if ((e.keyCode || e.which) === 37) {
        paginatePrev();
      }
      if ((e.keyCode || e.which) === 39) {
        paginateNext();
      }
    };

    book.ready
      .then(() => {
        // attaches just to the iframe of the reader
        rendition.on('keyup', keyListener);
        // attaches to the whole document (i.e. the page!)
        // document.addEventListener('keyup', keyListener, false);
        // no longer need this^ because the iframe view is focused
        // each time its location is changed, per the code above
        return 0;
      })
      .catch(() => {});

    // so each section of the book seems to generate a new contents object
    // we can't access contents from the mouseup event itself
    // but we can hook into its creation and generate an event listener each time

    return () => {
      book.destroy();
      rendition.destroy();
      renditionRef.current = null;
    };
  };

  useEffect(() => {
    return initReader();
  }, ['hot']); // the hot bit is the property that must change/be updated for the effect to happen

  if (renditionRef.current) {
    const rendition = renditionRef.current;

    if (rendition.location && cfi && rendition.location.start.cfi !== cfi) {
      rendition.display(cfi);
    }

    // we're stuck with using really jank api by epubjs.
    // i've found a lot of bugs just looking through their code..
    Object.keys(rendition.annotations._annotations).forEach(key => {
      let uri = decodeURI(key);
      uri = uri.substring(0, uri.length - 'highlight'.length);
      rendition.annotations.remove(uri, 'highlight');
    });

    highlights.forEach(hl => {
      const color = hl.cfiRange === cfi ? 'blue' : 'yellow';

      rendition.annotations.highlight(
        hl.cfiRange,
        { id: hl.id },
        (e: MouseEvent) => {
          dispatch(locateHighlightInTable(hl.id));
        },
        styles.hl,
        { fill: color, mixBledMode: 'adh' }
      );
    });
  }

  const currentLocationDescription = useSelector<
    ApplicationState,
    LocationDescription | undefined
  >(state => state.bookReader.locationDescription);
  const pagesLeft =
    (currentLocationDescription?.totalPagesOfSection || 0) -
    (currentLocationDescription?.pageNumberOfSection || 0);
  const progress = currentLocationDescription?.progress || 0;

  const pagesLeftText =
    pagesLeft > 0 ? `${pagesLeft} page${pagesLeft !== 1 ? 's' : ''} left` : '';
  const progressText =
    progress !== undefined ? `${Math.round(progress * 100)}%` : '';

  return (
    <div className={styles.verticalEpubViewerContainer}>
      <div className={styles.horizontalEpubViewerContainer}>
        <EpubViewerNavigationButton
          fa="fas fa-caret-left"
          onClick={paginatePrev}
        />
        <div className={styles.epubViewerWrapper}>
          <div className={styles.epubViewer} ref={epubJsViewerRef} />
        </div>
        <EpubViewerNavigationButton
          fa="fas fa-caret-right"
          onClick={paginateNext}
        />
      </div>
      <div className={styles.footer}>
        <div className={styles.left}>{progressText || <br />}</div>
        <div className={styles.right}>{pagesLeftText || <br />}</div>
      </div>
    </div>
  );
}

function EpubViewerNavigationButton({
  fa,
  onClick
}: {
  fa: string;
  onClick: Function;
}) {
  return (
    <div className={styles.navigationButton} onClick={onClick}>
      <i className={fa + ' ' + styles.navigationButtonIcon} />
    </div>
  );
}
