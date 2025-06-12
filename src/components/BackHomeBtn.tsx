import { useNavigate, useRouter } from "@tanstack/react-router";

const BackHomeBtn = () => {
  const navigate = useNavigate();
  const { history } = useRouter();

  return (
    <section className="absolute top-8 right-8 z-20 hidden sm:flex gap-4 pointer-events-auto">
      {/* Back Button */}
      <button
        onClick={() => history.back()}
        aria-label="Go back to previous page"
        className="
          button-style
        ">
        <svg
          className="w-6 h-6 flex-shrink-0 drop-shadow-md"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false">
          <path d="M15 19L8 12l7-7" />
        </svg>
        <span>Back</span>
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
        className="
          button-style
        ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
          className="flex-shrink-0 drop-shadow-md">
          <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
        </svg>
        <span>Home</span>
      </button>
    </section>
  );
};

export default BackHomeBtn;
