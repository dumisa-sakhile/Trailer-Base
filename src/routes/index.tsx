import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import Button from "@/components/Button";


export const Route = createFileRoute("/")({
  component: App,
});

function App() {

  
    const tvShows = Array.from({ length: 25 }, (_, index) => ({
      title: `Show ${index + 1}`,
      date: `2023-10-${index + 1}`,
      imageUrl:
        "https://media.themoviedb.org/t/p/w440_and_h660_face/oLxWocqheC8XbXbxqJ3x422j9PW.jpg",
    }));

  return (
    <div className="mt-[120px] flex flex-col gap-5 px-32 py-4">
      <Header />
      <br />
      <br />

      <section className="w-full flex items-center justify-center gap-4">
        <h1 className="text-5xl text-left geist-bold pink">Trailer Base</h1>
        <br />
        <br />
        <p className="geist-light">Trending Movies this:</p>
      </section>

      <section>
        <br />
        <section className="w-full flex items-center justify-center gap-4">
          <Button variant="primary">Day</Button>
          <Button variant="ghost">week</Button>
        </section>
        <br />
        <div className="absolute left-0 overflow-x-scroll  w-full h-[470px]">
          <div className="flex animate-scroll gap-12 scale-95">
            {tvShows.map((show, index) => (
              <Link
                to="/"
                key={index}
                className="w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 hover:rotate-3 transition-transform duration-300 ease-in-out overflow-hidden stack geist-light">
                <img
                  src={show.imageUrl}
                  alt={show.title}
                  className="w-full h-full object-cover rounded-lg overflow-hidden"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black   transition-opacity flex flex-col justify-end p-4 rounded-lg">
                  <h3 className="text-white text-lg">{show.title}</h3>
                  <p className="text-white text-sm">{show.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
