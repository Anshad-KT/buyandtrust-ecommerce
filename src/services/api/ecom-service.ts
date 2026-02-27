import { Supabase } from "./utils";
import "../interceptor";
import { useLogin } from "@/app/LoginContext";

export class EcomService extends Supabase {

    //DEVELOPMENT
    // private business_id: string = "e5643a41-cc69-4d1e-9ddd-72da801a94b7";

    //PRODUCTION Buy and Trust
    private business_id: string = "e6d8d773-6f3f-4383-9439-26169e4624ee";


    private cartStorage: string = "cart_data";
    private customizedCartStorage: string = "customized_cart_data";
    private customizedCartProductsStorage: string = "customized_cart_products_data";
    private ordersStorage: string = "orders_data";
    private localUserIdKey: string = "local_user_id";
    private productsStorage: string = "products_data";
    private cartProductsStorage: string = "cart_products_data";


    
    constructor() {
        super();
        // Initialize localStorage if needed
        if (!localStorage.getItem(this.cartStorage)) {
            localStorage.setItem(this.cartStorage, JSON.stringify([]));
            console.log('Initialized empty cart_data in localStorage');
        }
        if (!localStorage.getItem(this.customizedCartStorage)) {
            localStorage.setItem(this.customizedCartStorage, JSON.stringify([]));
            console.log('Initialized empty customized_cart_data in localStorage');
        }
        if (!localStorage.getItem(this.customizedCartProductsStorage)) {
            localStorage.setItem(this.customizedCartProductsStorage, JSON.stringify([]));
            console.log('Initialized empty customized_cart_products_data in localStorage');
        }
        if (!localStorage.getItem(this.ordersStorage)) {
            localStorage.setItem(this.ordersStorage, JSON.stringify([]));
            console.log('Initialized empty orders_data in localStorage');
        }
        if (!localStorage.getItem(this.productsStorage)) {
            localStorage.setItem(this.productsStorage, JSON.stringify([]));
            console.log('Initialized empty products_data in localStorage');
        }
        if (!localStorage.getItem(this.cartProductsStorage)) {
            localStorage.setItem(this.cartProductsStorage, JSON.stringify([]));
            console.log('Initialized empty cart_products_data in localStorage');
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    async getUserDetails() {
        console.log("getUserId");
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session?.user?.id) {
            return session.user.email;
        }
        throw new Error("User must be logged in");
    }

    // Public method to get current session
    async getCurrentSession() {
        const { data: { session } } = await this.supabase.auth.getSession();
        return session;
    }


    // Get the user id from session if logged in, else generate/return guest ID
    async getUserId(): Promise<string> {
        console.log("getUserId");
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session?.user?.id) {
            // User is logged in, return their actual UUID
            return session.user.id;
        }
        // User is not logged in, generate or retrieve guest ID
        return this.getOrCreateGuestId();
    }

    // Generate or retrieve a guest user ID from localStorage
    private getOrCreateGuestId(): string {
        const guestIdKey = 'guest_user_id';
        let guestId = localStorage.getItem(guestIdKey);
        
        if (!guestId) {
            // Generate a new guest ID with a prefix to distinguish from real user IDs
            guestId = `guest_${this.generateId()}_${Date.now()}`;
            localStorage.setItem(guestIdKey, guestId);
            console.log('Generated new guest ID:', guestId);
        }
        
        return guestId;
    }

