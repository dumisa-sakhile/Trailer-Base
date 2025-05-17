import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/movie/$genreId')({
  
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello 
    <title>Trailer Base - Movies</title>
    GENRE movies
    
  </div>
}
