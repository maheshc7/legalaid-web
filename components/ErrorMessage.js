// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Alert, AlertTitle } from "@mui/material";
import { useAppContext } from "../context/AppContext";

// <ErrorMessageSnippet>

export default function ErrorMessage({home}) {
  const app = useAppContext();

  if(home) {
    app.clearError()
  }
  if (app.error && !home) {
    return (
      <Alert
        severity="error"
        variant="outlined"
        onClose={() => app.clearError()}
      >
        <AlertTitle>Error</AlertTitle>
        <strong>{app.error.message}</strong> -
        {app.error.debug ? <>{app.error.debug}</> : null}
      </Alert>
    );
  }

  return null;
}
// </ErrorMessageSnippet>
