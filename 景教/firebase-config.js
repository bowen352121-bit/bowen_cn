// 景教留言板 · Firebase Web 配置（bowen-guestbook）
export const firebaseConfig = {
  apiKey: "AIzaSyATu4BqeGvEigNygpSiPYxpRSebWcP6L6g",
  authDomain: "bowen-guestbook.firebaseapp.com",
  projectId: "bowen-guestbook",
  storageBucket: "bowen-guestbook.firebasestorage.app",
  messagingSenderId: "1010667882061",
  appId: "1:1010667882061:web:f427b8a35ec1dbd86c3e04",
  measurementId: "G-9N4YR3EW0E"
};

export function isFirebaseReady() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain);
}
