"use client";

import { useMemo, useState } from "react";
import {
  sipFutureValue,
  sipProjection,
} from "@/lib/finance";
import ProjectionChart from "./ProjectionChart";

const inrFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

function StatCard({ label, value, accent = false }: StatCardProps) {
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
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
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

export default function SipCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState(10_000);
  const [annualRate, setAnnualRate] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(0);

  const months = years * 12;

  const { fv, invested, gained, projection } = useMemo(() => {
    const fv = sipFutureValue(monthlyAmount, annualRate, months);
    // For step-up: use stepUpSipFutureValue but projection already handles it
    const projection = sipProjection(monthlyAmount, annualRate, months, stepUp);
    const finalPoint = projection[projection.length - 1];
    const actualFV = finalPoint?.value ?? fv;
    const actualInvested = finalPoint?.invested ?? monthlyAmount * months;
    return {
      fv: actualFV,
      invested: actualInvested,
      gained: actualFV - actualInvested,
      projection,
    };
  }, [monthlyAmount, annualRate, months, stepUp]);

  return (
    <div className="flex flex-col gap-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <NumberField
          id="sip-amount"
          label="Monthly SIP Amount"
          value={monthlyAmount}
          min={500}
          max={10_00_000}
          step={500}
          onChange={setMonthlyAmount}
          prefix="₹"
        />
        <NumberField
          id="sip-rate"
          label="Expected Annual Return"
          value={annualRate}
          min={1}
          max={30}
          step={0.5}
          onChange={setAnnualRate}
          suffix="%"
        />
        <NumberField
          id="sip-years"
          label="Investment Duration"
          value={years}
          min={1}
          max={40}
          step={1}
          onChange={setYears}
          suffix="years"
        />
        <NumberField
          id="sip-stepup"
          label="Annual Step-Up (optional)"
          value={stepUp}
          min={0}
          max={50}
          step={1}
          onChange={setStepUp}
          suffix="% / yr"
        />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Invested" value={inrFormat.format(invested)} />
        <StatCard label="Wealth Gained" value={inrFormat.format(gained)} />
        <StatCard
          label="Estimated Value"
          value={inrFormat.format(fv)}
          accent
        />
      </div>

      {/* Chart */}
      <ProjectionChart data={projection} />
    </div>
  );
}
