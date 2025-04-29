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
import { AuthService } from "@/services/api/auth-service"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { states } from "@/lib/utils"

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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = {
      fullAddress: formData.get('fullAddress') as string,
      landmark: formData.get('landmark') as string, 
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      pinCode: formData.get('pinCode') as string
    };

    try {
      const authService = new AuthService();
      const userId = await authService.getUserId();
      if(!data.state || data.state == ""){
        toastWithTimeout(ToastVariant.Default,"Please select a state")
        return
      }
      if(!data.city || data.city == ""){
        toastWithTimeout(ToastVariant.Default,"Please enter city")
        return
      }
      if(!data.fullAddress || data.fullAddress == ""){
        toastWithTimeout(ToastVariant.Default,"Please enter full address")
        return
      }
      if(!data.pinCode || data.pinCode == "" || data.pinCode.length != 6){
        toastWithTimeout(ToastVariant.Default,"Please enter a valid 6-digit pin code")
        return
      }
      
      // Validate pin code format (6 digits for Indian PIN codes)
      if(!/^\d{6}$/.test(data.pinCode)) {
        toastWithTimeout(ToastVariant.Default,"Please enter a valid 6-digit pin code")
        return
      }
      if (!userId) throw new Error("User not found");

      await authService.add_user_address(
        userId,
        data.fullAddress,
        data.landmark,
        data.city, 
        data.state,
        data.pinCode
      );
       toastWithTimeout(ToastVariant.Default,"Address added successfully")
      // Redirect or show success message
    } catch (error) {
      toastWithTimeout(ToastVariant.Default,"An Error Occured")
      console.error(error);
      // Handle error
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Card className="w-full mx-auto max-w-lg mt-5 shadow-none h-full border-none mr-auto">
        <CardContent className="shadow-none border-none h-full">
          <h2 className="lg:block hidden text-4xl font-semibold mb-4">Address details</h2>
          <form onSubmit={handleSubmit} className="flex flex-col justify-evenly space-y-6 h-full">
            <div className="">
              <TextField
                id="fullAddress"
                name="fullAddress"
                className=""
                required
                fullWidth
                label="Full Address"
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
                id="landmark"
                name="landmark"
                required
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
                name="city"
                required
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
                name="state"
                select
                required
                fullWidth
                label="State"
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
                name="pinCode"
                fullWidth
                label="Pin Code"
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
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-8 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Save and update
            </Button>
          </form>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
