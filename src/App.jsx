import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toast } from './components/common/Toast';
import { HomePage } from './pages/HomePage';
import { CameraPage } from './pages/CameraPage';
import { BookListPage } from './pages/BookListPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { BookEditPage } from './pages/BookEditPage';
import { SettingsPage } from './pages/SettingsPage';
import './App.css';

/**
 * 메인 App 컴포넌트
 */
function App() {
  return (
    <Router basename="/reading-books">
      <div className="App bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/books" element={<BookListPage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
          <Route path="/books/:bookId/pages/:pageId/edit" element={<BookEditPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toast />
      </div>
    </Router>
  );
}

export default App;
