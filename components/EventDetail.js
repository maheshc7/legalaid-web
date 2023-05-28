import dayjs from 'dayjs';
import React, { useState } from "react";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TextField, Stack} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import EDButton from './EditDeleteButtonControl';

export default function EventDetail({ entry }) {
  const [isEditable, setIsEditable] = useState(false);
  const [subject, setSubject] = useState(entry.subject);
  const [date, setDate] = useState(entry.date);
  const [description, setDescription] = useState(entry.description);

  return (
        <Grid container flexDirection={"row"}>
          <Grid container xs={12} flexDirection={"row"}>
            <Grid xs={8} md={8} lg={8} >
              <Stack spacing={1.5}>
                <TextField
                  label="Subject"
                  size ="small"
                  margin="normal"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={!isEditable}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                  label="Start"
                    margin="normal"
                    slotProps={{ textField: { size: 'small' } }}
                    value={dayjs(date)}
                    onChange={(e) => setDate(e)}
                    disabled={!isEditable}
                  />
                </LocalizationProvider>
              </Stack>
            </Grid>
            <Grid xs={4} md={4} lg={4} paddingTop={2} >
            <Stack direction="row" justifyContent="end">
              <EDButton isEditable={isEditable} setIsEditable={setIsEditable}/>
            </Stack>
            </Grid>
          </Grid>
          <Grid xs={12} md={12} lg={12}>
            <TextField
              multiline
              minRows={3}
              maxRows={3}
              margin="normal"
              size ="small"
              label="Description"
              fullWidth={true}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditable}
            />
          </Grid>
        </Grid>
  );
};
