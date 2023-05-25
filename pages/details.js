import { ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, TextField, Button, Stack } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CaseDetails from '../components/CaseDetail';
import EventDetail from "../components/EventDetail";
import { useAppContext } from "../context/AppContext";
import Layout from '../components/Layout';
import Head from 'next/head';
import theme from "../styles/Theme";
import { useRouter } from 'next/router';

export default function Main({}) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useAppContext();
    const entries = [
        { subject: "Entry 1",date:"1998-06-28", description: "Description 1" },
        { subject: "Entry 2",date:"2007-05-14", description: "Description 2" },
        { subject: "Entry 3",date:"2023-02-28", description: "Description 3" },
      ];

      const emailNames = [
        {name: 'John Doe', email: 'jhon.doe@email.com'},
        {name: 'James Bond', email: 'bond.james@007.com'},
        {name: 'Peter Parker', email: 'parker.peter@marvel.com'},
        {name: 'Anakin Skywalker ', email: 'darth_vader@starwars.com'},
        {name: 'Djinn Djarin', email: 'the.mandalorian@disney.com'},
      ];
      
      const caseDetail = {court:"Arizona Superior Maricopa County", caseNum: "CV12587651", plaintiff: "Saul Goodman", defendant: "Harvey Specter"};
      
      return(
        <Layout>
          <Head>
            <title>Order Detail</title>
          </Head>
        <ThemeProvider theme={theme}>
        <Grid container spacing={1} marginTop={5} padding={2}>
          <Grid sm={12} md={12} lg={6}>
            {selectedFile && <embed src={URL.createObjectURL(selectedFile)} type="application/pdf" title={selectedFile.name} width="100%" height="100%" />}
          </Grid>
           
          <Grid xs={3}>
            <Stack spacing={1.5}>
              <Autocomplete
                  multiple
                  options={emailNames}
                  getOptionLabel={(option) => option.name}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Attorney Emails"
                        placeholder="Type or select from list"
                    />
                  )}
                />
                
                <Box border={1} borderColor={"grey.400"} borderRadius={1.5} padding={1}> 
                  <CaseDetails caseDetail={caseDetail}/>
                </Box>
              </Stack>
          </Grid> 

          <Grid sm={12} md={6} lg={3}>

              {entries.map((entry, index) => (
                console.log(entry) ,
                <EventDetail key={index} entry={entry} />
              ))}
          </Grid> 
          
        </Grid>
        
        <Stack direction="row" spacing={12} justifyContent="center">
        <Button variant="outlined" onClick={()=>router.push("/")}>New File</Button>
        <Button variant="contained">Create Events</Button>
        </Stack>

        </ThemeProvider>
        </Layout>
      )
  };