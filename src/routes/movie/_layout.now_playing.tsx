import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/movie/_layout/now_playing")({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: NowPlaying,
});

function NowPlaying() {
  return <div>
    <title>Trailer Base - Now Playing</title>
    now playing</div>
}
