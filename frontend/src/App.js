import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BloodRequests from './pages/BloodRequests';
import DonationHistory from './pages/DonationHistory';
import Profile from './pages/Profile';
import ApproveRequests from './pages/hospital/ApproveRequests';/*New added*/

// Context
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e53935', // Red shade
      light: '#ff6f60',
      dark: '#ab000d',
    },
    secondary: {
      main: '#4caf50', // Green shade
      light: '#80e27e',
      dark: '#087f23',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Web3Provider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/donor/*" element={
                <PrivateRoute role="donor">
                  <Routes>
                    <Route path="dashboard" element={<DonorDashboard />} />
                    <Route path="history" element={<DonationHistory />} />
                    <Route path="profile" element={<Profile />} />
                  </Routes>
                </PrivateRoute>
              } />

              <Route path="/recipient/*" element={
                <PrivateRoute role="recipient">
                  <Routes>
                    <Route path="dashboard" element={<RecipientDashboard />} />
                    <Route path="requests" element={<BloodRequests />} />
                    <Route path="profile" element={<Profile />} />
                  </Routes>
                </PrivateRoute>
              } />

              <Route path="/hospital/*" element={
                <PrivateRoute role="hospital">
                  <Routes>
                    <Route path="dashboard" element={<HospitalDashboard />} />
                    <Route path="requests" element={<ApproveRequests />} />     
                    <Route path="profile" element={<Profile />} />
                  </Routes>
                </PrivateRoute>
              } />

              <Route path="/admin/*" element={
                <PrivateRoute role="admin">
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                  </Routes>
                </PrivateRoute>
              } />
            </Routes>
          </Router>
        </Web3Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;