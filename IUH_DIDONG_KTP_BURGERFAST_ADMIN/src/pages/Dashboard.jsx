import React, { useEffect, useState } from "react";
import { getRevenueStats } from "../services/orderService";
import { getRevenueSeries } from "../services/orderService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

    getRevenueStats(startDay, endDay).then((r) => setTodayRevenue(r.total));
    getRevenueStats(startMonth, endMonth).then((r) => setMonthRevenue(r.total));
    getRevenueStats(startYear, endYear).then((r) => setYearRevenue(r.total));
    getRevenueSeries(7).then((s) => setSeries(s));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Doanh thu hôm nay</div>
          <div className="text-2xl font-bold mt-2">
            {formatCurrency(todayRevenue)}
          </div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Doanh thu tháng</div>
          <div className="text-2xl font-bold mt-2">
            {formatCurrency(monthRevenue)}
          </div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Doanh thu năm</div>
          <div className="text-2xl font-bold mt-2">
            {formatCurrency(yearRevenue)}
          </div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold mb-3">
          Doanh thu 7 ngày gần nhất
        </h3>
        <Line
          data={{
            labels: series.map((s) => s.date),
            datasets: [
              {
                label: "Doanh thu (VND)",
                data: series.map((s) => s.total),
                fill: true,
                backgroundColor: "rgba(99,102,241,0.08)",
                borderColor: "rgba(99,102,241,1)",
                tension: 0.3,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
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
  );
}
