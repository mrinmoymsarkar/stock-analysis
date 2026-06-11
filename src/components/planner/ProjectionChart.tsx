"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "next-themes";
import { ProjectionPoint } from "@/lib/finance";

interface ProjectionChartProps {
  data: ProjectionPoint[];
}

const getCssVar = (name: string) => `hsl(var(${name}))`;

/** Compact INR formatter: 1.5L, 2.3Cr, etc. */
function formatCompactINR(value: number): string {
  if (value >= 1_00_00_000) {
    return (
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(value / 1_00_00_000) + " Cr"
    );
  }
  if (value >= 1_00_000) {
    return (
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
      }).format(value / 1_00_000) + " L"
    );
  }
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

const inrFull = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function ProjectionChart({ data }: ProjectionChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const axisColor = getCssVar("--muted-foreground");
  const gridColor = isDark
    ? "rgba(255,255,255,0.05)"
    : "rgba(0,0,0,0.04)";
  const tooltipBg = getCssVar("--card");
  const tooltipBorder = getCssVar("--border");
  const foreground = getCssVar("--foreground");

  const xTickFormatter = (month: number) => {
    const yr = Math.round(month / 12);
    return yr === 0 ? `1m` : `${yr}y`;
  };

  return (
    <div className="w-full h-[320px] bg-transparent">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickFormatter={xTickFormatter}
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            tickFormatter={(v) => `₹${formatCompactINR(v)}`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 11 }}
            width={72}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "0.75rem",
              boxShadow:
                "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              color: foreground,
            }}
            labelFormatter={(month: number) => {
              const yr = Math.floor(month / 12);
              const mo = month % 12;
              const parts: string[] = [];
              if (yr > 0) parts.push(`${yr} yr`);
              if (mo > 0) parts.push(`${mo} mo`);
              return parts.join(" ") || `${month} mo`;
            }}
            formatter={(value: number, name: string) => [
              inrFull.format(value),
              name === "value" ? "Portfolio Value" : "Amount Invested",
            ]}
          />

          <Legend
            formatter={(value) =>
              value === "value" ? "Portfolio Value" : "Amount Invested"
            }
            wrapperStyle={{ fontSize: 12, color: axisColor }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2.5}
            fill="url(#gradValue)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />

          <Area
            type="monotone"
            dataKey="invested"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="url(#gradInvested)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
