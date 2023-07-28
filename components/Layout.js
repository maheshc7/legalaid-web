import {
  Box,
  Tooltip,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import logo from "../public/logo.png";
import msLogo from "../public/ms_logo.png";
import { login } from "../utils/authService";
import { useRouter } from "next/router";
import { useAppContext } from "../context/AppContext";
import { useIsAuthenticated } from "@azure/msal-react";
import { useState } from "react";

export const siteTitle = "LegalAid - Make Scheduling Easy";
const settings = ["Profile", "Logout"];

const ms_logo = <Image src={msLogo} alt="Microsoft Logo" />;

export default function Layout({ children, home }) {
  const router = useRouter();
  const app = useAppContext();
  const isAuthenticated = useIsAuthenticated();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleMenuItemClick = (option) => {
    if (option === "Logout") {
      app.signOut();
      router.push("/");
    }
    handleCloseMenu();
  };

  const handleCloseMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <Head>
        <link rel="icon" href="/legal.png" />
        <meta name="LegalAid" content="Process scheduling order in seconds" />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <header>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          marginX={2}
        >
          <Image
            src={logo}
            height={64}
            width={256}
            alt="LegalAid"
            onClick={() => {
              router.push("/");
            }}
          />
          {isAuthenticated ? (
            <>
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                    <Avatar alt={app.user ? app.user.displayName : ""} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem
                      key={setting}
                      onClick={() => handleMenuItemClick(setting)}
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </>
          ) : home? null: (
            <Tooltip title="Grant acess to your Calendar and Contacts">
              <Button
                variant="text"
                size="small"
                color="primary"
                onClick={app.signIn}
                startIcon={ms_logo}
              >
                <Typography variant="button" sx={{fontWeight: 'bold'}}>Connect Outlook</Typography>
              </Button>
            </Tooltip>
          )}
        </Stack>
      </header>
      <main>{children}</main>
    </>
  );
}
