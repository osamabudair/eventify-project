import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home/Home';
import Auth from './pages/Auth/Auth';
import ClubDashboard from './pages/Dashboard/ClubDashboard';
import EventDetails from './pages/EventDetails/EventDetails';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import ExploreEvents from './pages/ExploreEvents/ExploreEvents';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/club-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['CLUB_LEADER', 'ADMIN']}>
                <ClubDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/explore" element={<ExploreEvents />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;