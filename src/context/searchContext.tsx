import { createContext, useState, useContext } from "react";

interface SearchContextType {
  status: boolean;
  setStatus: (status: boolean) => void;
  pageType: "movies" | "tv" | "people";
  setPageType: (pageType: "movies" | "tv" | "people") => void;
}

// Create context with `undefined` as the default value to enforce provider usage
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Custom hook to safely access the context
const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};

const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState(false);
  const [pageType, setPageType] = useState<"movies" | "tv" | "people">(
    "movies"
  ); // Default to 'movies'

  return (
    <SearchContext.Provider
      value={{ status, setStatus, pageType, setPageType }}>
      {children}
    </SearchContext.Provider>
  );
};

export { SearchContext, SearchProvider, useSearchContext };
