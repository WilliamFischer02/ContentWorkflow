import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './App'
import { WeeklyPage } from './pages/WeeklyPage'
import { DashboardPage } from './pages/DashboardPage'
import { BoardPage } from './pages/BoardPage'
import { IdeaPage } from './pages/IdeaPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { TemplateEditorPage } from './pages/TemplateEditorPage'
import { ToolkitPage } from './pages/ToolkitPage'
import { SettingsPage } from './pages/SettingsPage'

// GitHub Pages fallback: swap createBrowserRouter for createHashRouter and
// set base: '/ContentWorkflow/' in vite.config.ts (see README).
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <WeeklyPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'board', element: <BoardPage /> },
      { path: 'ideas/:ideaId', element: <IdeaPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'templates/:templateId', element: <TemplateEditorPage /> },
      { path: 'toolkit', element: <ToolkitPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <WeeklyPage /> },
    ],
  },
])
