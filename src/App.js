import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from './components/Header/Header';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import { ModalProvider } from './Modal';


function App() {
  return (
    <Router>
        <ModalProvider>
        <Header />
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* удалить для редиректа эту строку
          <Route path="*" element={<Navigate to="/login" />} />
          удалить для редиректа эту строку*/}
        </Routes>
        </ModalProvider>
    </Router>
  );
}

export default App;