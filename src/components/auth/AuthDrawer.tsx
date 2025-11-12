// components/auth/AuthDrawer.tsx
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { auth, db } from "../../config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription as AlertDesc } from "@/components/ui/alert";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import PasswordResetForm from "./PasswordResetForm";
import VerificationNotice from "./VerificationNotice";
import ResetSentNotice from "./ResetSentNotice";

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// helper to strip "Firebase: " prefix from error messages
const stripFirebasePrefix = (err: any) => {
  const msg = err?.message || String(err || "");
  return msg.replace(/^Firebase:\s*/i, "").trim();
};

const AuthDrawer: React.FC<AuthDrawerProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [_isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  // track uid of a just-created account so we can prevent the client staying signed in
  const [justCreatedUid, setJustCreatedUid] = useState<string | null>(null);
  // keep previous user to detect sign-out transitions
  const prevUserRef = useRef<any | null>(null);

  // For account creation when user doesn't exist
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  // store gender as free string, UI restricts to male/female via radio and validation
  // default to "male"
  const [gender, setGender] = useState<string>("male");

  // Password validation flags
  const [pwLengthOk, setPwLengthOk] = useState(false);
  const [pwUpperOk, setPwUpperOk] = useState(false);
  const [pwLowerOk, setPwLowerOk] = useState(false);
  const [pwNumberOk, setPwNumberOk] = useState(false);
  const [pwSpecialOk, setPwSpecialOk] = useState(false);
  const [pwMatch, setPwMatch] = useState(false);

  // Password reset UI state
  const [showResetForm, setShowResetForm] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  // new state for resend verification flow
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  // Prevent the drawer auto-closing while we're in the "verification sent" flow
  const [suppressAutoClose, setSuppressAutoClose] = useState<boolean>(false);

  // Drawer drag logic
  const drawerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const dragHandlers = {
    onDragStart: (_event: MouseEvent | TouchEvent, info: PanInfo) => {
      startY.current = info.point.y;
    },
    onDragEnd: (_event: MouseEvent | TouchEvent, info: PanInfo) => {
      const draggedDistance = info.point.y - startY.current;
      const threshold = (drawerRef.current?.offsetHeight || 0) * 0.18;
      if (draggedDistance > threshold) {
        onClose();
      }
    },
  };

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const prevUser = prevUserRef.current;

      // If a fresh account was just created client-side, and the current user matches it
      // but hasn't verified email yet, immediately sign out and ignore this auth state.
      // This prevents any data reads or permission checks while unverified.
      if (currentUser && justCreatedUid && currentUser.uid === justCreatedUid && !currentUser.emailVerified) {
        try {
          await signOut(auth);
        } catch (e) {
          // ignore
        }
        prevUserRef.current = null;
        setUser(null);
        return;
      }

      // Detect a sign-out transition (prev existed, now null).
      if (prevUser && !currentUser) {
        // Do not auto-close the drawer on sign-out.
        // Show a toast for user-initiated sign-outs, but suppress during verification flows.
        if (!suppressAutoClose && !justCreatedUid) {
          toast.success("Signed out");
        }
        prevUserRef.current = null;
        setUser(null);
        return;
      }

      // Normal sign-in / state update - only set user if verified, to prevent unverified access
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
        prevUserRef.current = currentUser;
      } else if (currentUser && !currentUser.emailVerified) {
        // For non-just-created unverified users (e.g., during resend), sign out to prevent access
        try {
          await signOut(auth);
        } catch (e) {
          // ignore
        }
        setUser(null);
        prevUserRef.current = null;
      } else {
        setUser(null);
        prevUserRef.current = null;
      }

      // Automatically close the drawer when user signs in (verified),
      // but do NOT auto-close while we are suppressing auto-close for the verification flow.
      if (currentUser && currentUser.emailVerified && !suppressAutoClose) {
        setTimeout(() => {
          onClose();
        }, 300); // short delay for UX
      }
    });
    return () => unsubscribe();
  }, [isOpen, onClose, suppressAutoClose, justCreatedUid]);

  useEffect(() => {
    setIsValidEmail(emailRegex.test(email));
    setError(null);
  }, [email]);

  // validate password as user types
  useEffect(() => {
    const pw = password || "";
    setPwLengthOk(pw.length >= 8);
    setPwUpperOk(/[A-Z]/.test(pw));
    setPwLowerOk(/[a-z]/.test(pw));
    setPwNumberOk(/[0-9]/.test(pw));
    setPwSpecialOk(/[^A-Za-z0-9]/.test(pw));
    setPwMatch(passwordConfirm.length > 0 ? pw === passwordConfirm : false);
  }, [password, passwordConfirm]);

  const validateEmail = (value: string) => emailRegex.test(value);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      if (u) {
        // Google sign-ins are typically verified, but check anyway
        if (!u.emailVerified) {
          try {
            await sendEmailVerification(u);
          } catch (e) {
            // ignore send failure, we'll still show the notice
          }
          try {
            await signOut(auth);
          } catch (e) {
            // ignore
          }
          // show error toast so user knows what to do and keep drawer open with the notice UI
          const msg = `Email not verified. A verification link was sent to ${u.email}. Verify your email to sign in.`;
          toast.error(msg);
          setVerificationNotice(msg);
          setSuppressAutoClose(true);
          // leave the drawer open and show verification UI - no data reads attempted
          return;
        }

        // Verified: write to Firestore (rules should allow for verified)
        await setDoc(
          doc(db, "users", u.uid),
          {
            email: u.email,
            displayName: u.displayName || "Anonymous",
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      toast.success("Successfully signed in with Google!");
      onClose();
    } catch (err: any) {
      const msg = stripFirebasePrefix(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address.");
      }
      if (!password) {
        throw new Error("Please enter your password.");
      }
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const u = cred.user;

      // If the account exists but email is not verified, do NOT keep them signed in.
      // Send a verification email, sign them out and show the verification UI.
      // Do not close drawer, render verification message instead.
      if (u && !u.emailVerified) {
        try {
          await sendEmailVerification(u);
        } catch (e) {
          // ignore send error, still show notice
        }
        try {
          await signOut(auth);
        } catch (e) {
          // ignore signOut error
        }
        const msg = `Email not verified. A verification link was sent to ${email}. Verify your email to sign in.`;
        toast.error(msg, { duration: 10000 });
        setVerificationNotice(msg);
        setSuppressAutoClose(true);
        // keep password in state so the user can use "Resend" which signs in temporarily
        // no data reads attempted post-signout
        return;
      }

      // Verified: write to Firestore if needed
      if (u) {
        try {
          await setDoc(
            doc(db, "users", u.uid),
            {
              email: u.email,
              displayName: u.displayName || "Anonymous",
              lastLogin: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (writeErr) {
          console.warn("Failed to update user doc on signin:", writeErr);
          // Don't fail signin on write error; user is still authenticated
        }
      }
      toast.success("Signed in successfully");
      onClose();
    } catch (err: any) {
      const code = err?.code;
      const rawMsg = stripFirebasePrefix(err);
      // If user not found, show create account form
      if (code === "auth/user-not-found") {
        setShowCreateForm(true);
        setError(null);
        toast(rawMsg || "No account found. Please provide name and gender to create one.");
      } else if (code === "auth/wrong-password") {
        setError("Incorrect password. Try again or reset your password.");
        toast.error("Incorrect password.");
      } else {
        setError(rawMsg || "Authentication error");
        toast.error(rawMsg || "Authentication error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create account but DO NOT keep user signed in: send verification then sign out
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setVerificationNotice(null);

    // Suppress auto-close while the create / send verification flow runs
    setSuppressAutoClose(true);

    try {
      if (!validateEmail(email)) throw new Error("Valid email required.");
      // require password rules
      if (!pwLengthOk || !pwUpperOk || !pwLowerOk || !pwNumberOk || !pwSpecialOk) {
        throw new Error("Password does not meet security requirements.");
      }
      if (!pwMatch) throw new Error("Passwords do not match.");
      if (!name || name.trim().length === 0) throw new Error("Name is required.");
      if (!gender || !["male", "female"].includes(gender.toLowerCase())) {
        throw new Error("Gender is required. Please enter 'male' or 'female'.");
      }

      // Create user (this signs them in briefly on the client)
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const u = cred.user;
      if (u) {
        // remember this uid so the onAuthStateChanged handler can immediately sign out unverified accounts
        setJustCreatedUid(u.uid);

        // update displayName (auth profile, should always work)
        try {
          await updateProfile(u, { displayName: name });
        } catch (profileErr) {
          console.warn("Failed to update auth profile on create:", profileErr);
        }

        // Try to write to Firestore - if permission denied due to unverified, warn but proceed
        // User doc will be created on first verified signin
        try {
          await setDoc(
            doc(db, "users", u.uid),
            {
              email: u.email,
              displayName: name,
              gender: gender.toLowerCase(),
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              hasWelcomeEmail: false,
              emailVerified: u.emailVerified ?? false,
            },
            { merge: true }
          );
        } catch (writeErr: any) {
          if (writeErr.code === 'permission-denied') {
            console.warn("Permission denied on user doc write during create (unverified); will create on first verified login");
          } else {
            console.error("Unexpected error writing user doc on create:", writeErr);
          }
          // Proceed anyway - account created, just doc not written yet
        }

        // send verification email
        try {
          await sendEmailVerification(u);
        } catch (emailErr) {
          console.warn("Failed to send verification email on create:", emailErr);
          // Still show notice, user can resend later
        }

        // make sure client is signed out so we don't treat the user as authenticated until they verify
        // this prevents permission issues on data reads in the app
        try {
          await signOut(auth);
        } catch (e) {
          // ignore signOut error; onAuthStateChanged guard also covers this case
        }

        // inform user to verify email - show proper UI (VerificationNotice), no data reads
        const msg = `Account created. A verification link was sent to ${email}. Please verify your email before signing in.`;
        setVerificationNotice(msg);
        toast.success("Verification email sent. Check your inbox.");
        setShowCreateForm(false);

        // keep drawer open to show notice; do NOT clear justCreatedUid yet — keep it until user navigates back or closes
      }
    } catch (err: any) {
      const msg = stripFirebasePrefix(err);
      setError(msg || "Account creation failed");
      toast.error(msg || "Account creation failed");
      // If creation failed, allow auto-close behavior again
      setSuppressAutoClose(false);
      setJustCreatedUid(null);
    } finally {
      setIsLoading(false);
      // After flow completed (success or failure), we stop suppressing auto-close only if we are not actively showing the verificationNotice.
      // If verificationNotice is set, keep suppressAutoClose true until user navigates back to login or closes the drawer.
      if (!verificationNotice) {
        setSuppressAutoClose(false);
      }
    }
  };

  const handleSendPasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!validateEmail(email)) throw new Error("Enter a valid email to reset password.");
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setShowResetForm(false); // Improved flow: hide form after success
      toast.success("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      const msg = stripFirebasePrefix(err);
      setError(msg || "Failed to send reset email");
      toast.error(msg || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification: sign in temporarily with provided credentials, resend, then sign out
  // During this brief sign-in (unverified), avoid any Firestore operations to prevent permission errors
  const handleResendVerification = async () => {
    setError(null);
    setResendLoading(true);
    try {
      if (!validateEmail(email)) throw new Error("Valid email required to resend verification.");
      if (!password) throw new Error("Password required to resend verification.");
      // Sign in user to get a user object we can call sendEmailVerification on
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const u = cred.user;
      if (!u) throw new Error("Unable to sign in to resend verification.");
      await sendEmailVerification(u);
      await signOut(auth); // keep user signed out client-side
      toast.success("Verification email resent. Check your inbox.");
      setVerificationNotice(null); // allow returning to login form
      setSuppressAutoClose(false);
    } catch (err: any) {
      const msg = stripFirebasePrefix(err);
      setError(msg || "Failed to resend verification email.");
      toast.error(msg || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const resetAllStates = () => {
    setShowCreateForm(false);
    setShowResetForm(false);
    setResetSent(false);
    setVerificationNotice(null);
    setPassword("");
    setPasswordConfirm("");
    setName("");
    setGender("male");
    setError(null);
    // Reset pw flags
    setPwLengthOk(false);
    setPwUpperOk(false);
    setPwLowerOk(false);
    setPwNumberOk(false);
    setPwSpecialOk(false);
    setPwMatch(false);
    setSuppressAutoClose(false);
    setJustCreatedUid(null);
  };

  // Improved flow: on close or signin, reset states to prevent glitches in state persistence
  useEffect(() => {
    if (!isOpen) {
      resetAllStates();
    }
  }, [isOpen]);

  // Drawer/modal content
  return isOpen
    ? ReactDOM.createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => {
                resetAllStates();
                onClose();
              }}
              aria-label="Close authentication drawer"
            />
            {/* Drawer/Modal */}
            <motion.div
              ref={drawerRef}
              className="fixed bottom-0 md:relative w-full max-w-[400px] bg-background rounded-t-2xl rounded-b-none md:rounded-2xl shadow-2xl p-6 pt-4 flex flex-col max-h-[90vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 180 }}
              drag="y"
              dragElastic={0.15}
              dragMomentum={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              {...dragHandlers}>
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 h-8 w-8 p-0 rounded-full"
                onClick={() => {
                  resetAllStates();
                  onClose();
                }}
                aria-label="Close">
                <X className="h-4 w-4" />
              </Button>

              {/* Handle */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1.5 rounded-full bg-muted" />
              </div>

              {/* Content */}
              <div className="flex-1">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDesc>{error}</AlertDesc>
                  </Alert>
                )}

                {/* When a verification notice exists, render the verification UI alone */}
                {verificationNotice ? (
                  <VerificationNotice
                    notice={verificationNotice}
                    email={email}
                    password={password}
                    resendLoading={resendLoading}
                    onResend={handleResendVerification}
                    onBack={() => {
                      // hide verification notice and show login form with email preserved
                      setVerificationNotice(null);
                      setShowCreateForm(false);
                      setError(null);
                      setSuppressAutoClose(false);
                    }}
                    onClose={() => {
                      resetAllStates();
                      onClose();
                      toast.success("You can sign in after verifying your email.");
                    }}
                  />
                ) : resetSent ? (
                  <ResetSentNotice
                    email={email}
                    onBack={() => {
                      setResetSent(false);
                      setShowResetForm(false);
                      setError(null);
                    }}
                    onClose={() => {
                      resetAllStates();
                      onClose();
                    }}
                  />
                ) : user ? null : (
                  <>
                    {/* Title & Description */}
                    <div className="mb-4 text-center">
                      <h2 className="text-2xl font-bold text-foreground">Log In or Create an Account</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sign in to bookmark favorites and get recommendations.
                      </p>
                    </div>

                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full mb-4 bg-card text-foreground border hover:bg-accent"
                      aria-label="Sign in with Google">
                      <img src="https://www.google.com/favicon.ico" alt="Google Icon" className="w-5 h-5 mr-2" />
                      Sign in with Google
                    </Button>

                   

                    {/* Render appropriate form based on state */}
                    {showResetForm ? (
                      <PasswordResetForm
                        email={email}
                        setEmail={setEmail}
                        isLoading={isLoading}
                        error={error}
                        onSubmit={handleSendPasswordReset}
                        onCancel={() => {
                          setShowResetForm(false);
                          setResetSent(false);
                          setError(null);
                        }}
                      />
                    ) : showCreateForm ? (
                      <SignUpForm
                        email={email}
                        password={password}
                        passwordConfirm={passwordConfirm}
                        name={name}
                        gender={gender}
                        pwLengthOk={pwLengthOk}
                        pwUpperOk={pwUpperOk}
                        pwLowerOk={pwLowerOk}
                        pwNumberOk={pwNumberOk}
                        pwSpecialOk={pwSpecialOk}
                        pwMatch={pwMatch}
                        isLoading={isLoading}
                        error={error}
                        setEmail={setEmail}
                        setPassword={setPassword}
                        setPasswordConfirm={setPasswordConfirm}
                        setName={setName}
                        setGender={setGender}
                        onSubmit={handleCreateAccount}
                        onBack={() => {
                          setShowCreateForm(false);
                          setError(null);
                          setPassword("");
                          setPasswordConfirm("");
                        }}
                      />
                    ) : (
                      <SignInForm
                        email={email}
                        password={password}
                        isLoading={isLoading}
                        error={error}
                        setEmail={setEmail}
                        setPassword={setPassword}
                        onSubmit={handlePasswordSignIn}
                        onForgotPassword={() => {
                          setShowResetForm(true);
                          setError(null);
                        }}
                        onCreateAccount={() => {
                          setShowCreateForm(true);
                          setError(null);
                        }}
                      />
                    )}

                    <p className="text-center text-xs text-muted-foreground mt-4">
                      Create an account to bookmark your favorite movies and TV shows, receive personalized recommendations, and more!
                    </p>

                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Need help?{" "}
                      <a href="https://sakhiledumisa.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Visit sakhiledumisa.com
                      </a>
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;
};

export default AuthDrawer;