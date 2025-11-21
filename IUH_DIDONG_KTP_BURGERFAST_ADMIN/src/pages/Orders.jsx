import React, { useEffect, useState } from "react";
import { listenOrders, updateOrderStatus } from "../services/orderService";
import { getDoc, doc as docRef } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const STATUS = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "delivering",
  "delivered",
  "cancelled",
];

function exportCSV(items) {
  if (!items || !items.length) return;
  const keys = ["id", "customerName", "status", "total", "createdAt"];
  const lines = [keys.join(",")];
  for (const it of items) {
    const row = keys
      .map((k) => {
        let v = it[k];
        if (k === "createdAt") {
          const d = v && v.toDate ? v.toDate() : v ? new Date(v) : "";
          v = d ? d.toISOString() : "";
        }
        return `"${String(v ?? "").replace(/"/g, '""')}"`;
      })
      .join(",");
    lines.push(row);
  }

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders_export_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pageInput, setPageInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const unsub = listenOrders(setOrders);
    return () => unsub();
  }, []);

  // resolve missing customer names by looking up users collection
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    let cancelled = false;
    async function resolve() {
      const resolved = await Promise.all(
        orders.map(async (o) => {
          if (o.customerName) return o;
          const uid =
            o.userId ||
            o.customerId ||
            (o.customer && (o.customer.uid || o.customer.id));
          if (!uid) return o;
          try {
            const snap = await getDoc(docRef(db, "users", uid));
            if (snap.exists()) {
              const data = snap.data();
              return {
                ...o,
                customerName:
                  data.name || data.displayName || data.fullName || data.email,
              };
            }
          } catch (e) {
            // ignore
          }
          return o;
        })
      );
      if (!cancelled) setOrders(resolved);
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [orders]);

  async function changeStatus(id, next) {
    await updateOrderStatus(id, next);
  }

  function applyFilters(list) {
    let out = list.slice();
    if (statusFilter && statusFilter !== "all")
      out = out.filter((o) => o.status === statusFilter);
    if (fromDate) {
      const f = new Date(fromDate + "T00:00:00");
      out = out.filter((o) => {
        const d =
          o.createdAt && o.createdAt.toDate
            ? o.createdAt.toDate()
            : o.createdAt
            ? new Date(o.createdAt)
            : null;
        return d && d >= f;
      });
    }
    if (toDate) {
      const t = new Date(toDate + "T23:59:59");
      out = out.filter((o) => {
        const d =
          o.createdAt && o.createdAt.toDate
            ? o.createdAt.toDate()
            : o.createdAt
            ? new Date(o.createdAt)
            : null;
        return d && d <= t;
      });
    }
    return out;
  }

  const filtered = applyFilters(orders);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>

      <div className="flex flex-col md:flex-row gap-3 mb-4 items-end">
        <div>
          <label className="text-sm text-slate-600">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block border p-2 rounded mt-1"
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-600">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="block border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-slate-600">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="block border p-2 rounded mt-1"
          />
        </div>

        <div className="ml-auto">
          <button
            onClick={() => exportCSV(filtered)}
            className="bg-green-600 text-white px-3 py-2 rounded"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {visible.map((o) => (
          <div
            key={o.id}
            className="p-4 bg-white rounded shadow flex justify-between items-start"
          >
            <div>
              <div className="font-medium">Order #{o.id}</div>
              <div className="text-sm text-slate-600">
                Customer: {o.customerName ?? o.customer?.name ?? "N/A"}
              </div>
              <div className="text-sm text-slate-600">
                Total: {o.total ?? o.amount ?? 0}₫
              </div>
              <div className="text-sm mt-2">
                Items:{" "}
                {(o.items || []).map((it) => it.title || it.name).join(", ")}
              </div>
            </div>
            <div className="text-right">
              <div
                className={`px-3 py-1 rounded text-sm ${
                  o.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {o.status}
              </div>
              <div className="mt-3 space-x-2">
                {STATUS.filter((s) => s !== "all").map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(o.id, s)}
                    className="text-sm px-2 py-1 border rounded"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-2 py-1 border rounded ${
                  page === i + 1 ? "bg-slate-200" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div>Page</div>
          <input
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = Number(pageInput);
                if (!isNaN(v) && v >= 1 && v <= totalPages) setPage(v);
              }
            }}
            className="w-16 border p-1 rounded text-center"
          />
          <div>/ {totalPages}</div>
        </div>
      </div>
    </div>
  );
}
