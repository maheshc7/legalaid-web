import { useState, createContext, useContext, useMemo } from "react";

const AppContext = createContext();

export function AppWrapper({ children }) {
   const [selectedFile, setSelectedFile] = useState(null);
   const contextValue = useMemo(() => {
      return [selectedFile, setSelectedFile];
   }, [selectedFile, setSelectedFile]);

   return (
   <AppContext.Provider value={contextValue}>
      {children}
   </AppContext.Provider>
   );
}
export function useAppContext() {
   return useContext(AppContext);
}