import Grid from '@mui/material/Unstable_Grid2';
import { Box, TextField, Button, Stack, List, ListItem, ListItemText } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CaseDetails from '../components/CaseDetail';
import EventDetail from "../components/EventDetail";
import { useAppContext } from "../context/AppContext";
import Layout from '../components/Layout.js';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getEvents, getCaseDetails } from '../utils/apiHelpers';
import { getContacts } from '../utils/graphApiHelpers';

export default function Main({}) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useAppContext();
  const [events, setEvents] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [contactList, setContactList] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const taskId = router.query.taskId;
  
  useEffect(() => {
    async function fetchData() {
      const caseInfo = await getCaseDetails(taskId);
      setCaseDetail(caseInfo);
      const eventInfo = await getEvents(taskId);
      setEvents(eventInfo);
      console.log(events);
    }

    async function fetchContacts() {
      const contacts = await getContacts();
      setContactList(contacts); 

    }

    fetchData();
    fetchContacts();
  },[]);

  const handleContactChange = (event, value, reason) => {
    //even: onClick, value: latest value in the text field, reason: select, add or remove
    setSelectedContacts(value);
  };
      
      return(
        <Layout>
          <Head>
            <title>Order Detail</title>
          </Head>
        <Grid container spacing={1} padding={2}>
          <Grid sm={12} md={12} lg={6} style={{ minHeight: '700px' }}>
            {selectedFile && <embed src={URL.createObjectURL(selectedFile)} type="application/pdf" title={selectedFile.name} width="100%" height="100%" />}
          </Grid>
           
          <Grid xs={3}>
            <Stack spacing={1.5}>
              <Autocomplete
                  multiple
                  filterSelectedOptions
                  options={contactList}
                  value={selectedContacts}
                  onChange={handleContactChange}
                  getOptionLabel={(option) => option.name}
                  renderOption={(props, option) => (
                    <List {...props}>
                      <ListItem>
                        <ListItemText primary={option.name} secondary={option.email} />
                      </ListItem>
                    </List>
                  )}
                  renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Attorney Emails"
                        placeholder="Type or select from list"
                    />
                  )}
                />
                
                <Box border={1} borderColor={"grey.400"} borderRadius={1.5} padding={1}> 
                  
                  {caseDetail ? (<CaseDetails caseDetail={caseDetail}/>)
                  : (<p>Loading...</p>)}
                </Box>
              </Stack>
          </Grid> 

          <Grid sm={12} md={6} lg={3}>

              {events ? (events.map((entry, index) => (
                console.log(entry) ,
                <EventDetail key={index} entry={entry} />
              ))): <p>Loading...</p>}
          </Grid> 
          
        </Grid>
        
        <Stack direction="row" spacing={12} justifyContent="center">
        <Button variant="outlined" onClick={()=>router.push("/")}>New File</Button>
        <Button variant="contained">Create Events</Button>
        </Stack>
        </Layout>
      )
  };