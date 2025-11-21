import {
  collection,
  query,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const ordersCol = collection(db, "orders");

export function listenOrders(callback) {
  const q = query(ordersCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

export async function updateOrderStatus(orderId, status) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status });
}

export async function getRevenueStats(rangeStart, rangeEnd) {
  // rangeStart and rangeEnd are JS Date objects
  const q = query(
    ordersCol,
    where("createdAt", ">=", rangeStart),
    where("createdAt", "<=", rangeEnd)
  );
  const snap = await getDocs(q);
  let total = 0;
  snap.forEach((d) => {
    const data = d.data();
    const t = data.total ?? data.amount ?? 0;
    total += Number(t);
  });
  return { total };
}

export async function getRevenueSeries(days = 7) {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));

  const q = query(
    ordersCol,
    where("createdAt", ">=", start),
    where("createdAt", "<=", end),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);
  // initialize map of date -> total
  const map = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }

  snap.forEach((d) => {
    const data = d.data();
    const t = Number(data.total ?? data.amount ?? 0) || 0;
    let dt = data.createdAt;
    if (dt && dt.toDate) dt = dt.toDate();
    else dt = dt ? new Date(dt) : null;
    if (!dt) return;
    const key = dt.toISOString().slice(0, 10);
    if (map[key] === undefined) map[key] = t;
    else map[key] += t;
  });

  const series = Object.keys(map)
    .sort()
    .map((k) => ({ date: k, total: map[k] }));
  return series;
}
