import React, {useState} from "react";
import Stack from '@mui/material/Stack';
import TextField  from '@mui/material/TextField';
import EDButton from "./EditDeleteButtonControl";

export default function CaseDetails({ caseDetail }) {

    const [isEditable, setIsEditable] = useState(false);
    const [court, setCourt] = useState(caseDetail.court);
    const [caseNum, setCaseNum] = useState(caseDetail.caseNum);
    const [plaintiff, setPlaintiff] = useState(caseDetail.plaintiff);
    const [defendant, setDefendant] = useState(caseDetail.defendant);

    return(
        <>
            <Stack direction="row" justifyContent="space-between">
                <h2>Case Details</h2>
                <EDButton isEditable={isEditable} setIsEditable={setIsEditable} showDelete={false}/>
            </Stack>

            <TextField
            multiline
                label="Court"
                size ="small"
                margin="normal"
                fullWidth={true}
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                disabled={!isEditable}
            />
            <TextField
                label="Case Number"
                size ="small"
                margin="normal"
                value={caseNum}
                onChange={(e) => setCaseNum(e.target.value)}
                disabled={!isEditable}
            />
            <TextField
                label="Plaintiff"
                size ="small"
                margin="normal"
                value={plaintiff}
                onChange={(e) => setPlaintiff(e.target.value)}
                disabled={!isEditable}
            />
            <TextField
                label="Defendant"
                size ="small"
                margin="normal"
                value={defendant}
                onChange={(e) => setDefendant(e.target.value)}
                disabled={!isEditable}
            />
        </> 
        
    );

};