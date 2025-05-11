import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/movie/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div>movie home</div>
      
    </>
  );

}
