import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "6f3df88c-8168-4592-b1a0-bf4b7ef4c3e7", //secure it
    redirectUri: "http://localhost:3000", // or your production URL
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export async function login() {
  const loginRequest = {
    scopes: ["openid", "profile", "User.Read", "Calendars.ReadWrite", "People.Read"],
  };

  try {
    const response = await msalInstance.loginPopup(loginRequest);
    console.log(response);
    msalInstance.setActiveAccount(response.account);
    return response.account;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

export async function getAccessToken() {
  const tokenRequest = {
    scopes: ["Calendars.ReadWrite", "Contacts.Read", "People.Read"],
  };

  try {
    const response = await msalInstance.acquireTokenSilent(tokenRequest);
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // fallback to interaction when silent call fails
      return msalInstance.acquireTokenRedirect(request);
    }
    else {
      console.error("Access token error:", error);
      throw error;
    }
  }
};

export  function logout() {
  msalInstance.logout();
};
