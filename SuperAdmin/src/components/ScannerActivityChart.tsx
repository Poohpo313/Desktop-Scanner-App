import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../styles/scanner-activity-chart.css";

export type ScannerActivityRange =
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "thisYear";

export type ScannerActivityPoint = {
  label: string;
  activations: number;
  registrations: number;
};

type Props = {
  dataByRange: Record<ScannerActivityRange, ScannerActivityPoint[]>;
};

const rangeLabels: Record<ScannerActivityRange, string> = {
  today: "Today",
  thisWeek: "This Week",
  thisMonth: "This Month",
  thisYear: "This Year",
};

const getEvenYAxisTicks = (data: ScannerActivityPoint[]) => {
  const maxValue = Math.max(
    0,
    ...data.flatMap((point) => [point.activations, point.registrations]),
  );

  if (maxValue === 0) {
    return [0, 25, 50, 75, 100];
  }

  const segments = 4;
  const roughStep = maxValue / segments;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step = Math.ceil(roughStep / magnitude) * magnitude;

  return Array.from({ length: segments + 1 }, (_, index) => index * step);
};

export default function ScannerActivityChart({ dataByRange }: Props) {
  const [range, setRange] = useState<ScannerActivityRange>("today");
  const [rangeOpen, setRangeOpen] = useState(false);
  const data = dataByRange[range];
  const isDenseRange = range === "today" || range === "thisMonth";
  const chartWidth = isDenseRange ? Math.max(1120, data.length * 62) : "100%";
  const yAxisTicks = getEvenYAxisTicks(data);

  return (
    <section className="scanner-chart-card">
      <div className="scanner-chart-card__header">
        <h2>Scanner Activations vs Registrations</h2>
        <div className="scanner-chart-card__range">
          <button
            className="scanner-chart-card__range-trigger"
            type="button"
            aria-expanded={rangeOpen}
            aria-haspopup="listbox"
            onClick={() => setRangeOpen((open) => !open)}
          >
            {rangeLabels[range]}
          </button>

          {rangeOpen && (
            <div className="scanner-chart-card__range-menu" role="listbox">
              {Object.entries(rangeLabels).map(([value, label]) => {
                const optionValue = value as ScannerActivityRange;

                return (
                  <button
                    className={
                      optionValue === range
                        ? "scanner-chart-card__range-option scanner-chart-card__range-option--selected"
                        : "scanner-chart-card__range-option"
                    }
                    key={value}
                    type="button"
                    role="option"
                    aria-selected={optionValue === range}
                    onClick={() => {
                      setRange(optionValue);
                      setRangeOpen(false);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="scanner-chart-card__plot">
        <div className="scanner-chart-card__plot-inner" style={{ width: chartWidth }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              key={range}
              data={data}
              margin={{ top: 14, right: 38, bottom: 18, left: -18 }}
            >
              <CartesianGrid stroke="#E7ECF4" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#667085",
                  fontSize: 11,
                  fontFamily: "Poppins",
                }}
                height={42}
                interval={0}
                minTickGap={0}
                dy={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#667085", fontSize: 12, fontFamily: "Poppins" }}
                domain={[0, yAxisTicks[yAxisTicks.length - 1]]}
                ticks={yAxisTicks}
              />
              <Tooltip
                cursor={{ stroke: "#CBD5E1", strokeDasharray: "4 4" }}
                contentStyle={{
                  border: "1px solid #E5EAF5",
                  borderRadius: 12,
                  boxShadow: "0 12px 28px rgba(16, 24, 40, 0.08)",
                  fontFamily: "Poppins",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="activations"
                name="Activations"
                stroke="#2448B8"
                strokeWidth={4}
                dot={{ r: 5, fill: "#FFFFFF", stroke: "#2448B8", strokeWidth: 3 }}
                activeDot={{ r: 6, fill: "#2448B8", stroke: "#FFFFFF", strokeWidth: 3 }}
              />
              <Line
                type="monotone"
                dataKey="registrations"
                name="Registrations"
                stroke="#7EA6FF"
                strokeWidth={3}
                strokeDasharray="8 7"
                dot={{ r: 4, fill: "#FFFFFF", stroke: "#7EA6FF", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#7EA6FF", stroke: "#FFFFFF", strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="scanner-chart-card__legend">
        <span className="scanner-chart-card__legend-item scanner-chart-card__legend-item--activations">
          Activations
        </span>
        <span className="scanner-chart-card__legend-item scanner-chart-card__legend-item--registrations">
          Registrations
        </span>
      </div>
    </section>
  );
}
