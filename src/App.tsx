import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CarPage from './pages/CarPage';
import PhotoPage from './pages/PhotoPage';
import { isCarValid, type Car } from './types';

export default function App() {
  const [car, setCar] = useState<Car>({ brand: '', model: '', year: '', body: '' });
  const [photo, setPhoto] = useState<File | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = { '/': 'Начало', '/car': 'Автомобиль', '/photo': 'Фотография' };
    document.title = `${titles[pathname] || 'Начало'} — Осмотр авто`;
    document.querySelector<HTMLElement>('h1')?.focus();
  }, [pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/car" element={<CarPage car={car} onChange={setCar} />} />
        <Route path="/photo" element={isCarValid(car) ? <PhotoPage car={car} photo={photo} onChange={setPhoto} /> : <Navigate to="/car" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
