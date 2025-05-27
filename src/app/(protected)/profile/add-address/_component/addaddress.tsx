"use client"

import { useState, useEffect } from "react"
import { SheetAddress } from "./sheetaddress"
import { EcomService } from "@/services/api/ecom-service"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
interface Address {
  id: string
  name: string
  address: string
  phone: string
  email: string
  is_default?: boolean
  first_name?: string
  last_name?: string
  city?: string
  state?: string
  country?: string
  zipcode?: string
  customer_addresses_id?: string
  [key: string]: any // For extra fields from Supabase
}

const ecomService = new EcomService()

export default function AddAddress() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null)

  // Fetch the address from Supabase on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  // Function to fetch addresses from the server
  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const addressesData = await ecomService.get_customer_addresses();
      console.log("dataaddress:", addressesData);
      
      if (addressesData && addressesData.length > 0) {
        // Map the array of addresses to our Address interface format
        const formattedAddresses = addressesData.map(data => ({
          id: data.customer_addresses_id || data.id || "1",
          customer_addresses_id: data.customer_addresses_id || data.id || "1",
          name: [data.first_name, data.last_name].filter(Boolean).join(" ") || "",
          address: data.address || "",
          company_name: data.company_name || "",
          phone: data.phone || "",
          email: data.email || "",
          is_default: data.is_default || false,
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          zipcode: data.zipcode || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          ...data, // Keep all original data to preserve any other fields
        }));

        setAddresses(formattedAddresses);
        
        // Find and set the default address if any
        const defaultAddress = formattedAddresses.find(addr => addr.is_default);
        if (defaultAddress) {
          setDefaultAddressId(defaultAddress.id);
        }
      } else {
        setAddresses([]);
      }
    } catch (err: any) {
      console.error("Address fetch error:", err);
      setError("Failed to fetch address.");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Save handler (for add/edit)
  const handleSaveAddress = async (addressData: Partial<Address>, addressId?: string) => {
    if (addressId) {
      // Edit address: update in Supabase
      try {
        console.log("addressId:", addressId);
        // Find the current address being edited
        const currentAddress = addresses.find(addr => addr.id === addressId);
        if (!currentAddress) {
          throw new Error("Address not found");
        }
        
        // Create a complete update payload by merging current data with changes
        // This ensures we keep all existing data that wasn't changed
        const updatePayload: any = {
          // Always include the customer_address_id - critical for the update operation
          customer_addresses_id: currentAddress.customer_addresses_id || currentAddress.id || addressId,
        };
        
        // When editing from SheetAddress, the addressData contains all form fields directly
        // so we can use them directly without splitting name
        if (addressData.first_name !== undefined) updatePayload.first_name = addressData.first_name;
        if (addressData.last_name !== undefined) updatePayload.last_name = addressData.last_name;
        if (addressData.company_name !== undefined) updatePayload.company_name = addressData.company_name;
        if (addressData.address !== undefined) updatePayload.address = addressData.address;
        if (addressData.country !== undefined) updatePayload.country = addressData.country;
        if (addressData.state !== undefined) updatePayload.state = addressData.state;
        if (addressData.city !== undefined) updatePayload.city = addressData.city;
        if (addressData.zipcode !== undefined) updatePayload.zipcode = addressData.zipcode;
        if (addressData.email !== undefined) updatePayload.email = addressData.email;
        if (addressData.phone !== undefined) updatePayload.phone = addressData.phone;
        
        // For backward compatibility, also handle the case where name is provided instead of first_name/last_name
        if (addressData.name && (!addressData.first_name && !addressData.last_name)) {
          const nameParts = addressData.name.split(" ");
          updatePayload.first_name = nameParts[0] || "";
          updatePayload.last_name = nameParts.length > 1 ? 
            nameParts.slice(1).join(" ") : "";
        }
        
        console.log("Sending complete update payload:", updatePayload);
        
        // Make the API call
        const updatedData = await ecomService.update_customer_address(updatePayload);
        
        toastWithTimeout(ToastVariant.Success, "Address updated successfully");
        console.log("Address updated successfully:", updatedData);
        
        // Fetch the updated list of addresses from the server
        await fetchAddresses();
        
      } catch (err: any) {
        console.error("Address update error:", err);
        // Show the error message from Supabase if available
        setError(
          err?.message ||
          err?.error?.message ||
          "Failed to update address."
        )
      }
    } else {
      // For new address, we'll let SheetAddress component handle the API call
      // and then refresh our address list afterward
      try {
        // After SheetAddress adds the address, fetch the updated list
        await fetchAddresses();
      } catch (err: any) {
        console.error("Error refreshing addresses after add:", err);
        setError("Failed to refresh address list.");
      }
    }
  }

// Handler for default address checkbox
const handleDefaultCheckbox = async (addressId: string) => {
  // Find the address object
  const address = addresses.find(addr => addr.id === addressId);
  if (!address) return;

  // Prepare the payload for update_default_address
  const payload = {
    customer_addresses_id: address.customer_addresses_id || address.id,
    is_default: true // Explicitly set is_default to true
  };

  setLoading(true);
  setError(null);

  try {
    // Call the API to set this address as default
    await ecomService.update_default_address(payload);

    // Update local state
    setDefaultAddressId(addressId);
    setAddresses(prev =>
      prev.map(addr =>
        addr.id === addressId
          ? { ...addr, is_default: true }
          : { ...addr, is_default: false }
      )
    );
  } catch (err: any) {
    setError(
      err?.message ||
      err?.error?.message ||
      "Failed to set default address."
    );
  } finally {
    setLoading(false);
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
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="col-span-full text-center text-red-500">{error}</div>
        ) : addresses.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-8">
            <img
              src="/noaddress.svg"
              alt="No Address Illustration"
              className="mx-auto mb-4 w-32 h-32 object-contain"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Address Found</h2>
            <p className="text-gray-500 text-base">You haven't added an address yet.</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="border rounded-md p-6 relative">
              {/* Default address checkbox on top right */}
              <div className="absolute top-4 right-4 flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={!!address.is_default || defaultAddressId === address.id}
                  onChange={() => handleDefaultCheckbox(address.id)}
                  id={`default-checkbox-${address.id}`}
                  className="accent-blue-800"
                />
                <label htmlFor={`default-checkbox-${address.id}`} className="text-xs text-gray-700 select-none">

                </label>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{address.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{address.address}</p>
              
              <div className="space-y-1 mb-6">
                <p className="text-sm">
                  <span className="text-gray-600 font-semibold">Company Name:</span> {address.company_name}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600 font-semibold">Phone Number:</span> {address.phone}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600 font-semibold">Email:</span> {address.email}
                </p>
                {address.city && (
                  <p className="text-sm">
                    <span className="text-gray-600 font-semibold">City:</span> {address.city}
                  </p>
                )}
                {address.state && (
                  <p className="text-sm">
                    <span className="text-gray-600 font-semibold">State:</span> {address.state}
                  </p>
                )}
                {address.country && (
                  <p className="text-sm">
                    <span className="text-gray-600 font-semibold">Country:</span> {address.country}
                  </p>
                )}
              </div>
              
              <SheetAddress
                mode="edit"
                address={address}
                onSave={(data) => handleSaveAddress(data, address.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}