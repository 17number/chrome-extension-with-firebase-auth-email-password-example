// import 'core-js';  // NOTE: babel で useBuiltIns: 'entry' にする場合に必要
import './assets/stylesheets/options.scss';
const browser = require("webextension-polyfill");
const firebase = require("firebase/app").default;
require("firebase/auth");
const firebaseConfig = {
  apiKey: "xxxx",
  authDomain: "xxxx",
  projectId: "xxxx",
  storageBucket: "xxxx",
  messagingSenderId: "xxxx",
  appId: "xxxx"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);

/**
 * サインイン
 * @param {*} email
 * @param {*} password
 */
const signinFirebaseWithEmailAndPassword = async (email, password) => {
  if (!email || !password) {
    return {};
  }

  try {
    await firebaseApp.auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error({ error });
    return {};
  }

  // サインインできたらストレージに Email/Password を保存
  await browser.storage.sync.set({
    email,
    password,
  });

  return firebaseApp.auth().currentUser;
};

/**
 * サインインボタン
 */
const clickSigninButton = async () => {
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  const user = await signinFirebaseWithEmailAndPassword(email, password);
  if (user?.uid) {
    showSignedInArea(user);
  }
}

/**
 * サインイン後エリアの表示
 * @param {*} user
 */
const showSignedInArea = (user) => {
  document.querySelector('[data-signin]').style.display = 'block';
  document.getElementById('uid').value = user.uid;
}

(async () => {
  document.getElementById('signin').addEventListener('click', clickSigninButton)

  // ストレージに Email/Password があれば最初にサインイン
  const { email } = await browser.storage.sync.get({ email: null });
  const { password } = await browser.storage.sync.get({ password: null });
  document.getElementById('email').value = email;
  document.getElementById('password').value = password;
  const user = await signinFirebaseWithEmailAndPassword(email, password);

  if (user?.uid) {
    showSignedInArea(user);
  }
})();
