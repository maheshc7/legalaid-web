import { MsalProvider } from '@azure/msal-react';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import ProvideAppContext from '../context/AppContext';
import themeTokens from '../styles/Theme';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import config from "../Config";

export default function App({ Component, pageProps }) {

  const preferedMode = useMediaQuery('(prefers-color-scheme: dark)');
  const mainTheme = useMemo(()=> createTheme(themeTokens(preferedMode ? 'dark' : 'light')),[preferedMode]);

  // <MsalInstanceSnippet>
  const msalInstance = new PublicClientApplication({
    auth: {
      clientId: config.appId,
      redirectUri: config.redirectUri
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: true
    }
  });

  // Check if there are already accounts in the browser session
  // If so, set the first account as the active account
  const accounts = msalInstance.getAllAccounts();
  if (accounts && accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      // Set the active account - this simplifies token acquisition
      const authResult = event.payload;
      msalInstance.setActiveAccount(authResult.account);
    }
  });
  // </MsalInstanceSnippet>
  
  return (
    // <AppWrapper>
    <MsalProvider instance={msalInstance}>
      <ProvideAppContext>
      <ThemeProvider theme={mainTheme}>
        <CssBaseline/>
      <Component {...pageProps} />
      </ThemeProvider>
      </ProvideAppContext>
      </MsalProvider>
    // {/* </AppWrapper> */}

  );
    
}