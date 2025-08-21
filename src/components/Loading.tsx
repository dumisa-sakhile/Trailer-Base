import type { FC } from "react";
import { motion } from "framer-motion";

const Loading: FC = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}>
      {/* Modern blue spinner */}
      <div className="flex items-center justify-center h-screen">
        <span className="relative flex h-16 w-16">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40"></span>
          <span className="relative inline-flex rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent animate-spin"></span>
        </span>
      </div>
    </motion.div>
  );
};

export default Loading;
