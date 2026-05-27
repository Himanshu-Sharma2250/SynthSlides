import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
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
import { GenerationStatus } from '#/features/presentations/components/generation-status'
import { SlideCard } from '#/features/presentations/components/slide-card'
import { SlidePreview } from '#/features/presentations/components/slide-preview'
import { SlideshowModal } from '#/features/presentations/components/slideshow-modal'
import {
  LAYOUT_OPTIONS,
  SLIDE_STYLES,
  TONE_OPTIONS,
} from '#/features/presentations/constants/presentation-options'
import { useFullscreen } from '#/features/presentations/hooks/use-fullscreen'
import { usePresentationDetail } from '#/features/presentations/hooks/usePresentation-detail'
import { exportToPptx } from '#/features/presentations/lib/export-pptx'
import { presentationThumbnailUrl } from '#/features/presentations/utils/thumbnail-url'
import { getSession } from '#/lib/auth.functions'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Play,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/presentations/$presentationId')({
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
  component: PresentationDetailPage,
})

function PresentationDetailPage() {
  const { presentationId } = Route.useParams()
  const navigate = useNavigate()
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { isFullscreen, toggleFullscreen } = useFullscreen(
    'slide-preview-container',
  )

  const {
    query,
    slides,
    isGenerating,
    form,
    setForm,
    updateMut,
    regenerateMut,
    deleteMut,
  } = usePresentationDetail(presentationId, {
    onDeleted: () => navigate({ to: '/' }),
  })

  const handleExportPptx = useCallback(async () => {
    const data = query.data
    if (!data) return
    const slidesToExport = slides
    if (slidesToExport.length === 0) return

    setIsExporting(true)
    try {
      const filename = await exportToPptx({
        title: data.title,
        slides: slidesToExport,
      })
      toast.success(`Exported as ${filename}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }, [query.data, slides])

  if (query.isPending) {
    return (
      <main className="min-h-screen relative pt-24 pb-12 px-4 bg-background overflow-hidden">
        {/* Background terminal matrix */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0_/_3%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0_/_3%)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center justify-center py-20 space-y-4 select-none">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/80">
            COMPILING PRESENTATION WORKSPACE...
          </p>
        </div>
      </main>
    )
  }

  if (query.isError) {
    const error = query.error
    return (
      <main className="min-h-screen relative pt-24 pb-12 px-4 bg-background overflow-hidden">
        {/* Background terminal matrix */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0_/_3%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0_/_3%)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="max-w-xl mx-auto relative z-10 glass rounded-xl border border-destructive/20 p-8 text-center space-y-4">
          <p className="font-mono text-sm uppercase tracking-wider text-destructive leading-relaxed">
            {error instanceof Error ? error.message : 'Something went wrong during loading'}
          </p>
          <Button asChild variant="outline" className="h-9 rounded-md font-mono text-xs uppercase tracking-wider border-border/80 hover:border-primary/40 active:translate-y-[1px]">
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </div>
      </main>
    )
  }

  const data = query.data
  const thumb = presentationThumbnailUrl(data?.id!)
  const activeSlide = slides.at(activeSlideIndex)

  return (
    <main className="min-h-screen relative pt-24 pb-12 px-4 bg-background overflow-hidden">
      {/* Background terminal matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0_/_3%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0_/_3%)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Top Navigator Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 rounded-md font-mono text-xs uppercase tracking-wider gap-1.5 border border-border/40 hover:bg-muted/40 cursor-pointer active:translate-y-[1px]"
            >
              <Link to="/">
                <ArrowLeft className="size-3.5" />
                Back to console
              </Link>
            </Button>

            <GenerationStatus status={data?.status!} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {/* Presentation Details Sub-Bar */}
            <div className="glass rounded-xl border border-border/80 shadow-md p-4 flex flex-wrap items-center justify-between gap-4 bg-card/50 backdrop-blur-xl animate-fade-in-up">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={thumb}
                  alt=""
                  width={56}
                  height={56}
                  className="rounded-lg border border-border/60 bg-background/30 object-cover shrink-0 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-semibold truncate leading-tight tracking-tight">{data?.title}</h1>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80 mt-1">
                    {slides.length} SLIDES DECK
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {slides.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-md font-mono text-xs uppercase tracking-wider gap-1.5 border-border/70 hover:border-primary/40 hover:bg-muted/30 cursor-pointer active:translate-y-[1px]"
                      onClick={() => setShowSlideshow(true)}
                    >
                      <Play className="size-3.5 text-primary" />
                      <span>Slideshow</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-md font-mono text-xs uppercase tracking-wider gap-1.5 border-border/70 hover:border-primary/40 hover:bg-muted/30 cursor-pointer active:translate-y-[1px]"
                      onClick={handleExportPptx}
                      disabled={isExporting}
                    >
                      <Download className="size-3.5" />
                      <span>
                        {isExporting ? 'Exporting…' : 'Export PPTX'}
                      </span>
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-md font-mono text-xs uppercase tracking-wider gap-1.5 border-border/70 hover:border-primary/40 hover:bg-muted/30 cursor-pointer active:translate-y-[1px]"
                  disabled={regenerateMut.isPending || isGenerating}
                  onClick={() => regenerateMut.mutate()}
                >
                  <RefreshCw
                    className={`size-3.5 ${isGenerating ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isGenerating ? 'Compiling…' : 'Regenerate'}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-md font-mono text-xs uppercase tracking-wider border border-border/40 hover:bg-muted/40 cursor-pointer active:translate-y-[1px]"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {showSettings ? 'Hide settings' : 'Edit config'}
                </Button>
              </div>
            </div>

            {showSettings && (
              <div className="glass rounded-xl border border-border/80 shadow-lg overflow-hidden bg-card/60 backdrop-blur-xl animate-fade-in-up">
                {/* Console header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/40 text-[9px] text-muted-foreground/60 tracking-widest font-mono select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-destructive/30" />
                    <span className="size-2 rounded-full bg-yellow-500/30" />
                    <span className="size-2 rounded-full bg-primary/30" />
                  </div>
                  <div>SYNTHSLIDES // ENGINE_CONFIGURATION</div>
                  <div className="size-2 rounded-full bg-emerald-500/50" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pres-title" className="text-[10px] font-mono uppercase tracking-wider font-semibold text-muted-foreground/80">
                      Title
                    </Label>
                    <input
                      id="pres-title"
                      value={form.title}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          title: e.target.value,
                        }))
                      }
                      className="flex h-10 w-full rounded-md border border-border/50 bg-background/30 px-3 py-2 text-sm font-mono outline-none focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-mono uppercase tracking-wider font-semibold text-muted-foreground/80">Prompt</Label>
                    <Textarea
                      value={form.prompt}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          prompt: e.target.value,
                        }))
                      }
                      className="min-h-30 text-sm bg-background/30 border-border/50 rounded-md font-mono resize-y focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/10 transition-all scrollbar-thin"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
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
                        <SelectTrigger className="bg-background/30 border-border/50 rounded-md font-mono text-xs hover:border-primary/30 cursor-pointer transition-colors focus:ring-1 focus:ring-primary/30">
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
                        <SelectTrigger className="bg-background/30 border-border/50 rounded-md font-mono text-xs hover:border-primary/30 cursor-pointer transition-colors focus:ring-1 focus:ring-primary/30">
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
                        <SelectTrigger className="bg-background/30 border-border/50 rounded-md font-mono text-xs hover:border-primary/30 cursor-pointer transition-colors focus:ring-1 focus:ring-primary/30">
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

                  <div className="flex flex-wrap justify-between gap-3 pt-4 border-t border-border/20">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-9 rounded-md font-mono text-xs uppercase tracking-wider gap-2 cursor-pointer active:translate-y-[1px]"
                          disabled={deleteMut.isPending}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass border-border/85 animate-fade-in-up">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-semibold text-base">
                            Delete presentation?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            This action cannot be undone. This will permanently
                            delete your presentation and all its slides.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                          <AlertDialogCancel className="h-9 rounded-md font-mono text-xs uppercase tracking-wider border-border/60 hover:bg-muted/40 cursor-pointer active:translate-y-[1px]">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="h-9 rounded-md font-mono text-xs uppercase tracking-wider bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer active:translate-y-[1px]"
                            onClick={() => deleteMut.mutate()}
                          >
                            {deleteMut.isPending ? 'Deleting…' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 rounded-md font-mono text-xs uppercase tracking-wider gap-2 cursor-pointer active:translate-y-[1px]"
                      disabled={
                        updateMut.isPending ||
                        !form.title.trim() ||
                        !form.prompt.trim()
                      }
                      onClick={() => updateMut.mutate()}
                    >
                      <Save className="size-3.5" />
                      {updateMut.isPending ? 'Saving…' : 'Save config'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeSlide && (
              <div className="space-y-4 animate-fade-in-up">
                <div id="slide-preview-container" className="relative group rounded-xl overflow-hidden border border-border/80 shadow-lg bg-black/5">
                  <SlidePreview
                    slide={activeSlide}
                    isFullscreen={isFullscreen}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className={`absolute top-3 right-3 size-9 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 hover:bg-background border border-border/60 cursor-pointer ${
                      isFullscreen ? 'opacity-100' : ''
                    }`}
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="size-3.5" />
                  </Button>
                </div>
                {/* Navigator controls */}
                <div className="flex items-center justify-between font-mono text-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-md font-mono text-xs uppercase tracking-wider gap-1.5 border-border/70 hover:border-primary/40 hover:bg-muted/30 cursor-pointer active:translate-y-[1px] disabled:opacity-40"
                    disabled={activeSlideIndex === 0}
                    onClick={() =>
                      setActiveSlideIndex((i) => Math.max(0, i - 1))
                    }
                  >
                    <ChevronLeft className="size-3.5" />
                    Previous
                  </Button>
                  <span className="text-xs tracking-wider uppercase font-semibold text-muted-foreground/80">
                    SLIDE {activeSlideIndex + 1} // {slides.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-md font-mono text-xs uppercase tracking-wider gap-1.5 border-border/70 hover:border-primary/40 hover:bg-muted/30 cursor-pointer active:translate-y-[1px] disabled:opacity-40"
                    disabled={activeSlideIndex >= slides.length - 1}
                    onClick={() =>
                      setActiveSlideIndex((i) =>
                        Math.min(slides.length - 1, i + 1),
                      )
                    }
                  >
                    Next
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {slides.length === 0 && !isGenerating && (
              <div className="glass rounded-xl border border-border/70 p-12 text-center space-y-4 bg-card/30 backdrop-blur-xl animate-fade-in-up">
                <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                  No slides compiled yet. Seed workspace below.
                </p>
                <Button
                  className="h-9 rounded-md font-mono text-xs uppercase tracking-wider gap-2 cursor-pointer active:translate-y-[1px]"
                  onClick={() => regenerateMut.mutate()}
                  disabled={regenerateMut.isPending}
                >
                  <RefreshCw className="size-3.5" />
                  Generate slides
                </Button>
              </div>
            )}

            {slides.length === 0 && isGenerating && (
              <div className="glass rounded-xl border border-border/70 p-12 text-center space-y-4 bg-card/30 backdrop-blur-xl select-none animate-fade-in">
                <RefreshCw className="size-8 animate-spin mx-auto text-primary" />
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/80">
                  COMPILING PRESENTATION WORKSPACE...
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">
                  ESTIMATED COMPILATION TIME: ~60 SECONDS
                </p>
              </div>
            )}
          </div>

          {slides.length > 0 && (
            <aside className="lg:w-80 xl:w-96 flex flex-col shrink-0">
              <h2 className="font-mono text-[10px] uppercase tracking-widest px-2 pb-3 text-muted-foreground/80 select-none">
                Slide list deck
              </h2>
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-2 -mr-2 space-y-4 max-h-[calc(100vh-14rem)]">
                {slides.map((slide, i) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    isActive={i === activeSlideIndex}
                    onClick={() => setActiveSlideIndex(i)}
                  />
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>

      {showSlideshow && (
        <SlideshowModal
          slides={slides}
          initialIndex={activeSlideIndex}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </main>
  )
}
