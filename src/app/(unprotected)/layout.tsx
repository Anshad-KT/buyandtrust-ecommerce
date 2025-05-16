// "use client"
// import { AuthProvider } from "./Context"
// import { LoginProvider } from "./login/LoginContext";
 
// export default function Layout({
//     children,
//   }: Readonly<{
//     children: React.ReactNode;
//   }>) {
   
//     return(
//         <AuthProvider>
//           <LoginProvider>
//             {children}
//           </LoginProvider>
//         </AuthProvider>
     
//     )
//   }

"use client"
import { AuthProvider } from "./Context"
import { LoginProvider } from "./login/LoginContext"
import Footer from "@/app/_components/Footer" // Adjust the import path as needed
import Breadcrumbs from "@/app/_components/breadcrumps"
import { usePathname } from "next/navigation";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const breadcrumbPaths = {
    '/login': 'Login',
    '/signup': 'Sign Up'
  };

  return (
    <>
      {pathname !== '/' && <Breadcrumbs currentPath={pathname} pathMap={breadcrumbPaths} />}
      <AuthProvider>
        <LoginProvider>
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </div>
        </LoginProvider>
      </AuthProvider>
    </>
  )
}