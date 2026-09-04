const DATABASE_NAME = "schedula-file-storage";

const DATABASE_VERSION = 1;

const STORE_NAME = "medical-files";


export type StoredMedicalFile = {
  id: string;

  name: string;

  type: string;

  size: number;

  blob: Blob;

  createdAt: string;
};






function openDatabase(): Promise<IDBDatabase> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      if (
        typeof window ===
        "undefined"
      ) {
        reject(
          new Error(
            "IndexedDB is only available in the browser."
          )
        );

        return;
      }


      const request =
        indexedDB.open(
          DATABASE_NAME,
          DATABASE_VERSION
        );


      request.onupgradeneeded =
        () => {
          const database =
            request.result;


          if (
            !database.objectStoreNames.contains(
              STORE_NAME
            )
          ) {
            database.createObjectStore(
              STORE_NAME,
              {
                keyPath: "id",
              }
            );
          }
        };


      request.onsuccess =
        () => {
          resolve(
            request.result
          );
        };


      request.onerror =
        () => {
          reject(
            request.error ??
              new Error(
                "Unable to open file database."
              )
          );
        };
    }
  );
}






export async function saveMedicalFile(
  id: string,
  file: File
): Promise<boolean> {
  try {
    const database =
      await openDatabase();


    const storedFile: StoredMedicalFile =
      {
        id,

        name:
          file.name,

        type:
          file.type,

        size:
          file.size,

        blob:
          file,

        createdAt:
          new Date()
            .toISOString(),
      };


    return await new Promise<boolean>(
      (
        resolve,
        reject
      ) => {
        const transaction =
          database.transaction(
            STORE_NAME,
            "readwrite"
          );


        const store =
          transaction.objectStore(
            STORE_NAME
          );


        store.put(
          storedFile
        );


        transaction.oncomplete =
          () => {
            database.close();

            resolve(
              true
            );
          };


        transaction.onerror =
          () => {
            database.close();

            reject(
              transaction.error
            );
          };


        transaction.onabort =
          () => {
            database.close();

            reject(
              transaction.error
            );
          };
      }
    );

  } catch (
    error
  ) {
    console.error(
      "Unable to save medical file:",
      error
    );

    return false;
  }
}






export async function getMedicalFile(
  id: string
): Promise<StoredMedicalFile | null> {
  try {
    const database =
      await openDatabase();


    return await new Promise<
      StoredMedicalFile | null
    >(
      (
        resolve,
        reject
      ) => {
        const transaction =
          database.transaction(
            STORE_NAME,
            "readonly"
          );


        const store =
          transaction.objectStore(
            STORE_NAME
          );


        const request =
          store.get(
            id
          );


        request.onsuccess =
          () => {
            database.close();

            resolve(
              request.result
                ? (
                    request.result as
                      StoredMedicalFile
                  )
                : null
            );
          };


        request.onerror =
          () => {
            database.close();

            reject(
              request.error
            );
          };
      }
    );

  } catch (
    error
  ) {
    console.error(
      "Unable to read medical file:",
      error
    );

    return null;
  }
}






export async function deleteMedicalFile(
  id: string
): Promise<boolean> {
  try {
    const database =
      await openDatabase();


    return await new Promise<boolean>(
      (
        resolve,
        reject
      ) => {
        const transaction =
          database.transaction(
            STORE_NAME,
            "readwrite"
          );


        const store =
          transaction.objectStore(
            STORE_NAME
          );


        store.delete(
          id
        );


        transaction.oncomplete =
          () => {
            database.close();

            resolve(
              true
            );
          };


        transaction.onerror =
          () => {
            database.close();

            reject(
              transaction.error
            );
          };
      }
    );

  } catch (
    error
  ) {
    console.error(
      "Unable to delete medical file:",
      error
    );

    return false;
  }
}






export async function viewMedicalFile(
  id: string
): Promise<boolean> {
  const file =
    await getMedicalFile(
      id
    );


  if (!file) {
    return false;
  }


  const url =
    URL.createObjectURL(
      file.blob
    );


  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );


  setTimeout(
    () => {
      URL.revokeObjectURL(
        url
      );
    },
    60_000
  );


  return true;
}






export async function downloadMedicalFile(
  id: string
): Promise<boolean> {
  const file =
    await getMedicalFile(
      id
    );


  if (!file) {
    return false;
  }


  const url =
    URL.createObjectURL(
      file.blob
    );


  const anchor =
    document.createElement(
      "a"
    );


  anchor.href =
    url;

  anchor.download =
    file.name;


  document.body.appendChild(
    anchor
  );


  anchor.click();


  anchor.remove();


  URL.revokeObjectURL(
    url
  );


  return true;
}