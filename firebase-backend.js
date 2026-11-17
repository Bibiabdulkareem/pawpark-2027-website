import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import { getFirestore, collection, doc, writeBatch, updateDoc, serverTimestamp,
  onSnapshot, query, orderBy, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  setPersistence, browserSessionPersistence, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import { firebaseConfig } from './backend-config.js';

const config = { ...firebaseConfig };
// Local tests use emulators exclusively; this cannot be enabled on the public website.
const emulated = ['localhost', '127.0.0.1'].includes(location.hostname)
  && window.PAWPARK_EMULATORS === true;
if (emulated) config.projectId = 'demo-pawpark-2027';
const app = initializeApp(config);
export const db = getFirestore(app);
export const auth = getAuth(app);
if (emulated) {
  connectFirestoreEmulator(db, '127.0.0.1', 8085);
  connectAuthEmulator(auth, 'http://127.0.0.1:9095', { disableWarnings: true });
}
const persistenceReady = setPersistence(auth, browserSessionPersistence);
export const authorizedAdmin = user => !!user && user.emailVerified
  && user.email === 'bibi@pawapp.net'
  && user.providerData.some(p => p.providerId === 'google.com');
export async function signInAdmin() {
  await persistenceReady;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account', login_hint: 'bibi@pawapp.net' });
  return signInWithPopup(auth, provider);
}
export const signOutAdmin = () => signOut(auth);
export const watchAdmin = callback => onAuthStateChanged(auth, callback);

// Keep an in-memory ID for retries; never store customer records in the browser.
const pending = new Map();
export async function submitApplication(type, details, language) {
  const fingerprint = JSON.stringify([type, details]);
  let ref = pending.get(fingerprint);
  if (!ref) {
    ref = doc(db, 'applications', 'PP27-' + doc(collection(db, 'applications')).id);
    pending.set(fingerprint, ref);
  }
  const batch = writeBatch(db);
  batch.set(ref, {
    type, details, language,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    status: 'New', notes: '', contractStage: 'Not started', updatedBy: '',
    draftMessage: '', draftStatus: '', draftLanguage: '', messageLang: '',
    contactedAt: ''
  });
  batch.set(doc(db, 'notificationQueue', ref.id), { type, createdAt: serverTimestamp(), sent: false, sentAt: null });
  await batch.commit();
  pending.delete(fingerprint);
  return { id: ref.id };
}
export function watchApplications(next, fail) {
  return onSnapshot(query(collection(db, 'applications'), orderBy('createdAt', 'desc')), snapshot => {
    const rows = snapshot.docs.map(d => {
      const x = d.data();
      return { ...x.details, ...x, id: d.id, date: x.createdAt?.toDate().toISOString() || '' };
    });
    next(rows);
  }, fail);
}
export function updateApplication(id, values) {
  if (!authorizedAdmin(auth.currentUser)) return Promise.reject(new Error('unauthorized'));
  return updateDoc(doc(db, 'applications', id), {
    ...values, updatedAt: serverTimestamp(), updatedBy: auth.currentUser.email
  });
}
