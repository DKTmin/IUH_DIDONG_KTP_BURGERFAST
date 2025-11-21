import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";

const productsCol = collection(db, "products");

export async function getProducts() {
  const snap = await getDocs(productsCol);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addProduct({ title, price, file }) {
  let imageUrl = null;
  if (file) {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
  }

  const docRef = await addDoc(productsCol, {
    title,
    price: Number(price || 0),
    imageUrl,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateProduct(
  id,
  { title, price, file, existingImageUrl }
) {
  const productRef = doc(db, "products", id);
  let imageUrl = existingImageUrl || null;

  if (file) {
    // upload new
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
    // TODO: optionally delete old object if we can derive its path
  }

  await updateDoc(productRef, { title, price: Number(price || 0), imageUrl });
}

export async function removeProduct(id, imageUrl) {
  if (imageUrl) {
    try {
      const storageRef = ref(storage, imageUrl);
      // direct ref from URL may not work; we'll try to delete by creating ref from URL path
      await deleteObject(storageRef);
    } catch (e) {
      // ignore delete errors
    }
  }
  await deleteDoc(doc(db, "products", id));
}
