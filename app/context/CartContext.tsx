import React, { createContext, ReactNode, useContext, useState } from "react";

export interface SizeOption {
  name: string;
  key: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  image?: string;
  category?: string;
  categoryId?: string;
  sizes?: SizeOption[];
  sizeOptions?: SizeOption[];
  // For drinks
  volume?: string;
  categoryID?: string;
  // For combos
  items?: string[];
  discount?: number;
  isAvailable?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedSizePrice?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    size?: string,
    sizePrice?: number
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    size?: string,
    sizePrice?: number
  ) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === product.id && item.selectedSize === size
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prevItems,
        {
          ...product,
          quantity,
          selectedSize: size,
          selectedSizePrice: sizePrice,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.selectedSizePrice || item.price;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
