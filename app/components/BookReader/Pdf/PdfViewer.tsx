/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import React, { useEffect, useRef, MutableRefObject, Props } from 'react';
import styles from './PdfViewer.css';
import pdfjsLib from 'pdfjs-dist';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from '../../../ducks';
import { BookRecord } from '../../../ducks/bookManager';
import { getBookArchivePath } from '../../../utils/fileManager';

export type PdfViewerProps = {};

export default function PdfViewer(props: Props) {
  const dispatch = useDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bookRecord = useSelector<ApplicationState, BookRecord | undefined>(
    state => state.bookReader.bookRecord
  );
  if (!bookRecord) throw new Error('bookRecord undefined!');
  const bookFilepath = getBookArchivePath(bookRecord.id, bookRecord.baseName);

  useEffect(() => {
    // If absolute URL from the remote server is provided, configure the CORS
    // header on that server.
    const url = bookFilepath;

    // Loaded via <script> tag, create shortcut to access PDF.js exports.

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      '//mozilla.github.io/pdf.js/build/pdf.worker.js';

    // pdfjsLib.PDFJS.PDFViewer().
    if (!canvasRef.current) return;
    const a = pdfjsLib.PDFJS.PDFViewer({
      container: canvasRef.current
    });

    // Asynchronous download of PDF
    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise
      .then(pdf => {
        console.log('PDF loaded');

        // Fetch the first page
        const pageNumber = 5;
        pdf.getMetadata().then(ret => {
          console.log(ret);
        });
        pdf.getOutline().then(promise => {
          console.log(promise);
        });
        return pdf.getPage(pageNumber);
      })
      .then(page => {
        console.log('Page loaded');

        const scale = 1.5;
        const viewport = page.getViewport({ scale: scale });

        // Prepare canvas using PDF page dimensions
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        const renderTask = page.render(renderContext);
        return renderTask.promise;
      })
      .then(() => console.log('Page rendered'))
      .catch(reason => console.error(reason));
  }, ['hot']);

  return (
    <div className={styles.verticalEpubViewerContainer}>
      <div className={styles.horizontalEpubViewerContainer}>
        <canvas ref={canvasRef} />
      </div>
      <div className={styles.footer}>
        <br />
      </div>
    </div>
  );
}
