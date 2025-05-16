// "use client"
// import { createContext, useState, ReactNode } from "react"

// // Create AuthContext with default values
// export const AuthContext = createContext<{
//   formData: {
//     name: string;
//     phoneNumber: string;
//   };
//   setFormData: React.Dispatch<React.SetStateAction<{
//     name: string;
//     phoneNumber: string;
//   }>>;
// }>({
//   formData: {
//     name: "",
//     phoneNumber: ""
//   },
//   setFormData: () => {}
// });

// // AuthProvider component to wrap around components that need access to the context
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     phoneNumber: ""
//   });
//   const [changed,setChanged] = useState(false)

//   const context = {
//     formData,
//     setFormData,
//     changed,
//     setChanged
//   };

//   return (
//     <AuthContext.Provider value={context}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


"use client"
import { createContext, useState, ReactNode, useContext } from "react"

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

// Create AuthContext with default values
export const AuthContext = createContext<AuthContextType>({
  formData: {
    name: "",
    email: "",
    password: ""
  },
  setFormData: () => {}
});

// AuthProvider component to wrap around components that need access to the context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: ""
  });

  return (
    <AuthContext.Provider value={{ formData, setFormData }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}