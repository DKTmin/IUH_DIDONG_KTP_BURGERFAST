import { doc as docRef, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { listenOrders, updateOrderStatus } from "../services/orderService";
import { getBurgers, getDrinks, getCombos } from "../services/menuService";

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
  const [pageError, setPageError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerNameFilter, setCustomerNameFilter] = useState("");
  const [products, setProducts] = useState({ burgers: [], drinks: [], combos: [] });
  const [productFilter, setProductFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const unsub = listenOrders(setOrders);
    return () => unsub();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const [burgers, drinks, combos] = await Promise.all([
          getBurgers(),
          getDrinks(),
          getCombos(),
        ]);
        if (!cancelled)
          setProducts({ burgers: burgers || [], drinks: drinks || [], combos: combos || [] });
      } catch (_e) {
        // ignore
      }
    }
    loadProducts();
    return () => {
      cancelled = true;
    };
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
          } catch (_e) {
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

  function getStatusColor(status) {
    switch (status) {
      case "pending":
        return "#FFC107";
      case "confirmed":
        return "#2196F3";
      case "preparing":
        return "#FF9800";
      case "delivering":
        return "#9C27B0";
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      default:
        return "#999";
    }
  }

  function applyFilters(list) {
    let out = list.slice();
    if (statusFilter && statusFilter !== "all")
      out = out.filter((o) => o.status === statusFilter);
    if (customerNameFilter) {
      out = out.filter((o) => {
        const name = (o.customerName ?? o.customer?.name ?? "").toLowerCase();
        return name.includes(customerNameFilter.toLowerCase());
      });
    }
    if (productFilter && productFilter !== "all") {
      out = out.filter((o) => {
        const items = o.items || [];
        return items.some((it) => it.id === productFilter || it.productId === productFilter || it.id === productFilter);
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Quản lý đơn hàng
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Theo dõi và cập nhật trạng thái đơn hàng của khách hàng
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Bộ lọc</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trạng thái đơn hàng
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
              >
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "Tất cả" : s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sản phẩm</label>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
              >
                <option value="all">Tất cả sản phẩm</option>
                <optgroup label="🍔 Burgers">
                  {products.burgers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.title || p.id}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🥤 Drinks">
                  {products.drinks.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.title || p.id}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🎯 Combos">
                  {products.combos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.title || p.id}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên khách hàng
              </label>
              <input
                type="text"
                value={customerNameFilter}
                onChange={(e) => setCustomerNameFilter(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <button
                onClick={() => exportCSV(filtered)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Xuất CSV
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {visible.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">Không có đơn hàng nào</p>
            </div>
          ) : (
            visible.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">
                      Mã đơn hàng
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      #{o.id?.slice(-6) || o.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">
                      Khách hàng
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {o.customerName ?? o.customer?.name ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">
                      Tổng tiền
                    </p>
                    <p className="text-xl font-bold text-orange-600">
                      {(o.total ?? o.amount ?? 0).toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-semibold mb-2">
                      Trạng thái
                    </p>
                    <div
                      className="inline-block px-4 py-2 rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: getStatusColor(o.status) }}
                    >
                      {o.status}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 font-semibold mb-2">
                    Sản phẩm:
                  </p>
                  <p className="text-gray-700">
                    {(o.items || [])
                      .map((it) => it.title || it.name)
                      .join(", ") || "Không có sản phẩm"}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUS.filter((s) => s !== "all").map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(o.id, s)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                        o.status === s
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Trang trước
              </button>

              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-2 rounded-lg font-bold transition-all ${
                      page === i + 1
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Trang sau →
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-semibold">
                Đi đến trang:
              </span>
              <input
                value={pageInput}
                onChange={(e) => {
                  setPageInput(e.target.value);
                  setPageError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = Number(pageInput);
                    if (isNaN(v)) {
                      setPageError("Vui lòng nhập số");
                    } else if (v < 1 || v > totalPages) {
                      setPageError(
                        `Trang phải nằm trong khoảng 1-${totalPages}`
                      );
                    } else {
                      setPage(v);
                      setPageInput("");
                      setPageError("");
                    }
                  }
                }}
                className={`w-20 border-2 p-2 rounded-lg text-center font-semibold ${
                  pageError ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:border-blue-500 transition`}
                placeholder="..."
              />
              <span className="text-sm text-gray-600 font-semibold">
                / {totalPages}
              </span>
            </div>
          </div>
          {pageError && (
            <div className="text-red-600 text-sm font-bold mt-3">
              {pageError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
