import { useEffect, useState } from "react";
import {
  addBurger,
  addCombo,
  addDrink,
  addSideDish,
  getBurgers,
  getDrinks,
  getSideDishes,
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
  const [availableSideDishes, setAvailableSideDishes] = useState([]);
  const [errors, setErrors] = useState({});

  // side dish form states
  const [sdName, setSdName] = useState("");
  const [sdDesc, setSdDesc] = useState("");
  const [sdPrice, setSdPrice] = useState("");
  const [sdImageUrl, setSdImageUrl] = useState("");
  const [sdImageFile, setSdImageFile] = useState(null);

  useEffect(() => {
    async function loadLists() {
      const b = await getBurgers();
      const d = await getDrinks();
      const s = await getSideDishes();
      setAvailableBurgers(b);
      setAvailableDrinks(d);
      setAvailableSideDishes(s);
    }
    loadLists();
  }, []);

  async function handleAddBurger(e) {
    e.preventDefault();

    // Validation
    const formErrors = {};
    if (!bName.trim()) formErrors.bName = "Tên burger không được để trống";
    if (!bDesc.trim()) formErrors.bDesc = "Mô tả không được để trống";
    if (!bPriceSmall || Number(bPriceSmall) <= 0)
      formErrors.bPriceSmall = "Giá nhỏ phải lớn hơn 0";
    if (!bPriceMedium || Number(bPriceMedium) <= 0)
      formErrors.bPriceMedium = "Giá vừa phải lớn hơn 0";
    if (!bPriceLarge || Number(bPriceLarge) <= 0)
      formErrors.bPriceLarge = "Giá lớn phải lớn hơn 0";

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

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
      setErrors({});
      // refresh lists
      const b = await getBurgers();
      setAvailableBurgers(b);
      alert("Thêm Burger thành công");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm Burger");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDrink(e) {
    e.preventDefault();

    // Validation
    const formErrors = {};
    if (!dName.trim()) formErrors.dName = "Tên đồ uống không được để trống";
    if (!dDesc.trim()) formErrors.dDesc = "Mô tả không được để trống";
    if (!dVolume.trim()) formErrors.dVolume = "Dung tích không được để trống";
    if (!dPrice || Number(dPrice) <= 0)
      formErrors.dPrice = "Giá phải lớn hơn 0";

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

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
      setErrors({});
      const d = await getDrinks();
      setAvailableDrinks(d);
      alert("Thêm Drink thành công");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm Drink");
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

    // Validation
    const formErrors = {};
    if (!cName.trim()) formErrors.cName = "Tên combo không được để trống";
    if (!cDesc.trim()) formErrors.cDesc = "Mô tả không được để trống";
    if (!cPrice || Number(cPrice) <= 0)
      formErrors.cPrice = "Giá phải lớn hơn 0";
    if (cItems.length < 2) formErrors.cItems = "Phải chọn ít nhất 2 sản phẩm";

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      alert("Vui lòng điền đầy đủ thông tin và chọn ít nhất 2 sản phẩm");
      return;
    }

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
      setErrors({});
      alert("Thêm Combo thành công");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm Combo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Thêm sản phẩm theo phân loại
            </h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setTab("burgers")}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform ${
              tab === "burgers"
                ? " bg-orange-400 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50"
            }`}
          >
            Burgers
          </button>
          <button
            onClick={() => setTab("drinks")}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform ${
              tab === "drinks"
                ? "bg-orange-400 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50"
            }`}
          >
            Drinks
          </button>
          <button
            onClick={() => setTab("combos")}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform ${
              tab === "combos"
                ? "bg-orange-400 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50"
            }`}
          >
            Combos
          </button>
          <button
            onClick={() => setTab("sideDishes")}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform ${
              tab === "sideDishes"
                ? "bg-orange-400 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50"
            }`}
          >
            Side Dishes
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 p-8">
          {tab === "burgers" && (
            <form onSubmit={handleAddBurger} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Name</label>
                  <input
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.bName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.bName && (
                    <span className="text-red-500 text-xs">{errors.bName}</span>
                  )}
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

                <div>
                  <label className="text-sm">Price - Nhỏ</label>
                  <input
                    value={bPriceSmall}
                    onChange={(e) => setBPriceSmall(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.bPriceSmall ? "border-red-500" : ""
                    }`}
                  />
                  {errors.bPriceSmall && (
                    <span className="text-red-500 text-xs">
                      {errors.bPriceSmall}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm">Price - Vừa</label>
                  <input
                    value={bPriceMedium}
                    onChange={(e) => setBPriceMedium(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.bPriceMedium ? "border-red-500" : ""
                    }`}
                  />
                  {errors.bPriceMedium && (
                    <span className="text-red-500 text-xs">
                      {errors.bPriceMedium}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm">Price - Lớn</label>
                  <input
                    value={bPriceLarge}
                    onChange={(e) => setBPriceLarge(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.bPriceLarge ? "border-red-500" : ""
                    }`}
                  />
                  {errors.bPriceLarge && (
                    <span className="text-red-500 text-xs">
                      {errors.bPriceLarge}
                    </span>
                  )}
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
                <div className="md:col-span-2">
                  <label className="text-sm">Description</label>
                  <textarea
                    value={bDesc}
                    onChange={(e) => setBDesc(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.bDesc ? "border-red-500" : ""
                    }`}
                  />
                  {errors.bDesc && (
                    <span className="text-red-500 text-xs">{errors.bDesc}</span>
                  )}
                </div>
                <div className="md:col-span-2">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    disabled={loading}
                  >
                    {loading ? "Đang thêm..." : "Thêm Burger"}
                  </button>
                </div>
              </div>
            </form>
          )}
          {tab === "sideDishes" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await (async function () {
                  // reuse handleAddSideDish logic inline to avoid adding new function reference
                  const formErrors = {};
                  if (!sdName.trim())
                    formErrors.sdName = "Tên món kèm không được để trống";
                  if (!sdDesc.trim())
                    formErrors.sdDesc = "Mô tả không được để trống";
                  if (!sdPrice || Number(sdPrice) <= 0)
                    formErrors.sdPrice = "Giá phải lớn hơn 0";
                  if (Object.keys(formErrors).length > 0) {
                    setErrors(formErrors);
                    alert("Vui lòng điền đầy đủ thông tin");
                    return;
                  }
                  setLoading(true);
                  try {
                    const imageInput =
                      sdImageFile || (sdImageUrl ? sdImageUrl : null);
                    await addSideDish({
                      name: sdName,
                      description: sdDesc,
                      price: sdPrice,
                      imageInput,
                    });
                    setSdName("");
                    setSdDesc("");
                    setSdPrice("");
                    setSdImageUrl("");
                    setSdImageFile(null);
                    setErrors({});
                    const s = await getSideDishes();
                    setAvailableSideDishes(s);
                    alert("Thêm Side Dishes thành công");
                  } catch (err) {
                    console.error(err);
                    alert("Lỗi khi thêm Side Dishes");
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Name</label>
                  <input
                    value={sdName}
                    onChange={(e) => setSdName(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.sdName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.sdName && (
                    <span className="text-red-500 text-xs">
                      {errors.sdName}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm">Price</label>
                  <input
                    value={sdPrice}
                    onChange={(e) => setSdPrice(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.sdPrice ? "border-red-500" : ""
                    }`}
                  />
                  {errors.sdPrice && (
                    <span className="text-red-500 text-xs">
                      {errors.sdPrice}
                    </span>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm">Image URL</label>
                  <input
                    value={sdImageUrl}
                    onChange={(e) => setSdImageUrl(e.target.value)}
                    placeholder="Paste image URL"
                    className="w-full border p-2 rounded mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm">Description</label>
                  <textarea
                    value={sdDesc}
                    onChange={(e) => setSdDesc(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.sdDesc ? "border-red-500" : ""
                    }`}
                  />
                  {errors.sdDesc && (
                    <span className="text-red-500 text-xs">
                      {errors.sdDesc}
                    </span>
                  )}
                </div>
                <div className="md:col-span-2">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    disabled={loading}
                  >
                    {loading ? "Đang thêm..." : "Thêm Side Dishes"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {tab === "drinks" && (
            <form onSubmit={handleAddDrink} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Name</label>
                  <input
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.dName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.dName && (
                    <span className="text-red-500 text-xs">{errors.dName}</span>
                  )}
                </div>
                <div>
                  <label className="text-sm">Volume</label>
                  <input
                    value={dVolume}
                    onChange={(e) => setDVolume(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.dVolume ? "border-red-500" : ""
                    }`}
                  />
                  {errors.dVolume && (
                    <span className="text-red-500 text-xs">
                      {errors.dVolume}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm">Price</label>
                  <input
                    value={dPrice}
                    onChange={(e) => setDPrice(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.dPrice ? "border-red-500" : ""
                    }`}
                  />
                  {errors.dPrice && (
                    <span className="text-red-500 text-xs">
                      {errors.dPrice}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm">Image URL</label>
                  <input
                    value={dImageUrl}
                    onChange={(e) => setDImageUrl(e.target.value)}
                    placeholder="Paste image URL"
                    className="w-full border p-2 rounded mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm">Description</label>
                  <textarea
                    value={dDesc}
                    onChange={(e) => setDDesc(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.dDesc ? "border-red-500" : ""
                    }`}
                  />
                  {errors.dDesc && (
                    <span className="text-red-500 text-xs">{errors.dDesc}</span>
                  )}
                </div>
                <div className="md:col-span-2">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    disabled={loading}
                  >
                    {loading ? "Đang thêm..." : "Thêm Drink"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {tab === "combos" && (
            <form onSubmit={handleAddCombo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Name</label>
                  <input
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.cName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.cName && (
                    <span className="text-red-500 text-xs">{errors.cName}</span>
                  )}
                </div>
                <div>
                  <label className="text-sm">Price</label>
                  <input
                    value={cPrice}
                    onChange={(e) => setCPrice(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.cPrice ? "border-red-500" : ""
                    }`}
                  />
                  {errors.cPrice && (
                    <span className="text-red-500 text-xs">
                      {errors.cPrice}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm">Discount</label>
                  <input
                    value={cDiscount}
                    onChange={(e) => setCDiscount(e.target.value)}
                    className="w-full border p-2 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm">Image URL</label>
                  <input
                    value={cImageUrl}
                    onChange={(e) => setCImageUrl(e.target.value)}
                    placeholder="Paste image URL"
                    className="w-full border p-2 rounded mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm">
                    Items (select burgers & drinks)
                  </label>
                  {errors.cItems && (
                    <div className="text-red-500 text-xs mb-2">
                      {errors.cItems}
                    </div>
                  )}
                  <div className="mt-2">
                    {/* Burgers Section */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-orange-600 mb-2">
                        🍔 Burgers
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-3 border-l-4 border-orange-300">
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
                      </div>
                    </div>

                    {/* Drinks Section */}
                    <div>
                      <h4 className="text-sm font-bold text-blue-600 mb-2">
                        🥤 Drinks
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-3 border-l-4 border-blue-300">
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
                    {/* Side Dishes Section */}
                    <div className="mt-4">
                      <h4 className="text-sm font-bold text-amber-600 mb-2">
                        🍟 Side Dishes
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-3 border-l-4 border-amber-300">
                        {availableSideDishes.map((s) => (
                          <label key={s.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={cItems.find((i) => i._id === s.id)}
                              onChange={() => toggleComboItem(s)}
                            />
                            <span>{s.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm">Description</label>
                  <textarea
                    value={cDesc}
                    onChange={(e) => setCDesc(e.target.value)}
                    className={`w-full border p-2 rounded mt-1 ${
                      errors.cDesc ? "border-red-500" : ""
                    }`}
                  />
                  {errors.cDesc && (
                    <span className="text-red-500 text-xs">{errors.cDesc}</span>
                  )}
                </div>

                <div className="md:col-span-2">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    disabled={loading}
                  >
                    {loading ? "Đang thêm..." : "Thêm Combo"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
