import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateProperty from './pages/CreateProperty';
import PropertyDetail from './pages/PropertyDetail';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <Link to="/" className="logo">
            <div className="logo-icon">B</div>
            <h1>Buena</h1>
          </Link>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateProperty />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
