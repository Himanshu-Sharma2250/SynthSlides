import { Button } from '#/components/ui/button'
import { getSession } from '#/lib/auth.functions'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  RefreshCw,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSession()

    if (session) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: LandingPage,
})

const MOCK_STEPS = [
  { id: 'write', label: '1. Write Outline' },
  { id: 'compile', label: '2. Compile Engine' },
  { id: 'inspect', label: '3. Inspect Deck' },
]

const MOCK_SLIDES = [
  {
    title: 'SYNTHSLIDES',
    subtitle: 'The Expert Editor\'s Presentation Terminal',
    content: 'An opinionated workspace designed for creators who demand speed, typographic precision, and structural layout sanity.',
    footer: '01 // INTRODUCTION',
  },
  {
    title: 'THE PROBLEM',
    subtitle: 'Death by Generic Templates',
    content: 'Standard presentation tools rely on copy-paste templates, cluttered visual drag-and-drop layers, and auto-generated slop that feels unprofessional.',
    footer: '02 // PROBLEM SPACE',
  },
  {
    title: 'THE SOLUTION',
    subtitle: 'Precision Code-Like Generation',
    content: 'Convert raw markdown outlines and text outlines into structured, 1px bordered terminal-style slides instantly. Layout is code; compilation is instant.',
    footer: '03 // SOLUTION SPACE',
  },
  {
    title: 'DESIGN SYSTEM',
    subtitle: 'Geist Mono + Cyber Ochre',
    content: 'Relying exclusively on monospace typography, high-contrast structural grids, and a highly disciplined 10% golden-yellow accent strategy.',
    footer: '04 // SYSTEM TOKENS',
  },
]

