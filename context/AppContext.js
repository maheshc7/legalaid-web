import { useEffect, useState, createContext, useContext, useMemo } from "react";
import config from "../Config";
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { InteractionType } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { getUser, getUserTimeZone } from "../utils/authService";

const appContext = createContext({
  user: undefined,
  selectedFile: undefined,
  storeFile: undefined,
  error: undefined,
  signIn: undefined,
  signOut: undefined,
  displayError: undefined,
  clearError: undefined,
  authProvider: undefined,
});

const AppContext = createContext();

export function AppWrapper({ children }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const contextValue = useMemo(() => {
    return [selectedFile, setSelectedFile];
  }, [selectedFile, setSelectedFile]);

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
export function useAppContext() {
  return useContext(appContext);
}

//From MSGraph Sample ReactSPA Tutorial

export default function ProvideAppContext({ children }) {
  const auth = useProvideAppContext();
  return <appContext.Provider value={auth}>{children}</appContext.Provider>;
}

function useProvideAppContext() {
  const msal = useMsal();
  const [user, setUser] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [selectedFile, setSelectedFile] = useState(null);

  const storeFile = (file) => {
    console.log(file);
    setSelectedFile(file);
  };

  const displayError = (message, debug) => {
    setError({ message, debug });
  };

  const clearError = () => {
    setError(undefined);
  };

  // <AuthProviderSnippet>
  // Used by the Graph SDK to authenticate API calls
  const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
    msal.instance, // as PublicClientApplication,
    {
      account: msal.instance.getActiveAccount(),
      scopes: config.scopes,
      interactionType: InteractionType.Popup,
    }
  );
  // </AuthProviderSnippet>

  // <UseEffectSnippet>
  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        try {
          // Check if user is already signed in
          const account = msal.instance.getActiveAccount();
          if (account) {
            // Get the user from Microsoft Graph
            const user = await getUser(authProvider);

            setUser({
              id: user.id,
              displayName: user.displayName || "",
              email: user.mail || user.userPrincipalName || "",
              //  timeFormat: user.mailboxSettings?.timeFormat || 'h:mm a',
              timeZone: user.timeZone,
              isOrg: user.isOrg,
            });
          }
        } catch (err) {
          displayError(err.message);
        }
      }
    };
    checkUser();
  });
  // </UseEffectSnippet>

  // <SignInSnippet>
  const signIn = async () => {
    await msal.instance.loginPopup({
      scopes: config.scopes,
      prompt: "select_account",
    });

    // Get the user from Microsoft Graph
    const account = await getUser(authProvider);
    console.log("Account:", account);

    setUser({
      id: account.id,
      displayName: account.displayName || "",
      email: account.mail || account.userPrincipalName || "",
      //  timeFormat: user.mailboxSettings?.timeFormat || '',
      timeZone: account.timeZone,
      isOrg: account.isOrg,
    });

    console.log("User: ", user);
  };
  // </SignInSnippet>

  // <SignOutSnippet>
  const signOut = async () => {
    await msal.instance.logoutPopup();
    setUser(undefined);
  };
  // </SignOutSnippet>

  return {
    user,
    selectedFile,
    storeFile,
    error,
    signIn,
    signOut,
    displayError,
    clearError,
    authProvider,
  };
}
