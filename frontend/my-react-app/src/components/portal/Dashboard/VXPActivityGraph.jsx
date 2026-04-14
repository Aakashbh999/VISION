import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

/**
 * VXPActivityGraph
 * @param {Array} activityData - Array of { day: string, xp_gained: number } (7 items)
 * @param {boolean} isLoading
 */
export default function VXPActivityGraph({ activityData = [], isLoading = false }) {
  const labels = activityData.length
    ? activityData.map((d) => d.day)
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const values = activityData.length
    ? activityData.map((d) => d.xp_gained)
    : [0, 0, 0, 0, 0, 0, 0];

  const totalWeekXP = values.reduce((a, b) => a + b, 0);
  const maxDay = activityData.length
    ? activityData.reduce((best, d) => (d.xp_gained > best.xp_gained ? d : best), activityData[0])
    : null;

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "VXP Gained",
          data: values,
          fill: true,
          backgroundColor: (ctx) => {
            const canvas = ctx.chart.ctx;
            const gradient = canvas.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, "rgba(139, 92, 246, 0.25)");
            gradient.addColorStop(1, "rgba(139, 92, 246, 0.00)");
            return gradient;
          },
          borderColor: "#8b5cf6",
          borderWidth: 2.5,
          tension: 0.45,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#8b5cf6",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activityData],
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15,10,40,0.85)",
        titleColor: "#c4b5fd",
        bodyColor: "#e2e8f0",
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} VXP`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, weight: "600" },
        },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(148,163,184,0.1)" },
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
          stepSize: 10,
        },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 h-full flex flex-col border border-gray-100 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            VXP Activity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Last 7 days · XP earned per day
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-violet-600 dark:text-violet-400">
            {isLoading ? "—" : `+${totalWeekXP}`}
          </div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
            This week
          </div>
        </div>
      </div>

      {/* Best day badge */}
      {!isLoading && maxDay && maxDay.xp_gained > 0 && (
        <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 self-start">
          <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
            {maxDay.day} · {maxDay.xp_gained} VXP
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-0" style={{ minHeight: 160 }}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
