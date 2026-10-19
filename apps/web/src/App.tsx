import { Route, Routes } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { HomePage } from '@/pages/HomePage'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster />
    </>
  )
}
