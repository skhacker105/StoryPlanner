import { Observable, from, tap } from "rxjs";
import { DBName, Tables } from "../constants/constant";

export const clearIndexedDB = () => {
    indexedDB.deleteDatabase(DBName);
}

function connectDB(keyColumn: string): Promise<IDBDatabase> {
    // Open (or create) the database
    var request: IDBOpenDBRequest = indexedDB.open(DBName, 1);

    return new Promise<IDBDatabase>((resolve, reject) => {
        request.onerror = (err) => reject(err);
        request.onsuccess = (e: any) => {
            resolve(request.result);
        }

        request.onupgradeneeded = (e: any) => {
            const Db = e.currentTarget.result;

            //Create store
            Object.keys(Tables).forEach(t => {
                const storeName = ({ ...Tables })[t]
                if (!Db.objectStoreNames.contains(storeName)) {
                    const store = Db.createObjectStore(storeName, { autoIncrement: true, keyPath: keyColumn });
                }
            });
            connectDB(keyColumn)
                .then(result => resolve(result))
                .catch(err => reject(err));
        }
    });

}

export interface IQuery<T> {
    filter?: (record: T) => boolean,
    sort?: (a: T, b: T) => number
}

export class IndexedDBManager<T> {
    storeName: string;
    keyColumn: string;

    constructor(storeName: string, keyColumn: string) {
        this.storeName = storeName;
        this.keyColumn = keyColumn;
    }

    add(obj: any): Observable<boolean> {

        return from(new Promise<boolean>((resolve, reject) => {
            connectDB(this.keyColumn)
                .then((db) => {
                    const objectStore = db.transaction([this.storeName], "readwrite").objectStore(this.storeName);
                    if (!objectStore) {
                        console.log('No Object Store Found');
                        return;
                    }
                    var objectStoreRequest = objectStore.add(obj);
                    objectStoreRequest.onsuccess = () => resolve(true);
                    objectStoreRequest.onerror = (err) => console.log('Error while add: ', err, obj);
                })
                .catch(err => reject(err));
        }));
    }

    update(updatedData: T): Observable<boolean> {
        return from(new Promise<boolean>((resolve, reject) => {
            connectDB(this.keyColumn)
                .then((db: IDBDatabase) => {

                    const objectStore = db.transaction([this.storeName], "readwrite").objectStore(this.storeName);
                    if (!objectStore) {
                        console.log('No Object Store Found');
                        return;
                    }
                    const put_request = objectStore.put(updatedData);
                    put_request.onsuccess = (e) => resolve(true);
                    put_request.onerror = (err) => reject(err);
                })
                .catch(err => reject(err))
        }));
    }

    delete(id: string): Observable<boolean> {
        return from(new Promise<boolean>((resolve, reject) => {
            connectDB(this.keyColumn)
                .then((db) => {
                    var objectStore = db.transaction([this.storeName], "readwrite").objectStore(this.storeName);
                    if (!objectStore) {
                        console.log('No Object Store Found');
                        return;
                    }
                    var objectStoreRequest = objectStore.delete(id);
                    objectStoreRequest.onerror = (err) => reject(err);
                    objectStoreRequest.onsuccess = () => resolve(true);
                })
                .catch(err => reject(err));
        }));
    }

    getAll(): Observable<T[]> {

        return from(new Promise<T[]>((resolve, reject) => {
            connectDB(this.keyColumn)
                .then((db) => {
                    const rows: T[] = [];
                    const objectStore = db.transaction([this.storeName], "readonly").objectStore(this.storeName);
                    if (!objectStore) {
                        console.log('No Object Store Found');
                        return;
                    }

                    objectStore.openCursor()
                        .onsuccess = (e: any) => {
                            let cursor = e.target.result;
                            if (cursor) {
                                rows.push(cursor.value);
                                cursor.continue();
                            }
                            else {
                               resolve(rows);
                            }
                        };
                })
                .catch(err => reject(err));
        }));
    }

}