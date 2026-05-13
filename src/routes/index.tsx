import ThemeToggle from '#/components/ThemeToggle';
import { authClient } from '#/lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const {data} = authClient.useSession();

  console.log("Data: ", data)
  return (
    <div className="p-8">
      hello
    </div>
  )
}
