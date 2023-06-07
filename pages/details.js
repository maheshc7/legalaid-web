import Grid from '@mui/material/Unstable_Grid2';
import { Box, TextField, Button, Stack, List, ListItem, ListItemText, CircularProgress, Fab, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CaseDetails from '../components/CaseDetail';
import EventDetail from "../components/EventDetail";
import { useAppContext } from "../context/AppContext";
import Layout from '../components/Layout.js';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { getEvents, getCaseDetails, uploadFileGetEvents } from '../utils/apiHelpers';
import { postEvent, getContacts, getFilteredContacts, getCalendars, shareCalendar } from '../utils/authService';
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
  const scrollRef = useRef(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        // const [caseInfo, eventInfo] = await Promise.all([getCaseDetails(taskId), getEvents(taskId)]);
        const [caseInfo, eventInfo] = await uploadFileGetEvents(selectedFile);
        console.log(caseInfo,eventInfo)
        setCaseDetail(caseInfo);
        setEvents(eventInfo);
      } catch (error) {
        console.log(error)
        app.displayError('Error fetching data', error.message);
      }
    }
    fetchData();
  },[selectedFile]);

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
    setEvents((prevEvents) =>
    prevEvents.filter((event) => event.id !== id)
    );

    setEventDetails((prevEvents) =>
    prevEvents.filter((event) => event.id !== id)
    );
  }

  const handleEventAdd = (event) => {
    console.log(event);
    event.preventDefault();
    const newEvent = {
      id: events.length+1,
      subject: "",
      description: "",
      date: new Date()};

    setEvents([...events,newEvent]);
    setIsCreatable(false);
  
    // Scroll to the new component
    const newEventRef = scrollRef.current.lastElementChild;
    newEventRef.scrollIntoView({ behavior: "smooth" });
    
  }

  async function createEvents() {
    // setIsCreatable(false);
    try {
      const attendees = selectedContacts.map((contact) => ({
        emailAddress: {
          address: contact.address,
          name: contact.name,
        },
        type: "required",
      }))

      const calendarId = await getCalendars(app.authProvider, "LegalMaid");

      console.log(selectedContacts.length)
      if(selectedContacts.length){
        const calendarPermission = selectedContacts.map((contact) => ({
          emailAddress: {
            name: contact.name,
            address: contact.address,
          },
          role: 'write', // Set the desired role for all contacts
        }));
        
        console.log(calendarPermission);

        const calendarResponse = await shareCalendar(calendarId,calendarPermission);
      }
      
      var batchRequests = eventDetails.map((newEvent) =>{
        var startDate = new Date(newEvent.date);
        var endDate = new Date(newEvent.date);
        endDate.setDate(endDate.getDate()+1);

        const eventPayload = {
          subject: newEvent.subject,
          body: {
            contentType: 'HTML',
            content: newEvent.description,
          },
          start: {
            dateTime: startDate,
            timeZone:app.user.timeZone.value,
          },
          end: {
            dateTime: endDate,
            timeZone:app.user.timeZone.value,
          },
          // attendees: attendees, //commenting for now. Attendees get invite to the calendar.
          // other event details
        };

        return {
          id: newEvent.id, // Unique identifier for the request
          method: 'POST',
          url: `/me/calendars/${calendarId}/events`,
          body: eventPayload,
          headers: {
            "Content-Type": "application/json"
          },
          transactionId: caseDetail.caseNum //what if they run again and it fails? Do the previous events get removed? Should be sent in batch
        };
      });
      console.log(batchRequests);
      console.log("Batch Request Length: ",batchRequests.length)

      await postEvent(app.authProvider, batchRequests);

    } catch (err) {
      // setIsCreatable(true);
      app.displayError('Error creating event', err);
    }
  }
      
      return(
        <Layout>
          <Head>
            <title>Order Detail</title>
          </Head>
        <Grid container spacing={1} padding={2}>
          <Grid sm={12} md={12} lg={6} style={{ minHeight: '700px', maxHeight: '700px'}}>
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
           <Box id='event_box' ref={scrollRef} component="div" sx={{ height: '600px' , overflow: 'auto' }}>
              {events && events.length>0 ? (events.map((entry, index) => (
                <EventDetail key={entry.id} entry={entry} onChange={(values) => handleEventChange(index,values)} onDelete = {() => handleEventDelete(entry.id)}/>
              ))): <CircularProgress/>}
            </Box>
            <Grid marginTop={2} textAlign={"end"}>
              <Tooltip title="Add Event">
              <Fab size="medium" color="secondary" onClick={handleEventAdd}>  
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