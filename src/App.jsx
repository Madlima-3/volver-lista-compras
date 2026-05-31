import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout      from './router';
import HomePage    from './pages/HomePage';
import RecipesPage from './pages/RecipesPage';
import ListPage    from './pages/ListPage';
import ProfilePage from './pages/ProfilePage';
import MarketPage  from './pages/MarketPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index             element={<HomePage />} />
          <Route path="receitas"   element={<RecipesPage />} />
          <Route path="lista"      element={<ListPage />} />
          <Route path="perfil"     element={<ProfilePage />} />
        </Route>
        {/* Rota fora do Layout — sem barra de navegação inferior */}
        <Route path="lista/:id/mercado" element={<MarketPage />} />
      </Routes>
    </BrowserRouter>
  );
}
