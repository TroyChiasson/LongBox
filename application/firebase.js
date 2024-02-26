// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBW-jpp9n24EbjdZvuoXIQX5PY6J8EWcmA",
    authDomain: "sinuous-vortex-411619.firebaseapp.com",
    databaseURL: "https://sinuous-vortex-411619-default-rtdb.firebaseio.com",
    projectId: "sinuous-vortex-411619",
    storageBucket: "sinuous-vortex-411619.appspot.com",
    messagingSenderId: "601080788845",
    appId: "1:601080788845:web:f9d7298c25846409cd8c64",
    measurementId: "G-GJDCC73TLN"
};

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();
const settings = {
  timestampsInSnapshots: true,
};
firestore.settings(settings);

export default firebase;

export {
  firestore,
};