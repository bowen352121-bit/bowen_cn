/** 动态加载 Firebase SDK，避免国内网络因 gstatic 阻塞整页脚本 */
const FIREBASE_VERSION = "10.14.1";
const BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;

let cache = null;

export async function loadFirebaseSdk() {
  if (cache) return cache;
  try {
    const [appMod, authMod, fsMod] = await Promise.all([
      import(`${BASE}/firebase-app.js`),
      import(`${BASE}/firebase-auth.js`),
      import(`${BASE}/firebase-firestore.js`),
    ]);
    cache = { ...appMod, ...authMod, ...fsMod };
    return cache;
  } catch (err) {
    console.warn("[Firebase] SDK 加载失败（国内网络可能无法访问 gstatic）", err);
    return null;
  }
}
