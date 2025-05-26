import { useNavigate, useRouter } from "@tanstack/react-router";

const BackHomeBtn = () => {
  const navigate = useNavigate();
  const { history } = useRouter();

  return (
    <section className="absolute top-8 right-8 z-20 hidden sm:flex gap-4">
      {/* Back Button */}
      <button
        className="group flex items-center justify-center w-12 h-12
          bg-black text-white
          border border-gray-700
          rounded-full shadow-md
          hover:bg-yellow-600 hover:border-yellow-600
          hover:scale-110
          focus-visible:ring-2 focus-visible:ring-yellow-500/50
          transition-all duration-200"
        onClick={() => history.back()}
        aria-label="Go back to previous page">
        <svg
          className="w-5 h-5 text-white group-hover:text-black"
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
            strokeWidth="1.5"
            d="m15 19-7-7 7-7"
          />
        </svg>
      </button>

      {/* Home Button */}
      <button
        className="group flex items-center justify-center w-12 h-12
          bg-black text-white
          border border-gray-700
          rounded-full shadow-md
          hover:bg-yellow-600 hover:border-yellow-600
          hover:scale-110
          focus-visible:ring-2 focus-visible:ring-yellow-500/50
          transition-all duration-200"
        onClick={() =>
          navigate({
            to: "/",
            search: { page: 1, period: "day" },
          })
        }
        aria-label="Go to homepage">
        <svg
          className="w-5 h-5 text-white group-hover:text-black"
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
            strokeWidth="1.5"
            d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
          />
        </svg>
      </button>
    </section>
  );
};

export default BackHomeBtn;
