import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import AppContent from './App'; // Import AppContent instead of App

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export function render(url: string) {
  const html = renderToString(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StaticRouter location={url}>
          <AppContent />
        </StaticRouter>
      </ThemeProvider>
    </Provider>
  );

  return { html };
}