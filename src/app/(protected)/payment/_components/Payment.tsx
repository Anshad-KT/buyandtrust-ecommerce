import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { Loader2, CreditCard, Banknote, ChevronRight } from 'lucide-react';
import { EcomService } from '@/services/api/ecom-service';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { makeApiCall } from '@/lib/apicaller';
import { useLogin } from '@/app/LoginContext';
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { useCurrency } from '@/app/CurrencyContext';

const emptyAddress = {
  customer_addresses_id: '',
  first_name: '',
  last_name: '',
  company_name: '',
  address: '',
  country: '',
  state: '',
  city: '',
  zipcode: '',
  email: '',
  phone: '',
};

const requiredFields = [
  'first_name',
  'address',
  'country',
  'state',
  'city',
  'zipcode',
  'email',
  'phone',
];

const isAddressValid = (address: any) => {
  for (const field of requiredFields) {
    if (!address[field] || address[field].toString().trim() === '') {
      return false;
    }
  }
  return true;
};


const getMissingFields = (address: any) => {
  return requiredFields.filter(
    (field) => !address[field] || address[field].toString().trim() === ''
  );
};

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone validation: only numbers and optional leading plus
const phoneRegex = /^\+?[0-9]*$/;

const normalizePhoneValue = (value: string) => {
  let filtered = value.replace(/[^0-9+]/g, '');
  if (filtered.startsWith('++')) filtered = '+' + filtered.replace(/^\++/, '');
  if (filtered.indexOf('+') > 0) filtered = filtered.replace(/\+/g, '');
  return filtered;
};

