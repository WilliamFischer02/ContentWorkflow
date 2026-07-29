import { Outlet } from 'react-router-dom'
import { QuickLinksBar } from './components/QuickLinksBar'
import { IdeaSidebar } from './components/IdeaSidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <QuickLinksBar />
      <div className="flex flex-1 flex-col md:flex-row">
        <IdeaSidebar />
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
