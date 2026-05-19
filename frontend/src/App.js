import './App.css';
import Navbar from './components/Navbar';
import Body from './components/Body';
import DiscoverMenu from './components/DiscoverMenu';
import { Box, Toolbar } from '@mui/material';
import Menu from './components/Menu';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login'

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
      <BrowserRouter>
      <Navbar/>
      <Toolbar />
       <Box>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/login" element={<Login />}/>
      </Routes>
      </Box>
      </BrowserRouter>
    </>
      );
}

export default App;
