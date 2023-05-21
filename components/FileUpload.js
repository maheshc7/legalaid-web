import { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { styled } from "@mui/system";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAppContext } from "../context/AppContext";


const FileInput = styled("input")({
  display: "none",
});

const DropZone = styled(Box)({
  border: "4px dashed rgba(0, 0, 0, 0.2)",
  borderRadius: "8px",
  cursor: "pointer",
  height: "180px",
  marginBottom: "32px",
  position: "relative",
  textAlign: "center",
  width: "100%",

  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});

const ErrorMessage = styled(Typography)({
  color: "red",
  fontSize: "1rem",
  marginBottom: "16px",
});

const SelectFileButton = styled(Button)({
  backgroundColor: "#3F51B5",
  color: "#fff",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 1,
});

function FileUpload({onUpload}) {
  const [selectedFile, setSelectedFile] = useAppContext();
  const [error, setError] = useState("");

  const handleSelectFile = (e) => {
    const file = e.target.files[0];
    if (file.type === "application/pdf") {
      setSelectedFile(file);
      setError("");
    } else {
      setSelectedFile(null);
      setError("Please select a PDF file.");
    }
  };

  const handleUploadFile = () => {
    if (selectedFile) {
      onUpload();
    } else {
      setError("Please select a PDF file.");
    }
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file.type === "application/pdf") {
      setSelectedFile(file);
      setError("");
    } else {
      setSelectedFile(null);
      setError("Please select a PDF file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: "32px" }}>
        Upload a PDF file
      </Typography>
      <DropZone
        onDrop={handleDropFile}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <FileInput
          id="fileInput"
          type="file"
          accept=".pdf"
          onChange={handleSelectFile}
        />
        {selectedFile ? (
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {selectedFile.name}
          </Typography>
        ) : (
          <SelectFileButton
            variant="contained"
            startIcon={<CloudUploadIcon />}
            size="large">
            Select a PDF file
          </SelectFileButton>
          )}
        </DropZone>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleUploadFile}
          disabled={!selectedFile}
        >
          Upload
        </Button>
      </Container>
         );
        }
        
        export default FileUpload;