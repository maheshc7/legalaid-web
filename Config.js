const config = {
  appId: process.env.NEXT_PUBLIC_APP_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_REDIRECT_URL,
  scopes: [
    "user.read",
    "Calendars.ReadWrite",
    "MailboxSettings.Read",
    "Contacts.Read",
    "People.Read",
    "Group.ReadWrite.All",
    "GroupMember.ReadWrite.All",
    "Directory.ReadWrite.All",
  ],
  backend_url: process.env.NEXT_PUBLIC_BACKEND_URL,
};

export default config;
