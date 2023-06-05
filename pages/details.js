import Grid from '@mui/material/Unstable_Grid2';
import { Box, TextField, Button, Stack, List, ListItem, ListItemText, CircularProgress, Fab, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CaseDetails from '../components/CaseDetail';
import EventDetail from "../components/EventDetail";
import { useAppContext } from "../context/AppContext";
import Layout from '../components/Layout.js';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getEvents, getCaseDetails } from '../utils/apiHelpers';
import { postEvent, getContacts, getFilteredContacts } from '../utils/authService';
import AddIcon from '@mui/icons-material/Add';
import ErrorMessage from '../components/ErrorMessage';

export default function Main() {
  const router = useRouter();
  const app = useAppContext();
  const selectedFile = app.selectedFile;
  const [events, setEvents] = useState([]);
  const [eventDetails, setEventDetails] = useState([]);
  const [caseDetail, setCaseDetail] = useState(null);
  const [contactList, setContactList] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatable, setIsCreatable] = useState(false);
  const taskId = router.query.taskId;
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [caseInfo, eventInfo] = await Promise.all([getCaseDetails(taskId), getEvents(taskId)]);
        setCaseDetail(caseInfo);
        setEvents(eventInfo);
      } catch (error) {
        app.displayError('Error fetching data', error.message);
      }
    }
    fetchData();
  },[taskId]);

  useEffect(() => {
    async function fetchFilteredContacts() {
      try {
        const filteredContacts = await getFilteredContacts(app.authProvider, searchQuery);
        setContactList(filteredContacts);
      } catch (error) {
        app.displayError('Error fetching contacts', error.message);
      }
    }
    if (searchQuery.length > 2){
      fetchFilteredContacts();
    }
    else{
      setContactList([]);
    }
  }, [searchQuery]);

  const handleContactChange = (event, value, reason) => {
    //even: onClick, value: latest value in the text field, reason: select, add or remove
    setSelectedContacts(value);
  };

  const handleEventChange = (index, values) => {
    // Update the eventDetails state when the values change
    setEventDetails((prevEventDetails) => {
      const updatedEventDetails = [...prevEventDetails];
      updatedEventDetails[index] = values;
      return updatedEventDetails;
    });
  }

  useEffect(() => {
    // Check if all EventDetail components are saved/disabled.
    const isAnyEventEditable = eventDetails.some((event) => event.isEditable);
    setIsCreatable(!isAnyEventEditable);
  }, [eventDetails]);

  const handleEventDelete = (id) => {
    console.log(id, events);
    setEvents((prevEvents) =>
    prevEvents.filter((event) => event.id !== id)
    );
  }

  async function createEvents() {
    const attendees = selectedContacts.map((contact) => ({
      emailAddress: {
        address: contact.address,
        name: contact.name,
      },
      type: "required",
    }))
      
    for(const newEvent of eventDetails){
      try {
        await postEvent(app.authProvider, app.user, newEvent, attendees);
      } catch (err) {
        app.displayError('Error creating event', JSON.stringify(err));
      }
    }
  }
      
      return(
        <Layout>
          <Head>
            <title>Order Detail</title>
          </Head>
        <Grid container spacing={1} padding={2}>
          <Grid sm={12} md={12} lg={6} style={{ minHeight: '700px' }}>
            {selectedFile && <embed src={URL.createObjectURL(selectedFile)} type="application/pdf" title={selectedFile.name} width="100%" height="100%" />}
          </Grid>
           
          <Grid sm={12} md={6} lg={3}>
            <Stack spacing={1.5}>
              <Autocomplete
                  multiple
                  filterSelectedOptions
                  options={contactList}
                  value={selectedContacts}
                  noOptionsText="Start typing the name/email"
                  onChange={handleContactChange}
                  onInputChange={(event, value) => setSearchQuery(value)}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.address === value.address}
                  renderOption={(props, option) => (
                    <List {...props}>
                      <ListItem>
                        <ListItemText primary={option.name} secondary={option.address} />
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
                  : (<CircularProgress />)}
                </Box>
              </Stack>
          </Grid> 

          <Grid sm={12} md={6} lg={3}>

              {events && events.length>0 ? (events.map((entry, index) => (
                <EventDetail key={index} entry={entry} onChange={(values) => handleEventChange(index,values)} onDelete = {() => handleEventDelete(entry.id)}/>
              ))): <CircularProgress/>}

              <Grid marginTop={2} textAlign={"end"}>
                <Tooltip title="Add Event">
                <Fab size="medium" color="secondary" onClick={()=>{setEvents(oldArray =>[...oldArray,{id: events.length+1, subject: "",description: "", date: new Date()}]); setIsCreatable(false);}}>  
                  <AddIcon />
                </Fab>
                </Tooltip>
              </Grid>
          </Grid> 
          
        </Grid>
        
        <Stack direction="row" spacing={12} justifyContent="center">
        <Button variant="outlined" onClick={()=>router.push("/")}>New File</Button>
        <Button variant="contained" disabled={!isCreatable} onClick={createEvents}>Create Events</Button>
        </Stack>
        <ErrorMessage/>
        </Layout>
      )
  };