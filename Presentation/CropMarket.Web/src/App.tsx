import { Route, Routes, Navigate } from 'react-router'
import type { Role } from './types'
import Navbar from './components/navbar/Navbar'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import NewListing from './pages/NewListing'

function App() {
  const { user } = useAuth()
  const role: Role = user ? user.role : 'guest'

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar role={role} name={user?.fullName} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings/new" element={role === 'farmer' ? <NewListing /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
