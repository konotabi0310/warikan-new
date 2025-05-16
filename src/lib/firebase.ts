// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// クライアントサイドかどうかを判定
const isClient = typeof window !== "undefined";

// Firebase App をクライアントでだけ初期化
let app = null;
if (isClient) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

// auth / db もクライアントのみエクスポート
export const auth = isClient ? getAuth(app!) : null;
export const db   = isClient ? getFirestore(app!) : null;

// ローカル永続化もクライアントでのみ設定
if (isClient && auth) {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}