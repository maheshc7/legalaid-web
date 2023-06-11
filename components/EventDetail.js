import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField, Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import EDButton from "./EditDeleteButtonControl";
import { Widgets } from "@mui/icons-material";

export default function EventDetail({ entry, onChange, onDelete }) {
  const [isEditable, setIsEditable] = useState(false);
  const [subjectError, setSubjectError] = useState(!entry.subject.trim());
  const [descError, setDescError] = useState(!entry.description.trim());
  const [event, setEvent] = useState({
    id: entry.id,
    subject: entry.subject,
    date: dayjs(entry.date),
    description: entry.description,
    isEditable: isEditable || descError || subjectError,
  });

  useEffect(() => {
    updateEvent("isEditable", !isEditable);
    onChange(event);
  }, [isEditable]);

  const updateEvent = (keyword, value) => {
    setEvent((prevValue) => {
      return { ...prevValue, [keyword]: value };
    });
  };

  const handleSave = () => {
    // Perform validation
    if (!event.subject.trim()) {
      setSubjectError(true);
      return;
    }

    if (!event.description.trim()) {
      setDescError(true);
      return;
    }
    setSubjectError(false);
    setDescError(false);
    // Validation passed, save the entry
    setIsEditable(false);
  };

  const handleEventChange = (keyword, value, setError) => {
    // Update the eventDetails state when the values change
    if (value === "") {
      setError(true);
    } else {
      setError(false);
    }
    updateEvent(keyword, value);
  };

  return (
    <Grid container flexDirection={"row"}>
      <Grid container xs={12} flexDirection={"row"}>
        <Grid xs={8} md={8} lg={8}>
          <Stack spacing={1.5}>
            <TextField
              error={subjectError}
              helperText={subjectError ? "Subject is required" : ""}
              label="Subject"
              size="small"
              margin="normal"
              value={event.subject}
              onChange={(e) =>
                handleEventChange("subject", e.target.value, setSubjectError)
              }
              disabled={!isEditable}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start"
                margin="normal"
                slotProps={{ textField: { size: "small" } }}
                value={dayjs(event.date)}
                onChange={(e) => handleEventChange("date", e, (x) => {})}
                disabled={!isEditable}
              />
            </LocalizationProvider>
          </Stack>
        </Grid>
        <Grid xs={4} md={4} lg={4} paddingTop={2}>
          <Stack direction="row" justifyContent="end">
            <EDButton
              isEditable={isEditable}
              setIsEditable={setIsEditable}
              onSave={handleSave}
              onDelete={onDelete}
            />
          </Stack>
        </Grid>
      </Grid>
      <Grid xs={12} md={12} lg={12} paddingRight={1}>
        <TextField
          multiline
          minRows={3}
          maxRows={3}
          margin="normal"
          size="small"
          label="Description"
          fullWidth={true}
          // style={{ width: "95%", flexGrow: 1}}
          error={descError}
          helperText={descError ? "Description is required" : ""}
          value={event.description}
          onChange={(e) =>
            handleEventChange("description", e.target.value, setDescError)
          }
          disabled={!isEditable}
        />
      </Grid>
    </Grid>
  );
}
