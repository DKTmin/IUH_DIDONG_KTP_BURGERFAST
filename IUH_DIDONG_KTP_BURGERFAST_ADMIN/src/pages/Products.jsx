import React, { useEffect, useState } from "react";
import {
  addBurger,
  addDrink,
  addCombo,
  getBurgers,
  getDrinks,
} from "../services/menuService";

export default function Products() {
  const [tab, setTab] = useState("burgers");

  // common states
  const [loading, setLoading] = useState(false);

  // burgers form
  const [bName, setBName] = useState("");
  const [bDesc, setBDesc] = useState("");
  const [bPriceSmall, setBPriceSmall] = useState("");
  const [bPriceMedium, setBPriceMedium] = useState("");
  const [bPriceLarge, setBPriceLarge] = useState("");
  const [bCategory, setBCategory] = useState("burgers");
  const [bImageUrl, setBImageUrl] = useState("");
  const [bImageFile, setBImageFile] = useState(null);

  // drinks form
  const [dName, setDName] = useState("");
  const [dDesc, setDDesc] = useState("");
  const [dVolume, setDVolume] = useState("");
  const [dPrice, setDPrice] = useState("");
  const [dImageUrl, setDImageUrl] = useState("");
  const [dImageFile, setDImageFile] = useState(null);

  // combos form
  const [cName, setCName] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cPrice, setCPrice] = useState("");
  const [cDiscount, setCDiscount] = useState(0);
  const [cItems, setCItems] = useState([]);
  const [cImageUrl, setCImageUrl] = useState("");
  const [cImageFile, setCImageFile] = useState(null);

  const [availableBurgers, setAvailableBurgers] = useState([]);
  const [availableDrinks, setAvailableDrinks] = useState([]);

  useEffect(() => {
    async function loadLists() {
      const b = await getBurgers();
      const d = await getDrinks();
      setAvailableBurgers(b);
      setAvailableDrinks(d);
    }
    loadLists();
  }, []);

  async function handleAddBurger(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const pricing = {
        small: Number(bPriceSmall || 0),
        medium: Number(bPriceMedium || 0),
        large: Number(bPriceLarge || 0),
      };
      const imageInput = bImageFile || (bImageUrl ? bImageUrl : null);
      await addBurger({
        name: bName,
        description: bDesc,
        pricing,
        categoryId: bCategory,
        imageInput,
      });
      // reset
      setBName("");
      setBDesc("");
      setBPriceSmall("");
      setBPriceMedium("");
      setBPriceLarge("");
      setBImageUrl("");
      setBImageFile(null);
      // refresh lists
      const b = await getBurgers();
      setAvailableBurgers(b);
      alert("Burger added");
    } catch (err) {
      console.error(err);
      alert("Error adding burger");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDrink(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const imageInput = dImageFile || (dImageUrl ? dImageUrl : null);
      await addDrink({
        name: dName,
        description: dDesc,
        volume: dVolume,
        price: dPrice,
        imageInput,
      });
      setDName("");
      setDDesc("");
      setDVolume("");
      setDPrice("");
      setDImageUrl("");
      setDImageFile(null);
      const d = await getDrinks();
      setAvailableDrinks(d);
      alert("Drink added");
    } catch (err) {
      console.error(err);
      alert("Error adding drink");
    } finally {
      setLoading(false);
    }
  }

  function toggleComboItem(item) {
    const exists = cItems.find((i) => i._id === item.id);
    if (exists) setCItems(cItems.filter((i) => i._id !== item.id));
    else setCItems([...cItems, { _id: item.id, name: item.name }]);
  }

  async function handleAddCombo(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const imageInput = cImageFile || (cImageUrl ? cImageUrl : null);
      const items = cItems.map((i) => ({ id: i._id, name: i.name }));
      await addCombo({
        name: cName,
        description: cDesc,
        price: cPrice,
        discount: cDiscount,
        items,
        imageInput,
      });
      setCName("");
      setCDesc("");
      setCPrice("");
      setCDiscount(0);
      setCItems([]);
      setCImageUrl("");
      setCImageFile(null);
      alert("Combo added");
    } catch (err) {
      console.error(err);
      alert("Error adding combo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Thêm sản phẩm theo phân loại
      </h2>

      <div className="mb-4">
        <button
          onClick={() => setTab("burgers")}
          className={`px-3 py-2 rounded mr-2 ${
            tab === "burgers" ? "bg-blue-600 text-white" : "bg-white border"
          }`}
        >
          Burgers
        </button>
        <button
          onClick={() => setTab("drinks")}
          className={`px-3 py-2 rounded mr-2 ${
            tab === "drinks" ? "bg-blue-600 text-white" : "bg-white border"
          }`}
        >
          Drinks
        </button>
        <button
          onClick={() => setTab("combos")}
          className={`px-3 py-2 rounded ${
            tab === "combos" ? "bg-blue-600 text-white" : "bg-white border"
          }`}
        >
          Combos
        </button>
      </div>

      {tab === "burgers" && (
        <form
          onSubmit={handleAddBurger}
          className="bg-white p-4 rounded shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Name</label>
              <input
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>

            <div>
              <label className="text-sm">Category</label>
              <select
                value={bCategory}
                onChange={(e) => setBCategory(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              >
                <option value="burgers">burgers</option>
                <option value="spicy">spicy</option>
                <option value="trending">trending</option>
                <option value="veggie">veggie</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm">Description</label>
              <textarea
                value={bDesc}
                onChange={(e) => setBDesc(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>

            <div>
              <label className="text-sm">Price - Nhỏ</label>
              <input
                value={bPriceSmall}
                onChange={(e) => setBPriceSmall(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Price - Vừa</label>
              <input
                value={bPriceMedium}
                onChange={(e) => setBPriceMedium(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Price - Lớn</label>
              <input
                value={bPriceLarge}
                onChange={(e) => setBPriceLarge(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>

            <div>
              <label className="text-sm">Image URL</label>
              <input
                value={bImageUrl}
                onChange={(e) => setBImageUrl(e.target.value)}
                placeholder="Paste image URL"
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Or upload image</label>
              <input
                type="file"
                onChange={(e) => setBImageFile(e.target.files[0])}
                className="w-full mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Adding..." : "Thêm Burger"}
              </button>
            </div>
          </div>
        </form>
      )}

      {tab === "drinks" && (
        <form onSubmit={handleAddDrink} className="bg-white p-4 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Name</label>
              <input
                value={dName}
                onChange={(e) => setDName(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Volume</label>
              <input
                value={dVolume}
                onChange={(e) => setDVolume(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Description</label>
              <textarea
                value={dDesc}
                onChange={(e) => setDDesc(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Price</label>
              <input
                value={dPrice}
                onChange={(e) => setDPrice(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Image URL</label>
              <input
                value={dImageUrl}
                onChange={(e) => setDImageUrl(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Or upload image</label>
              <input
                type="file"
                onChange={(e) => setDImageFile(e.target.files[0])}
                className="w-full mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Adding..." : "Thêm Drink"}
              </button>
            </div>
          </div>
        </form>
      )}

      {tab === "combos" && (
        <form onSubmit={handleAddCombo} className="bg-white p-4 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Name</label>
              <input
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Price</label>
              <input
                value={cPrice}
                onChange={(e) => setCPrice(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Description</label>
              <textarea
                value={cDesc}
                onChange={(e) => setCDesc(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Discount</label>
              <input
                value={cDiscount}
                onChange={(e) => setCDiscount(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Items (select burgers & drinks)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {availableBurgers.map((b) => (
                  <label key={b.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cItems.find((i) => i._id === b.id)}
                      onChange={() => toggleComboItem(b)}
                    />
                    <span>{b.name}</span>
                  </label>
                ))}
                {availableDrinks.map((d) => (
                  <label key={d.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cItems.find((i) => i._id === d.id)}
                      onChange={() => toggleComboItem(d)}
                    />
                    <span>{d.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm">Image URL</label>
              <input
                value={cImageUrl}
                onChange={(e) => setCImageUrl(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Or upload image</label>
              <input
                type="file"
                onChange={(e) => setCImageFile(e.target.files[0])}
                className="w-full mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Adding..." : "Thêm Combo"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
