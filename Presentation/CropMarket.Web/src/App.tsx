import { Route, Routes, Navigate } from 'react-router'
import type { Role } from './types'
import Navbar from './components/navbar/Navbar'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import NewListing from './pages/NewListing'
import ListingDetail from './pages/ListingDetail'
import MyOrders from './pages/MyOrders'
import MyListings from './pages/MyListings'
import FarmerOrders from './pages/FarmerOrders'

function App() {
  const { user } = useAuth()
  const role: Role = user ? user.role : 'guest'

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar role={role} name={user?.fullName} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings/new" element={role === 'farmer' ? <NewListing /> : <Navigate to="/login" replace />} />
        <Route path="/listings/:id" element={<ListingDetail role={role} />} />
        <Route path="/orders" element={role === 'consumer' ? <MyOrders /> : <Navigate to="/login" replace />} />
        <Route path="/farmer/listings" element={role === 'farmer' ? <MyListings /> : <Navigate to="/login" replace />} />
        <Route path="/farmer/orders" element={role === 'farmer' ? <FarmerOrders /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
