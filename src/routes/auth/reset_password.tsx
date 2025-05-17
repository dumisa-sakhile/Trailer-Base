import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/reset_password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <title>Trailer Base - Reset Password</title>
    reset password
  </div>
}
