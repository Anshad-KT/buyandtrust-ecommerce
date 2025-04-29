'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { makeApiCall } from '@/lib/apicaller'
import { AuthService } from '@/services/api/auth-service'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const Page = () => {
  const [address, setAddress] = useState<any>([])

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
  return (
    <>
    <div className="flex-col items-center  justify-center  lg:hidden flex">
      {!address ? (
        <>
          <div className="w-64 h-64 mb-6">
            <img
              src="/newsletter.png" 
              alt="Illustration of a person sitting in an armchair"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Available Address</h2>
          <p className="text-gray-500 text-center">
            You haven&apos;t added any address yet.
          </p>
          <Link className="pt-6" href="/profile/address/add-address">
            <Button className="bg-white hover:bg-white text-[#FF3333] border border-[#FF3333] px-8 rounded-none">
              Add address
            </Button>
          </Link>
        </>
      ) : (
        <AddressForm address={address} />
      )}
    </div>
  
    <div className="lg:flex hidden w-full justify-center items-center mx-auto mb-8">
      {address.length === 0 ? (
        <>
          <img
            src="/orders.png"
            alt="No Address Illustration" 
            className="w-40 h-40"
          />
        </>
      ) : (
        <AddressForm address={address} />
      )}
    </div>
      
      
    {address.length === 0 && (
    <Link className="lg:flex hidden" href="/profile/address/add-address">
      <Button className="bg-white hover:bg-white text-[#FF3333] border border-[#FF3333] px-8 rounded-none">
        Add address
      </Button>
    </Link>
    )}
  </>
  )
}

export default Page
 




 
import TextField from "@mui/material/TextField"
import MenuItem from "@mui/material/MenuItem"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { states } from '@/lib/utils'
import { ToastVariant } from '@/hooks/use-toast'
import { toastWithTimeout } from '@/hooks/use-toast'

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

function AddressForm({ address }: { address: any }) {
  const [formValues, setFormValues] = useState({
    fullAddress: address?.full_address || '',
    landmark: address?.landmark || '',
    city: address?.city || '',
    state: address?.state || '',
    pinCode: address?.pin_code || ''
  });

  useEffect(() => {
    if (address) {
      setFormValues({
        fullAddress: address.full_address || '',
        landmark: address.landmark || '',
        city: address.city || '',
        state: address.state || '',
        pinCode: address.pin_code || ''
      });
    }
  }, [address]);

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
     
    try {
    
      makeApiCall(
        async () => new AuthService().update_user_address(await new AuthService().getUserId() || "", data.fullAddress, data.landmark, data.city, data.state, data.pinCode),
        {
          afterSuccess: () => {
            toastWithTimeout(ToastVariant.Default, "Address updated successfully")
          }
        }
      ) 
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <ThemeProvider theme={theme} >
      <Card className="w-full mx-auto max-w-lg mt-5 shadow-none  h-full border-none mr-auto  ">
        <CardContent className=" shadow-none border-none h-full ">
        <h2 className="lg:block hidden text-4xl font-semibold mb-4">Address details</h2>
          <form onSubmit={handleSubmit} className=" flex flex-col justify-evenly  space-y-6 h-full">
           
            <div className="">
              <TextField
                id="fullAddress"
                name="fullAddress"
                className=""
                required 
                value={formValues.fullAddress}
                onChange={(e) => setFormValues({...formValues, fullAddress: e.target.value})}
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
                value={formValues.landmark}
                onChange={(e) => setFormValues({...formValues, landmark: e.target.value})}
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
                value={formValues.city}
                onChange={(e) => setFormValues({...formValues, city: e.target.value})}
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
                value={formValues.state}
                onChange={(e) => setFormValues({...formValues, state: e.target.value})}
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
                value={formValues.pinCode}
                onChange={(e) => setFormValues({...formValues, pinCode: e.target.value})}
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
  )
}
