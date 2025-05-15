
const PortraitCard = () => {
  return (
    <div className="w-[300px] min-h-[169px] rounded-md overflow-hidden shadow-md">
      <img
        src="https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/xb9wpY31SeVZbfkevYuolhfV63w.jpg"
        alt="movie"
        className="w-full h-full rounded-md"
      />
      <div className="p-4">
        <h2 className="text-xl font-bold">
          The lord of the rings : The Return of the King
        </h2>
        <p className="text-sm text-gray-200 roboto-condensed-regular">Release Date: 2023-10-01</p>
        <p className="text-sm text-gray-200 roboto-condensed-regular">Rating: 8.5/10</p>
        <p className="text-sm text-gray-200 roboto-condensed-regular">
          Overview: This is a brief overview of the movie.
        </p>
      </div>
    </div>
  );
}

export default PortraitCard