    // Merge guest cart with user cart on login
    async mergeGuestCartOnLogin(userUuid: string): Promise<void> {
        const guestIdKey = 'guest_user_id';
        const guestId = localStorage.getItem(guestIdKey);
        
        if (!guestId || guestId === userUuid) {
            return; // No guest cart to merge
        }

        console.log('Merging guest cart to user cart');
        
        // Get guest cart products
        const cartProductsData = JSON.parse(localStorage.getItem(this.cartProductsStorage) || '[]');
        const guestProducts = cartProductsData.filter((p: any) => p.user_id === guestId);
        
        if (guestProducts.length === 0) {
            // No guest products to merge
            localStorage.removeItem(guestIdKey);
            return;
        }

        // Merge guest products into user's cart
        const updatedCartProducts = cartProductsData.map((product: any) => {
            if (product.user_id === guestId) {
                return { ...product, user_id: userUuid };
            }
            return product;
        });

        // Check for duplicate items and merge quantities
        const mergedProducts: any[] = [];
        const productMap = new Map();

        updatedCartProducts.forEach((product: any) => {
            if (product.user_id === userUuid) {
                const key = `${product.item_id}`;
                if (productMap.has(key)) {
                    // Merge quantities for duplicate items
                    const existing = productMap.get(key);
                    existing.quantity += product.quantity;
                    existing.localQuantity = (existing.localQuantity || 0) + (product.localQuantity || product.quantity);
                } else {
                    productMap.set(key, product);
                }
            } else {
                mergedProducts.push(product);
            }
        });

        // Add merged user products
        productMap.forEach(product => mergedProducts.push(product));

        localStorage.setItem(this.cartProductsStorage, JSON.stringify(mergedProducts));

        // Update cart data
        const cartData = JSON.parse(localStorage.getItem(this.cartStorage) || '[]');
        const updatedCartData = cartData.filter((cart: any) => cart.user_id !== guestId);
        
        // Ensure user cart exists
        if (!updatedCartData.find((cart: any) => cart.user_id === userUuid)) {
            updatedCartData.push({
                user_id: userUuid,
                created_at: new Date().toISOString()
            });
        }
        
        localStorage.setItem(this.cartStorage, JSON.stringify(updatedCartData));
        
        // Remove guest ID
        localStorage.removeItem(guestIdKey);
        
        console.log('Guest cart merged successfully');
    }


    async update_profile_name(name: string) {
        console.log("update_profile_name");
        // No need to get userId, Supabase infers from session
        const { data, error } = await this.supabase.auth.updateUser({
            data: { name }
        });
        if (error) {
            console.error("Error updating profile name:", error);
            throw new Error(error.message || "An error occurred while updating the profile name.");
        }
        return data;
    }
    
    async settle_sale_payment(params: { sale_id: string; amount: number; payment_mode: string; payment_date?: string; }) {
        console.log('settle_sale_payment (client) start', params);
        const { data, error } = await this.supabase.rpc('settle_sale_payment', {
            p_sale_id: params.sale_id,
            p_amount: params.amount,
            p_payment_mode: params.payment_mode,
            p_payment_date: params.payment_date ?? new Date().toISOString().slice(0, 10),
        });
        if (error) {
            console.error('settle_sale_payment RPC error', error);
            throw new Error(error.message || 'An error occurred while settling the sale payment.');
        }
        return data as string; // payment_id
    }

    async get_lost_sale_by_user(userId: string) {
        const { data, error } = await this.supabase
            .from('lost_sale')
            .select('id, user_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching lost_sale row:', error);
            throw new Error(error.message || 'An error occurred while checking lost sale data.');
        }

