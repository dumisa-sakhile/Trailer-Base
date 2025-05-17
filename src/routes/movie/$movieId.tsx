import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/movie/$movieId")({
  validateSearch: (search: Record<string, string>) => ({
    title: search.title ?? 'Movie Details',
  }),
  component: MovieDetails,
});

function MovieDetails() {
  return <div>
    <title>Trailer Base - </title>
    {Route.useSearch().title}</div>;
}
