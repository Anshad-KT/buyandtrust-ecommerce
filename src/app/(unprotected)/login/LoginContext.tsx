// "use client";

// import { createContext, useState, ReactNode, useContext } from "react";

// interface LoginContextType {
//   phone: string;
//   setPhone: (phone: string) => void;
// }

// export const LoginContext = createContext<LoginContextType | undefined>(undefined);

// interface LoginProviderProps {
//   children: ReactNode;
// }

// export function LoginProvider({ children }: LoginProviderProps) {
//   const [phone, setPhone] = useState("");

//   return (
//     <LoginContext.Provider value={{ phone, setPhone }}>
//       {children}
//     </LoginContext.Provider>
//   );
// }

// export function useLoginContext() {
//   const context = useContext(LoginContext);
//   if (context === undefined) {
//     throw new Error("useLoginContext must be used within a LoginProvider");
//   }
//   return context;
// }


"use client";

import { createContext, useState, ReactNode, useContext } from "react";

interface LoginContextType {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

export const LoginContext = createContext<LoginContextType | undefined>(undefined);

interface LoginProviderProps {
  children: ReactNode;
}

export function LoginProvider({ children }: LoginProviderProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <LoginContext.Provider value={{ email, setEmail, password, setPassword }}>
      {children}
    </LoginContext.Provider>
  );
}

export function useLoginContext() {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error("useLoginContext must be used within a LoginProvider");
  }
  return context;
}