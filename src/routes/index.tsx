// import ThemeToggle from '#/components/ThemeToggle';
// import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'
import { createPresentation } from '#/features/presentations/actions/presentation-mutation'
import { listPresentations } from '#/features/presentations/actions/presentation-query'
import { PresentationListSection } from '#/features/presentations/components/presentation-list-section'
import {
  LAYOUT_OPTIONS,
  SLIDE_STYLES,
  TONE_OPTIONS,
} from '#/features/presentations/constants/presentation-options'
import { PRESENTATION_TEMPLATES } from '#/features/presentations/constants/presentation-template'
import { presentationQueryKeys } from '#/features/presentations/hooks/query-keys'
import { getSession } from '#/lib/auth.functions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Sparkles, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type HomeFormState = {
  content: string
  slideCount: number
  style: (typeof SLIDE_STYLES)[number]['value']
  tone: (typeof TONE_OPTIONS)[number]['value']
  layout: (typeof LAYOUT_OPTIONS)[number]['value']
}

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    return { user: session.user }
  },
  component: Home,
})

function Home() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    content: '',
    slideCount: 8,
    style: 'minimal',
    tone: 'formal',
    layout: 'balanced',
  })

  const { data: presentations = [], isPending: listPending } = useQuery({
    queryKey: presentationQueryKeys.list(),
    queryFn: () => listPresentations(),
  })

  const createMut = useMutation({
    mutationFn: () =>
      createPresentation({
        data: {
          prompt: form.content.trim(),
          slideCount: form.slideCount,
          style: form.style,
          tone: form.tone,
          layout: form.layout,
        },
      }),
    onSuccess: (presentation) => {
      toast.success('Presentation created')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: presentation.id },
      })
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : 'Could not create presentation',
      )
    },
  })

  const handleGenerate = () => {
    if (!form.content.trim()) {
      toast.error('Please enter your content first')
      return
    }
    createMut.mutate()
  }

  return (
    <main className="min-h-screen relative pt-24 pb-12 px-4 bg-background overflow-hidden">
      {/* Background terminal matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0_/_3%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0_/_3%)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-10">
        <PresentationListSection
          presentations={presentations}
          isPending={listPending}
        />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
            What do you want to{' '}
            <span className="text-primary font-semibold">create?</span>
          </h1>
          <p className="text-muted-foreground text-sm font-mono tracking-wide uppercase opacity-80">
            Enter your content outline below to compile a presentation deck
          </p>
        </div>

        {/* Custom Terminal Control Console */}
        <div className="glass rounded-2xl border border-border/80 shadow-2xl overflow-hidden bg-card/60 backdrop-blur-xl">
          {/* Console Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/40 text-[10px] text-muted-foreground/60 tracking-widest font-mono select-none">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-destructive/40 border border-destructive/20" />
              <span className="size-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/20" />
              <span className="size-2.5 rounded-full bg-primary/40 border border-primary/20" />
            </div>
            <div className="font-medium text-muted-foreground/80">
              SYNTHSLIDES // ENGINE_INPUT_CONSOLE
            </div>
            <div className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span className="opacity-70 text-[9px] uppercase font-semibold text-primary">READY</span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Textarea */}
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your presentation topic, paste your notes, or outline your key points..."
                value={form.content}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    content: e.target.value,
                  }))
                }
                className="h-50 min-h-50 max-h-50 overflow-y-auto text-sm bg-background/30 border-border/50 rounded-md resize-none font-mono focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/10 transition-all placeholder:opacity-50 leading-relaxed scrollbar-thin"
              />
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 px-1 select-none">
                <span>{form.content.length.toLocaleString()} characters</span>
                <span>Markdown outline supported</span>
              </div>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              {/* Slide count */}
              <div className="space-y-3 font-mono">
                <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">
                  Slides: <span className="text-primary font-bold">{form.slideCount}</span>
                </Label>
                <Slider
                  value={[form.slideCount]}
                  onValueChange={([v]) =>
                    setForm((s) => ({
                      ...s,
                      slideCount: v,
                    }))
                  }
                  min={3}
                  max={20}
                  step={1}
                  className="py-2 cursor-pointer"
                />
              </div>

              {/* Style */}
              <div className="space-y-2">
                <Label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-muted-foreground/80">Style</Label>
                <Select
                  value={form.style}
                  onValueChange={(value) =>
                    setForm((s) => ({
                      ...s,
                      style: value,
                    }))
                  }
                >
                  <SelectTrigger className="bg-background/40 border-border/50 rounded-md font-mono text-xs hover:border-primary/30 cursor-pointer transition-colors focus:ring-1 focus:ring-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/80">
                    {SLIDE_STYLES.map((s) => (
                      <SelectItem className="font-mono text-xs cursor-pointer hover:bg-muted/40 transition-colors" key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-muted-foreground/80">Tone</Label>
                <Select
                  value={form.tone}
                  onValueChange={(value) =>
                    setForm((s) => ({
                      ...s,
                      tone: value,
                    }))
                  }
                >
                  <SelectTrigger className="bg-background/40 border-border/50 rounded-md font-mono text-xs hover:border-primary/30 cursor-pointer transition-colors focus:ring-1 focus:ring-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/80">
                    {TONE_OPTIONS.map((t) => (
                      <SelectItem className="font-mono text-xs cursor-pointer hover:bg-muted/40 transition-colors" key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Layout */}
              <div className="space-y-2">
                <Label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-muted-foreground/80">Layout</Label>
                <Select
                  value={form.layout}
                  onValueChange={(value) =>
                    setForm((s) => ({
                      ...s,
                      layout: value,
                    }))
                  }
                >
                  <SelectTrigger className="bg-background/40 border-border/50 rounded-md font-mono text-xs hover:border-primary/30 cursor-pointer transition-colors focus:ring-1 focus:ring-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/80">
                    {LAYOUT_OPTIONS.map((l) => (
                      <SelectItem className="font-mono text-xs cursor-pointer hover:bg-muted/40 transition-colors" key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate button */}
            <div className="flex justify-end pt-4 border-t border-border/20">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={createMut.isPending || !form.content.trim()}
                className="h-10 rounded-md px-8 gap-2 font-mono text-xs uppercase tracking-wider font-semibold active:translate-y-[1px] cursor-pointer"
              >
                {createMut.isPending ? (
                  <>
                    <Sparkles className="size-4 animate-pulse text-primary-foreground" />
                    Compiling…
                  </>
                ) : (
                  <>
                    <Wand2 className="size-4" />
                    Compile PPT
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-3 pt-4 select-none">
          <p className="text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
            Quick seed templates
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {PRESENTATION_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  setForm({
                    content: template.content,
                    slideCount: template.slides,
                    style: template.style,
                    tone: template.tone,
                    layout: template.layout,
                  })
                }}
                className="px-4 py-2 text-xs font-mono rounded-md border border-border/40 bg-card/45 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-muted/40 transition-all duration-200 cursor-pointer active:translate-y-[1px]"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
