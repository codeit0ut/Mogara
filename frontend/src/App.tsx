import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "./context/AuthContext";
import { CalendarPage } from "./pages/CalendarPage";
import { GoalsAreas } from "./pages/goals/GoalsAreas";
import { GoalsLife } from "./pages/goals/GoalsLife";
import { GoalsShortTerm } from "./pages/goals/GoalsShortTerm";
import { Insights } from "./pages/Insights";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { NoteTemplatesPage } from "./pages/NoteTemplatesPage";
import { QuickNotesPage } from "./pages/QuickNotesPage";
import { Register } from "./pages/Register";
import { Settings } from "./pages/Settings";
import { Today } from "./pages/Today";
import { WeekFocus } from "./pages/week/WeekFocus";
import { WeekReflection } from "./pages/week/WeekReflection";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Today />} />
                <Route path="notes" element={<QuickNotesPage />} />
                <Route path="templates" element={<NoteTemplatesPage />} />
                <Route path="week" element={<Navigate to="/week/focus" replace />} />
                <Route path="week/focus" element={<WeekFocus />} />
                <Route path="week/reflection" element={<WeekReflection />} />
                <Route path="goals" element={<Navigate to="/goals/areas" replace />} />
                <Route path="goals/areas" element={<GoalsAreas />} />
                <Route path="goals/life" element={<GoalsLife />} />
                <Route path="goals/short-term" element={<GoalsShortTerm />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="insights" element={<Insights />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
