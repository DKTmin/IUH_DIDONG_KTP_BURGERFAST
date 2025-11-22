import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  getRevenueByCategoryPaid,
  getRevenueSeries,
  getRevenueStatsPaid,
} from "../services/orderService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function formatCurrency(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

export default function Dashboard() {
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [yearRevenue, setYearRevenue] = useState(0);
  const [categoryRevenue, setCategoryRevenue] = useState({
    burgers: 0,
    drinks: 0,
    combos: 0,
    trending: 0,
    veggie: 0,
    spicy: 0,
  });
  const [series, setSeries] = useState([]);

  useEffect(() => {
    const now = new Date();
    const startDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const endDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const startYear = new Date(now.getFullYear(), 0, 1);
    const endYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    getRevenueStatsPaid(startDay, endDay).then((r) => setTodayRevenue(r.total));
    getRevenueStatsPaid(startMonth, endMonth).then((r) =>
      setMonthRevenue(r.total)
    );
    getRevenueStatsPaid(startYear, endYear).then((r) =>
      setYearRevenue(r.total)
    );
    getRevenueSeries(7).then((s) => setSeries(s));
    getRevenueByCategoryPaid(startMonth, endMonth).then((c) =>
      setCategoryRevenue(c)
    );
  }, []);

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              BurgerFast Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Welcome to your restaurant management hub
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 font-semibold text-sm">
                Doanh thu hôm nay
              </h3>
            </div>
            <p className="text-3xl font-bold text-yellow-500">
              {formatCurrency(todayRevenue)}
            </p>
            <p className="text-xs text-gray-600 mt-2">Today sales</p>
          </div>

          <div className="group bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 font-semibold text-sm">
                Doanh thu tháng
              </h3>
            </div>
            <p className="text-3xl font-bold text-orange-500">
              {formatCurrency(monthRevenue)}
            </p>
            <p className="text-xs text-gray-600 mt-2">Monthly sales</p>
          </div>

          <div className="group bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 font-semibold text-sm">
                Doanh thu năm
              </h3>
            </div>
            <p className="text-3xl font-bold text-red-500">
              {formatCurrency(yearRevenue)}
            </p>
            <p className="text-xs text-gray-600 mt-2">Yearly sales</p>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">📈</div>
            <h3 className="text-xl font-bold text-gray-800">
              Doanh thu 7 ngày gần nhất
            </h3>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
            <Line
              data={{
                labels: series.map((s) => s.date),
                datasets: [
                  {
                    label: "Doanh thu (VND)",
                    data: series.map((s) => s.total),
                    fill: true,
                    backgroundColor: "rgba(99,102,241,0.15)",
                    borderColor: "rgba(99,102,241,1)",
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: "rgba(99,102,241,1)",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                    labels: { font: { size: 12, weight: "bold" } },
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      callback: (v) => new Intl.NumberFormat("vi-VN").format(v),
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">🍽️</div>
            <h3 className="text-xl font-bold text-gray-800">
              Doanh thu theo phân loại (tháng này)
            </h3>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
            <Bar
              data={{
                labels: [
                  "🍔 Burgers",
                  "🥤 Drinks",
                  "🎯 Combos",
                  "🔥 Trending",
                  "🥬 Veggie",
                  "🌶️ Spicy",
                ],
                datasets: [
                  {
                    label: "Doanh thu (VND)",
                    data: [
                      categoryRevenue.burgers,
                      categoryRevenue.drinks,
                      categoryRevenue.combos,
                      categoryRevenue.trending,
                      categoryRevenue.veggie,
                      categoryRevenue.spicy,
                    ],
                    backgroundColor: [
                      "rgba(255, 107, 107, 0.8)",
                      "rgba(66, 135, 245, 0.8)",
                      "rgba(102, 51, 153, 0.8)",
                      "rgba(255, 193, 7, 0.8)",
                      "rgba(76, 175, 80, 0.8)",
                      "rgba(233, 30, 99, 0.8)",
                    ],
                    borderColor: [
                      "rgba(255, 107, 107, 1)",
                      "rgba(66, 135, 245, 1)",
                      "rgba(102, 51, 153, 1)",
                      "rgba(255, 193, 7, 1)",
                      "rgba(76, 175, 80, 1)",
                      "rgba(233, 30, 99, 1)",
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                    labels: { font: { size: 12, weight: "bold" } },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (v) => new Intl.NumberFormat("vi-VN").format(v),
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
