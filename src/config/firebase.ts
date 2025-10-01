// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import axios from "axios";

// Helper function to send welcome email
const sendWelcomeEmail = async (userName: string | null, email: string) => {
  try {
    // Validate inputs
    if (!email) {
      throw new Error("Email is required");
    }

    // Validate environment variables
    if (!import.meta.env.VITE_EMAIL_API_URL || !import.meta.env.VITE_EMAIL_API_KEY) {
      throw new Error(
        "Missing VITE_EMAIL_API_URL or VITE_EMAIL_API_KEY in environment variables"
      );
    }

    // Send email via API
    const response = await axios.post(
      import.meta.env.VITE_EMAIL_API_URL,
      {
        to: email,
        userName: userName || "TrailerBaser",
        from: "welcome@api.trailerbase.tech",
      },
      {
        headers: {
          "x-api-key": import.meta.env.VITE_EMAIL_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Email sent to ${email}`, response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error sending welcome email:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: error.stack,
    });
    throw error;
  }
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.MESSAGE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Helper to get user's name
const getUserName = (user: User): string => {
  if (user.displayName && user.displayName.trim() !== "") {
    return user.displayName;
  }
  // Fallback to email prefix
  return user.email?.split('@')[0] || "User";
};

// Function to send welcome email for users who haven't received one
export const sendWelcomeMessage = async (user: User) => {
  try {
    // Get the user's name
    const userName = getUserName(user);

    // Check if the user has already received a welcome email
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    // If hasWelcomeEmail doesn't exist or is false, send welcome email
    if (!userData?.hasWelcomeEmail) {
      // Set hasWelcomeEmail to false if it doesn't exist
      if (!userDoc.exists() || userData?.hasWelcomeEmail === undefined) {
        await setDoc(userDocRef, { 
          ...userData,
          hasWelcomeEmail: false 
        }, { merge: true });
      }

      // Send welcome email
      await sendWelcomeEmail(userName, user.email!);
      
      // Update user document to mark welcome email as sent
      await setDoc(userDocRef, { 
        ...userData,
        hasWelcomeEmail: true 
      }, { merge: true });

      console.log(`Welcome email sent to ${user.email}`);
    } else {
      console.log(`User ${user.uid} already has received welcome email.`);
    }
  } catch (error: any) {
    console.error("Error sending welcome email:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: error.stack,
    });
  }
};

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, check and send welcome email if needed
    sendWelcomeMessage(user);
  }
});

export { app, auth, db };
