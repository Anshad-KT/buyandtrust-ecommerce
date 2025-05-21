import { Supabase } from "./utils";
import "../interceptor";

export class EcomService extends Supabase {
    // private business_id: string = "2b7e598a-ac54-40e3-a757-15d3960fcc2e";
    private business_id: string = "93a9ecbd-b09f-4adc-b51e-9892cfef5af6";
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


    // Get the user id from session if logged in, else throw error
    async getUserId(): Promise<string> {
        console.log("getUserId");
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session?.user?.id) {
            return session.user.id;
        }
        throw new Error("User must be logged in");
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


    async check_customer_exists() {
        console.log("check_customer_exists");
        const userId = await this.getUserId();
        
        // Check if customer exists
        const { data: existingCustomer, error: checkError } = await this.supabase
            .from('customers')
            .select('*')
            .eq('customer_id', userId)
            .single();
            
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
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
        const { data: newCustomer, error: createError } = await this.supabase
            .from('customers')
            .insert({
                customer_id: userId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (createError) {
            console.error("Error creating customer:", createError);
            return null;
        }

        console.log("New customer created:", newCustomer);
        return newCustomer;
    }

    async create_order(cartData: any) {
        console.log("create_order");
        const userId = await this.getUserId();
        console.log("userId", userId);

        console.log("cartData", cartData);

        if (!cartData || !Array.isArray(cartData.cartProducts) || cartData.cartProducts.length === 0) {
            throw new Error("No cart products found in cartData.");
        }

        // Build sale_items array for the RPC from cartData.cartProducts
        const sale_items = cartData.cartProducts.map((product: any) => ({
            item_id: product.item_id,
            quantity: product.localQuantity ?? product.quantity ?? 1,
            unit_price: product.sale_price ?? product.unit_price ?? 0,
            subservices: product.subservices || null
        }));

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
            discount_amount: cartData.discount_amount || 0,
            shipping: cartData.shipping_charge || 0,
            paid_amount: cartData.paid_amount || 0,
            payment_details: cartData.payment_details || null,
            order_mode: true,
            employee_id: cartData.employee_id || null,
            attachment: cartData.attachment_url || null,
            metadata: cartData.metadata || null,
            total_amount: total_amount,
            // Handle billing_info and shipping_info if present
            billing_address: cartData.billing_info|| null,
            shipping_address: cartData.shipping_info || cartData.shipping_info || null,
        };

        console.log("p_sale_json", p_sale_json);

        // Call the Postgres RPC function
        const { data, error } = await this.supabase.rpc('create_sale', { p_sale_json });
        if (error) {
            console.error("Error creating sale:", error);
            throw new Error(error.message || "An error occurred while creating the sale.");
        }

        // Optionally, clear the cart after successful order creation
        localStorage.setItem(this.cartStorage, JSON.stringify([]));
        localStorage.setItem(this.cartProductsStorage, JSON.stringify([]));
        
        return data;
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
                .from('items')
                .select('*, stock_quantity')
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
        } catch {
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

    async update_cart_size(sizes: any, cart_product_id: string, quantity: number) {
        console.log("update_cart_size");
        const userId = await this.getUserId();
        const cartProductsData = JSON.parse(localStorage.getItem(this.cartProductsStorage) || '[]');
        const updatedData = cartProductsData.map((product: any) => {
            if (product.user_id === userId && product.id === cart_product_id) {
                return { ...product, sizes, quantity };
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

    // --- CUSTOMIZED CART METHODS (unchanged) ---

    async add_product_to_customized_cart(product: any) {
        console.log("add_product_to_customized_cart");
        const userId = await this.getUserId();
        const productsData = JSON.parse(localStorage.getItem(this.customizedCartProductsStorage) || '[]');
        if (!product.id) {
            product.id = this.generateId();
        }
        product.customized_cart_id = userId;
        productsData.push(product);
        localStorage.setItem(this.customizedCartProductsStorage, JSON.stringify(productsData));
        console.log("product", product);
        return [product];
    }

    async get_customized_cart_products() {
        console.log("get_customized_cart_products");
        const userId = await this.getUserId();
        const productsData = JSON.parse(localStorage.getItem(this.customizedCartProductsStorage) || '[]');
        const filteredProducts = productsData.filter((product: any) => product.customized_cart_id === userId);
        console.log("filteredProducts", filteredProducts);
        return filteredProducts;
    }

    async update_customized_cart_products(id: string, updates: any) {
        console.log("update_customized_cart_products");
        const userId = await this.getUserId();
        const productsData = JSON.parse(localStorage.getItem(this.customizedCartProductsStorage) || '[]');
        const updatedData = productsData.map((product: any) => {
            if (product.customized_cart_id === userId && product.id === id) {
                return { ...product, ...updates };
            }
            return product;
        });
        localStorage.setItem(this.customizedCartProductsStorage, JSON.stringify(updatedData));
        console.log("updatedData", updatedData);
        return updatedData.filter((product: any) => product.customized_cart_id === userId && product.id === id);
    }

    async delete_customized_cart_products(id: string) {
        console.log("delete_customized_cart_products");
        const userId = await this.getUserId();
        const productsData = JSON.parse(localStorage.getItem(this.customizedCartProductsStorage) || '[]');
        const filteredData = productsData.filter((product: any) => !(product.customized_cart_id === userId && product.id === id));
        localStorage.setItem(this.customizedCartProductsStorage, JSON.stringify(filteredData));
        console.log("filteredData", filteredData);
        return filteredData;
    }

    async get_customized_cart() {
        console.log("get_customized_cart");
        const userId = await this.getUserId();
        const cartData = JSON.parse(localStorage.getItem(this.customizedCartStorage) || '[]');
        const userCarts = cartData.filter((cart: any) => cart.user_id === userId);
        return userCarts;
    }

    async add_customized_cart() {
        console.log("add_customized_cart");
        const userId = await this.getUserId();
        const customizedCarts = JSON.parse(localStorage.getItem(this.customizedCartStorage) || '[]');
        let userCart = customizedCarts.find((cart: any) => cart.user_id === userId);
        if (!userCart) {
            userCart = {
                id: userId,
                user_id: userId,
                created_at: new Date().toISOString()
            };
            customizedCarts.push(userCart);
            localStorage.setItem(this.customizedCartStorage, JSON.stringify(customizedCarts));
        }
        console.log("userCart", userCart);
        return userCart;
    }

    async delete_customized_cart() {
        console.log("delete_customized_cart");
        const userId = await this.getUserId();
        // Remove cart entry
        const cartData = JSON.parse(localStorage.getItem(this.customizedCartStorage) || '[]');
        const filteredCartData = cartData.filter((cart: any) => cart.user_id !== userId);
        localStorage.setItem(this.customizedCartStorage, JSON.stringify(filteredCartData));
        // Remove all products for this user's customized cart
        const productsData = JSON.parse(localStorage.getItem(this.customizedCartProductsStorage) || '[]');
        const filteredProductsData = productsData.filter((product: any) => product.customized_cart_id !== userId);
        localStorage.setItem(this.customizedCartProductsStorage, JSON.stringify(filteredProductsData));
        return filteredCartData;
    }

    // --- CUSTOMER ADDRESS METHODS ---

    async add_customer_address(address: any) {
        console.log("add_customer_address");
        
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
          .select()
          .single();
          
        if (error) {
          console.error("Error adding customer address:", error);
          throw new Error("An Error Occurred");
        }
        
        return data;
      }

    /**
     * Gets the customer address for the current user from the 'customer_addresses' table.
     * Returns the most recently created address for the user, or null if none exists.
     */
    // async get_customer_address() {
    //     console.log("get_customer_address");
    //     const userId = await this.getUserId();

    //     const { data, error } = await this.supabase
    //         .from('customer_addresses')
    //         .select('*')
    //         .eq('customer_id', userId)
    //         .order('created_at', { ascending: false })
    //         .limit(1)
    //         .single();

    //     if (error && error.code !== "PGRST116") {
    //         console.error("Error fetching customer address:", error);
    //         throw new Error("An Error Occurred");
    //     }

    //     return data || null;
    // }

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
            .select()
            .single();

        if (error) {
            console.error("Error updating default address:", error);
            throw new Error("An Error Occurred");
        }

        return data;
    }

    async update_customer_address(address: any) {
        console.log("update_customer_address");
        const userId = await this.getUserId();
        const { data, error } = await this.supabase
            .from('customer_addresses')
            .update(address)
            .eq('customer_id', userId)
            .eq('customer_addresses_id', address.customer_addresses_id)
            .select()
            .single();

        if (error) {
            console.error("Error updating customer address:", error);
            throw new Error("An Error Occurred");
        }

        return data;
    }
    


    // --- PRODUCT/ORDER METHODS (unchanged, but use userId for customer_id) ---

    async get_all_products() {
        const { data, error } = await this.supabase.from('items')
            .select('*, stock_quantity')
            .eq('is_active', true)
            .eq('business_id', this.business_id);

        if (error) {
            throw new Error("An Error Occurred");
        }
        return data;
    }

    /**
     * Fetches all countries and their respective states, mapping each country to its states.
     * Returns an array of countries, each with a `states` property containing its states.
     */
    // async get_countries_with_states() {
    //     // Fetch all countries
    //     const { data: countries, error: countryError } = await this.supabase
    //         .from('countries')
    //         .select('*');
    //     if (countryError) throw new Error("An Error Occurred while fetching countries");

    //     // Fetch all states
    //     const { data: states, error: stateError } = await this.supabase
    //         .from('states')
    //         .select('*');
    //     if (stateError) throw new Error("An Error Occurred while fetching states");

    //     // Map each country to its states
    //     const countryWithStates = (countries || []).map((country: any) => ({
    //         ...country,
    //         states: (states || []).filter((state: any) => state.country_id === country.id)
    //     }));

    //     return countryWithStates;
    // }
    
    async get_country_list() {
        const { data: country_data, error } = await this.supabase
            .from('countries')
            .select('*');
        if (error) throw new Error("An Error Occurred");
        return country_data;
    }

    // async get_state_list() {
    //     const { data: state_data, error } = await this.supabase
    //         .from('states')
    //         .select('*');

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
            .select('item_category_id, name')
            .eq('business_id', this.business_id);
        if (error) throw new Error("An Error Occurred While Fetching Categories");
        return data || [];
    }

    async get_customer_orders() {
        try {
            const userId = await this.getUserId();
            console.log("userId", userId)
            const { data: orders, error } = await this.supabase
                .from('sale_view')
                .select('sale_id, sale_invoice, sale_date, status,customer,sale_items,subtotal')
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
                    total + (parseFloat(item.price) * item.quantity), 0) || 0
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

