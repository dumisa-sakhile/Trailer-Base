import Button from '@/components/Button';
import { createFileRoute, Link } from '@tanstack/react-router'
import male from "/male.jpg?url";

export const Route = createFileRoute('/auth/profile')({
  component: Profile,
})

function Profile() {
  const watchlist = [
    
    {
      id: 2,
      title: "Inception",
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      vote_average: 8.8,
      release_date: "2010-07-16",
    },
    {
      id: 3,
      title: "Blade Runner",
      poster_path: "/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg",
      vote_average: 7.9,
      release_date: "1982-06-25",
    },
  ];
    return (
      <>
        <title>Trailer Base - Profile</title>

        <div className="w-full min-h-lvh flex flex-col gap-12 py-8 px-4 md:px-10">
          <h1 className="text-4xl md:text-5xl text-left roboto-condensed-bold tracking-tight">
            Profile
          </h1>

          <section className="flex flex-col md:flex-row items-center justify-around gap-8 md:gap-12">
            <aside className="flex items-center gap-6 flex-col">
              <img src={male} alt="" className="w-32 h-32 rounded-full" />
              <h3 className="roboto-condensed-light text-xl md:text-2xl text-gray-200">
                Jabulani Zondi
              </h3>
            </aside>
            <Button variant="primary">Edit Profile</Button>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl md:text-3xl roboto-condensed-bold mb-6">
              Your Bookmark
            </h2>
            <div className="flex flex-wrap gap-6">
              {watchlist.map(
                ({ id, title, poster_path, vote_average, release_date }) => (
                  <div className="relative group" key={id}>
                    <Link
                      to="/movie/$movieId"
                      params={{ movieId: id.toString() }}
                      className="w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden geist-light hover:ring-1 hover:ring-gray-400 hover:rotate-3">
                      <img
                        src={
                          poster_path
                            ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                            : "https://via.placeholder.com/300x450?text=No+Poster"
                        }
                        alt={title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent transition-opacity flex flex-col justify-end p-4 rounded-lg">
                        <p className="text-gray-300 text-sm">{vote_average}</p>
                        <p className="text-gray-300 text-sm">{release_date}</p>
                        <h3 className="text-white text-lg roboto-condensed-bold">
                          {title}
                        </h3>
                      </div>
                    </Link>
                    <button
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-sm roboto-condensed-light px-3 py-1 rounded-full hover:bg-gray-700 transition-all duration-300"
                      onClick={() => alert(`Remove ${title} from watchlist`)}>
                      Remove
                    </button>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </>
    );
}
