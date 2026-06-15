import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  // Requesting Google Sheets scopes as seen in AdminDashboard
  provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    
    if (accessToken) {
      sessionStorage.setItem("google_access_token", accessToken);
    }
    
    return { user: result.user, accessToken };
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    sessionStorage.removeItem("google_access_token");
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

export default app;
