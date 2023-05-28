import React from "react";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/ModeEdit';
import { ButtonGroup } from "@mui/material";

export default function EDButton ({isEditable, setIsEditable, showDelete = true}) {

    const handleEditClick = () => {
        setIsEditable(true);
      };
    
      const handleSaveClick = () => {
        setIsEditable(false);
      };
    
      const handleDeleteClick = () => {
        // perform delete logic here
      };

    return (
        <ButtonGroup>
            {isEditable ? (
                <IconButton aria-label="save" color="success" onClick={handleSaveClick}>
                <CheckIcon />
                </IconButton>
            ) : (
                <IconButton aria-label="edit" color="neutral" onClick={handleEditClick}>
                <EditIcon />
                </IconButton>
            )}
            {showDelete && 
                <IconButton aria-label="delete" color="error" onClick={handleDeleteClick}>
                    <DeleteIcon />
                </IconButton>
            }
        </ButtonGroup>
    );
    
};