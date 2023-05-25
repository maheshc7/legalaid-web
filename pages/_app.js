import { CssBaseline} from '@mui/material';
import { AppWrapper } from '../context/AppContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useMemo } from 'react';
import themeTokens from '../styles/Theme';

export default function App({ Component, pageProps }) {

  const preferedMode = useMediaQuery('(prefers-color-scheme: dark)');
  const mainTheme = useMemo(()=>
    createTheme(themeTokens(preferedMode ? 'dark' : 'light'))
    ,[preferedMode]);
  
  return (
    <AppWrapper>
      <ThemeProvider theme={mainTheme}>
        <CssBaseline/>
      <Component {...pageProps} />;
      </ThemeProvider>
    </AppWrapper>

  );
    
}