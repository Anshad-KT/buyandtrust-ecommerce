import { ToastFunction } from "@/hooks/use-toast";
import { IResponse } from "@/services/api/utils";
 

export async function makeApiCall(
    serverCall: Function,
    {   toastContent,
        toast,
        afterSuccess,
        afterError,
        forceShutdown = false
    }: { toastContent?:string, toast?: ToastFunction; afterSuccess?: Function; afterError?: Function,forceShutdown?:boolean }
) {
    try {
        const response: IResponse = await serverCall();
 


        if (afterSuccess) afterSuccess(response);
        if (toast) {
            const currentToast = toast({
                description: toastContent,
            });
            setTimeout(() => {
                currentToast.dismiss()
            }, 2000);
         return response
        } else {
            
        }
    } catch (error:any) {
        
        
 
        
        if (afterError) afterError(error instanceof Error);
        if (toast && !forceShutdown) {
            const currentToast = toast({
                variant: "destructive",
                description: error.message ? error.message as string :"An Error Occured",
            });
            setTimeout(() => {
                currentToast.dismiss()
            }, 3000);
            
        } else {
            
        }
       
    }
}