function LandingPage() {
  const [activeStep, setActiveStep] = useState<'write' | 'compile' | 'inspect'>('write')
  const [typedText, setTypedText] = useState('')
  const [compileProgress, setCompileProgress] = useState(0)
  const [compileLogs, setCompileLogs] = useState<string[]>([])
  const [slideIndex, setSlideIndex] = useState(0)
  const [autoPlaying, setAutoPlaying] = useState(true)

  const promptText = `// SYNTHSLIDES COMPILER INSTRUCTIONS
#title: "SynthSlides Engine"
#theme: "expert-editor-terminal"
#accent: "cyber-ochre"

- Slide 1: Introduction // SynthSlides Workspace
- Slide 2: The Problem // Slide Template Slop
- Slide 3: The Solution // Monospace Precision
- Slide 4: Design Tokens // 1px Structural Grids`

  // Typing simulator effect
  useEffect(() => {
    if (activeStep !== 'write') return
    let index = 0
    setTypedText('')
    const interval = setInterval(() => {
      if (index < promptText.length) {
        setTypedText((prev) => prev + promptText.charAt(index))
        index++
      } else {
        clearInterval(interval)
        // Transition to compile step automatically if autoPlaying
        if (autoPlaying) {
          const timeout = setTimeout(() => {
            setActiveStep('compile')
          }, 1200)
          return () => clearTimeout(timeout)
        }
      }
    }, 18) // Snappy typing speed

    return () => clearInterval(interval)
  }, [activeStep, autoPlaying])

  // Compiler progress simulation
  useEffect(() => {
    if (activeStep !== 'compile') return
    setCompileProgress(0)
    setCompileLogs([])

    const logs = [
      'Initializing compiler runtime...',
      'Parsing outline prompt structural blocks...',
      'Validating Geist Mono typographic hierarchy...',
      'Mapping Cyber Ochre accent rules (<= 10% area)...',
      'Assembling 1px grid border panels...',
      'Compiling 4 presentation slides successfully.'
    ]

    let currentLogIndex = 0
    let progress = 0

    const progressInterval = setInterval(() => {
      progress += 2
      setCompileProgress(progress)

      if (progress % 20 === 0 && currentLogIndex < logs.length) {
        setCompileLogs((prev) => [...prev, `> ${logs[currentLogIndex]}`])
        currentLogIndex++
      }

      if (progress >= 100) {
        clearInterval(progressInterval)
        if (autoPlaying) {
          const timeout = setTimeout(() => {
            setActiveStep('inspect')
            setSlideIndex(0)
          }, 1000)
          return () => clearTimeout(timeout)
        }
      }
    }, 40)

    return () => clearInterval(progressInterval)
  }, [activeStep, autoPlaying])

  // General loop auto-play controller
  useEffect(() => {
    if (!autoPlaying) return
    if (activeStep === 'inspect') {
      const slideInterval = setInterval(() => {
        setSlideIndex((prev) => {
          if (prev < MOCK_SLIDES.length - 1) {
            return prev + 1
          } else {
            // Restart loop back to step 1
            clearInterval(slideInterval)
            const timeout = setTimeout(() => {
              setActiveStep('write')
            }, 3000)
            return prev
          }
        })
      }, 2500)
      return () => clearInterval(slideInterval)
    }
  }, [activeStep, autoPlaying])

  const handleStepClick = (stepId: 'write' | 'compile' | 'inspect') => {
    setAutoPlaying(false)
    setActiveStep(stepId)
    if (stepId === 'inspect') {
      setSlideIndex(0)
    }
  }

  const handlePrevSlide = () => {
    setAutoPlaying(false)
    setSlideIndex((prev) => (prev > 0 ? prev - 1 : MOCK_SLIDES.length - 1))
  }

  const handleNextSlide = () => {
    setAutoPlaying(false)
    setSlideIndex((prev) => (prev < MOCK_SLIDES.length - 1 ? prev + 1 : 0))
  }

  const handleResetDemo = () => {
    setAutoPlaying(true)
    setActiveStep('write')
  }

  return (
    <main className="min-h-screen relative pt-28 pb-20 px-4 bg-background overflow-hidden font-mono">
      {/* Decorative Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Hero Content */}
          <div className="lg:col-span-5 space-y-6 text-left pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] uppercase tracking-widest font-semibold">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Engine V1.0 Active
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-foreground">
              Create structured slides at <span className="text-primary font-semibold">compiler</span> speed.
            </h1>
            
            <p className="text-muted-foreground text-xs leading-relaxed max-w-[65ch]">
              Turn text outlines, raw notes, or Markdown files into clean, professional, monospace-forward presentations in seconds. Fully responsive layout structure with zero template clutter.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild size="lg" className="h-11 rounded-md px-6 gap-2 text-xs uppercase tracking-wider font-semibold active:translate-y-[1px] cursor-pointer">
                <Link to="/login">
                  Get Started <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleResetDemo}
                className="h-11 rounded-md px-6 gap-2 text-xs border-border/80 hover:border-primary/50 text-foreground uppercase tracking-wider font-semibold bg-background/20 backdrop-blur-sm cursor-pointer"
              >
                <Play className="size-3.5 fill-current" /> Auto Demo
              </Button>
            </div>

            {/* Micro details */}
            <div className="flex items-center gap-6 pt-4 text-[10px] text-muted-foreground/60 uppercase tracking-widest select-none">
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-primary" />
                <span>Geist Mono Only</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-primary" />
                <span>PPTX Native Export</span>
              </div>
            </div>
          </div>

          {/* Interactive Terminal simulator */}
          <div className="lg:col-span-7 w-full">
            <div className="glass rounded-xl border border-border shadow-2xl overflow-hidden bg-card/65 backdrop-blur-xl">
              {/* Terminal Chrome Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40 text-[9px] text-muted-foreground/70 tracking-widest select-none">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-destructive/30 border border-destructive/20" />
                  <span className="size-2 rounded-full bg-yellow-500/30 border border-yellow-500/20" />
                  <span className="size-2 rounded-full bg-primary/30 border border-primary/20" />
                </div>
                <div className="font-semibold text-muted-foreground flex items-center gap-1">
                  <Terminal className="size-3 text-primary" />
                  SYNTHSLIDES_WORKSPACE // MOCK_SIMULATOR
                </div>
                <button 
                  onClick={handleResetDemo}
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer text-[8px] uppercase tracking-wider bg-transparent border-0"
                >
                  <RefreshCw className={`size-2.5 ${autoPlaying ? 'animate-spin' : ''}`} />
                  {autoPlaying ? 'Looping' : 'Reset'}
                </button>
              </div>

              {/* Step Navigation Tabs */}
              <div className="grid grid-cols-3 border-b border-border/50 bg-background/20 select-none">
                {MOCK_STEPS.map((step) => {
                  const isActive = activeStep === step.id
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(step.id as 'write' | 'compile' | 'inspect')}
                      className={`py-2 px-3 text-[10px] font-semibold uppercase tracking-wider border-r border-border/30 last:border-r-0 transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-muted/70 text-primary border-b border-b-primary font-bold' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                      }`}
                    >
                      {step.label}
                    </button>
                  )
                })}
              </div>

              {/* Console Panes Screen */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px] max-h-[340px] bg-background/10">
                {/* Left Pane - Command / Outline Input */}
                <div className="md:col-span-5 p-4 border-b md:border-b-0 md:border-r border-border/50 flex flex-col justify-between overflow-hidden bg-background/20">
                  <div className="space-y-1.5 overflow-y-auto scrollbar-thin h-full max-h-[260px] pr-1">
                    <div className="text-[10px] text-muted-foreground/60 uppercase tracking-widest select-none pb-1 font-semibold">
                      Prompt Console
                    </div>
                    {activeStep === 'write' ? (
                      <pre className="text-xs leading-relaxed text-foreground whitespace-pre-wrap font-mono break-all">
                        {typedText}
                        <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse" />
                      </pre>
                    ) : (
                      <pre className="text-xs leading-relaxed text-muted-foreground/60 whitespace-pre-wrap font-mono break-all select-none">
                        {promptText}
                      </pre>
                    )}
                  </div>
                  <div className="text-[8px] text-muted-foreground/50 uppercase tracking-wider pt-2 border-t border-border/20 select-none">
                    Status: {activeStep === 'write' ? 'Entering text outline...' : 'Prompt finalized'}
                  </div>
                </div>

                {/* Right Pane - Visual Preview (Live Slide Deck) */}
                <div className="md:col-span-7 p-4 flex flex-col justify-between overflow-hidden relative">
                  <div className="text-[10px] text-muted-foreground/60 uppercase tracking-widest select-none pb-2 font-semibold flex items-center justify-between">
                    <span>Rendering Output</span>
                    {activeStep === 'inspect' && (
                      <span className="text-[9px] text-primary lowercase">
                        slide {slideIndex + 1} of {MOCK_SLIDES.length}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center relative">
                    {/* Step 1: Write State Graphic */}
                    {activeStep === 'write' && (
                      <div className="text-center p-6 space-y-3 select-none">
                        <Terminal className="size-8 text-muted-foreground/30 mx-auto animate-pulse" />
                        <div className="text-xs text-muted-foreground/80">
                          Waiting for outline input...
                        </div>
                        <div className="text-[9px] text-muted-foreground/50 lowercase">
                          editor is compiling variables in real-time
                        </div>
                      </div>
                    )}

                    {/* Step 2: Compile Loading Bar */}
                    {activeStep === 'compile' && (
                      <div className="w-full px-6 space-y-4">
                        <div className="space-y-1.5 select-none">
                          <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground/80 uppercase">
                            <span>Compiling Slides</span>
                            <span className="text-primary font-bold">{compileProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted/65 rounded-full overflow-hidden border border-border/50">
                            <div 
                              className="h-full bg-primary transition-all duration-75"
                              style={{ width: `${compileProgress}%` }}
                            />
                          </div>
                        </div>

                        {/* Live Compilation Logs */}
                        <div className="bg-background/45 p-3 rounded-lg border border-border/40 font-mono text-[9px] leading-relaxed text-muted-foreground/80 h-28 overflow-y-auto scrollbar-thin">
                          {compileLogs.map((log, index) => (
                            <div key={index} className="transition-opacity duration-200">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Slide Specimen Output */}
                    {activeStep === 'inspect' && (
                      <div className="w-full h-full max-h-[220px] rounded-lg border border-border bg-card shadow-lg p-5 flex flex-col justify-between text-card-foreground select-none relative group overflow-hidden">
                        {/* Slide Grid watermark background */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:16px_16px] opacity-[3%] pointer-events-none" />
                        
                        {/* Slide Title / Accent */}
                        <div className="space-y-1 relative z-10">
                          <div className="text-[8px] tracking-widest text-primary font-bold uppercase">
                            {MOCK_SLIDES[slideIndex].subtitle}
                          </div>
                          <h3 className="text-lg font-bold tracking-tight text-foreground">
                            {MOCK_SLIDES[slideIndex].title}
                          </h3>
                        </div>

                        {/* Slide content description */}
                        <p className="text-[11px] leading-relaxed text-muted-foreground relative z-10 max-w-[50ch] py-2">
                          {MOCK_SLIDES[slideIndex].content}
                        </p>

                        {/* Slide Footer */}
                        <div className="flex justify-between items-center text-[8px] font-semibold text-muted-foreground/70 uppercase tracking-widest pt-2 border-t border-border/25 relative z-10">
                          <span>{MOCK_SLIDES[slideIndex].footer}</span>
                          <span>SYNTHSLIDES V1.0</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Control for Inspect Slide state */}
                  <div className="pt-3 border-t border-border/25 flex justify-between items-center select-none min-h-[38px]">
                    {activeStep === 'inspect' ? (
                      <>
                        <div className="flex gap-1.5">
                          <button
                            onClick={handlePrevSlide}
                            className="size-7 rounded border border-border/80 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 bg-background/30 hover:bg-muted/40 transition-all cursor-pointer active:translate-y-px"
                          >
                            <ChevronLeft className="size-4" />
                          </button>
                          <button
                            onClick={handleNextSlide}
                            className="size-7 rounded border border-border/80 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 bg-background/30 hover:bg-muted/40 transition-all cursor-pointer active:translate-y-px"
                          >
                            <ChevronRight className="size-4" />
                          </button>
                        </div>
                        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">
                          Use buttons to inspect output deck
                        </span>
                      </>
                    ) : (
                      <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mx-auto text-center py-1">
                        Compiler must finish to inspect output
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Features Grid */}
        <div className="pt-12 border-t border-border/60">
          <div className="text-center space-y-2 pb-8">
            <h2 className="text-xl md:text-2xl font-medium tracking-tight">
              Engine Characteristics
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold select-none">
              Strict rules of SynthSlides presentation compilation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-border rounded-xl overflow-hidden bg-card/15 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="p-6 space-y-3">
              <div className="text-primary font-semibold text-xs tracking-wider">
                01 // MONOSPACE NATIVE
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Unified Typographic Rhythm
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utilizes Geist Mono strictly across display, body, and labels to replicate a robust terminal IDE feel.
              </p>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-primary font-semibold text-xs tracking-wider">
                02 // STRUCTURED GRIDS
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Zero Template Clutter
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Defines regions with solid 1px structural borders rather than soft shadows or generic card stacks.
              </p>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-primary font-semibold text-xs tracking-wider">
                03 // CONSTRAINED COLOR
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Accent Contrast Rule
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cyber Ochre accent color stays rarity-locked (under 10% area) and contrast-safe for maximum legibility.
              </p>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-primary font-semibold text-xs tracking-wider">
                04 // FLUID TRANSITIONS
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Snappy Physics
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Transitions rely on exponential decellerations for interactive states to maintain performance feel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
