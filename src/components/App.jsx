import { Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import About from './Pages/About';
import Mileage from './Pages/Mileage';
import NotFound from './NotFound/NotFound';
import Layout from './Layout/Layout';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/mileage" element={<Layout><Mileage /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
