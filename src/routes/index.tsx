import { createFileRoute, Link } from '@tanstack/react-router'
import logo from '../logo.svg'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="mt-[120px] flex flex-col gap-5 px-32 py-4">
      <header className="fixed top-0 left-0 w-full h-[70px] shadow  grid grid-cols-3 bg-inherit px-32 py-4">
        <nav className="flex items-center gap-4">
          <img src={logo} alt="logo" className="w-12 h-12" />
          <Link to="/">Movies</Link>
          <Link to="/">TV</Link>
          <Link to="/">People</Link>
        </nav>
        <nav className="flex items-center">
          <input
            type="search"
            name="search"
            id=""
            placeholder="Search a Movie, TV show..."
            className="p-2 rounded-full h-[48px] w-full bg-[#333] pl-8 outline-none geist-light text-sm"
          />
        </nav>
        <nav></nav>
      </header>

      <h1 className="text-5xl text-left geist-regular">Trailer Base</h1>
      <p>Your one stop shop for movie and tv show trailers </p>
      <div className=" min-w-full rounded-full h-[70px] flex items-center justify-between px-4 ">
      <button className="text-black roboto-condensed-regular  bg-white text-sm py-2 px-4">Success</button>
      </div>

      {/* <div className="carousel carousel-end rounded-box">
        <div className="carousel-item">
          <img
            src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp"
            alt="Drink"
          />
        </div>
        <div className="carousel-item">
          <img
            src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
            alt="Drink"
          />
        </div>
        <div className="carousel-item">
          <img
            src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp"
            alt="Drink"
          />
        </div>
        <div className="carousel-item">
          <img
            src="https://img.daisyui.com/images/stock/photo-1494253109108-2e30c049369b.webp"
            alt="Drink"
          />
        </div>
        <div className="carousel-item">
          <img
            src="https://img.daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.webp"
            alt="Drink"
          />
        </div>
        <div className="carousel-item">
          <img
            src="https://img.daisyui.com/images/stock/photo-1559181567-c3190ca9959b.webp"
            alt="Drink"
          />
        </div>
        <div className="carousel-item">
          <img
            src="https://img.daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.webp"
            alt="Drink"
          />
        </div>
      </div> */}
    </div>
  );
}