        return data;
    }

    async save_lost_sale_if_missing(userId: string, orderJson: any) {
        const existingRow = await this.get_lost_sale_by_user(userId);
        if (existingRow?.id) {
            return existingRow;
        }

        const { data, error } = await this.supabase
            .from('lost_sale')
            .insert({
                user_id: userId,
                order_json: orderJson
            })
            .select('id, user_id')
            .single();

        if (error) {
            // Handle race condition when multiple attempts insert for same user.
            if (error.code === '23505') {
                return await this.get_lost_sale_by_user(userId);
            }

            console.error('Error inserting lost_sale row:', error);
            throw new Error(error.message || 'An error occurred while saving lost sale data.');
        }

        return data;
    }

    async get_customer_name_phone() {
        const userId = await this.getUserId();
        const { data, error } = await this.supabase
            .from('customer_view')
            .select('name, phone')
            .eq('customer_id', userId)
            .maybeSingle();
        if (error) {
            console.error("Error getting customer name:", error);
            throw new Error(error.message || "An error occurred while getting the customer name.");
        }
        if (!data) {
            return { name: '', phone: '' };
        }
        console.log("customer name:", data);
        return data;
    }

    async check_customer_exists() {
        console.log("check_customer_exists");
        const userId = await this.getUserId();
        
        // Check if customer exists
        const { data: existingCustomer, error: checkError } = await this.supabase
            .from('customers')
            .select('*')
            .eq('customer_id', userId)
            .maybeSingle();

        if (checkError) {
            console.error("Error checking customer:", checkError);
            return null;
        }

        // If customer exists, return it
        if (existingCustomer) {
            console.log("Existing customer found:", existingCustomer);
            return existingCustomer;
        }

        // If customer doesn't exist, create new customer
        console.log("No customer found, creating new customer for user:", userId);
        const { data: { session } } = await this.supabase.auth.getSession();
        const metadata = (session?.user?.user_metadata || {}) as Record<string, any>;
        const fallbackName =
            metadata.user_name ||
            metadata.name ||
            (session?.user?.email ? session.user.email.split('@')[0] : '') ||
            "Customer";
        const fallbackImage = metadata.picture || metadata.avatar_url || null;

        const { data: createdCustomer, error: createError } = await this.supabase
            .from('customers')
            .upsert(
                {
                    customer_id: userId,
                    name: fallbackName,
                    image: fallbackImage,
                },
                { onConflict: 'customer_id' }
            )
            .select('*')
            .maybeSingle();

        if (createError) {
            console.error("Error creating customer:", createError);
            return null;
        }

        if (createdCustomer) {
            return createdCustomer;
        }

        const { data: reloadedCustomer, error: reloadError } = await this.supabase
            .from('customers')
            .select('*')
            .eq('customer_id', userId)
            .maybeSingle();

        if (reloadError) {
            console.error("Error reloading customer after create:", reloadError);
            return null;
        }

        return reloadedCustomer || null;
    }


    async get_tax_amount(cartProducts: any) {
        try {
            // Query the vw_simple_items view for the item with the given item_id and select the tax JSONB column
            const { data, error } = await this.supabase
                .from('vw_simple_items')
                .select('tax_rate')
                .eq('item_id', cartProducts.item_id)
                .single();

            if (error) {
                console.error("Error getting tax amount:", error);
                return 0;
            }

            // If tax is null or not an object, return 0
            if (!data || !data.tax_rate || typeof data.tax_rate !== 'object') {
                console.log("No tax info found for item_id:", cartProducts.item_id);
                return 0;
            }

            // Extract the rate from the tax JSONB object
            const taxRate = data.tax_rate;
            console.log("tax amount (rate):", taxRate);

            // Return the tax rate, or 0 if not present
            return typeof taxRate === 'number' ? taxRate : 0;
        } catch (error) {
            console.error("Error getting tax amount:", error);
            return 0;
        }
    }

    // Get business org_id
    async get_business_org_id() {
        const { data, error } = await this.supabase
            .from('businesses')
            .select('org_id')
            .eq('business_id', this.business_id)
            .single();
        
        if (error) {
            console.error('Error fetching business org_id:', error);
            throw error;
        }
        
        return data?.org_id || null;
    }

    private resolve_order_customer_name(cartData: any, metadata: Record<string, any>, email: string | null): string {
        const billing = cartData?.billing_info || {};
        const billingName = [billing.first_name, billing.last_name]
            .filter((part: string) => typeof part === 'string' && part.trim().length > 0)
            .join(' ')
            .trim();

        return (
            metadata?.user_name ||
            metadata?.name ||
            metadata?.full_name ||
            billingName ||
            (email ? email.split('@')[0] : '') ||
            'Customer'
        );
    }

    private async ensure_order_user_and_customer(authUser: any, cartData: any) {
        if (!authUser?.id) {
            console.warn("Skipping users/customers upsert before order: no authenticated user session found.");
            return;
        }

        const userId = authUser.id;
        const metadata = (authUser.user_metadata || {}) as Record<string, any>;
        const billing = cartData?.billing_info || {};

        const email = authUser.email || billing.email || null;
        const phone = authUser.phone || metadata.phone_number || billing.phone || null;
        const image = metadata.picture || metadata.avatar_url || null;
        const name = this.resolve_order_customer_name(cartData, metadata, email);

        const { data: existingUser, error: usersLookupError } = await this.supabase
            .from('users')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (usersLookupError) {
            console.error("Error checking users record before order:", usersLookupError);
            throw new Error(usersLookupError.message || "Unable to check users record before order creation.");
        }

        if (!existingUser) {
            const { error: usersInsertError } = await this.supabase
                .from('users')
                .insert({
                    user_id: userId,
                    name,
                    email,
                    phone,
                    image
                });

            if (usersInsertError && usersInsertError.code !== '23505') {
                console.error("Error inserting users record before order:", usersInsertError);
                throw new Error(usersInsertError.message || "Unable to prepare users record before order creation.");
            }
        }

        const { data: existingCustomer, error: customerLookupError } = await this.supabase
            .from('customers')
            .select('customer_id')
            .eq('customer_id', userId)
            .maybeSingle();

        if (customerLookupError) {
            console.error("Error checking customers record before order:", customerLookupError);
            throw new Error(customerLookupError.message || "Unable to check customers record before order creation.");
        }

        if (!existingCustomer) {
            const { error: customersInsertError } = await this.supabase
                .from('customers')
                .insert({
                    customer_id: userId,
                    name,
                    image
                });

            if (customersInsertError && customersInsertError.code !== '23505') {
                console.error("Error inserting customers record before order:", customersInsertError);
                throw new Error(customersInsertError.message || "Unable to prepare customers record before order creation.");
            }
        }
    }
    
    async create_order(cartData: any , setCartItemCount?: (count:number) => void) {
        console.log("create_order");
        const { data: { session } } = await this.supabase.auth.getSession();
        const authUser = session?.user || null;
        const userId = authUser?.id || this.getOrCreateGuestId();
        console.log("userId", userId);

        console.log("cartData", cartData);

        if (!cartData || !Array.isArray(cartData.cartProducts) || cartData.cartProducts.length === 0) {
            throw new Error("No cart products found in cartData.");
        }

        // Fetch org_id from businesses table
        const org_id = await this.get_business_org_id();
        console.log("org_id from businesses table:", org_id);

        // Build sale_items array for the RPC from cartData.cartProducts
        const sale_items = cartData.cartProducts.map((product: any) => ({
            item_id: product.item_id,
            quantity: product.localQuantity ?? product.quantity ?? 1,
            unit_price: product.sale_price ?? product.unit_price ?? 0,
            subservices: product.subservices || null
        }));
        console.log("carts data payment:" , cartData)

        // Calculate total_amount
        const total_amount = sale_items.reduce(
            (acc: number, item: any) => acc + (item.unit_price * item.quantity), 0
        );

        // Compose the sale JSON for the RPC
        const p_sale_json: any = {
            business_id: this.business_id,
            customer_id: userId,
            sale_items: sale_items,
            sale_date: new Date().toISOString(),
            notes: cartData.order_notes || cartData.notes || null,
            platform: 'E-commerce',
            // discount_amount: cartData.discount_amount || 0,
            shipping: cartData.shipping_charge || 0,
            shipping_method: cartData.shipping_method || '', // 'default' or 'express'
            // paid_amount: total_amount,
            // payment_details: cartData.payment_details || null,
            order_mode: true,
            employee_id: cartData.employee_id || userId,
            attachment: cartData.attachment_url || null,
            metadata: cartData.payment_details || null,
            total_amount: total_amount,
            // Handle billing_info and shipping_info if present
            billing_address: cartData.billing_info|| null,
            shipping_address: cartData.shipping_info || cartData.billing_info || null,
            tax_amount: cartData.tax_amount || 0,
            org_id: org_id

        };

        console.log("p_sale_json", p_sale_json);

        await this.ensure_order_user_and_customer(authUser, cartData);

        // Keep a copy of the sale payload before creating the sale
        const { error: sampleDummyError } = await this.supabase
            .from('sample_dummy')
            .insert({
                user_id: userId,
                sales_json: p_sale_json
            });

        if (sampleDummyError) {
            console.error("Error inserting into sample_dummy:", sampleDummyError);
            throw new Error(sampleDummyError.message || "An error occurred while storing the sale payload.");
        }

        // Call the Postgres RPC function
        // const { data, error } = await this.supabase.rpc('create_sale', { p_sale_json });
        const { data, error } = await this.supabase.rpc('create_sale_test', { p_sale_json });
        if (error) {
            console.error("Error creating sale:", error);
            throw new Error(error.message || "An error occurred while creating the sale.");
        }


        // Clear the cart after successful order creation
        localStorage.setItem(this.cartStorage, JSON.stringify([]));
        localStorage.setItem(this.cartProductsStorage, JSON.stringify([]));

        // Update cart count if callback provided
        if (setCartItemCount) {
            setCartItemCount(0);
        }

        // Dispatch custom event to notify all components about cart update
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        }

        return data;
    }
    // --- CART METHODS ---

    // Check if a cart exists for the logged-in user (by user_id)
    async check_cart_exists() {
        console.log("check_cart_exists");
        const userId = await this.getUserId();
        const cartData = JSON.parse(localStorage.getItem(this.cartStorage) || '[]');
        const userCart = cartData.find((cart: any) => cart.user_id === userId);
        console.log("userCart", userCart);
        return userCart ? [userCart] : [];
    }

    // Add a new cart for the user (by user_id)
    async add_to_cart() {
        console.log("add_to_cart");
        const userId = await this.getUserId();
        const cartData = JSON.parse(localStorage.getItem(this.cartStorage) || '[]');
        // Only one cart per user (user_id)
        let userCart = cartData.find((cart: any) => cart.user_id === userId);
        if (!userCart) {
            userCart = {
                user_id: userId,
                created_at: new Date().toISOString()
            };
            cartData.push(userCart);
            localStorage.setItem(this.cartStorage, JSON.stringify(cartData));
        }
        console.log("userCart", userCart);
        return userCart;
    }

    // --- CART METHODS (user_id only, no cart_id) ---

    async get_cart_products() {
        console.log("get_cart_products");
        const userId = await this.getUserId();
        // Find the cart for this user (by user_id)
        const cartData = JSON.parse(localStorage.getItem(this.cartStorage) || '[]');
        const userCart = cartData.find((cart: any) => cart.user_id === userId);
        if (!userCart) {
            return [];
        }
        // Only get products for this user (by user_id, not cart_id)
        const cartProductsData = JSON.parse(localStorage.getItem(this.cartProductsStorage) || '[]');
        const userCartProducts = cartProductsData.filter((product: any) => product.user_id === userId);
        console.log("userCartProducts", userCartProducts);
        // Enrich with product details from Supabase
        try {
            const { data: itemsData, error } = await this.supabase
                .from('vw_simple_items')
                .select('*')
                .eq('is_active', true)
                .eq('business_id', this.business_id);

            if (error) {
                return userCartProducts;
            }

            return userCartProducts.map((cartProduct: any) => {
                const itemDetails = itemsData.find((item: any) => item.item_id === cartProduct.item_id) || {};
                return {
                    ...cartProduct,
                    ...itemDetails
                };
            });
        } catch (error) {
            console.error("Error getting cart products:", error);
            return userCartProducts;
        }
    }

    async add_to_cart_products(product: any) {
        console.log("add_to_cart_products");
        const userId = await this.getUserId();

        // Ensure a cart exists for this user (by user_id)
        let cartData = JSON.parse(localStorage.getItem(this.cartStorage) || '[]');
        let userCart = cartData.find((cart: any) => cart.user_id === userId);
        if (!userCart) {
            userCart = {
                user_id: userId,
                created_at: new Date().toISOString()
            };
            cartData.push(userCart);
            localStorage.setItem(this.cartStorage, JSON.stringify(cartData));
        }

        // Only use user_id for cart products
        const cartProductsData = JSON.parse(localStorage.getItem(this.cartProductsStorage) || '[]');
        const existingProductIndex = cartProductsData.findIndex(
            (p: any) => p.user_id === userId && p.item_id === product.item_id
        );
        if (existingProductIndex !== -1) {
            // If product exists, increase quantity
            cartProductsData[existingProductIndex].quantity += product.quantity;
            cartProductsData[existingProductIndex].localQuantity = (cartProductsData[existingProductIndex].localQuantity || 0) + product.quantity;
            localStorage.setItem(this.cartProductsStorage, JSON.stringify(cartProductsData));
            console.log("cartProductsData", cartProductsData);
            return [cartProductsData[existingProductIndex]];
        } else {
            // If product doesn't exist, add new product
            const enhancedProduct = {
                ...product,
                user_id: userId,
                localQuantity: product.quantity
            };
            cartProductsData.push(enhancedProduct);
            localStorage.setItem(this.cartProductsStorage, JSON.stringify(cartProductsData));
            console.log("enhancedProduct", enhancedProduct);
            return [enhancedProduct];
        }
    }

    async update_cart_quantity(item_id: string, quantity: number) {
        console.log("update_cart_quantity");
        const userId = await this.getUserId();
        const cartProductsData = JSON.parse(localStorage.getItem(this.cartProductsStorage) || '[]');
        const updatedData = cartProductsData.map((product: any) => {
            if (product.user_id === userId && product.item_id === item_id) {
                return { ...product, localQuantity: quantity };
            }
            return product;
        });
        localStorage.setItem(this.cartProductsStorage, JSON.stringify(updatedData));
        console.log("updatedData", updatedData);
        return updatedData.filter((product: any) => product.user_id === userId && product.item_id === item_id);
    }

    async update_cart_notes(notes: string, quantity: number, cart_product_id: string, extra_printing: boolean) {
        console.log("update_cart_notes");
        const userId = await this.getUserId();
        const cartProductsData = JSON.parse(localStorage.getItem(this.cartProductsStorage) || '[]');
        const updatedData = cartProductsData.map((product: any) => {
            if (product.user_id === userId && product.id === cart_product_id) {
                return { ...product, notes, localQuantity:quantity, extra_printing };
            }
            return product;
        });
        localStorage.setItem(this.cartProductsStorage, JSON.stringify(updatedData));
        console.log("updatedData", updatedData);
        return updatedData.filter((product: any) => product.user_id === userId && product.id === cart_product_id);
    }


    async deleteCartProduct(item_id: string) {
        console.log("deleteCartProduct");
        const userId = await this.getUserId();
        const cartProductsData = JSON.parse(localStorage.getItem(this.cartProductsStorage) || '[]');
        const filteredData = cartProductsData.filter(
            (product: any) => !(product.user_id === userId && product.item_id === item_id)
        );
        localStorage.setItem(this.cartProductsStorage, JSON.stringify(filteredData));
        console.log("filteredData", filteredData);
        return filteredData;
    }

    async remove_cart() {
        console.log("remove_cart");
        const userId = await this.getUserId();
        // Remove cart entry
        const cartData = JSON.parse(localStorage.getItem(this.cartStorage) || '[]');
        const filteredCartData = cartData.filter((cart: any) => cart.user_id !== userId);
        localStorage.setItem(this.cartStorage, JSON.stringify(filteredCartData));
        // Remove all products for this user's cart
        const cartProductsData = JSON.parse(localStorage.getItem(this.cartProductsStorage) || '[]');
        const filteredProductsData = cartProductsData.filter((product: any) => product.user_id !== userId);
        localStorage.setItem(this.cartProductsStorage, JSON.stringify(filteredProductsData));
        console.log("filteredProductsData", filteredProductsData);
        return filteredCartData;
    }

    // --- CUSTOMER ADDRESS METHODS ---

    async add_customer_address(address: any) {
        console.log("add_customer_address", address);
        
        // First, ensure the customer exists in the customers table
        const customer = await this.check_customer_exists();
        
        if (!customer) {
          throw new Error("Could not create or find customer");
        }
        
        const userId = customer.customer_id;
        
        // Prepare the address object for insertion
        const newAddress = {
          customer_id: userId,
          first_name: address.first_name || "",
          last_name: address.last_name || "",
          company_name: address.company_name || "",
          address: address.address || "",
          country: address.country || "",
          state: address.state || "",
          city: address.city || "",
          zipcode: address.zipcode || "",
          email: address.email || "",
          phone: address.phone || "",
        };
        
        const { data, error } = await this.supabase
          .from('customer_addresses')
          .insert([newAddress])
          .select();
          
        if (error) {
          console.error("Error adding customer address:", error);
          throw new Error("An Error Occurred");
        }
        
        // Return the first item from the array (insert returns an array)
        const insertedAddress = data && data.length > 0 ? data[0] : null;
        
        if (!insertedAddress) {
          console.log("No address was inserted");
          throw new Error("Failed to add address");
        }
        
        console.log("address adding data", insertedAddress);
        return insertedAddress;
      }



    async get_customer_addresses() {
        console.log("get_customer_addresses");
        const userId = await this.getUserId();
    
        const { data, error } = await this.supabase
            .from('customer_addresses')
            .select('*')
            .eq('customer_id', userId)
            .order('created_at', { ascending: false });
    
        if (error) {
            console.error("Error fetching customer addresses:", error);
            throw new Error("An Error Occurred");
        }
    
        return data || [];
    }

    async update_default_address(address: any) {
        console.log("update_default_address");
        const userId = await this.getUserId();
        const { data, error } = await this.supabase
            .from('customer_addresses')
            .update(address)
            .eq('customer_id', userId)
            .eq('customer_addresses_id', address.customer_addresses_id)
            .select();

        if (error) {
            console.error("Error updating default address:", error);
            throw new Error("An Error Occurred");
        }
        
        // Return the first item from the array
        const updatedAddress = data && data.length > 0 ? data[0] : null;
        
        if (!updatedAddress) {
            console.error("No address was updated");
            throw new Error("Address not found or could not be updated");
        }

        return updatedAddress;
    }

    async update_customer_address(address: any) {
        console.log("update_customer_address");
        const userId = await this.getUserId();
        const { data, error } = await this.supabase
            .from('customer_addresses')
            .update(address)
            .eq('customer_id', userId)
            .eq('customer_addresses_id', address.customer_addresses_id)
            .select();

        if (error) {
            console.error("Error updating customer address:", error);
            throw new Error("An Error Occurred");
        }
        
        // Return the first item from the array
        const updatedAddress = data && data.length > 0 ? data[0] : null;
        
        if (!updatedAddress) {
            console.error("No address was updated");
            throw new Error("Address not found or could not be updated");
        }

        return updatedAddress;
    }
    


    // --- PRODUCT/ORDER METHODS (unchanged, but use userId for customer_id) ---

    async get_all_products() {
        const { data, error } = await this.supabase.from('vw_simple_items')
            .select('*')
            .eq('is_active', true)
            .eq('business_id', this.business_id);

        if (error) {
            throw new Error("An Error Occurred");
        }
        return data;
    }

    async get_products_by_category(categoryId: string) {
        const { data, error } = await this.supabase.from('vw_simple_items')
            .select('*')
            .eq('is_active', true)
            .eq('business_id', this.business_id)
            .eq('item_category_id', categoryId);

        if (error) {
            throw new Error("An Error Occurred");
        }
        return data;
    }

    
    async get_country_list() {
        const { data: country_data, error } = await this.supabase
            .from('countries')
            .select('*');
        if (error) throw new Error("An Error Occurred");
        return country_data;
    }


    async get_state_list() {
        interface State {
            id: string;
            name: string;
            country_id: string;
            // Add other state properties as needed
        }

        const pageSize = 1000; // Supabase default limit is 1000
        let page = 0;
        let hasMore = true;
        let allStates: State[] = [];
        
        try {
            while (hasMore) {
                const { data: state_data, error } = await this.supabase
                    .from('states')
                    .select('*')
                    .range(page * pageSize, (page + 1) * pageSize - 1);
                    
                if (error) throw new Error("An Error Occurred");
                
                if (state_data && state_data.length > 0) {
                    allStates = [...allStates, ...state_data];
                    page++;
                } else {
                    hasMore = false;
                }
            }
            
            console.log(`Fetched total ${allStates.length} states`);
            return allStates;
        } catch (error) {
            console.error("Error fetching states:", error);
            throw error;
        }
    }

    async get_city_list() {
        const { data: city_data, error } = await this.supabase
            .from('cities')
            .select('*');
        if (error) throw new Error("An Error Occurred");
        return city_data;
    }

    async get_all_categories() {
        const { data, error } = await this.supabase.from('item_categories')
            .select('item_category_id, name,image_url')
            .eq('business_id', this.business_id);
        if (error) throw new Error("An Error Occurred While Fetching Categories");
        return data || [];
    }

    async get_business_currency() {
        const { data, error } = await this.supabase
            .from('businesses')
            .select('currency')
            .eq('business_id', this.business_id)
            .single();
        if (error) throw new Error("An Error Occurred While Fetching Currency");
        return data?.currency || { symbol: '₹', code: 'INR' };
    }

    async get_business_shipping_charges() {
        const { data, error } = await this.supabase
            .from('businesses')
            .select('default_shipping_charge, default_express_shipping_charge')
            .eq('business_id', this.business_id)
            .single();
        if (error) throw new Error("An Error Occurred While Fetching Shipping Charges");
        return {
            defaultShipping: data?.default_shipping_charge || 0,
            expressShipping: data?.default_express_shipping_charge || 0
        };
    }

    async get_customer_orders_minimal() {
        try {
            const userId = await this.getUserId();
            const { data: orders, error } = await this.supabase
                .from('minimal_sale_view')
                .select('sale_id, sale_invoice, sale_date, status, total_amount')
                .eq('customer_id', userId)
                .eq('business_id', this.business_id)
                .eq('platform', 'E-commerce')
                .order('created_at', { ascending: false });
            if (error) throw error;
            // Normalize field names for frontend
            return (orders || []).map((order: any) => ({
                order_id: order.sale_invoice,
                sale_id: order.sale_id,
                order_date: order.sale_date,
                order_status: order.status,
                total_price: order.total_amount
            }));
        } catch (error) {
            return [];
        }
    }

    async get_order_details_by_id(saleId: string) {
        try {
            const { data, error } = await this.supabase
                .from('sale_view')
                .select('*')
                .eq('sale_id', saleId)
                .single(); // Only one order
            if (error) throw error;
            return data;
        } catch (error) {
            return null;
        }
    }

    async get_customer_orders() {
        try {
            const userId = await this.getUserId();
            console.log("userId", userId)
            const { data: orders, error } = await this.supabase
                .from('sale_view')
                .select('sale_id, sale_invoice, sale_date, status,customer,sale_items,subtotal,billing_address,shipping_address,notes')
                .eq('customer_id', userId)
                .eq('business_id', this.business_id)
                .eq('platform', 'E-commerce');
            console.log("orders", orders)
            if (!orders || orders.length === 0) {
                return [];
                
            }
            return orders.map((order: any) => ({
                customer_name: order?.customer?.name,
                customer_email: order?.customer?.email,
                customer_phone: order?.customer?.phone,
                customer_address: order?.customer?.address,
                item_id: order?.sale_items?.item_id,
                item_name: order?.sale_items?.item_name,
                item_price: order?.sale_items?.unit_price,
                item_quantity: order?.sale_items?.quantity,
                item_total_price: order?.sale_items?.total_price,
                sub_total: order?.subtotal,
                sale_id: order.sale_id,
                order_id: order.sale_invoice,
                order_date: order.sale_date,
                order_status: order?.status?.name,
                customer: order.customer,
                product_details: order.sale_items,
                total_price: order.sale_items?.reduce((total: number, item: any) =>
                    total + (parseFloat(item.price) * item.quantity), 0) || 0,
                billing_address: order.billing_address,
                shipping_address: order.shipping_address,
                notes: order.notes
            }));
        } catch (error: any) {
            return [];
        }
    }

    async logout() {
        await this.supabase.auth.signOut();
        return true;
    }

    // Storage methods
    async listProfileImages(userId: string) {
        const { data, error } = await this.supabase
            .storage
            .from('customer-assets')
            .list(`${userId}/profileimages`);
        
        if (error) throw error;
        return data;
    }

    async getProfileImageUrl(userId: string, fileName: string) {
        const { data } = await this.supabase
            .storage
            .from('customer-assets')
            .getPublicUrl(`${userId}/profileimages/${fileName}`);
        return data.publicUrl;
    }

    async uploadProfileImage(userId: string, fileName: string, file: File) {
        const { data, error } = await this.supabase
            .storage
            .from('customer-assets')
            .upload(`${userId}/profileimages/${fileName}`, file, {
                upsert: true
            });
        
        if (error) throw error;
        return data;
    }

    // Update the customer's profile image URL in the database
    async updateCustomerProfileImage(userId: string, imageUrl: string) {
        const { data, error } = await this.supabase
            .from('customers')
            .update({ image: imageUrl })
            .eq('customer_id', userId);
        
        if (error) {
            console.error('Error updating customer profile image:', error);
            throw error;
        }
        
        return data;
    }
}

