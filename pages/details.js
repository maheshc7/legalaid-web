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
import { uploadFileGetEvents } from "../utils/apiHelpers";
import {
  getFilteredContacts,
  getCalendars,
  shareCalendar,
  postEvent,
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
  const [eventStatus, setEventStatus] = useState("editing");
  const taskId = router.query.taskId;
  const scrollRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // const [caseInfo, eventInfo] = await Promise.all([getCaseDetails(taskId), getEvents(taskId)]);
        const [caseInfo, eventInfo] = await uploadFileGetEvents(selectedFile);
        console.log(caseInfo, eventInfo);
        setCaseDetail(caseInfo);
        setEvents(eventInfo);
      } catch (error) {
        console.log(error);
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
        console.log("Filtered: ", filteredContacts);
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

  const validateEmail = (email) => {
    // Regular expression for email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleContactChange = (event, value, reason) => {
    //event: onClick, value: latest value in the text field, reason: select, add or remove
    console.log(reason, value);
    if (reason === "createOption") {
      // If the user typed a custom value, add it to the selectedContacts state
      const newEmail = value.pop();
      setSelectedContacts([
        ...selectedContacts,
        { name: newEmail, address: newEmail },
      ]);
      if (!validateEmail(newEmail)) {
        setContactError(true);
        console.log(contactError);
      }
    } else if (reason === "removeOption") {
      console.log("in ", reason, value);
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
    console.log(event);
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
    const newEventRef = scrollRef.current.lastElementChild;
    newEventRef.scrollIntoView({ behavior: "smooth" });
  };

  async function createEvents() {
    setIsCreatable(false);
    setEventStatus("processing");
    try {
      const attendees = selectedContacts.map((contact) => ({
        emailAddress: {
          address: contact.address,
          name: contact.name,
        },
        type: "required",
      }));

      const calendarId = await getCalendars(
        app.authProvider,
        caseDetail.caseNum
      );

      console.log("Length - Selected Contacts: ", selectedContacts.length);
      if (selectedContacts.length) {
        const calendarPermission = selectedContacts.map((contact) => ({
          emailAddress: {
            name: contact.name,
            address: contact.address,
          },
          role: "write", // Set the desired role for all contacts
        }));

        console.log(calendarPermission);

        const calendarResponse = await shareCalendar(
          calendarId,
          calendarPermission
        );
        console.log(calendarResponse);
      }
      console.log("User Timezone: ", app.user.timeZone);
      var batchRequests = eventDetails.map((newEvent) => {
        const dateOnly = newEvent.date.format("YYYY-MM-DD") + " 00:00:00";
        var startDate = new Date(dateOnly);
        var endDate = new Date(dateOnly);
        endDate.setDate(endDate.getDate() + 1);
        console.log(dateOnly, startDate, endDate);

        const eventPayload = {
          subject: newEvent.subject,
          body: {
            contentType: "HTML",
            content: newEvent.description,
          },
          start: {
            dateTime: startDate,
            timeZone: app.user.timeZone,
          },
          end: {
            dateTime: endDate,
            timeZone: app.user.timeZone,
          },
          // attendees: attendees, //commenting for now. Attendees get invite to the calendar.
          // other event details
        };

        return {
          id: newEvent.id, // Unique identifier for the request
          method: "POST",
          url: `/me/calendars/${calendarId}/events`,
          body: eventPayload,
          headers: {
            "Content-Type": "application/json",
          },
          transactionId: caseDetail.caseNum, //what if they run again and it fails? Do the previous events get removed? Should be sent in batch
        };
      });
      console.log(batchRequests);
      console.log("Batch Request Length: ", batchRequests.length);

      await postEvent(app.authProvider, batchRequests);
      //after successfully creating events.
      setEventStatus("success");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err) {
      setIsCreatable(true);
      setEventStatus("editing");
      app.displayError("Error creating event", err);
    }
  }

  const generateICSContent = (events) => {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${caseDetail.caseNum}
X-WR-TIMEZONE:${app.user.timezone}`;

    events.forEach((eventDetails) => {
      const dateOnly = eventDetails.date.format("YYYY-MM-DD") + " 00:00:00";
      var startDate = new Date(dateOnly);
      var endDate = new Date(dateOnly);
      endDate.setDate(endDate.getDate() + 1);

      icsContent += `
BEGIN:VEVENT
UID:${eventDetails.id}
DTSTART:${startDate.toISOString().substring(0, 10).replaceAll("-", "")}
DTEND:${endDate.toISOString().substring(0, 10).replaceAll("-", "")}
SUMMARY:${eventDetails.subject}
DESCRIPTION:${eventDetails.description}
END:VEVENT`;
    });

    icsContent += "\nEND:VCALENDAR";
    return icsContent;
  };

  const downloadICSFile = (icsContent, fileName) => {
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportICS = () => {
    const icsContent = generateICSContent(eventDetails);
    downloadICSFile(icsContent, `Case_${caseDetail.caseNum}_Calendar.ics`);
  };

  async function handleSplitButtonClick(index) {
    switch (index) {
      case 0:
        console.log("Download .ics file");
        handleExportICS();
        break;

      case 1:
        createEvents();
        break;

      default:
        console.log("Invalid option");
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
                Check you Outlook calendar.
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
                filterSelectedOptions //
                options={contactList}
                value={selectedContacts}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...console.log("Chip", option)}
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
              border={1}
              borderColor={"grey.400"}
              borderRadius={1.5}
              padding={1}
            >
              {caseDetail ? (
                <CaseDetails caseDetail={caseDetail} />
              ) : (
                <CircularProgress />
              )}
            </Box>
          </Stack>
        </Grid>

        <Grid sm={12} md={6} lg={3}>
          <Box
            id="event_box"
            ref={scrollRef}
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
          disableBtn={!isCreatable || events.length <= 0}
          disableIndex={isAuthenticated ? -1 : 1}
        />
      </Stack>
      <ErrorMessage />
    </Layout>
  );
}
