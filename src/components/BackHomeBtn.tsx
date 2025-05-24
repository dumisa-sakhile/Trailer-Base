import { useNavigate, useRouter } from "@tanstack/react-router";

const BackHomeBtn = () => {
  const navigate = useNavigate();
  const { history } = useRouter();

  return (
    <section className="absolute top-10 right-10 z-20 flex gap-6 md:gap-8">
      <button
        className="flex items-center gap-3 px-6 py-3 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-xl text-gray-200 font-medium text-base uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
        onClick={() =>
          navigate({
            to: "/",
            search: { page: 1, period: "day" },
          })
        }
        aria-label="Go to homepage">
        <svg
          className="w-6 h-6"
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
            strokeWidth="1.8"
            d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
          />
        </svg>
        <span className="font-sans">Home</span>
      </button>

      <button
        className="flex items-center gap-3 px-6 py-3 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-xl text-gray-200 font-medium text-base uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
        onClick={() => history.back()}
        aria-label="Go back to previous page">
        <svg
          className="w-6 h-6"
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
            strokeWidth="1.8"
            d="M8 6v12m8-12v12l-8-6 8-6Z"
          />
        </svg>
        <span className="font-sans">Back</span>
      </button>
    </section>
  );
};

export default BackHomeBtn;
