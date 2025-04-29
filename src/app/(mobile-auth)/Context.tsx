"use client"
import { createContext, useState, ReactNode } from "react"

// Create AuthContext with default values
export const AuthContext = createContext<{
  formData: {
    name: string;
    phoneNumber: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    phoneNumber: string;
  }>>;
}>({
  formData: {
    name: "",
    phoneNumber: ""
  },
  setFormData: () => {}
});

// AuthProvider component to wrap around components that need access to the context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: ""
  });
  const [changed,setChanged] = useState(false)

  const context = {
    formData,
    setFormData,
    changed,
    setChanged
  };

  return (
    <AuthContext.Provider value={context}>
      {children}
    </AuthContext.Provider>
  );
};
