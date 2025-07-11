// app/auth-error/page.tsx
export default function AuthErrorPage() {
  return (
    <div className="text-center p-10">
      <h1 className="text-2xl font-bold">Authentication Error</h1>
      <p className="text-gray-600 mt-2">There was a problem logging you in. Please try again.</p>
    </div>
  );
}


// "use client";
// import { useEffect } from "react";
// import { useSearchParams } from "next/navigation";
// import { toastWithTimeout, ToastVariant } from "@/hooks/use-toast";

// export default function AuthErrorPage() {
//   const searchParams = useSearchParams();

//   useEffect(() => {
  
//     const error = searchParams.get("error");
//     const errorDescription = searchParams.get("error_description");

//     if (error) {
//       let message = "There was a problem logging you in. Please try again.";
//       if (error === "access_denied" && errorDescription?.includes("expired")) {
//         message = "Your login link has expired. Please request a new one.";
//       } else if (errorDescription) {
//         message = errorDescription;
//       }
//       toastWithTimeout(ToastVariant.Destructive, message);
//     }
//   }, [searchParams]);

//   return (
//     <div className="text-center p-10">
//       <h1 className="text-2xl font-bold">Authentication Error</h1>
//       <p className="text-gray-600 mt-2">
//         There was a problem logging you in. Please try again.
//       </p>
//     </div>
//   );
// }