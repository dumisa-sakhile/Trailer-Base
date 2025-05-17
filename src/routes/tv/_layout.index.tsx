import { createFileRoute } from '@tanstack/react-router';
import Button from '@/components/Button';
import Header from '@/components/Header';

export const Route = createFileRoute('/tv/_layout/')({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: Tv,
})

function Tv() {
  return (
    <div className="w-full mt-[150px] md:mt-[120px] flex flex-col gap-5 lg:px-32 py-4  min-h-10">
      <Header />

      <section className="min-w-[300px]  mt-10 md:mt-0 w-full flex flex-col items-center justify-center gap-4 ">
        <h1 className="text-5xl text-left geist-bold ">Trailer Base</h1>
        <p className="roboto-condensed-light w-[300px] md:w-full text-center">
          Discover the latest trailers for movies and TV shows
        </p>
      </section>
      <br />
      <section className=" min-w-[300px] min-h-[50px] flex items-center justify-center gap-4">
        <Button variant="primary">Day</Button>
        <Button variant="ghost">week</Button>
      </section>
      <br />
      <section>
        <div className="absolute left-0 overflow-x-scroll  w-full h-[470px] ">
          <div className="flex animate-scroll gap-12 scale-95">
            
          </div>
        </div>
      </section>
    </div>
  );
}
