import type { FunctionComponent } from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import AuthDrawer from "./AuthDrawer";
import BackHomeBtn from "./BackHomeBtn";

/**
 * LoginPrompt Component
 * Displays a full-screen prompt encouraging the user to log in.
 * It features a dark, blurred background and a styled button that opens the authentication drawer.
 */
const LoginPrompt: FunctionComponent = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Framer Motion variants for the container and elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center
                   bg-neutral-950/90 backdrop-blur-md text-white p-4 text-center">
                    <BackHomeBtn/>
        <motion.h2
          variants={itemVariants}
          className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
          Access Restricted
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl font-light text-neutral-300 mb-8 max-w-md">
          Please log in to view your profile and manage your bookmarks.
        </motion.p>
        <motion.div variants={itemVariants}>
          <motion.button
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full
                       shadow-lg hover:bg-blue-700 transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 20px rgba(0, 123, 255, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDrawerOpen(true)}>
            Login / Sign Up
          </motion.button>
        </motion.div>
      </motion.div>
      <AuthDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default LoginPrompt;
