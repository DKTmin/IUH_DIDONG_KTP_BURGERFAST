import { useEffect, useState } from "react";
import {
  getBurgers,
  getCombos,
  getDrinks,
  getSideDishes,
  updateProduct,
} from "../services/menuService";

export default function UpdateProduct() {
  const [products, setProducts] = useState({
    burgers: [],
    drinks: [],
    combos: [],
    sideDishes: [],
  });
  const [selected, setSelected] = useState(null);
  const [selectedOriginal, setSelectedOriginal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categorySelect, setCategorySelect] = useState("burgers");

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
    // val is an id for the currently chosen category
    if (!val || val === "all") {
      setSelected(null);
      setSelectedOriginal(null);
      return;
    }
    const collection = categorySelect;
    const id = val;
    const list = products[collection] || [];
    const p = list.find((x) => x.id === id);
    if (!p) return;
    const copy = { ...p };
    setSelected({ collection, id, data: { ...copy } });
    setSelectedOriginal({ collection, id, data: { ...copy } });
  }

  function hasChanges() {
    if (!selected || !selectedOriginal) return false;
    return (
      JSON.stringify(selected.data) !== JSON.stringify(selectedOriginal.data)
    );
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    try {
      // Create a shallow copy of data to save; remove metadata
      const payload = { ...selected.data };
      // ensure numeric conversion for price etc
      if (payload.price) payload.price = Number(payload.price);
      const ok = await updateProduct(selected.collection, selected.id, payload);
      if (ok) {
        alert("Đã cập nhật thành công");
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
      } else alert("Câp nhật thất bại");
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 mb-2 rounded-2xl shadow">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
          Cập nhật sản phẩm theo phân loại
        </h2>
        {/* Tab-like category selector */}
        <div className="mb-6 flex flex-wrap gap-3">
          {[
            { key: "burgers", label: "Burgers" },
            { key: "drinks", label: "Drinks" },
            { key: "sideDishes", label: "Side Dishes" },
            { key: "combos", label: "Combos" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setCategorySelect(cat.key);
                setSelected(null);
                setSelectedOriginal(null);
              }}
              className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                categorySelect === cat.key
                  ? "bg-orange-400 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Chọn sản phẩm</label>
          <select
            onChange={(e) => onSelect(e.target.value)}
            className="w-full p-3 border rounded"
            value={selected?.id || "all"}
          >
            <option value="all">Tất cả sản phẩm</option>
            {(products[categorySelect] || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.id}
              </option>
            ))}
          </select>
        </div>

        {selected && selected.collection === "burgers" && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">Name</label>
              <input
                className="w-full p-2 border rounded"
                value={selected.data.name || ""}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: { ...selected.data, name: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Category</label>
              <select
                className="w-full p-2 border rounded"
                value={selected.data.categoryId || "burgers"}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: { ...selected.data, categoryId: e.target.value },
                  })
                }
              >
                <option value="burgers">burgers</option>
                <option value="spicy">spicy</option>
                <option value="trending">trending</option>
                <option value="veggie">veggie</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">Price - Nhỏ</label>
              <input
                className="w-full p-2 border rounded"
                value={
                  selected.data.pricing?.small ??
                  selected.data.pricing?.Nhỏ ??
                  ""
                }
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: {
                      ...selected.data,
                      pricing: {
                        ...selected.data.pricing,
                        small: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Price - Vừa</label>
              <input
                className="w-full p-2 border rounded"
                value={
                  selected.data.pricing?.medium ??
                  selected.data.pricing?.Vừa ??
                  ""
                }
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: {
                      ...selected.data,
                      pricing: {
                        ...selected.data.pricing,
                        medium: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Price - Lớn</label>
              <input
                className="w-full p-2 border rounded"
                value={
                  selected.data.pricing?.large ??
                  selected.data.pricing?.Lớn ??
                  ""
                }
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: {
                      ...selected.data,
                      pricing: {
                        ...selected.data.pricing,
                        large: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Image URL</label>
              <input
                className="w-full p-2 border rounded"
                value={selected.data.imageUrl || ""}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: { ...selected.data, imageUrl: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Description</label>
              <textarea
                className="w-full p-2 border rounded"
                value={selected.data.description || ""}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: { ...selected.data, description: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <button
                type="submit"
                className={`px-4 py-2 rounded text-white ${
                  loading || !hasChanges()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
                disabled={loading || !hasChanges()}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
              </button>
            </div>
          </form>
        )}

        {selected && selected.collection !== "burgers" && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">Name</label>
              <input
                className="w-full p-2 border rounded"
                value={selected.data.name || ""}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: { ...selected.data, name: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Description</label>
              <textarea
                className="w-full p-2 border rounded"
                value={selected.data.description || ""}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: { ...selected.data, description: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Image URL</label>
              <input
                className="w-full p-2 border rounded"
                value={selected.data.imageUrl || ""}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: { ...selected.data, imageUrl: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Price</label>
              <input
                className="w-full p-2 border rounded"
                value={selected.data.price || ""}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    data: { ...selected.data, price: e.target.value },
                  })
                }
              />
            </div>

            {selected.collection === "combos" && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Items in Combo
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    ...products.burgers,
                    ...products.drinks,
                    ...products.sideDishes,
                  ].map((it) => (
                    <label key={it.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(selected.data.items || []).some(
                          (x) => x.id === it.id
                        )}
                        onChange={() => {
                          const exists = (selected.data.items || []).some(
                            (x) => x.id === it.id
                          );
                          const items = selected.data.items || [];
                          if (exists)
                            setSelected({
                              ...selected,
                              data: {
                                ...selected.data,
                                items: items.filter((x) => x.id !== it.id),
                              },
                            });
                          else
                            setSelected({
                              ...selected,
                              data: {
                                ...selected.data,
                                items: [
                                  ...items,
                                  {
                                    id: it.id,
                                    name: it.name || it.title || "",
                                  },
                                ],
                              },
                            });
                        }}
                      />
                      <span>{it.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className={`px-4 py-2 rounded text-white ${
                  loading || !hasChanges()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
                disabled={loading || !hasChanges()}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
