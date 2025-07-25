import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Home } from "lucide-react";


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
        <ChevronLeft className="w-6 h-6" />
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
        <Home className="w-6 h-6" />
        <span>Home</span>
      </button>
    </section>
  );
};

export default BackHomeBtn;
