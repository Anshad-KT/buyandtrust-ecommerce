"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import TextField from "@mui/material/TextField"
import MenuItem from "@mui/material/MenuItem"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { useEffect, useState } from "react"
import { makeApiCall } from "@/lib/apicaller"
import { AuthService } from "@/services/api/auth-service"
import { states } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toastWithTimeout, ToastVariant } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#bdbdbd',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#9e9e9e',
            },
          },
        },
      },
    },
  },
});

export default function AddressForm() {
  const [address, setAddress] = useState<any>({
    full_address: "",
    landmark: "",
    city: "",
    state: "",
    pin_code: "",
  })
  useEffect(() => {
    makeApiCall(
      async () => new AuthService().get_user_address(await new AuthService().getUserId() || ""),
      {
        afterSuccess: (data: any) => {
          setAddress(data)
        }
      }
    )
  }, [])
  const router = useRouter()

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({
      ...address,
      [field]: event.target.value
    });
  };
  const [isLoading,setIsLoading] = useState(false)
  const handleSubmit = async () => {
    
    if(address.full_address == "" || address.landmark == "" || address.city == "" || address.state == "" || address.pin_code == ""){
      toastWithTimeout(ToastVariant.Default, "Please fill all the fields")
      return
    }
    if(address.pin_code.length != 6){
      toastWithTimeout(ToastVariant.Default, "Pin code must be 6 digits")
      return
    }
    if(address.state == ""){
      toastWithTimeout(ToastVariant.Default, "Please select a state")
      return
    }
    if(address.city == ""){
      toastWithTimeout(ToastVariant.Default, "Please enter a city")
      return
    }
    if(address.landmark == ""){
      toastWithTimeout(ToastVariant.Default, "Please enter a landmark")
      return
    }
    const isValidString = (str: string) => /^[a-zA-Z\s]+$/.test(str);

    if (!isValidString(address.city)) {
      toastWithTimeout(ToastVariant.Default, "City cannot contain numbers");
      return;
    }
    if (!isValidString(address.state)) {
      toastWithTimeout(ToastVariant.Default, "State cannot contain numbers");
      return;
    }
    setIsLoading(true)
    await new AuthService().update_user_address(
      await new AuthService().getUserId() || "",
      address.full_address,
      address.landmark,
      address.city,
      address.state,
      address.pin_code
    ); 
    setIsLoading(false)
    toastWithTimeout(ToastVariant.Default, "Address updated successfully")
    router.push("/payment")
  };

  return (
    <ThemeProvider theme={theme} >
      <Card className="w-full mx-auto max-w-lg mt-5 shadow-none  h-full border-none mr-auto  ">
        <CardContent className=" shadow-none border-none h-full ">
         
          <div className=" flex flex-col justify-evenly  space-y-6 h-full"  >
           
            
            <div className="">
               
              <TextField
                id="fullAddress"
                className=""
                required
                
                fullWidth
                value={address.full_address}
                onChange={handleChange('full_address')}
                label="Full Address"
                variant="outlined"
                size="medium"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#BEC8E0" },
                    "&:hover fieldset": { borderColor: "#BEC8E0" },
                    "&.Mui-focused fieldset": { borderColor: "#BEC8E0" },
                  },
                }}
              />
            </div>

            <div className="">
              
              <TextField
                id="landmark"
                required
                value={address.landmark}
                onChange={handleChange('landmark')}
                label="Landmark"
                fullWidth
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#BEC8E0" },
                    "&:hover fieldset": { borderColor: "#BEC8E0" },
                    "&.Mui-focused fieldset": { borderColor: "#BEC8E0" },
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />
            </div>

            <div className="">
               
              <TextField
                id="city"
                required
                value={address.city}
                onChange={handleChange('city')}
                fullWidth
                 label="City"
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#BEC8E0" },
                    "&:hover fieldset": { borderColor: "#BEC8E0" },
                    "&.Mui-focused fieldset": { borderColor: "#BEC8E0" },
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />
            </div>

            <div className="">
               
              <TextField
                id="state"
                select
                required
                value={address.state}
                onChange={handleChange('state')}
                fullWidth
                 label="State"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#BEC8E0" },
                    "&:hover fieldset": { borderColor: "#BEC8E0" },
                    "&.Mui-focused fieldset": { borderColor: "#BEC8E0" },
                  },
                }}
                size="medium"
                InputLabelProps={{ shrink: true }}
              >
                {states.map((option) => (
                  <MenuItem key={option.label} value={option.label}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div className="">
             
              <TextField
                id="pinCode"
                fullWidth
                label="Pin Code"
                variant="outlined"
                value={address.pin_code}
                onChange={handleChange('pin_code')}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#BEC8E0" },
                    "&:hover fieldset": { borderColor: "#BEC8E0" },
                    "&.Mui-focused fieldset": { borderColor: "#BEC8E0" },
                  },
                }}
                size="medium"
                InputLabelProps={{ shrink: true }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
            </div>

            <button 
              type="button"
              onClick={handleSubmit} 
              className="bg-gradient-to-b from-[#FF4D4D] to-[#D32F2F] text-white py-3 px-7 w-full"
            >
              {isLoading ?<> <Loader2 className="w-4 h-4 animate-spin" /> <h1>Confirming Address</h1></> : "Confirm Address"}
            </button>
          </div>
        </CardContent>
      </Card>
    </ThemeProvider>
  )
}

