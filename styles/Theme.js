
import { green, blueGrey } from '@mui/material/colors';

  const themeTokens = (mode) =>({
    status: {
      danger: '#e53e3e',
    },
    palette: {
      mode,
      primary: {
        main: green[100],
        dark: green[600],
        darker: '#053e85',
      },
      neutral: {
        main: '#64748B',
        contrastText: '#fff',
      },
      background: {
              paper: blueGrey[600], // your color
            },
    },
  });
export default themeTokens;