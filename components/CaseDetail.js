import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import EDButton from "./EditDeleteButtonControl";
import { Typography } from "@mui/material";

export default function CaseDetails({ caseDetail, updateCaseDetail, allowPost }) {
  const [isEditable, setIsEditable] = useState(false);
  const [caseInfo, setCaseInfo] = useState(caseDetail);

  const toggleEdit = (value) => {
    setIsEditable(value);
    allowPost(!value);
  }

  const handleSaveClick = () => {
    if (caseInfo.court && caseInfo.caseNum && caseInfo.client && caseInfo.plaintiff && caseInfo.defendant) {
      updateCaseDetail(caseInfo);
      toggleEdit(false);
    }
  };

  const updateField = (field, value) => {
    setCaseInfo((prevCaseInfo) => ({
      ...prevCaseInfo,
      [field]: value,
    }));

    if (value == ""){
      allowPost(false);
    }
  };


  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ pl: 2, pr: 1 }}
      >
        <Typography variant="h6" color={"grey.700"} gutterBottom>
          Case Details
        </Typography>
        <EDButton
          isEditable={isEditable}
          setIsEditable={toggleEdit}
          onSave={handleSaveClick}
          showDelete={false}
        />
      </Stack>

      <TextField
        multiline
        maxRows={5}
        fullWidth={true}
        error={!caseInfo.court.trim()}
        label="Court"
        size="small"
        margin="normal"
        value={caseInfo.court}
        onChange={(e) => updateField("court", e.target.value)}//{(e) => setCourt(e.target.value)}
        disabled={!isEditable}
      />
      <TextField
        error={!caseInfo.caseNum.trim()}
        label="Case Number"
        size="small"
        margin="normal"
        value={caseInfo.caseNum}
        onChange={(e) => updateField("caseNum", e.target.value)}//{(e) => setCaseNum(e.target.value)}
        disabled={!isEditable}
      />
      <TextField
        multiline
        maxRows={3}
        fullWidth={caseInfo.client.trim().length > 20}
        error={!caseInfo.client.trim()}
        label="Client"
        size="small"
        margin="normal"
        value={caseInfo.client}
        onChange={(e) => updateField("client", e.target.value)}//{(e) => setCaseNum(e.target.value)}
        disabled={!isEditable}
      />
      <TextField
        multiline
        maxRows={3}
        fullWidth={caseInfo.plaintiff.trim().length > 20}
        error={!caseInfo.plaintiff.trim()}
        label="Plaintiff"
        size="small"
        margin="normal"
        value={caseInfo.plaintiff}
        onChange={(e) => updateField("plaintiff", e.target.value)}//{(e) => setPlaintiff(e.target.value)}
        disabled={!isEditable}
      />
      <TextField
        multiline
        maxRows={3}
        fullWidth={caseInfo.defendant.trim().length > 20}
        error={!caseInfo.defendant.trim()}
        label="Defendant"
        size="small"
        margin="normal"
        value={caseInfo.defendant}
        onChange={(e) => updateField("defendant", e.target.value)}//{(e) => setDefendant(e.target.value)}
        disabled={!isEditable}
      />
    </>
  );
}
