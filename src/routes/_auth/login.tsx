import LoginForm from '#/components/auth/login_form'
import { getSession } from '#/lib/auth.functions'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Presentation } from 'lucide-react'
import { z } from 'zod'

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async () => {
    const session = await getSession()

    if (session) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background overflow-hidden">
      {/* Terminal grid/matrix background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0_/_3%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0_/_3%)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Custom terminal-style login window */}
        <div className="glass rounded-2xl border border-border/80 shadow-2xl overflow-hidden bg-card/60 backdrop-blur-xl">
          {/* Window Chrome Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/40 text-[10px] text-muted-foreground/60 tracking-widest font-mono select-none">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-destructive/40 border border-destructive/20" />
              <span className="size-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/20" />
              <span className="size-2.5 rounded-full bg-primary/40 border border-primary/20" />
            </div>
            <div className="font-medium text-muted-foreground/80">
              SYNTHSLIDES // AUTH_GATEWAY
            </div>
            <div className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="opacity-70 text-[9px]">SECURE</span>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Logo & Welcome */}
            <div className="flex flex-col items-center gap-4">
              <Link to="/" className="no-underline focus-visible:outline-none">
                <div className="size-14 rounded-xl border border-border bg-card/85 flex items-center justify-center shadow-md transition-all duration-300 hover:border-primary/50 group/logo">
                  <Presentation className="size-7 text-primary transition-transform duration-300 group-hover/logo:scale-110" />
                </div>
              </Link>
              <div className="text-center space-y-1">
                <h1 className="text-xl md:text-2xl font-medium tracking-tight">
                  Welcome to{' '}
                  <span className="text-primary font-semibold">
                    SynthSlides
                  </span>
                </h1>
                <p className="text-muted-foreground text-xs font-mono tracking-wide">
                  SIGN IN TO ENTER THE CREATIVE COMMAND DECK
                </p>
              </div>
            </div>

            {/* Login form */}
            <div className="pt-2">
              <LoginForm redirectTo={search.redirect} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
