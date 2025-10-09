import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { CjmEditorPage } from './pages/CjmEditorPage';
import { SbpEditorPage } from './pages/SbpEditorPage';
import { OutcomeEditorPage } from './pages/OutcomeEditorPage';
import { EmEditorPage } from './pages/EmEditorPage';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/cjm" replace />} />
          <Route path="/cjm" element={<CjmEditorPage />} />
          <Route path="/sbp" element={<SbpEditorPage />} />
          <Route path="/outcome" element={<OutcomeEditorPage />} />
          <Route path="/em" element={<EmEditorPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
