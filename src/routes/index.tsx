import { createFileRoute } from '@tanstack/react-router'
// import logo from '../logo.svg'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-red-300">
      home
    </div>
  )
}
