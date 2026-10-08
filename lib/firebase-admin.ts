import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfgodkab8NVnP4bbxQIUWDkEqZFff4J2I",
  authDomain: "imgstorage-c1224.firebaseapp.com",
  projectId: "imgstorage-c1224",
  storageBucket: "imgstorage-c1224.firebasestorage.app",
  messagingSenderId: "930236936696",
  appId: "1:930236936696:web:a38dbcfcf60664774c660d",
  measurementId: "G-MZM301KPGW"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const clientDb = getFirestore(app);

export async function findMediaBySlug(slug: string) {
  for (const col of ["images", "videos", "audios"]) {
    const snap = await adminDb.collection(col).where("slug", "==", slug).limit(1).get()
    if (!snap.empty) {
      return { doc: snap.docs[0], collectionName: col }
    }
  }
  return null
}

export const adminDb = {
  collection(collectionPath: string) {
    const colRef = collection(clientDb, collectionPath);
    return {
      doc(docId?: string) {
        const dRef = docId ? doc(clientDb, collectionPath, docId) : doc(collection(clientDb, collectionPath));
        return {
          id: dRef.id,
          async get() {
            const snap = await getDoc(dRef);
            return {
              exists: snap.exists(),
              id: snap.id,
              data: () => snap.data(),
              ref: {
                async delete() {
                  return await deleteDoc(dRef);
                },
                async update(data: any) {
                  return await updateDoc(dRef, data);
                }
              }
            };
          },
          async set(data: any, options?: any) {
            return options ? await setDoc(dRef, data, options) : await setDoc(dRef, data);
          },
          async update(data: any) {
            return await updateDoc(dRef, data);
          },
          async delete() {
            return await deleteDoc(dRef);
          }
        };
      },
      where(field: string, op: any, value: any) {
        let q = query(colRef, where(field, op, value));
        return createQueryBuilder(q);
      },
      orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
        let q = query(colRef);
        return createQueryBuilder(q).orderBy(field, direction);
      },
      limit(n: number) {
        let q = query(colRef, limit(n));
        return createQueryBuilder(q);
      },
      async get() {
        const qSnap = await getDocs(colRef);
        return {
          empty: qSnap.empty,
          docs: qSnap.docs.map(d => ({
            id: d.id,
            exists: d.exists(),
            data: () => d.data(),
            ref: {
              async delete() {
                return await deleteDoc(d.ref);
              },
              async update(data: any) {
                return await updateDoc(d.ref, data);
              }
            }
          }))
        };
      }
    };
  }
};

function createQueryBuilder(q: any, orderByField?: string, orderByDir?: 'asc' | 'desc') {
  return {
    where(field: string, op: any, value: any) {
      q = query(q, where(field, op, value));
      return this;
    },
    orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
      orderByField = field;
      orderByDir = direction;
      return this;
    },
    limit(n: number) {
      q = query(q, limit(n));
      return this;
    },
    async get() {
      const qSnap = await getDocs(q);
      let docs = qSnap.docs.map(d => ({
        id: d.id,
        exists: d.exists(),
        data: () => d.data(),
        ref: {
          async delete() {
            return await deleteDoc(d.ref);
          },
          async update(data: any) {
            return await updateDoc(d.ref, data);
          }
        }
      }));

      if (orderByField) {
        docs.sort((a, b) => {
          let valA = (a.data() as any)[orderByField!];
          let valB = (b.data() as any)[orderByField!];
          if (valA?.toDate) valA = valA.toDate();
          if (valB?.toDate) valB = valB.toDate();
          if (valA instanceof Date) valA = valA.getTime();
          if (valB instanceof Date) valB = valB.getTime();

          if (valA < valB) return orderByDir === 'desc' ? 1 : -1;
          if (valA > valB) return orderByDir === 'desc' ? -1 : 1;
          return 0;
        });
      }

      return {
        empty: docs.length === 0,
        docs
      };
    }
  };
}
