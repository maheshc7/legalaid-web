import React, {useState} from "react";
import Stack from '@mui/material/Stack';
import TextField  from '@mui/material/TextField';
import EDButton from "./EditDeleteButtonControl";
import { Typography } from "@mui/material";

export default function CaseDetails({ caseDetail }) {

    const [isEditable, setIsEditable] = useState(false);
    const [court, setCourt] = useState(caseDetail.court);
    const [caseNum, setCaseNum] = useState(caseDetail.caseNum);
    const [plaintiff, setPlaintiff] = useState(caseDetail.plaintiff);
    const [defendant, setDefendant] = useState(caseDetail.defendant);

    const handleSaveClick = () => {
        if (court && caseNum && plaintiff && defendant){
            setIsEditable(false);
        }
    }

    return(
        <>
            <Stack direction="row" justifyContent="space-between" sx={{pl:2, pr:1}}>
                <Typography variant="h6" color={"grey.700"} gutterBottom>Case Details</Typography>
                <EDButton isEditable={isEditable} setIsEditable={setIsEditable} onSave={handleSaveClick} showDelete={false}/>
            </Stack>

            <TextField
            multiline
                error={!court.trim()}
                label="Court"
                size ="small"
                margin="normal"
                fullWidth={true}
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                disabled={!isEditable}
            />
            <TextField
                error={!caseNum.trim()}
                label="Case Number"
                size ="small"
                margin="normal"
                value={caseNum}
                onChange={(e) => setCaseNum(e.target.value)}
                disabled={!isEditable}
            />
            <TextField
                error={!plaintiff.trim()}
                label="Plaintiff"
                size ="small"
                margin="normal"
                value={plaintiff}
                onChange={(e) => setPlaintiff(e.target.value)}
                disabled={!isEditable}
            />
            <TextField
                error={!defendant.trim()}
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