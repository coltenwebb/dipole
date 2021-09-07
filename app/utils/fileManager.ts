import fs from 'fs';
import path from 'path';
import { remote } from 'electron';
import util from 'util';
import ePub from 'epubjs';
import { ApplicationState } from '../ducks';
import { BookRecord } from '../ducks/bookManager';
import { Highlight, AnkiCard } from '../ducks/bookReader';

const copyFile = util.promisify(fs.copyFile);
const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const rmdir = util.promisify(fs.rmdir);
const unlink = util.promisify(fs.unlink);

export function getStoragePath() {
  return path.join(remote.app.getPath('appData'), 'Dipole');
}

function getBookDir(id: string) {
  return path.join(getStoragePath(), id);
}

export function getBookArchivePath(id: string, baseName: string) {
  return path.join(getBookDir(id), baseName);
}

function getBookDataPath(id: string) {
  return path.join(getBookDir(id), `data.json`);
}

async function makeAndGetBookDir(id: string) {
  const destDir = getBookDir(id);
  if (!(await exists(destDir))) await mkdir(destDir);
  return destDir;
}

export async function storeBook(srcPath: string, id: string) {
  const bookDir = await makeAndGetBookDir(id);
  const baseName = path.basename(srcPath);
  const bookPath = path.join(bookDir, baseName);
  await copyFile(srcPath, bookPath);
  // await writeFile(path.join(bookDir, `${id}.json`), '');
  return baseName;
}

export async function removeBookDirSafely(id: string, baseName: string) {
  if (await exists(getBookArchivePath(id, baseName)))
    await unlink(getBookArchivePath(id, baseName));
  if (await exists(getBookDataPath(id))) await unlink(getBookDataPath(id));
  await rmdir(getBookDir(id));
}

export function openPathInFileExplorer(pth: string) {
  remote.shell.openItem(pth);
}

export async function loadBookMetadata(book: BookRecord): Promise<BookRecord> {
  const bookEpub = ePub(getBookArchivePath(book.id, book.baseName), {
    openAs: 'epub'
  });
  return new Promise((resolve, reject) => {
    bookEpub.loaded.metadata
      .then(meta => {
        resolve({
          ...book,
          title: meta.title,
          author: meta.creator
        });
        bookEpub.destroy();
        return 0;
      })
      .catch(err => {
        throw err;
      });
  });
}

async function writeObjectToFile(
  filePath: string,
  obj: Record<string, unknown>
) {
  await writeFile(filePath, JSON.stringify(obj));
}

async function readObjectFromFile(filePath: string) {
  const doesExist = await exists(filePath);
  if (!doesExist) return undefined;
  return JSON.parse(await readFile(filePath, 'utf-8'));
}

function readObjectFromFileSync(filePath: string) {
  const doesExist = fs.existsSync(filePath);
  if (!doesExist) return undefined;
  const fileString = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileString);
}

type StoredBookData = {
  highlights: Highlight[];
  ankiCards: AnkiCard[];
  cfi: string;
};

// strictly use this for persisting the bookmanager, ankicards and highlights
export async function onStoreUpdate(state: ApplicationState, dispatch) {
  const appDir = getStoragePath();

  const bookManagerStoragePath = path.join(appDir, 'bookManager.json');
  const bookManagerBooksObject = state.bookManager.books;
  await writeObjectToFile(bookManagerStoragePath, {
    books: bookManagerBooksObject
  });

  if (state.bookReader.bookRecord) {
    const { bookRecord } = state.bookReader;
    const currentBookStoragePath = getBookDataPath(bookRecord.id);
    const currentBookDataObject = {
      highlights: state.bookReader.bookData.highlights,
      ankiCards: state.bookReader.bookData.ankiCards,
      cfi: state.bookReader.bookData.cfi
    } as StoredBookData;
    await writeObjectToFile(currentBookStoragePath, currentBookDataObject);
  }
}

// strictly use this for loading the state at the beginning of using the app
export function storeLoad() {
  const appDir = getStoragePath();
  const bookManagerStoragePath = path.join(appDir, 'bookManager.json');

  // instead of readObjectFromFile since this is syncronous
  const bookManagerBooksObject = readObjectFromFileSync(bookManagerStoragePath);
  if (bookManagerBooksObject) return { bookManager: bookManagerBooksObject };

  return {};
}

export function loadBookData(id: string): StoredBookData | undefined {
  // instead of readObjectFromFile since this is syncronous
  const bookDataObject = readObjectFromFileSync(getBookDataPath(id));

  return bookDataObject as StoredBookData | undefined;
}
