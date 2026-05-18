import './App.css';
import Navbar from './components/Navbar';
import Body from './components/Body';
import DiscoverMenu from './components/DiscoverMenu';
import { Box, Toolbar } from '@mui/material';
import Menu from './components/Menu';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
      </Routes>
      </Box>
      </BrowserRouter>
    </>
      );
}

export default App;
