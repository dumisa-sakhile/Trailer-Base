import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/people/$personId")({
  loader: async ({ params }) => {
    return { personId: params.personId };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/people/$personId"!</div>
}
