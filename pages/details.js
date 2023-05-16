import { ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import EventDetail from "../components/EventDetail";
import { useAppContext } from "../context/AppContext";
import Layout from '../components/layout';
import Head from 'next/head';
import theme from "../styles/Theme";

export default function Main({}) {
  const [selectedFile, setSelectedFile] = useAppContext();
    const entries = [
        { subject: "Entry 1",date:"1998-06-28", description: "Description 1" },
        { subject: "Entry 2",date:"2007-05-14", description: "Description 2" },
        { subject: "Entry 3",date:"2023-02-28", description: "Description 3" },
      ];
      return(
        <Layout>
          <Head>
            <title>Order Detail</title>
          </Head>
        <ThemeProvider theme={theme}>
        <Grid container spacing={1} marginTop={5} padding={2}>
          <Grid sm={12} md={12} lg={6}>
            <embed src={URL.createObjectURL(selectedFile)} type="application/pdf" title={selectedFile.name} width="100%" height="100%" />
          </Grid>
           
          {/* <Grid xs={3}>
            <div className="contacts">
              <input type = "text" placeholder = "Enter Attorney emails.."  style={{ display: "flex", alignItems: "center" }}/>
            </div>
            
              {entries.map((entry, index) => (
                console.log(entry),
                <EventDetail key={index} entry={entry} />
              ))}
          </Grid>  */}

          <Grid sm={12} md={6} lg={3}>

              {entries.map((entry, index) => (
                console.log(entry) ,
                <EventDetail key={index} entry={entry} />
              ))}
          </Grid> 
          
        </Grid>
        </ThemeProvider>
        </Layout>
      )
  };