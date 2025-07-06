import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage.tsx';
import HomePage from './pages/HomePage.tsx';
import TransactionsPage from './pages/TransactionsPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path='/transactions' element={<TransactionsPage />} />
        <Route path='*' element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
