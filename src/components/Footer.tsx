
const Footer = () => {
  return (
    <>
      <br />
      <footer className="w-full py-3 max-sm:py-2 bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-[rgba(0,0,0,0.6)] backdrop-blur-xl border-t border-gray-600/20 shadow-sm">
        <p className="text-center text-gray-100 text-md max-sm:text-xs roboto-condensed-light">
          © {new Date().getFullYear()} Trailer Base | Powered by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 hover:text-yellow-600 roboto-condensed-bold transition-colors duration-200">
            TMDb API
          </a>{" "}
          | Made with <span className="text-white">❤</span> by{" "}
          <a
            href="https://github.com/dumisa-sakhile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 hover:text-yellow-600 roboto-condensed-bold transition-colors duration-200">
            Dumisa Sakhile
          </a>
        </p>
      </footer>
      <br />
    </>
  );
}

export default Footer