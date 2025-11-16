import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

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
  imageUrl: string;
  categoryId?: string;
  category?: string;
  isAvailable?: boolean;
  sizes?: SizeOption[];
  sizeOptions?: SizeOption[];
  pricing?: {
    small?: number;
    medium?: number;
    large?: number;
  };
  // For drinks
  volume?: string;
  categoryID?: string;
  // For combos
  items?: string[];
  discount?: number;
}

// Helper function to convert pricing object to sizes array
function convertPricingToSizes(pricing: any): SizeOption[] {
  const sizes: SizeOption[] = [];

  // Support both Vietnamese keys (Nhỏ, Vừa, Lớn) and English keys (small, medium, large)
  const smallPrice =
    pricing?.Nhỏ ?? pricing?.small ?? pricing?.nho ?? pricing?.Nho;
  const mediumPrice =
    pricing?.Vừa ?? pricing?.medium ?? pricing?.vua ?? pricing?.Vua;
  const largePrice =
    pricing?.Lớn ?? pricing?.large ?? pricing?.lon ?? pricing?.Lon;

  if (typeof smallPrice === "number") {
    sizes.push({ name: "Nhỏ", key: "small", price: smallPrice });
  }
  if (typeof mediumPrice === "number") {
    sizes.push({ name: "Vừa", key: "medium", price: mediumPrice });
  }
  if (typeof largePrice === "number") {
    sizes.push({ name: "Lớn", key: "large", price: largePrice });
  }

  return sizes;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);

    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        icon: getIconForCategory(doc.id),
      } as Category);
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Helper function to get icon for category
function getIconForCategory(categoryId: string): string {
  const iconMap: { [key: string]: string } = {
    trending: "🔥",
    burgers: "🍔",
    spicy: "🌶️",
    veggie: "🥬",
    combos: "🎯",
    drinks: "🥤",
  };
  return iconMap[categoryId] || "🍽️";
}

// Get all products from all collections
export async function getProducts(): Promise<Product[]> {
  try {
    const allProducts: Product[] = [];

    // Fetch burgers
    const burgersRef = collection(db, "burgers");
    const burgersSnapshot = await getDocs(burgersRef);
    burgersSnapshot.forEach((doc) => {
      const data = doc.data();
      const sizes = data.pricing
        ? convertPricingToSizes(data.pricing)
        : data.sizeOptions || [];
      allProducts.push({
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        price: data.price || 0,
        imageUrl: data.imageUrl || data.image || "",
        category: data.categoryId || "burgers",
        sizes: sizes,
        isAvailable: data.isAvailable !== false,
      } as Product);
    });

    // Fetch drinks
    const drinksRef = collection(db, "drinks");
    const drinksSnapshot = await getDocs(drinksRef);
    drinksSnapshot.forEach((doc) => {
      const data = doc.data();
      allProducts.push({
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        price: data.price || 0,
        imageUrl: data.imageUrl || data.image || "",
        category: data.categoryID || "drinks",
        volume: data.volume || "",
        isAvailable: data.isAvailable !== false,
      } as Product);
    });

    // Fetch combos
    const combosRef = collection(db, "combos");
    const combosSnapshot = await getDocs(combosRef);
    combosSnapshot.forEach((doc) => {
      const data = doc.data();
      allProducts.push({
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        price: data.price || 0,
        imageUrl: data.imageUrl || data.image || "",
        category: "combos",
        items: data.items || [],
        discount: data.discount || 0,
        isAvailable: data.isAvailable !== false,
      } as Product);
    });

    return allProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Get products by category
export async function getProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  try {
    let collectionName = categoryId;

    // Map category IDs to collection names
    if (categoryId === "trending") {
      // For trending, get products from all collections
      const allProducts = await getProducts();
      return allProducts.slice(0, 6); // Return first 6 as trending
    }

    if (categoryId === "burgers") collectionName = "burgers";
    if (categoryId === "drinks") collectionName = "drinks";
    if (categoryId === "combos") collectionName = "combos";
    if (categoryId === "spicy" || categoryId === "veggie") {
      // These are sub-categories of burgers
      const burgersRef = collection(db, "burgers");
      const snapshot = await getDocs(burgersRef);
      const products: Product[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const sizes = data.pricing
          ? convertPricingToSizes(data.pricing)
          : data.sizeOptions || [];
        products.push({
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          price: data.price || 0,
          imageUrl: data.imageUrl || data.image || "",
          category: "burgers",
          sizes: sizes,
          isAvailable: data.isAvailable !== false,
        } as Product);
      });

      return products;
    }

    const productsRef = collection(db, collectionName);
    const snapshot = await getDocs(productsRef);

    const products: Product[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const sizes = data.pricing
        ? convertPricingToSizes(data.pricing)
        : data.sizeOptions || [];
      products.push({
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        price: data.price || 0,
        imageUrl: data.imageUrl || data.image || "",
        category: categoryId,
        sizes: sizes,
        items: data.items || [],
        volume: data.volume || "",
        isAvailable: data.isAvailable !== false,
      } as Product);
    });

    return products;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

// Get single product by ID
export async function getProductById(
  productId: string,
  collectionHint?: string
): Promise<Product | null> {
  try {
    const collectionsOrder = collectionHint
      ? [collectionHint, "burgers", "drinks", "combos"]
      : ["burgers", "drinks", "combos"];

    const seen = new Set<string>();
    for (const coll of collectionsOrder) {
      if (seen.has(coll)) continue;
      seen.add(coll);

      const productRef = doc(db, coll, productId);
      const snapshot = await getDoc(productRef);
      if (!snapshot.exists()) continue;

      const data = snapshot.data();
      if (coll === "burgers") {
        const sizes = data.pricing
          ? convertPricingToSizes(data.pricing)
          : data.sizeOptions || [];
        return {
          id: snapshot.id,
          name: data.name || "",
          description: data.description || "",
          price: data.price || 0,
          imageUrl: data.imageUrl || data.image || "",
          category: "burgers",
          sizes: sizes,
          isAvailable: data.isAvailable !== false,
        } as Product;
      }
      if (coll === "drinks") {
        return {
          id: snapshot.id,
          name: data.name || "",
          description: data.description || "",
          price: data.price || 0,
          imageUrl: data.imageUrl || data.image || "",
          category: "drinks",
          volume: data.volume || "",
          isAvailable: data.isAvailable !== false,
        } as Product;
      }
      if (coll === "combos") {
        return {
          id: snapshot.id,
          name: data.name || "",
          description: data.description || "",
          price: data.price || 0,
          imageUrl: data.imageUrl || data.image || "",
          category: "combos",
          items: data.items || [],
          isAvailable: data.isAvailable !== false,
        } as Product;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Search products by name
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  try {
    const allProducts = await getProducts();

    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}
