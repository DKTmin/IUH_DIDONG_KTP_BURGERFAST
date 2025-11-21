import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  const docRef = await addDoc(collection(db, "burgers"), {
    categoryId: categoryId || "burgers",
    id,
    name,
    description,
    imageUrl,
    pricing,
    isAvailable: true,
    createdAt: new Date(),
  });
  return { docId: docRef.id, id };
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
  const docRef = await addDoc(collection(db, "drinks"), {
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
  return { docId: docRef.id, id };
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
  const docRef = await addDoc(collection(db, "combos"), {
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
  return { docId: docRef.id, id };
}

export async function getBurgers() {
  const snap = await getDocs(collection(db, "burgers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getDrinks() {
  const snap = await getDocs(collection(db, "drinks"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
