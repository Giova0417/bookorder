import './App.css';
import Navbar from './components/Navbar';
import Body from './components/Body';
import DiscoverMenu from './components/DiscoverMenu';
import { Box, Toolbar } from '@mui/material';
import Menu from './components/Menu';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login'
import Register from './components/Register'
import Cart from './components/Cart'
import Ordini from './components/Ordini'
import StaffOrders from './components/StaffOrders'
import { CartProvider } from './components/CartContext';
function HomePage() {
  return (
    <>
      <Body />
      <DiscoverMenu />
    </>
  );
}
function App() {
  return (
    <>
    <CartProvider>
      <BrowserRouter>
      <Navbar/>
      <Toolbar sx={{ backgroundColor: '#1a1a1a' }} />
       <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#1a1a1a' }}>
        <Routes>
          <Route path="/"   element={<HomePage />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/login" element={<Login />}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/cart" element={<Cart />}/>
          <Route path="/ordini" element={<Ordini />}/>
          <Route path="/staff" element={<StaffOrders />}/>
      </Routes>
      </Box>
      </BrowserRouter>
      </CartProvider>
    </>
      );
}

export default App;
