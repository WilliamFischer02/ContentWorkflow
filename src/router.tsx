import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './App'
import { DashboardPage } from './pages/DashboardPage'
import { IdeaPage } from './pages/IdeaPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { TemplateEditorPage } from './pages/TemplateEditorPage'

// GitHub Pages fallback: swap createBrowserRouter for createHashRouter and
// set base: '/ContentWorkflow/' in vite.config.ts (see README).
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'ideas/:ideaId', element: <IdeaPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'templates/:templateId', element: <TemplateEditorPage /> },
      { path: '*', element: <DashboardPage /> },
    ],
  },
])
