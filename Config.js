const config = {
  appId: process.env.NEXT_PUBLIC_APP_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_REDIRECT_URL,
  scopes: process.env.NEXT_PUBLIC_APP_SCOPES.split(","),
  backend_url: process.env.NEXT_PUBLIC_BACKEND_URL,
};

export default config;
