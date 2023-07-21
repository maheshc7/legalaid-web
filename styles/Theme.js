import { createTheme } from "@mui/material";
import { green, blueGrey, purple } from "@mui/material/colors";

const themeTokens = (mode) => createTheme({
  status: {
    danger: "#e53e3e",
  },
  palette: {
    mode,
    ...( mode === 'light'?
      {
        primary: {
        main: green[800],
        dark: blueGrey[900]
        },
        secondary: {
          main: purple[700],
          },
      } : {
        primary: {
        main: green[200]
        },
        secondary: {
          main: purple[200],
          },
      }
    ),
    neutral: {
      main: "#64748B",
      contrastText: "#fff",
    },
    background: {
      paper: blueGrey[600], // your color
    },
    
  },
});
export default themeTokens;
