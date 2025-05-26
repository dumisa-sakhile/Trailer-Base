import { useNavigate, useRouter } from "@tanstack/react-router";

const BackHomeBtn = () => {
  const navigate = useNavigate();
  const { history } = useRouter();

  return (
    <section className="absolute top-8 right-10 z-20 hidden sm:flex gap-4 md:gap-6">
      {/* Back Button */}
      <button
        className="group flex items-center gap-2 px-5 py-2.5
          bg-white/10 backdrop-blur-sm
          border border-white/20
          rounded-full shadow-md
          text-white
          font-semibold text-lg
          hover:bg-white/20
          hover:scale-105
          focus-visible:ring-2 focus-visible:ring-white
          transition-all duration-200"
        onClick={() => history.back()}
        aria-label="Go back to previous page">
        <span className="font-sans tracking-wide">&lt;</span>
        <span className="font-sans tracking-wide">Back</span>
      </button>

      {/* Home Button */}
      <button
        className="group flex items-center gap-2 px-5 py-2.5
          bg-white/10 backdrop-blur-sm
          border border-white/20
          rounded-full shadow-md
          text-white
          font-semibold text-lg
          hover:bg-white/20
          hover:scale-105
          focus-visible:ring-2 focus-visible:ring-white
          transition-all duration-200"
        onClick={() =>
          navigate({
            to: "/",
            search: { page: 1, period: "day" },
          })
        }
        aria-label="Go to homepage">
        <span className="font-sans tracking-wide">Home</span>
      </button>
    </section>
  );
};

export default BackHomeBtn;
