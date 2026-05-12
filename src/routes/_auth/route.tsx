import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className='min-h-screen w-full'>
      {/* <h1>Heading in auth</h1> */}
      <Outlet/>
    </div>
  )
}
