import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home/Home';
import Auth from './pages/Auth/Auth';
import Dashboard from './pages/Dashboard/Dashboard';
import EventDetails from './pages/EventDetails/EventDetails';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import ExploreEvents from './pages/ExploreEvents/ExploreEvents';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/explore" element={<ExploreEvents />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;