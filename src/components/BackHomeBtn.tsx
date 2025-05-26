import { useNavigate, useRouter } from "@tanstack/react-router";

const BackHomeBtn = () => {
  const navigate = useNavigate();
  const { history } = useRouter();

  return (
    <section className="absolute top-8 right-8 z-20 hidden sm:flex gap-3">
      {/* Back Button */}
      <button
        onClick={() => history.back()}
        aria-label="Go back to previous page"
        className="w-11 h-11 flex items-center justify-center rounded-full 
        bg-[#2A2A2D] border border-[#3A3A3D] text-white 
        hover:bg-white hover:text-black hover:border-white 
        focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24">
          <path d="M15 19L8 12l7-7" />
        </svg>
      </button>

      {/* Home Button */}
      <button
        onClick={() =>
          navigate({
            to: "/",
            search: { page: 1, period: "day" },
          })
        }
        aria-label="Go to homepage"
        className="w-11 h-11 flex items-center justify-center rounded-full 
        bg-[#2A2A2D] border border-[#3A3A3D] text-white 
        hover:bg-white hover:text-black hover:border-white 
        focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24">
          <path d="M4 12l8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5" />
        </svg>
      </button>
    </section>
  );
};

export default BackHomeBtn;
