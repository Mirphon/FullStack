import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import './styles.css';

const theme = createTheme({
  palette: { primary: { main: '#cda42b', dark: '#b58d1d', contrastText: '#17191c' }, background: { default: '#fafbfc' }, text: { primary: '#151a22', secondary: '#5e6879' } },
  typography: { fontFamily: 'Arial, sans-serif', button: { textTransform: 'none', fontWeight: 600, fontSize: '1rem' } },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 48, padding: '10px 24px' },
        outlined: { color: '#303846', borderColor: '#929ba9' },
      },
    },
    MuiTextField: { defaultProps: { fullWidth: true, slotProps: { inputLabel: { shrink: true } } } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: '#fff' } } },
    MuiFormLabel: { styleOverrides: { asterisk: { color: '#b3261e' } } },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter><App /></BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
