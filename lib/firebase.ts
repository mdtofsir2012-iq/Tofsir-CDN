import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

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
export const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;
