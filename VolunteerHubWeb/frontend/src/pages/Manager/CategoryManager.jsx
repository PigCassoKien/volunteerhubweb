import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function CategoryManager({ onUpdated }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data } = await axios.get("/categories/all");
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const create = async () => {
    if (!name.trim()) return alert("Nhập tên");
    try {
      await axios.post("/categories/create", { name });
      setName("");
      load();
      onUpdated?.();
    } catch (err) {
      alert("Tạo thất bại");
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa danh mục?")) return;
    try {
      await axios.delete(`/categories/delete/${id}`);
      load();
      onUpdated?.();
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Thêm danh mục"
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={create}
          className="px-3 py-2 bg-emerald-600 text-white rounded"
        >
          Thêm
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>{c.name}</div>
            <div>
              <button
                onClick={() => remove(c.id)}
                className="text-red-600 px-2"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}