import Grid from "@mui/material/Unstable_Grid2";
import {
  Box,
  TextField,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Fab,
  Tooltip,
  Backdrop,
  Typography,
  Fade,
  Chip,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import CaseDetails from "../components/CaseDetail";
import EventDetail from "../components/EventDetail";
import { useAppContext } from "../context/AppContext";
import Layout from "../components/Layout.js";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import {
  uploadFileGetEvents,
  generateICSContent,
  downloadICSFile,
} from "../utils/apiHelpers";
import {
  getFilteredContacts,
  getOrCreateCalendar,
  updateCalendar,
  postEvents,
  getAppEvents,
  deleteEvents,
  getGroup,
  addGroupMembers,
  postGroup,
  getGroupMembers,
} from "../utils/authService";
import AddIcon from "@mui/icons-material/Add";
import ErrorMessage from "../components/ErrorMessage";
import { CheckCircle } from "@mui/icons-material";
import logo from "../public/logo.png";
import Image from "next/image";
import SplitButton from "../components/SplitButton";
import { useIsAuthenticated } from "@azure/msal-react";

const splitBtnOptions = ["Download Events", "Add to Outlook"];
export default function Main() {
  const router = useRouter();
  const app = useAppContext();
  const selectedFile = app.selectedFile;
  const isAuthenticated = useIsAuthenticated();
  const [events, setEvents] = useState([]);
  const [eventDetails, setEventDetails] = useState([]);
  const [caseDetail, setCaseDetail] = useState(null);
  const [contactList, setContactList] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactError, setContactError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatable, setIsCreatable] = useState(false);
  const [caseStatus, setCaseStatus] = useState(false);
  const [eventStatus, setEventStatus] = useState("editing");
  const taskId = router.query.taskId;
  const scrollRef = useRef();

  useEffect(() => {
    async function fetchData() {
      try {
        // const [caseInfo, eventInfo] = await Promise.all([getCaseDetails(taskId), getEvents(taskId)]);
        const [caseInfo, eventInfo] = await uploadFileGetEvents(selectedFile);
        if(caseInfo && caseInfo.client){
          setCaseStatus(true);
        }
        else if(caseInfo){
          caseInfo.client = "";
        }
        setCaseDetail(caseInfo);
        setEvents(eventInfo);
      } catch (error) {
        console.error("Error fetching case and event details", error);
        app.displayError("Error fetching data", error.message);
      }
    }
    fetchData();
  }, [selectedFile]);

  useEffect(() => {
    async function fetchFilteredContacts() {
      try {
        var filteredContacts = await getFilteredContacts(
          app.authProvider,
          searchQuery
        );
        setContactList(filteredContacts);
      } catch (error) {
        app.displayError("Error fetching contacts", error.message);
      }
    }
    if (searchQuery.length > 2) {
      fetchFilteredContacts();
    } else {
      setContactList([]);
    }
  }, [searchQuery]);

  useEffect(() =>{
    async function updateContactList(){
      let groupId = await getGroup(app.authProvider, caseDetail.caseNum);
  
      if(groupId){
        const memberList = await getGroupMembers(app.authProvider, groupId);
        console.log(memberList);
        setSelectedContacts((prevContacts) => [
          ...prevContacts,
          ...memberList.filter((member) => 
            !prevContacts.some((contact) => contact.address === member.address)
          ),
        ]);
      }
    }
    if (caseDetail){
      updateContactList();
    }

  }, [caseDetail?.caseNum]);

  async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

  const validateEmail = (email) => {
    // Regular expression for email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleContactChange = (event, value, reason) => {
    //event: onClick, value: latest value in the text field, reason: select, add or remove
    if (reason === "createOption") {
      // If the user typed a custom value, add it to the selectedContacts state
      const newEmail = value.pop();
      setSelectedContacts([
        ...selectedContacts,
        { id: "", name: newEmail, address: newEmail },
      ]);
      if (!validateEmail(newEmail)) {
        setContactError(true);
      }
    } else if (reason === "removeOption") {
      setContactError(false); //Set to false assuming user removed the faulty email
      //Check if any of the remaining values are still invalid.
      if (value.some((contact) => !validateEmail(contact.address))) {
        setContactError(true);
      }
      setSelectedContacts(value);
    } else if (reason === "clear") {
      setContactError(false);
      setSelectedContacts(value);
    } else {
      setSelectedContacts(value);
    }
  };

  const handleEventChange = (index, values) => {
    // Update the eventDetails state when the values change
    setEventDetails((prevEventDetails) => {
      const updatedEventDetails = [...prevEventDetails];
      updatedEventDetails[index] = values;
      return updatedEventDetails;
    });
  };

  useEffect(() => {
    // Check if all EventDetail components are saved/disabled.
    const isAnyEventEditable = eventDetails.some((event) => event.isEditable);
    setIsCreatable(!isAnyEventEditable);
  }, [eventDetails]);

  const handleEventDelete = (id) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));

    setEventDetails((prevEvents) =>
      prevEvents.filter((event) => event.id !== id)
    );
  };

  const handleEventAdd = (event) => {
    event.preventDefault();
    const newEvent = {
      id: events.length + 1,
      subject: "",
      description: "",
      date: new Date(),
    };

    setEvents([...events, newEvent]);
    setIsCreatable(false);

    // Scroll to the new component
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    }, 200);
  };

  async function removeOldEvents(calendarId) {
    try {
      const oldEventsId = await getAppEvents(
        app.authProvider,
        calendarId,
        caseDetail.caseNum
      );
      await deleteEvents(app.authProvider, calendarId, oldEventsId);
    } catch (err) {
      app.displayError("Error removing old events", err.message);
    }
  }

  async function shareCalendar(calendarId) {
    try{
      if (selectedContacts.length) {
        const calendarPermission = selectedContacts.map((contact) => ({
          emailAddress: {
            name: contact.name,
            address: contact.address,
          },
          role: "write",
        }));

        const calendarResponse = await updateCalendar(
          calendarId,
          calendarPermission
        );
      }
    }catch(error){
      app.displayError("Error sharing calendar ", error.message);
    }
  }

  async function createEvents(calendarId, attendeeList) {
    setIsCreatable(false);
    setEventStatus("processing");

    try {
      await postEvents(
        app.authProvider,
        app.user.timeZone,
        eventDetails,
        attendeeList,
        calendarId,
        caseDetail
      );
      // TODO: do we call postEvents again if it fails?
      //after successfully creating events.
      setIsCreatable(true);
      setEventStatus("editing");
      // setEventStatus("success");
      // setTimeout(() => {
      //   router.push("/");
      // }, 3000);
    } catch (err) {
      setIsCreatable(true);
      setEventStatus("editing");
      app.displayError("Error creating event", err.message);
    }
  }

  const handleExportICS = () => {
    const icsContent = generateICSContent(
      app,
      eventDetails,
      caseDetail
    );
    downloadICSFile(icsContent, `Case_${caseDetail.caseNum}_Calendar.ics`);
  };

  async function handleSplitButtonClick(index) {
    switch (index) {
      case 0: //Download ICS File
        handleExportICS();
        break;

      case 1: //Add to Outlook
        try {
          console.log(app.user);
          let calendar = {}, url;
          //Add user as the attendee as well to get the events in their main calendar
          let attendeeList = selectedContacts;
          let userContact = { id: app.user.id, name: app.user.displayName, address: app.user.email };
          attendeeList.push(userContact);

          if(app.user.isOrg){
            let groupId = await getGroup(app.authProvider, caseDetail.caseNum);

            calendar.isOwner = false;
            calendar.isNew = false;

            if(groupId){
              addGroupMembers(app.authProvider,groupId, attendeeList);
            }
            else{
              groupId = await postGroup(app.authProvider, caseDetail.caseNum, attendeeList);
              calendar.isNew = true;
              await delay(2000);
            }

            url = `/groups/${groupId}`;
          }
          else if(app.user.isOrg == false){
            calendar = await getOrCreateCalendar(
              app.authProvider,
              caseDetail.caseNum,
              app.user.email
            );
            url = `/me/calendars/${calendar.id}`
          }
          else{
            console.error("isOrg variable is not definied", app.user.isOrg);
            break;
          }
          
          if (!calendar.isNew) {
            //If calendar exists already, delete old events created by LegalAid (if any)
            await removeOldEvents(url);
          }

          if (calendar.isOwner){
            await shareCalendar(calendar.id);
          }

          await createEvents(url, attendeeList);

        } catch (err) {
          app.displayError("Error Getting Calendar", err.message);
        }
        break;

      default:
        console.error("Invalid option");
    }
  }

  return (
    <Layout>
      <Head>
        <title>Order Detail</title>
      </Head>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={eventStatus !== "editing"}
      >
        {eventStatus === "success" ? (
          <>
            <Box
              display="flex"
              flexDirection={"column"}
              alignItems="center"
              justifyContent="center"
              minHeight={300}
              minWidth={500}
              bgcolor="background.paper"
              boxShadow={3}
              borderRadius={5}
            >
              <Image
                src={logo}
                height={64}
                width={256}
                alt="LegalAid"
                margin={20}
              />
              <Typography variant="h5" component="span" ml={1}>
                Process Complete!
              </Typography>
              <CheckCircle
                fontSize="large"
                color="primary"
                sx={{ marginTop: 1 }}
              />
              <Typography
                variant="h6"
                align="center"
                color="textSecondary"
                mt={2}
              >
                Check your Outlook calendar.
              </Typography>
              <Typography
                variant="body1"
                align="center"
                color="textSecondary"
                mt={2}
              >
                You will be redirected to the home page.
              </Typography>
            </Box>
          </>
        ) : (
          <Fade
            in={eventStatus === "processing"}
            style={{
              transitionDelay: eventStatus === "processing" ? "800ms" : "0ms",
            }}
            unmountOnExit
          >
            <CircularProgress />
          </Fade>
        )}
      </Backdrop>
      <Grid container spacing={1} padding={2}>
        <Grid
          sm={12}
          md={12}
          lg={6}
          style={{ minHeight: "700px", maxHeight: "700px" }}
        >
          {selectedFile && (
            <embed
              src={URL.createObjectURL(selectedFile)}
              type="application/pdf"
              title={selectedFile.name}
              width="100%"
              height="100%"
            />
          )}
        </Grid>

        <Grid sm={12} md={6} lg={3}>
          <Stack spacing={1.5}>
            {isAuthenticated ? (
              <Autocomplete
                multiple
                freeSolo
                filterSelectedOptions
                options={contactList}
                value={selectedContacts}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={index}
                      variant="outlined"
                      color={
                        validateEmail(option.address) ? "default" : "error"
                      }
                      label={option.name}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                noOptionsText="Start typing the name/email"
                onChange={handleContactChange}
                onInputChange={(event, value) => setSearchQuery(value)}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.name
                }
                isOptionEqualToValue={
                  (option, value) => option.address === value.address //
                }
                renderOption={(props, option) => (
                  <List {...props}>
                    <ListItem>
                      <ListItemText
                        primary={option.name}
                        secondary={option.address}
                      />
                    </ListItem>
                  </List>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Attorney Emails"
                    placeholder="Type or select from list"
                    error={contactError}
                    helperText={contactError ? "Enter a valid email" : ""}
                  />
                )}
              />
            ) : null}

            <Box
              data-testid="case-detail"
              border={1}
              borderColor={"grey.400"}
              borderRadius={1.5}
              padding={1}
            >
              {caseDetail ? (
                <CaseDetails
                  caseDetail={caseDetail}
                  updateCaseDetail={setCaseDetail}
                  allowPost={setCaseStatus}
                />
              ) : (
                <CircularProgress />
              )}
            </Box>
          </Stack>
        </Grid>

        <Grid sm={12} md={6} lg={3}>
          <Box
            id="event_box"
            component="div"
            sx={{ height: "600px", overflow: "auto" }}
          >
            {events && events.length > 0 ? (
              events.map((entry, index) => (
                <EventDetail
                  key={entry.id}
                  entry={entry}
                  onChange={(values) => handleEventChange(index, values)}
                  onDelete={() => handleEventDelete(entry.id)}
                />
              ))
            ) : (
              <CircularProgress />
            )}
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

      <Stack direction="row" spacing={12} justifyContent="space-around">
        <Button variant="outlined" onClick={() => router.push("/")}>
          New File
        </Button>

        <SplitButton
          options={splitBtnOptions}
          onClick={handleSplitButtonClick}
          disableBtn={
            !isCreatable || !caseStatus || !(events && events.length > 0) || contactError
          }
          disableIndex={isAuthenticated ? -1 : 1}
        />
      </Stack>
      <ErrorMessage />
    </Layout>
  );
}
