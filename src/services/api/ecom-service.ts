import { Supabase } from "./utils";
import "../interceptor";



export class EcomService extends Supabase {
    constructor() {
        super();
    }
    async getUserId() {
        const { session } = (await this.supabase.auth.getSession()).data
        return session?.user.id
    }
    private async checkAuth(): Promise<boolean> {
        const { session } = (await this.supabase.auth.getSession()).data;
        return !!session?.access_token;
    }

    private async ensureAuthenticated() {
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
            throw new Error('Authentication required. Please log in.');
        }
    }
    async add_product_to_customized_cart(product:any) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('customized_cart_products').insert(product)
        if (error) {
            throw new Error("An Error Occured")
        }

        return data
    }
    async delete_trending_cart_product(id:number) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('carts').delete().eq('id', id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async get_customized_cart_products(customized_cart_id:string) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('customized_cart_products').select('*').eq('customized_cart_id', customized_cart_id)
     
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async update_customized_cart_products(id:string,updates:any) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('customized_cart_products').update(updates).eq('id', id).select()
        
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async delete_customized_cart_products(id:string) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('customized_cart_products').delete().eq('id', id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async delete_customized_cart(id:string) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('customized_carts').delete().eq('id', id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async get_customized_cart_products_by_id(id:string) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('customized_cart_products').select('*').eq('id', id)
        if (error) {
            throw new Error("An Error Occured")
        }
       
        return data
    }
    async get_customized_cart() {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('customized_carts').select('*').eq('user_id', await this.getUserId())
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async get_customized_cart_by_id(id:string) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('customized_carts').select('*').eq('id', id).select('customized_cart_products(*)')
        if (error) {
            throw new Error("An Error Occured")
        }
      
        return data
    }
    async add_customized_cart(){
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('customized_carts').insert({user_id:await this.getUserId()}).select()
        if (error) {
        
            throw new Error("An Error Occured")
        }
      
        
        return data[0]
    }
    async get_all_products() {
        
        const { data, error } = await this.supabase.from('products').select('*').eq('is_published',true)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async logout() {
        const {  error } = await this.supabase.auth.signOut()
        if (error) {
            throw new Error("An Error Occured")
        }
        return true
    }
    async get_cart_products() {
        const { data, error } = await this.supabase.from('cart_view').select('*').eq('user_id', await this.getUserId())
        if (error) {
            throw new Error(error.message)
        }
        return data
    }
    async check_cart_exists() {
        const { data, error } = await this.supabase.from('carts').select('*').eq('user_id', await this.getUserId())
        
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async add_to_cart() {
        const { data, error } = await this.supabase.from('carts').insert({
            user_id: await this.getUserId(),
        }).select('*').single()
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async add_to_cart_products(product: any) {
   
        const { data, error } = await this.supabase.from('cart_products').insert(product)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async update_cart_notes(notes: string, quantity: number, cart_product_id: string,extra_printing:boolean) {
       
        const { data, error } = await this.supabase.from('cart_products').update({ notes, quantity,extra_printing }).eq('id', cart_product_id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async update_cart_size(sizes: any, cart_product_id: string, quantity: number) {
       
        const { data, error } = await this.supabase.from('cart_products').update({ sizes, quantity }).eq('id', cart_product_id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
    }
    async uploadFile(file:  FormData, filename: string, bucket: string) {
        await this.ensureAuthenticated()
        
        const { data, error } = await this.supabase
          .storage
          .from(bucket)
          .upload(`/${filename}`, file);
           
        if (error) {
          
          throw new Error(error.message);
        }
       
        
        return error || data;
      }
      async deleteCartProduct(cart_product_id: number,cart_id?:number) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('cart_products').delete().eq('id', cart_product_id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
      }
      async deleteCart(cart_id: number) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('carts').delete().eq('id', cart_id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
      }
      async createOrder(order:any,is_customized_product:boolean,delivery_address:any,product_id:any) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('user_orders').insert({
          user_id: await this.getUserId(),
          order_details: is_customized_product ? order : null,
          is_customized_product: is_customized_product,
          delivery_address: delivery_address,
          product_details: is_customized_product ? null : product_id,
       
        })
        if (error) {
            throw new Error("An Error Occured")
        }
        return data  
     
      }
      async remove_customized_cart(customized_cart_id:string) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('customized_carts').delete().eq('id', customized_cart_id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
      }
      async remove_cart(cart_id:string) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('carts').delete().eq('id', cart_id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
      }
      async get_all_orders() {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('user_order_view').select('*').eq('user_id', await this.getUserId())
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
      }
      async cancel_order(order_id:string) {
        await this.ensureAuthenticated()
        const { data, error } = await this.supabase.from('user_orders').update({order_status:"CANCELLATION REQUESTED"}).eq('id', order_id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data
      }
      async get_single_product(id: any){
        await this.ensureAuthenticated();
        const {data,error} =  await this.supabase.from('products').select('*').eq('id',id)
        if (error) {
            throw new Error("An Error Occured")
        }
        return data[0]
      }
      async changeStock(product_details: any[]) {
        await this.ensureAuthenticated();
    
        await Promise.all(
            product_details.map(async (item) => {
                // Create a copy of the stock to avoid modifying the original object
                
                const res = await this.get_single_product(item.product_id)
                const updatedStock = { ...res.size_based_stock };
                // Subtract quantities from the stock
                item.sizes.forEach(({ label, quantity }: any) => {
                    if (updatedStock[label] !== undefined) {
                        updatedStock[label] = Math.max(0, updatedStock[label] - quantity);
                    }
                });
    
                // Update the database
                const { data, error } = await this.supabase
                    .from("products")
                    .update({ size_based_stock: updatedStock })
                    .eq("id", item?.cart_product_id);
    
                if (error) {
                    console.error("Error updating stock:", error);
                } else {
                 
                }
            })
        );
    }
    
}

/**
 * {
    "order_id": 26,
    "created_at": "2025-03-24T13:10:30.972615+00:00",
    "user_id": "4fc9918f-5652-4083-ab6d-0aee06e297cd",
    "order_details": null,
    "is_customized_product": false,
    "order_status": "CONFIRMED",
    "refund_status": "NOT APPLICABLE",
    "delivery_address": "{\"id\":1,\"created_at\":\"2025-02-25T04:55:10.449403+00:00\",\"full_address\":\"22\",\"landmark\":\"Kolathur\",\"city\":\"w\",\"state\":\"Chandigarh\",\"pin_code\":\"679338\",\"user_id\":\"4fc9918f-5652-4083-ab6d-0aee06e297cd\"}",
    "product_details": [
        {
            "notes": null,
            "price": 300,
            "sizes": [
                {
                    "label": "S",
                    "quantity": "0"
                },
                {
                    "label": "L",
                    "quantity": "0"
                },
                {
                    "label": "M",
                    "quantity": "0"
                },
                {
                    "label": "XL",
                    "quantity": "10"
                }
            ],
            "quantity": 10,
            "product_id": 3,
            "product_code": "PRD-123",
            "product_name": "MEN'S SPECIAL SPIRAL THEMED JERSEY",
            "extra_printing": null
        },
        {
            "notes": null,
            "price": 300,
            "sizes": [
                {
                    "label": "S",
                    "quantity": "0"
                },
                {
                    "label": "L",
                    "quantity": "0"
                },
                {
                    "label": "M",
                    "quantity": "10"
                },
                {
                    "label": "XL",
                    "quantity": "0"
                }
            ],
            "quantity": 10,
            "product_id": 2,
            "product_code": "PRD-123",
            "product_name": "MEN'S SPECIAL SPIRAL THEMED JERSEY",
            "extra_printing": null
        }
    ],
    "order_uuid": "240320251"
}
 * 
 * 
 */