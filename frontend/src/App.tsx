import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Ratings } from './pages/Ratings';
import { Surveys } from './pages/Surveys';
import { Personnel } from './pages/Personnel';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="ratings" element={<Ratings />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="personnel" element={<Personnel />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
