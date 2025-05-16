"use client"

import { useState } from "react"
import { SheetAddress } from "./sheetaddress"

interface Address {
  id: string
  name: string
  address: string
  phone: string
  email: string
}

export default function AddAddress() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "Kevin Gilbert",
      address: "East Tejturi Bazar, Word No. 04, Road No. 13/x, House no. 1320/C, Flat No. 5D, Dhaka-1200, Bangladesh",
      phone: "+1-202-555-0118",
      email: "kevin.gilbert@gmail.com",
    },
    {
      id: "2",
      name: "Kevin Gilbert",
      address: "East Tejturi Bazar, Word No. 04, Road No. 13/x, House no. 1320/C, Flat No. 5D, Dhaka-1200, Bangladesh",
      phone: "+1-202-555-0118",
      email: "kevin.gilbert@gmail.com",
    },
    {
      id: "3",
      name: "Kevin Gilbert",
      address: "East Tejturi Bazar, Word No. 04, Road No. 13/x, House no. 1320/C, Flat No. 5D, Dhaka-1200, Bangladesh",
      phone: "+1-202-555-0118",
      email: "kevin.gilbert@gmail.com",
    },
  ])
  
  const handleSaveAddress = (addressData: Partial<Address>, editId?: string) => {
    if (editId) {
      // Edit existing address
      setAddresses(addresses.map(addr => 
        addr.id === editId ? { ...addr, ...addressData } as Address : addr // Ensure all fields of Address are present
      ))
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(), // Simple ID generation
        name: addressData.name || "",
        address: addressData.address || "",
        phone: addressData.phone || "",
        email: addressData.email || "",
      }
      setAddresses([...addresses, newAddress])
    }
  }

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">ADDRESSES</h2>
        <SheetAddress
          mode="add"
          onSave={(data) => handleSaveAddress(data)}
        />
      </div>

      {/* Address Cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((address) => (
          <div key={address.id} className="border rounded-md p-6">
            <h3 className="font-semibold text-gray-800 mb-2">{address.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{address.address}</p>
            
            <div className="space-y-1 mb-6">
              <p className="text-sm">
                <span className="text-gray-600 font-semibold">Phone Number:</span> {address.phone}
              </p>
              <p className="text-sm">
                <span className="text-gray-600 font-semibold">Email:</span> {address.email}
              </p>
            </div>
            
            <SheetAddress
              mode="edit"
              address={address}
              onSave={(data) => handleSaveAddress(data, address.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}