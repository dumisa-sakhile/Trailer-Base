import { useEffect } from "react";
import { useSearchContext } from "../context/searchContext";

const EscKeyHandler: React.FC = () => {
  const { setStatus } = useSearchContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStatus(false); // Set status to false when Esc is pressed
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setStatus]);

  return null; // This component doesn't render anything
};

export default EscKeyHandler;
