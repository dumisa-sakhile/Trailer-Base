import { useNavigate, useRouter } from "@tanstack/react-router";

const BackHomeBtn = () => {
  const navigate = useNavigate();
  const { history } = useRouter();

  return (
    <section className="absolute top-8 right-10 z-20 hidden sm:flex gap-4 md:gap-6">
      {/* Back Button */}
      <button
        className="group flex items-center gap-2 px-5 py-2.5
          bg-white/90 dark:bg-black/80
          border border-gray-300 dark:border-gray-700
          rounded-full shadow-md
          text-gray-900 dark:text-white
          font-semibold text-lg
          hover:bg-gray-100 dark:hover:bg-gray-900
          hover:scale-105
          focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white
          transition-all duration-200"
        onClick={() => history.back()}
        aria-label="Go back to previous page">
        <svg
          className="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 6v12m8-12v12l-8-6 8-6Z"
          />
        </svg>
        <span className="font-sans tracking-wide">Back</span>
      </button>

      {/* Home Button */}
      <button
        className="group flex items-center gap-2 px-5 py-2.5
          bg-white/90 dark:bg-black/80
          border border-gray-300 dark:border-gray-700
          rounded-full shadow-md
          text-gray-900 dark:text-white
          font-semibold text-lg
          hover:bg-gray-100 dark:hover:bg-gray-900
          hover:scale-105
          focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white
          transition-all duration-200"
        onClick={() =>
          navigate({
            to: "/",
            search: { page: 1, period: "day" },
          })
        }
        aria-label="Go to homepage">
        <svg
          className="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-sans tracking-wide">Home</span>
      </button>
    </section>
  );
};

export default BackHomeBtn;
