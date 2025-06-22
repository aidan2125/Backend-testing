import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Get current logged-in user profileID from Firestore
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            resolve({ profileID: docSnap.id, ...docSnap.data() });
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// Login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
};

// Sign up
export const signupUser = async (name, surname, phone, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send verification email here
    await sendEmailVerification(user);

    // Save additional profile info in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      surname,
      phone_number: phone,
      email,
    });

    return { user, message: 'Signup successful! Please verify your email before logging in.' };
  } catch (error) {
    console.error('Sign-up error:', error.message);
    return { user: null, message: error.message || 'Sign-up failed. Please try again.' };
  }
};

// Logout
export const logoutUser = async () => {
  await signOut(auth);
};

// Fetch trips associated with the logged-in user
export const getUserTrips = async (profileID) => {
  // Assuming trips are stored in Firestore under 'trips' collection with userId field
  try {
    const tripsRef = collection(db, 'trips');
    const q = query(tripsRef, where('userId', '==', profileID));
    const querySnapshot = await getDocs(q);
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return trips;
  } catch (error) {
    console.error('Error fetching trips:', error);
    return [];
  }
};
