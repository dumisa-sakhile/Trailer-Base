import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationFooterProps {
  page: number;
  totalPages?: number;
  prevLinkProps: any;
  nextLinkProps: any;
  className?: string;
}

export default function PaginationFooter({
  page,
  totalPages,
  prevLinkProps,
  nextLinkProps,
  className = "",
}: PaginationFooterProps) {
  return (
    <footer
      className={`fixed bottom-4 left-0 right-0 flex items-center justify-center w-full z-20 pointer-events-none ${className}`}>
      <section className="flex items-center gap-3 bg-[rgba(24,24,28,0.85)] backdrop-blur-lg px-6 py-3 max-sm:px-4 max-sm:py-3 rounded-xl shadow-lg border border-gray-700/40 font-sans pointer-events-auto">
        <Link
          {...prevLinkProps}
          className={`flex items-center gap-2 px-4 py-2 max-sm:px-4 max-sm:py-2 text-gray-200 font-medium text-base max-sm:text-sm roboto-condensed-bold capitalize rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60 ${
            page === 1
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-blue-600/80 hover:text-white hover:shadow-lg hover:scale-[1.06] active:scale-100"
          }`}
          disabled={page === 1}
          aria-label="Go to previous page"
          tabIndex={page === 1 ? -1 : 0}>
          <ChevronLeft className="w-5 h-5 max-sm:w-5 max-sm:h-5" />
          <span className="max-sm:hidden">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Link>
        <span className="text-gray-100 font-semibold text-base max-sm:text-sm px-4 max-sm:px-3 select-none">
          {page?.toLocaleString()} / {totalPages?.toLocaleString() ?? "?"}
        </span>
        <Link
          {...nextLinkProps}
          className={`flex items-center gap-2 px-4 py-2 max-sm:px-4 max-sm:py-2 text-gray-200 font-medium text-base max-sm:text-sm roboto-condensed-bold capitalize rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60 ${
            totalPages === page
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-blue-600/80 hover:text-white hover:shadow-lg hover:scale-[1.06] active:scale-100"
          }`}
          disabled={totalPages === page}
          aria-label="Go to next page"
          tabIndex={totalPages === page ? -1 : 0}>
          <span className="max-sm:hidden">Next</span>
          <ChevronRight className="w-5 h-5 max-sm:w-5 max-sm:h-5" />
        </Link>
      </section>
    </footer>
  );
}
