import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/movie/$genreId')({
  
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/movie/$genreId"!</div>
}
