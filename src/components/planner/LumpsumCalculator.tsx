"use client";

import { useMemo, useState } from "react";
import { inflationAdjusted, lumpsumFutureValue } from "@/lib/finance";

const inrFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function StatCard({ label, value, sub, accent = false }: StatCardProps) {
  return (
    <div className="bg-muted rounded-lg px-4 py-3 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-lg font-bold ${accent ? "text-blue-500" : "text-foreground"}`}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix,
  suffix,
}: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {prefix && (
          <span className="text-sm text-muted-foreground">{prefix}</span>
        )}
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {suffix && (
          <span className="text-sm text-muted-foreground">{suffix}</span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500"
        aria-label={`${label} slider`}
      />
    </div>
  );
}

export default function LumpsumCalculator() {
  const [principal, setPrincipal] = useState(1_00_000);
  const [annualRate, setAnnualRate] = useState(12);
  const [years, setYears] = useState(10);
  const [showInflation, setShowInflation] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);

  const { fv, realValue, gained } = useMemo(() => {
    const fv = lumpsumFutureValue(principal, annualRate, years);
    const realValue = inflationAdjusted(fv, inflationRate, years);
    return {
      fv,
      realValue,
      gained: fv - principal,
    };
  }, [principal, annualRate, years, inflationRate]);

  const multiplier = principal > 0 ? (fv / principal).toFixed(2) : "—";

  return (
    <div className="flex flex-col gap-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <NumberField
          id="ls-principal"
          label="Lumpsum Investment"
          value={principal}
          min={1_000}
          max={10_00_00_000}
          step={1_000}
          onChange={setPrincipal}
          prefix="₹"
        />
        <NumberField
          id="ls-rate"
          label="Expected Annual Return"
          value={annualRate}
          min={1}
          max={30}
          step={0.5}
          onChange={setAnnualRate}
          suffix="%"
        />
        <NumberField
          id="ls-years"
          label="Investment Duration"
          value={years}
          min={1}
          max={40}
          step={1}
          onChange={setYears}
          suffix="years"
        />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Amount Invested" value={inrFormat.format(principal)} />
        <StatCard
          label="Wealth Gained"
          value={inrFormat.format(gained)}
          sub={`${multiplier}× growth`}
        />
        <StatCard
          label="Future Value"
          value={inrFormat.format(fv)}
          accent
        />
      </div>

      {/* Inflation toggle */}
      <div className="border border-border rounded-lg p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Show inflation-adjusted value
          </span>
          <button
            role="switch"
            aria-checked={showInflation}
            onClick={() => setShowInflation((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
              showInflation ? "bg-blue-500" : "bg-muted-foreground/40"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showInflation ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {showInflation && (
          <div className="flex flex-col gap-4">
            <NumberField
              id="ls-inflation"
              label="Assumed Annual Inflation"
              value={inflationRate}
              min={1}
              max={20}
              step={0.5}
              onChange={setInflationRate}
              suffix="%"
            />
            <div className="bg-muted rounded-lg px-4 py-3 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Today&apos;s Money Value
              </span>
              <span className="text-lg font-bold text-amber-500">
                {inrFormat.format(realValue)}
              </span>
              <span className="text-xs text-muted-foreground">
                After adjusting for {inflationRate}% annual inflation over {years}{" "}
                years
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
