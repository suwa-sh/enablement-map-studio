import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32', // 緑 (Material Design Green 800)
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#66bb6a', // 明るい緑 (Material Design Green 400)
      light: '#98ee99',
      dark: '#338a3e',
      contrastText: '#000000',
    },
    text: {
      primary: '#424242', // 濃いグレー (Material Design Grey 800)
      secondary: '#616161', // グレー (Material Design Grey 700)
    },
  },
  typography: {
    allVariants: {
      color: '#424242', // 全体のデフォルト文字色を濃いグレーに
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
