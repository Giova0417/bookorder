import './App.css';
import Navbar from './components/Navbar';
import Body from './components/Body';
import DiscoverMenu from './components/DiscoverMenu';
import { Box, Toolbar } from '@mui/material';

function App() {
  return (
    <>
      <Navbar/>
      <Toolbar />
       <Box>
      <Body/>
      <DiscoverMenu/>
      </Box>
    </>
      );
}

export default App;
