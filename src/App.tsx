import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import { IdeaSidebar } from './components/IdeaSidebar'
import { CommandPalette } from './components/CommandPalette'
import { IdeaFormModal } from './components/IdeaFormModal'
import { ToastProvider } from './lib/toast'
import { EVENT_COMMAND_PALETTE, EVENT_NEW_IDEA, onAppEvent } from './lib/bus'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  )
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [newIdeaOpen, setNewIdeaOpen] = useState(false)
  // The weekly panel is stream-centric and wants the full width; the idea
  // sidebar stays on every idea-centric page.
  const showSidebar = location.pathname !== '/'

  useEffect(() => {
    const offNewIdea = onAppEvent(EVENT_NEW_IDEA, () => setNewIdeaOpen(true))
    const offPalette = onAppEvent(EVENT_COMMAND_PALETTE, () => setPaletteOpen(true))

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
        return
      }
      if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (isTypingTarget(e.target)) return
        e.preventDefault()
        setNewIdeaOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      offNewIdea()
      offPalette()
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <div className="flex flex-1 flex-col md:flex-row">
          {showSidebar && <IdeaSidebar />}
          <main className="min-w-0 flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      {newIdeaOpen && (
        <IdeaFormModal
          onClose={() => setNewIdeaOpen(false)}
          onCreated={(id) => navigate(`/ideas/${id}`)}
        />
      )}
    </ToastProvider>
  )
}
