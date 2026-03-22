import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import CreateQuestion from './components/Questions/CreateQuestion';
import QuestionDetail from './components/Questions/QuestionDetail';
import Profile from './components/Profile/Profile';
import PrivateRoute from './components/Auth/PrivateRoute';
import Router from './components/Router';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { hydrateAuth } from './store/slices/authSlice';
import LandingPage from './components/Landing/LandingPage';
import ForgotPassword from './components/Auth/ForgotPassword';
import AppLayout from './components/Layout/AppLayout';
import Box from '@mui/material/Box';
import BackgroundWave from './components/BackgroundWave';
import CircularProgress from '@mui/material/CircularProgress';
import MyQuestions from './components/Questions/MyQuestions';
import EditQuestion from './components/Questions/EditQuestion';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#5B21B6',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

// Loading component
const LoadingScreen = () => (
  <Box sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    position: 'relative',
  }}>
    <Box sx={{
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}>
      <CircularProgress sx={{ color: '#2563eb' }} />
    </Box>
  </Box>
);

const HomeRoute: React.FC = () => {
  const { token, user, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return <LoadingScreen />;
  }

  return token && user ? (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  ) : (
    <LandingPage />
  );
};

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, user, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      dispatch(hydrateAuth());
    }
  }, [dispatch]);

  useEffect(() => {
    const authPaths = ['/login', '/register', '/forgot-password'];
    if (token && user && authPaths.includes(location.pathname)) {
      navigate('/');
    }
  }, [token, user, location, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }


  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/questions/create" element={
        <PrivateRoute>
          <AppLayout>
            <CreateQuestion />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/question/:id" element={
        // <PrivateRoute>
        user && token ? <AppLayout>
          <QuestionDetail />
        </AppLayout> : <QuestionDetail />
        // </PrivateRoute>
      } />
      <Route path="/questions/edit/:id" element={
        <PrivateRoute>
          <AppLayout>
            <EditQuestion />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <AppLayout>
            <Profile />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/questions" element={
        <PrivateRoute>
          <AppLayout>
            <MyQuestions />
          </AppLayout>
        </PrivateRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;