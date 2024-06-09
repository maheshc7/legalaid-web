import { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { styled } from "@mui/system";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const FileInput = styled("input")({
  display: "none",
});

const DropZone = styled(Box)({
  border: "4px dashed rgba(0, 0, 0, 0.2)",
  background: "#EFF7FF",
  borderRadius: "8px",
  cursor: "pointer",
  height: "280px",
  marginBottom: "32px",
  position: "relative",
  textAlign: "center",
  width: "100%",

  "&:hover": {
    backgroundColor: "#a3d1ff",
  },
});

const ErrorMessage = styled(Typography)({
  color: "red",
  fontSize: "1rem",
  marginBottom: "16px",
});

const SelectFileButton = styled(Button)({
  color: "#fff",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 1,
});

const DropText = styled(Typography)({
  color: "grey",
  position: "absolute",
  top: "65%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 1,
});

function FileUpload({ selectedFile, onUpload, onSelect }) {
  const [error, setError] = useState("");

  const handleSelectFile = (e) => {
    const file = e.target.files[0];
    if (file.type === "application/pdf") {
      onSelect(file);
      setError("");
    } else {
      onSelect(null);
      setError("Please select a PDF file.");
    }
  };

  const handleUploadFile = () => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      onUpload();
    } else {
      setError("Please select a PDF file.");
    }
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onSelect(file);
      setError("");
    } else {
      onSelect(null);
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
        height: "70vh",
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
        data-testid="drop zone"
      >
        <FileInput
          id="fileInput"
          data-testid="file input"
          type="file"
          accept=".pdf"
          onChange={handleSelectFile}
        />
        {selectedFile ? (
          <Typography
            variant="h5"
            color={"black"}
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
          <>
            <SelectFileButton
              variant="contained"
              color="secondary"
              startIcon={<CloudUploadIcon />}
              size="large"
            >
              Select a PDF file
            </SelectFileButton>
            <DropText>or drop file here</DropText>
          </>
        )}
      </DropZone>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleUploadFile}
        disabled={!selectedFile}
        data-testid="upload btn"
      >
        Upload
      </Button>
    </Container>
  );
}

export default FileUpload;
