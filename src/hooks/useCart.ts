// src/hooks/useCart.ts
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { makeApiCall } from '@/lib/apicaller';
import { EcomService } from '@/services/api/ecom-service';
import { useLogin } from '@/app/LoginContext';

const CART_PRODUCTS_QUERY_KEY = ['cart-products'];

export function useCart() {
  const { setCartItemCount } = useLogin();
  const queryClient = useQueryClient();

  const { data: cartProductsData = [] } = useQuery({
    queryKey: CART_PRODUCTS_QUERY_KEY,
    queryFn: () => new EcomService().get_cart_products(),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const cartProducts = Array.isArray(cartProductsData) ? cartProductsData : [];

  const updateCartCount = async () => {
    try {
      const ecomService = new EcomService();
      const userId = await ecomService.getUserId();
      const cartProducts = localStorage.getItem('cart_products_data') ? 
        JSON.parse(localStorage.getItem('cart_products_data') || '[]') : 
        [];

      const userCartProducts = Array.isArray(cartProducts)
        ? cartProducts.filter((product: any) => product.user_id === userId)
        : [];

      const totalItems = userCartProducts.length > 0 ? 
        userCartProducts.reduce((acc: number, product: any) => acc + (product.localQuantity ?? product.quantity ?? 1), 0) : 
        0;
      
      setCartItemCount(totalItems);
      
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      setCartItemCount(0);
    }
  };

  const fetchCartProducts = () =>
    queryClient.invalidateQueries({
      queryKey: CART_PRODUCTS_QUERY_KEY,
    });

  // Keep cartProducts in sync when other parts of the app update the cart
  useEffect(() => {
    const onCartUpdated = () => {
      fetchCartProducts();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', onCartUpdated as EventListener);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cartUpdated', onCartUpdated as EventListener);
      }
    };
  }, []);

  const handleIncrement = (productId: string) => {
    const product = cartProducts.find(p => p.item_id === productId);
    if (product) {
      makeApiCall(
        () => new EcomService().update_cart_quantity(productId, product.localQuantity + 1),
        {
          afterSuccess: () => {
            fetchCartProducts();
            updateCartCount();
          }
        }
      );
    }
  };

  const handleDecrement = (productId: string) => {
    const product = cartProducts.find(p => p.item_id === productId);
    if (product) {
      if (product.localQuantity > 1) {
        makeApiCall(
          () => new EcomService().update_cart_quantity(productId, product.localQuantity - 1),
          {
            afterSuccess: () => {
              fetchCartProducts();
              updateCartCount();
            }
          }
        );
      } else {
        makeApiCall(
          () => new EcomService().deleteCartProduct(productId),
          {
            afterSuccess: () => {
              fetchCartProducts();
              updateCartCount();
            }
          }
        );
      }
    }
  };

  return { cartProducts, fetchCartProducts, handleIncrement, handleDecrement, updateCartCount };
}
