import { useEffect, useState } from "react";
import {
  deleteProduct,
  getBurgers,
  getCombos,
  getDrinks,
  getSideDishes,
} from "../services/menuService";

export default function DeleteProduct() {
  const [products, setProducts] = useState({
    burgers: [],
    drinks: [],
    combos: [],
    sideDishes: [],
  });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [b, d, c, s] = await Promise.all([
        getBurgers(),
        getDrinks(),
        getCombos(),
        getSideDishes(),
      ]);
      setProducts({
        burgers: b || [],
        drinks: d || [],
        combos: c || [],
        sideDishes: s || [],
      });
    }
    load();
  }, []);

  function onSelect(val) {
    if (!val || val === "all") {
      setSelected(null);
      return;
    }
    const [collection, id] = val.split(":");
    const list = products[collection] || [];
    const p = list.find((x) => x.id === id || x.id === id);
    setSelected({ collection, id, data: p });
  }

  async function handleDelete() {
    if (!selected) return;
    if (!confirm(`Xóa sản phẩm ${selected.id} từ ${selected.collection}?`))
      return;
    setLoading(true);
    const ok = await deleteProduct(selected.collection, selected.id);
    setLoading(false);
    if (ok) {
      alert("Đã xóa thành công");
      // refresh
      const [b, d, c, s] = await Promise.all([
        getBurgers(),
        getDrinks(),
        getCombos(),
        getSideDishes(),
      ]);
      setProducts({
        burgers: b || [],
        drinks: d || [],
        combos: c || [],
        sideDishes: s || [],
      });
      setSelected(null);
    } else alert("Xóa thất bại");
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
          Xóa sản phẩm theo phân loại
        </h2>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Chọn sản phẩm</label>
          <select
            onChange={(e) => onSelect(e.target.value)}
            className="w-full p-3 border rounded"
          >
            <option value="all">Tất cả sản phẩm</option>
            <optgroup label="🍔 Burgers">
              {products.burgers.map((p) => (
                <option key={p.id} value={`burgers:${p.id}`}>
                  {p.name || p.id}
                </option>
              ))}
            </optgroup>
            <optgroup label="🥤 Drinks">
              {products.drinks.map((p) => (
                <option key={p.id} value={`drinks:${p.id}`}>
                  {p.name || p.id}
                </option>
              ))}
            </optgroup>
            <optgroup label="🍟 Side Dishes">
              {products.sideDishes.map((p) => (
                <option key={p.id} value={`sideDishes:${p.id}`}>
                  {p.name || p.id}
                </option>
              ))}
            </optgroup>
            <optgroup label="🎯 Combos">
              {products.combos.map((p) => (
                <option key={p.id} value={`combos:${p.id}`}>
                  {p.name || p.id}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {selected && (
          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Chi tiết</h3>
            <p>
              <strong>ID:</strong> {selected.id}
            </p>
            <p>
              <strong>Collection:</strong> {selected.collection}
            </p>
            <p>
              <strong>Name:</strong> {selected.data?.name || "N/A"}
            </p>

            {/* Description */}
            <p className="mt-2">
              <strong>Description:</strong>
              <br />
              {selected.data?.description || selected.data?.desc || "-"}
            </p>

            {/* Price display */}
            <div className="mt-2">
              <strong>Price:</strong>
              <div className="mt-1">
                {selected.collection === "burgers" ? (
                  <div className="space-y-1">
                    <div>
                      <strong>Nhỏ:</strong>{" "}
                      {selected.data?.pricing?.small ??
                        selected.data?.pricing?.Nhỏ ??
                        "-"}
                    </div>
                    <div>
                      <strong>Vừa:</strong>{" "}
                      {selected.data?.pricing?.medium ??
                        selected.data?.pricing?.Vừa ??
                        "-"}
                    </div>
                    <div>
                      <strong>Lớn:</strong>{" "}
                      {selected.data?.pricing?.large ??
                        selected.data?.pricing?.Lớn ??
                        "-"}
                    </div>
                  </div>
                ) : (
                  <div>
                    {selected.data?.price ?? selected.data?.priceValue ?? "-"}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Xóa..." : "Xóa sản phẩm"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
