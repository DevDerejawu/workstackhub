//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from "@tanstack/react-query";
import './index.css'
import { router } from './router/index.tsx' 
import { queryClient } from './lib/react.query/client.ts'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-right" />
    <RouterProvider router={router} />
  </QueryClientProvider>

)
