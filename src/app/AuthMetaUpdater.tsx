'use client';
import { useEffect, useState } from "react";
import { AuthService } from "@/services/api/auth-service";
import { useLogin } from "./LoginContext";
import { useToast } from "@/hooks/use-toast";
import CompleteProfileModal from "./_components/CompleteProfileModal";



export default function AuthMetaUpdater() {
    const { isLoggedIn } = useLogin();
    const { toast } = useToast();
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = (values: any) => {
        console.log("Submitting values:", values);
        // Add your submit logic here
        setShowModal(false);
    };
  

    useEffect(() => {
        if (isLoggedIn) {
          const updateMetadata = async () => {
            try {
              const result = await new AuthService().ensureCustomerMetadata();
              if (result && 'missingFields' in result && Array.isArray(result.missingFields) && result.missingFields.length > 0) {
                setMissingFields(result.missingFields);
                setShowModal(true);
              }
            } catch (err) {
              console.error("Failed to update customer metadata", err);
            }
          };
          updateMetadata();
        }
      }, [isLoggedIn]);
    
      const handleCompleteProfile = async (values: any) => {
        try {
          // Call a method to update user metadata with the entered values
          await new AuthService().updateUserMetadata(values);
          setShowModal(false);
          setMissingFields([]);
          toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully.",
          });
        } catch (err: any) {
            // Try to use backend error message if available
            const code = err?.code || "Update Failed";
            const message = err?.message || "Could not update profile. Please try again.";
            toast({
                title: code === "phone_exists" ? "Phone number exists" : code,
                description: message,
            });
        }
      };
    
      return (
        <>
          {showModal && (
            <CompleteProfileModal
              missingFields={missingFields}
              onSubmit={handleCompleteProfile}
            />
          )}
          {/* nothing rendered otherwise */}
        </>
      );
    }


// export default function AuthMetaUpdater() {
//   const { isLoggedIn } = useLogin();

//   useEffect(() => {
//     console.log("isLoggedIn metadata", isLoggedIn);
//     if (isLoggedIn) {
//       const updateMetadata = async () => {
//         try {
//           await new AuthService().ensureCustomerMetadata();
//           console.log("✅ Customer metadata ensured");
//         } catch (err) {
//           console.error("Failed to update customer metadata", err);
//         }
//       };
//       updateMetadata();
//     }
//   }, [isLoggedIn]);

//   return null;
// }