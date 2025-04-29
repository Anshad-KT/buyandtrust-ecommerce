"use client"
import { AuthProvider } from "./Context"
import { LoginProvider } from "./login/LoginContext";
 
export default function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
   
    return(
        <AuthProvider>
          <LoginProvider>
            {children}
          </LoginProvider>
        </AuthProvider>
     
    )
  }