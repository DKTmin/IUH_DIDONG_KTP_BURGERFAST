import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";

async function getNextIndex(collectionName) {
  const snap = await getDocs(collection(db, collectionName));
  return snap.size + 1;
}

function formatId(prefix, idx) {
  return `${prefix}_${String(idx).padStart(2, "0")}`;
}

async function uploadImage(folder, file) {
  if (!file) return { imageUrl: null, storagePath: null };
  if (typeof file === "string") return { imageUrl: file, storagePath: null };
  const path = `${folder}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { imageUrl: url, storagePath: path };
}

export async function addBurger({
  name,
  description,
  pricing,
  categoryId,
  imageInput,
}) {
  const idx = await getNextIndex("burgers");
  const id = formatId("burger", idx);
  const { imageUrl } = await uploadImage("burgers", imageInput);
  await setDoc(doc(db, "burgers", id), {
    categoryId: categoryId || "burgers",
    id,
    name,
    description,
    imageUrl,
    pricing,
    isAvailable: true,
    createdAt: new Date(),
  });
  return { docId: id, id };
}

export async function addDrink({
  name,
  description,
  volume,
  price,
  imageInput,
}) {
  const idx = await getNextIndex("drinks");
  const id = formatId("drink", idx);
  const { imageUrl } = await uploadImage("drinks", imageInput);
  await setDoc(doc(db, "drinks", id), {
    categoryId: "drinks",
    id,
    name,
    description,
    volume,
    imageUrl,
    price: Number(price || 0),
    isAvailable: true,
    createdAt: new Date(),
  });
  return { docId: id, id };
}

export async function addCombo({
  name,
  description,
  price,
  discount,
  items,
  imageInput,
}) {
  const idx = await getNextIndex("combos");
  const id = formatId("combo", idx);
  const { imageUrl } = await uploadImage("combos", imageInput);
  await setDoc(doc(db, "combos", id), {
    id,
    name,
    description,
    discount: Number(discount || 0),
    items: items || [],
    imageUrl,
    price: Number(price || 0),
    isAvailable: true,
    createdAt: new Date(),
  });
  return { docId: id, id };
}

export async function getBurgers() {
  const snap = await getDocs(collection(db, "burgers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getDrinks() {
  const snap = await getDocs(collection(db, "drinks"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addSideDish({ name, description, price, imageInput }) {
  const idx = await getNextIndex("sideDishes");
  const id = formatId("sideDishes", idx);
  const { imageUrl } = await uploadImage("sideDishes", imageInput);
  await setDoc(doc(db, "sideDishes", id), {
    id,
    name,
    description,
    imageUrl,
    price: Number(price || 0),
    isAvailable: true,
    createdAt: new Date(),
  });
  return { docId: id, id };
}

export async function getSideDishes() {
  const snap = await getDocs(collection(db, "sideDishes"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteProduct(collectionName, id) {
  if (!collectionName || !id) return false;
  try {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  } catch (e) {
    console.error("deleteProduct error", e);
    return false;
  }
}

export async function updateProduct(collectionName, id, data) {
  if (!collectionName || !id) return false;
  try {
    await setDoc(doc(db, collectionName, id), data, { merge: true });
    return true;
  } catch (e) {
    console.error("updateProduct error", e);
    return false;
  }
}

export async function getCombos() {
  const snap = await getDocs(collection(db, "combos"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