const OrderDetails = ({
  size,
  localQuantity,
  deliveryExpected,
  totalPrice,
  imageUrl,
  cartProducts,
  delivery_address,
  tax, // not used, will be calculated below
  discount,
}: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const router = useRouter();
  const { cartItemCount, setCartItemCount } = useLogin();
  const { currencySymbol, currencyCode } = useCurrency();

  // Policy links are now normal routes (no modal)
  // Saved address selection
  const [selectedBillingAddress, setSelectedBillingAddress] = useState('');
  const [selectedShippingAddress, setSelectedShippingAddress] = useState('');

  // Address lists
  const [countryList, setCountryList] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [cityList, setCityList] = useState<any[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);

  // Filtered state lists based on selected country
  const [filteredBillingStates, setFilteredBillingStates] = useState<any[]>([]);
  const [filteredShippingStates, setFilteredShippingStates] = useState<any[]>([]);

  // Custom address states (main source of truth for form fields)
  const [customBillingAddress, setCustomBillingAddress] = useState({ ...emptyAddress });
  const [customShippingAddress, setCustomShippingAddress] = useState({ ...emptyAddress });
  const [loggedInContact, setLoggedInContact] = useState<{ email: string; phone: string }>({
    email: '',
    phone: '',
  });

  const mapAddressWithContact = (address: any, contact = loggedInContact) => ({
    customer_addresses_id: address?.customer_addresses_id || '',
    first_name: address?.first_name || '',
    last_name: address?.last_name || '',
    company_name: address?.company_name || '',
    address: address?.address || '',
    country: address?.country || '',
    state: address?.state || '',
    city: address?.city || '',
    zipcode: address?.zipcode || '',
    email: (contact.email || address?.email || '').toLowerCase(),
    phone: contact.phone || normalizePhoneValue(String(address?.phone || '')),
  });

  const normalizeAddressPayload = (address: any) => ({
    customer_addresses_id: address?.customer_addresses_id || '',
    first_name: (address?.first_name || '').trim(),
    last_name: (address?.last_name || '').trim(),
    company_name: (address?.company_name || '').trim(),
    address: (address?.address || '').trim(),
    country: (address?.country || '').trim(),
    state: (address?.state || '').trim(),
    city: (address?.city || '').trim(),
    zipcode: (address?.zipcode || '').trim(),
    email: (address?.email || '').trim().toLowerCase(),
    phone: normalizePhoneValue(String(address?.phone || '')),
  });

  // Order notes
  const [orderNotes, setOrderNotes] = useState('');

  // Error states for validation
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validation error state
  const [billingErrors, setBillingErrors] = useState<string[]>([]);
  const [shippingErrors, setShippingErrors] = useState<string[]>([]);

  // Tax calculation state
  const [calculatedTax, setCalculatedTax] = useState<number>(0);

  // Shipping info from cart
  const [shippingInfo, setShippingInfo] = useState<{
    isExpressDelivery: boolean;
    shippingCharge: number;
    defaultShipping: number;
    expressShipping: number;
  }>({
    isExpressDelivery: false,
    shippingCharge: 0,
    defaultShipping: 0,
    expressShipping: 0
  });

  // Load shipping info from localStorage
  useEffect(() => {
    const savedShippingInfo = localStorage.getItem('shipping_info');
    if (savedShippingInfo) {
      try {
        const parsedInfo = JSON.parse(savedShippingInfo);
        console.log('Fetched shipping_info from localStorage:', {
          isExpressDelivery: parsedInfo?.isExpressDelivery,
          shippingCharge: parsedInfo?.shippingCharge,
          expressShipping: parsedInfo?.expressShipping,
          defaultShipping: parsedInfo?.defaultShipping,
        });
        setShippingInfo(parsedInfo);
      } catch (error) {
        console.error('Error parsing shipping info:', error);
      }
    } else {
      console.log('No shipping_info found in localStorage; using default shipping values.');
    }
  }, []);

  // Calculate tax for all cart products - only exclusive tax
  useEffect(() => {
    if (!cartProducts || cartProducts.length === 0) {
      setCalculatedTax(0);
      return;
    }
    let totalTax = 0;
    for (const product of cartProducts) {
      const salePrice = Number(product.sale_price) || 0;
      const ratePct = Number(product.tax_rate || 0); // percentage like 5, 18, etc.
      const qty = Number(product.localQuantity) || 1;
      // Only add tax if it's not inclusive
      if (!product.is_tax_inclusive) {
        totalTax += salePrice * qty * (ratePct / 100);
      }
    }
    setCalculatedTax(totalTax);
  }, [cartProducts]);

  useEffect(() => {
    makeApiCall(
      async () => {
        const ecomService = new EcomService();
        const [countryList, stateList, cityList, customerAddresses, session] = await Promise.all([
          ecomService.get_country_list(),
          ecomService.get_state_list(),
          ecomService.get_city_list(),
          ecomService.get_customer_addresses(),
          ecomService.getCurrentSession(),
        ]);

        const sessionMetadata = (session?.user?.user_metadata || {}) as Record<string, any>;
        let loginPhone = normalizePhoneValue(
          String(session?.user?.phone || sessionMetadata.phone_number || '')
        );
        const loginEmail = (session?.user?.email || '').toLowerCase();

        try {
          const customerContact = await ecomService.get_customer_name_phone();
          if (customerContact?.phone) {
            loginPhone = normalizePhoneValue(String(customerContact.phone));
          }
        } catch {
          console.log('No customer phone found in customer_view yet.');
        }

        const loginContact = {
          email: loginEmail,
          phone: loginPhone,
        };

        setLoggedInContact(loginContact);
        setCountryList(countryList);
        setStateList(stateList);
        setCityList(cityList);
        setCustomerAddresses(customerAddresses);

        // Find default address or use the first one
        const defaultAddr =
          customerAddresses.find((addr: any) => addr.is_default === true) ||
          (customerAddresses.length > 0 ? customerAddresses[0] : null);

        if (defaultAddr) {
          setDefaultAddress(defaultAddr);
          setSelectedBillingAddress(defaultAddr.customer_addresses_id);
          setCustomBillingAddress(mapAddressWithContact(defaultAddr, loginContact));
          setCustomShippingAddress((prev) => mapAddressWithContact(prev, loginContact));

          // Update filtered states based on selected country
          if (defaultAddr.country) {
            const selectedCountryObj = countryList.find((country) =>
              country.name === defaultAddr.country
            );
            if (selectedCountryObj) {
              const countryStates = stateList.filter((state) => state.country_id === selectedCountryObj.id);
              setFilteredBillingStates(countryStates);

            }
          }
        } else {
          setCustomBillingAddress((prev) => mapAddressWithContact(prev, loginContact));
          setCustomShippingAddress((prev) => mapAddressWithContact(prev, loginContact));
        }
      },
      {
        afterSuccess: () => {
          // No-op
        },
      }
    );
  }, []);

  React.useEffect(() => {
    if (selectedBillingAddress && customerAddresses.length > 0) {
      const selectedAddress = customerAddresses.find(
        (addr) => addr.customer_addresses_id === selectedBillingAddress
      );
      if (selectedAddress) {
        setCustomBillingAddress(mapAddressWithContact(selectedAddress));

        // Update filtered states based on selected country
        if (selectedAddress.country) {
          const selectedCountryObj = countryList.find((country) =>
            country.name === selectedAddress.country
          );
          if (selectedCountryObj) {
            const countryStates = stateList.filter((state) => state.country_id === selectedCountryObj.id);
            setFilteredBillingStates(countryStates);
          }
        }
      }
    }
  }, [selectedBillingAddress, customerAddresses, countryList, stateList, loggedInContact]);

  React.useEffect(() => {
    if (selectedShippingAddress && customerAddresses.length > 0) {
      const selectedAddress = customerAddresses.find(
        (addr) => addr.customer_addresses_id === selectedShippingAddress
      );
      if (selectedAddress) {
        setCustomShippingAddress(mapAddressWithContact(selectedAddress));

        // Update filtered states based on selected country
        if (selectedAddress.country) {
          const selectedCountryObj = countryList.find((country) =>
            country.name === selectedAddress.country
          );
          if (selectedCountryObj) {
            const countryStates = stateList.filter((state) => state.country_id === selectedCountryObj.id);
            setFilteredShippingStates(countryStates);
          }
        }
      }
    }
  }, [selectedShippingAddress, customerAddresses, countryList, stateList, loggedInContact]);

  const handleBillingCountryChange = (countryName: string) => {
    const selectedCountry = countryList.find((country) => country.name === countryName);
    if (selectedCountry) {
      const countryStates = stateList.filter((state) => state.country_id === selectedCountry.id);
      setFilteredBillingStates(countryStates);

      setCustomBillingAddress((prev) => ({
        ...prev,
        country: countryName,
        state: '',
      }));
    }
  };

  const handleShippingCountryChange = (countryName: string) => {
    const selectedCountry = countryList.find((country) => country.name === countryName);
    if (selectedCountry) {
      const countryStates = stateList.filter((state) => state.country_id === selectedCountry.id);
      setFilteredShippingStates(countryStates);

      setCustomShippingAddress((prev) => ({
        ...prev,
        country: countryName,
        state: '',
      }));
    }
  };

  // Billing input handlers with validation
  const handleBillingInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      // Only allow numbers and optional leading plus
      const filtered = normalizePhoneValue(value);
      setCustomBillingAddress((prev) => ({
        ...prev,
        phone: filtered,
      }));
      if (!filtered) {
        setPhoneError(null);
      } else if (!phoneRegex.test(filtered)) {
        setPhoneError('Phone number can only contain numbers and an optional leading +');
      } else {
        setPhoneError(null);
      }
    } else if (field === 'zipcode') {
      // Only allow numbers
      let filtered = value.replace(/[^0-9]/g, '');
      setCustomBillingAddress((prev) => ({
        ...prev,
        zipcode: filtered,
      }));
      if (!filtered) {
        setZipError(null);
      } else if (!/^[0-9]+$/.test(filtered)) {
        setZipError('Zip code must contain only numbers');
      } else {
        setZipError(null);
      }
    } else if (field === 'email') {
      // Lowercase and validate
      const emailVal = value.toLowerCase();
      setCustomBillingAddress((prev) => ({
        ...prev,
        email: emailVal,
      }));
      if (!emailVal) {
        setEmailError(null);
      } else if (!emailRegex.test(emailVal)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError(null);
      }
    } else {
      setCustomBillingAddress((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Shipping input handlers with validation
  const handleShippingInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      const filtered = normalizePhoneValue(value);
      setCustomShippingAddress((prev) => ({
        ...prev,
        phone: filtered,
      }));
      if (!filtered) {
        setPhoneError(null);
      } else if (!phoneRegex.test(filtered)) {
        setPhoneError('Phone number can only contain numbers and an optional leading +');
      } else {
        setPhoneError(null);
      }
    } else if (field === 'zipcode') {
      let filtered = value.replace(/[^0-9]/g, '');
      setCustomShippingAddress((prev) => ({
        ...prev,
        zipcode: filtered,
      }));
      if (!filtered) {
        setZipError(null);
      } else if (!/^[0-9]+$/.test(filtered)) {
        setZipError('Zip code must contain only numbers');
      } else {
        setZipError(null);
      }
    } else if (field === 'email') {
      const emailVal = value.toLowerCase();
      setCustomShippingAddress((prev) => ({
        ...prev,
        email: emailVal,
      }));
      if (!emailVal) {
        setEmailError(null);
      } else if (!emailRegex.test(emailVal)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError(null);
      }
    } else {
      setCustomShippingAddress((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const getBillingInfo = () => normalizeAddressPayload(customBillingAddress);

  const getShippingInfo = () => normalizeAddressPayload(customShippingAddress);

  const handleProceedToPay = async () => {
    // Validate billing address
    const billing_info = getBillingInfo();
    const billingMissing = getMissingFields(billing_info);
    setBillingErrors(billingMissing);

    let shipping_info = null;
    let shippingMissing: string[] = [];
    if (shipToDifferentAddress) {
      shipping_info = getShippingInfo();
      shippingMissing = getMissingFields(shipping_info);
      setShippingErrors(shippingMissing);
    } else {
      setShippingErrors([]);
    }

    // If any required fields are missing, do not proceed
    if (billingMissing.length > 0 || (shipToDifferentAddress && shippingMissing.length > 0)) {
      setIsLoading(false);
      return;
    }

    // Check for errors in phone, zip, email
    if (phoneError || zipError || emailError) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Calculate total amount in paise (PhonePe requires amount in paise)
      // Use the same total shown in the UI: Sub-total (sale price x qty) + Tax (exclusive only) + Shipping
      const subTotal = cartProducts.reduce(
        (acc: number, product: any) => acc + Number(product.sale_price) * Number(product.localQuantity || 1),
        0
      );
      const shipping = Number(shippingInfo?.shippingCharge || 0);
      const grandTotal = Number(subTotal) + Number(calculatedTax) + shipping;
      const totalAmountInPaise = Math.round(grandTotal * 100);

      // Call PhonePe API to create payment order
      const response = await fetch('/api/phonepe/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmountInPaise,
          // Do not provide orderId now; we'll create order after payment verification
          customerInfo: {
            name: `${billing_info.first_name} ${billing_info.last_name}`.trim(),
            email: billing_info.email,
            phone: billing_info.phone,
          },
        }),
      });

      const result = await response.json();
      console.log('create-order result:', result);

      if (result.success && result.redirectUrl) {
        // Persist pending order payload tied to merchantOrderId for use in callback
        try {
          const pendingPayload = {
            cartProducts,
            billing_info,
            shipping_info,
            order_notes: orderNotes,
            tax_amount: calculatedTax,
            shipping_charge: shippingInfo.shippingCharge,
            shipping_method: shippingInfo.isExpressDelivery ? 'default_express_shipping_charge' : 'default_shipping_charge',
            payment_details: {
              payment_provider: 'phone_pe',
              payment_details: {
                request: {
                  amount: totalAmountInPaise,
                  customerInfo: {
                    name: `${billing_info.first_name} ${billing_info.last_name}`.trim(),
                    email: billing_info.email,
                    phone: billing_info.phone,
                  },
                  merchantOrderId: result?.merchantOrderId,
                },
                response: result?.gatewayResponse || null,
              }
            }
          };
          if (typeof window !== 'undefined' && result.merchantOrderId) {
            localStorage.setItem(
              `pendingOrder:${result.merchantOrderId}`,
              JSON.stringify(pendingPayload)
            );
          }
        } catch (e) {
          console.error('Failed to persist pending order payload', e);
        }

        // Redirect to PhonePe payment page
        window.location.href = result.redirectUrl;
      } else {
        throw new Error(result.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error creating order or payment:', error);
      toastWithTimeout(ToastVariant.Destructive, 'Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  // Helper to show error message for a field
  const showError = (field: string, errors: string[]) =>
    errors.includes(field) ? (
      <span className="text-xs text-red-500 block mt-1">This field is required</span>
    ) : null;

  return (
    <div className="container mx-auto px-4 py-8" style={{
      fontWeight: "400",
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Billing Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Billing Information */}
          <div>
            <h2 className="text-xl font-medium mb-6">Billing Information</h2>

            {/* Saved Addresses Dropdown for Billing */}
            <div className="mb-6">
              <Label htmlFor="billingAddresses">Saved Addresses</Label>
              <Select
                value={selectedBillingAddress}
                onValueChange={(value) => {
                  setSelectedBillingAddress(value);
                }}
              >
                <SelectTrigger className="mt-2 rounded-none text-gray-500">
                  <SelectValue placeholder="Select a saved address" />
                </SelectTrigger>
                <SelectContent>
                  {customerAddresses &&
                    customerAddresses.map((address) => (
                      <SelectItem key={address.customer_addresses_id} value={address.customer_addresses_id}>
                        {address.city || ''}
                        {address.city && address.address ? ' - ' : ''}
                        {address.address || ''}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="mt-2">
                <Button
                  variant="outline"
                  className="rounded-none bg-orange-500 text-white"
                  onClick={() => router.push('/profile/add-address?from=payment')}
                >
                  Add New Address
                </Button>
              </div>
            </div>

            {/* User Name */}
            <div className="mb-4">
              <Label htmlFor="firstName">User name</Label>
              <div className="grid grid-cols-1 gap-4 mt-2 ">
                <div>
                  <Input
                    id="firstName"
                    placeholder="Name"
                    className="rounded-none"
                    value={customBillingAddress.first_name}
                    onChange={(e) =>
                      handleBillingInputChange('first_name', e.target.value)
                    }
                  />
                  {showError('first_name', billingErrors)}
                </div>
                {/* <div>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    className="rounded-none"
                    value={customBillingAddress.last_name}
                    onChange={(e) =>
                      handleBillingInputChange('last_name', e.target.value)
                    }
                  />
                  {showError('last_name', billingErrors)}
                </div> */}
              </div>
            </div>

            {/* Company Name */}
            <div className="mb-4">
              <Label htmlFor="companyName">
                Company Name <span className="text-gray-400 text-sm">(Optional)</span>
              </Label>
              <Input
                id="companyName"
                className="mt-2 rounded-none"
                value={customBillingAddress.company_name}
                onChange={(e) =>
                  handleBillingInputChange('company_name', e.target.value)
                }
              />
            </div>

            {/* Address */}
            <div className="mb-4">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                className="mt-2 rounded-none"
                value={customBillingAddress.address}
                onChange={(e) =>
                  handleBillingInputChange('address', e.target.value)
                }
              />
              {showError('address', billingErrors)}
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={customBillingAddress.country.charAt(0).toUpperCase() + customBillingAddress.country.slice(1)}
                  onValueChange={(value) => handleBillingCountryChange(value)}
                >
                  <SelectTrigger className="mt-2 rounded-none text-gray-500">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryList.map((country) => (
                      <SelectItem key={country.country_id} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showError('country', billingErrors)}
              </div>

              <div>
                <Label htmlFor="region">Region/State</Label>
                <Select
                  value={customBillingAddress.state.charAt(0).toUpperCase() + customBillingAddress.state.slice(1)}
                  onValueChange={(value) =>
                    handleBillingInputChange('state', value)
                  }
                  disabled={!customBillingAddress.country || filteredBillingStates.length === 0}
                >
                  <SelectTrigger className="mt-2 rounded-none text-gray-500">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBillingStates.map((state) => (
                      <SelectItem key={state.state_id} value={state.name}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showError('state', billingErrors)}
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  value={customBillingAddress.city}
                  className="mt-2 rounded-none"
                  onChange={(e) =>
                    handleBillingInputChange('city', e.target.value)
                  }
                />
                {showError('city', billingErrors)}
              </div>

              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  className="mt-2 rounded-none"
                  value={customBillingAddress.zipcode}
                  onChange={(e) =>
                    handleBillingInputChange('zipcode', e.target.value)
                  }
                />
                {zipError && (
                  <span className="text-xs text-red-500 block mt-1">{zipError}</span>
                )}
                {showError('zipcode', billingErrors)}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-2 rounded-none"
                  value={customBillingAddress.email}
                  onChange={(e) =>
                    handleBillingInputChange('email', e.target.value)
                  }
                />
                {emailError && (
                  <span className="text-xs text-red-500 block mt-1">{emailError}</span>
                )}
                {showError('email', billingErrors)}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="mt-2 rounded-none"
                  value={customBillingAddress.phone}
                  onChange={(e) =>
                    handleBillingInputChange('phone', e.target.value)
                  }
                />
                {phoneError && (
                  <span className="text-xs text-red-500 block mt-1">{phoneError}</span>
                )}
                {showError('phone', billingErrors)}
              </div>
            </div>

            {/* Shipping Address Checkbox */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="differentAddress"
                checked={shipToDifferentAddress}
                onCheckedChange={(checked) => setShipToDifferentAddress(checked === true)}
              />
              <Label htmlFor="differentAddress" className="text-sm font-normal">
                Ship to different address
              </Label>
            </div>
          </div>

          {/* Shipping Address (only shown when checkbox is checked) */}
          {shipToDifferentAddress && (
            <div>
              <h2 className="text-xl font-medium mb-6">Shipping Information</h2>

              {/* Saved Addresses Dropdown */}
              <div className="mb-6">
                <Label htmlFor="savedAddresses">Saved Addresses</Label>
                <Select
                  value={selectedShippingAddress}
                  onValueChange={(value) => {
                    setSelectedShippingAddress(value);
                  }}
                >
                  <SelectTrigger className="mt-2 rounded-none text-gray-500">
                    <SelectValue placeholder="Select a saved address" />
                  </SelectTrigger>

                  <SelectContent>
                    {customerAddresses &&
                      customerAddresses.map((address) => (
                        <SelectItem key={address.customer_addresses_id} value={address.customer_addresses_id}>
                          {address.city || ''}
                          {address.city && address.address ? ' - ' : ''}
                          {address.address || ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    className="rounded-none bg-orange-500 text-white"
                    onClick={() => router.push('/profile/add-address?from=payment')}
                  >
                    Add New Address
                  </Button>
                </div>
              </div>

              {/* User Name */}
              <div className="mb-4">
                <Label htmlFor="shippingFirstName">User name</Label>
                <div className="grid grid-cols-1 gap-4 mt-2 ">
                  <div>
                    <Input
                      id="shippingFirstName"
                      placeholder="Name"
                      className="rounded-none"
                      value={customShippingAddress.first_name}
                      onChange={(e) =>
                        handleShippingInputChange('first_name', e.target.value)
                      }
                    />
                    {showError('first_name', shippingErrors)}
                  </div>
                  {/* <div>
                    <Input
                      id="shippingLastName"
                      placeholder="Last name"
                      className="rounded-none"
                      value={customShippingAddress.last_name}
                      onChange={(e) =>
                        handleShippingInputChange('last_name', e.target.value)
                      }
                    />
                    {showError('last_name', shippingErrors)}
                  </div> */}
                </div>
              </div>

              {/* Company Name */}
              <div className="mb-4">
                <Label htmlFor="shippingCompanyName">
                  Company Name <span className="text-gray-400 text-sm">(Optional)</span>
                </Label>
                <Input
                  id="shippingCompanyName"
                  className="mt-2 rounded-none"
                  value={customShippingAddress.company_name}
                  onChange={(e) =>
                    handleShippingInputChange('company_name', e.target.value)
                  }
                />
              </div>

              {/* Address */}
              <div className="mb-4">
                <Label htmlFor="shippingAddress">Address</Label>
                <Input
                  id="shippingAddress"
                  className="mt-2 rounded-none"
                  value={customShippingAddress.address}
                  onChange={(e) =>
                    handleShippingInputChange('address', e.target.value)
                  }
                />
                {showError('address', shippingErrors)}
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="shippingCountry">Country</Label>
                  <Select
                    value={customShippingAddress.country.charAt(0).toUpperCase() + customShippingAddress.country.slice(1)}
                    onValueChange={(value) => handleShippingCountryChange(value)}
                  >
                    <SelectTrigger className="mt-2 rounded-none text-gray-500">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryList.map((country) => (
                        <SelectItem key={country.country_id} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showError('country', shippingErrors)}
                </div>

                <div>
                  <Label htmlFor="shippingRegion">Region/State</Label>
                  <Select
                    value={customShippingAddress.state.charAt(0).toUpperCase() + customShippingAddress.state.slice(1)}
                    onValueChange={(value) =>
                      handleShippingInputChange('state', value)
                    }
                    disabled={!customShippingAddress.country || filteredShippingStates.length === 0}
                  >
                    <SelectTrigger className="mt-2 rounded-none text-gray-500">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredShippingStates.map((state) => (
                        <SelectItem key={state.state_id} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showError('state', shippingErrors)}
                </div>

                <div>
                  <Label htmlFor="shippingCity">City</Label>
                  <Input
                    value={customShippingAddress.city}
                    className="mt-2 rounded-none"
                    onChange={(e) =>
                      handleShippingInputChange('city', e.target.value)
                    }
                  />
                  {showError('city', shippingErrors)}
                </div>

                <div>
                  <Label htmlFor="shippingZipCode">Zip Code</Label>
                  <Input
                    id="shippingZipCode"
                    className="mt-2 rounded-none"
                    value={customShippingAddress.zipcode}
                    onChange={(e) =>
                      handleShippingInputChange('zipcode', e.target.value)
                    }
                  />
                  {zipError && (
                    <span className="text-xs text-red-500 block mt-1">{zipError}</span>
                  )}
                  {showError('zipcode', shippingErrors)}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="shippingEmail">Email</Label>
                  <Input
                    id="shippingEmail"
                    type="email"
                    className="mt-2 rounded-none"
                    value={customShippingAddress.email}
                    onChange={(e) =>
                      handleShippingInputChange('email', e.target.value)
                    }
                  />
                  {emailError && (
                    <span className="text-xs text-red-500 block mt-1">{emailError}</span>
                  )}
                  {showError('email', shippingErrors)}
                </div>

                <div>
                  <Label htmlFor="shippingPhone">Phone Number</Label>
                  <Input
                    id="shippingPhone"
                    type="tel"
                    className="mt-2 rounded-none"
                    value={customShippingAddress.phone}
                    onChange={(e) =>
                      handleShippingInputChange('phone', e.target.value)
                    }
                  />
                  {phoneError && (
                    <span className="text-xs text-red-500 block mt-1">{phoneError}</span>
                  )}
                  {showError('phone', shippingErrors)}
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div>
            <h2 className="text-xl font-medium mb-6">Additional Information</h2>

            <div>
              <Label htmlFor="orderNotes">
                Order Notes <span className="text-gray-400 text-sm">(Optional)</span>
              </Label>
              <Textarea
                id="orderNotes"
                placeholder="Notes about your order, e.g. special notes for delivery"
                className="mt-2 h-32 rounded-none"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-none p-6 mt-5">
            <h2 className="text-xl font-medium mb-6">Card Total</h2>
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartProducts &&
                cartProducts.map((product: any, index: number) => (
                  <div className="flex items-center" key={index}>
                    <div className="w-12 h-12 bg-gray-100 rounded-none overflow-hidden relative mr-3">
                      {product.images && Array.isArray(product.images) ? (
                        <Image
                          src={(() => {
                            if (product.images && Array.isArray(product.images)) {
                              // Find thumbnail image
                              const thumbnail = product.images.find((img: any) => img.is_thumbnail === true);
                              // Return thumbnail if found, otherwise first image, or fallback
                              return thumbnail
                                ? thumbnail.url
                                : product.images.length > 0
                                  ? product.images[0].url
                                  : product.url || '/placeholder.svg?height=48&width=48';
                            }
                            return product.url || '/placeholder.svg?height=48&width=48';
                          })()}
                          alt={product.name || 'Product'}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <Image
                          src="/productpage/noimage.svg"
                          alt={product.name || 'Product'}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{product.name || 'Product'}</p>
                      <p className="text-xs text-gray-500">
                        {product.localQuantity} x {currencySymbol}{product.sale_price || 0}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Sub-total</span>
                <span className="font-medium">
                  {currencySymbol}
                  {cartProducts.reduce(
                    (acc: any, product: any) => acc + Number(product.sale_price * product.localQuantity),
                    0
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">{shippingInfo.isExpressDelivery ? 'Express Delivery' : 'Shipping'}</span>
                <span className={shippingInfo.shippingCharge === 0 ? "text-green-600" : ""}>
                  {shippingInfo.shippingCharge === 0 ? 'Free' : `${currencySymbol}${shippingInfo.shippingCharge}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Discount</span>
                <span className="font-medium">{currencySymbol}{cartProducts.reduce((acc: any, product: any) => acc + Number((product.retail_price - product.sale_price) * (product.localQuantity || 1)), 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Tax</span>
                <span className="font-medium">{currencySymbol}{calculatedTax.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between mb-6">
                <span className="font-medium">Total</span>
                <span className="font-bold">
                  {currencySymbol}
                  {(
                    cartProducts.reduce(
                      (acc: any, product: any) => acc + Number(product.sale_price * product.localQuantity),
                      0
                    ) 
                    + Number(calculatedTax) 
                    + Number(shippingInfo.shippingCharge || 0)
                  ).toFixed(2)} {currencyCode}
                </span>
              </div>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-none lg:text-wrap"
                onClick={async () => {
                  await new EcomService().check_customer_exists();
                  handleProceedToPay();
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    PROCEED TO PAY <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Terms and Conditions Section */}
              <div className="space-y-3 mt-4">
                <div className="text-xs text-gray-600 leading-relaxed">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/shipping-policy"
                    className="text-orange-500 hover:underline focus:outline-none  focus:ring-offset-1 rounded"
                  >
                    Shipping & Payment Policy |
                  </Link>
                  {" "}
                  <Link
                    href="/return-policy"
                    className="text-orange-500 hover:underline focus:outline-none focus:ring-offset-1 rounded"
                  >
                    Return Policy |
                  </Link>
                  {" "}and{" "}
                  <Link
                    href="/refund-policy"
                    className="text-orange-500 hover:underline focus:outline-none focus:ring-offset-1 rounded"
                  >
                    Refund Policy
                  </Link>
                </div>
              </div>
              {/* Error Messages */}
              {(billingErrors.length > 0 || shippingErrors.length > 0 || phoneError || zipError || emailError) && (
                <div className="mt-4 text-red-600 text-sm">
                  Please fill all required address fields and correct any errors before proceeding.
                </div>
              )}
            </div>
          </div>

          {/* Policy modal removed; using routes instead */}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
