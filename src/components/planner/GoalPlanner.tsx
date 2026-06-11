"use client";

import { useMemo, useState } from "react";
import {
  lumpsumFutureValue,
  requiredSip,
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

export default function GoalPlanner() {
  const [targetAmount, setTargetAmount] = useState(1_00_00_000); // 1 Cr
  const [years, setYears] = useState(15);
  const [annualRate, setAnnualRate] = useState(12);
  const [currentSavings, setCurrentSavings] = useState(0);

  const months = years * 12;

  const { requiredSipAmount, savingsGrown, effectiveTarget, projection } =
    useMemo(() => {
      // Current savings grown as lumpsum over the horizon
      const savingsGrown =
        currentSavings > 0
          ? lumpsumFutureValue(currentSavings, annualRate, years)
          : 0;
      // Net target after existing savings contribute
      const effectiveTarget = Math.max(0, targetAmount - savingsGrown);
      // Required monthly SIP for the net target
      const requiredSipAmount =
        effectiveTarget > 0 ? requiredSip(effectiveTarget, annualRate, months) : 0;
      // Projection using the required SIP (no step-up since we solved for flat SIP)
      const projection = sipProjection(requiredSipAmount, annualRate, months);
      return { requiredSipAmount, savingsGrown, effectiveTarget, projection };
    }, [targetAmount, years, annualRate, currentSavings, months]);

  const totalToInvest = requiredSipAmount * months;

  return (
    <div className="flex flex-col gap-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <NumberField
          id="goal-target"
          label="Target Corpus"
          value={targetAmount}
          min={1_00_000}
          max={100_00_00_000}
          step={1_00_000}
          onChange={setTargetAmount}
          prefix="₹"
        />
        <NumberField
          id="goal-years"
          label="Time Horizon"
          value={years}
          min={1}
          max={40}
          step={1}
          onChange={setYears}
          suffix="years"
        />
        <NumberField
          id="goal-rate"
          label="Expected Annual Return"
          value={annualRate}
          min={1}
          max={30}
          step={0.5}
          onChange={setAnnualRate}
          suffix="%"
        />
        <NumberField
          id="goal-savings"
          label="Current Savings (optional)"
          value={currentSavings}
          min={0}
          max={10_00_00_000}
          step={10_000}
          onChange={setCurrentSavings}
          prefix="₹"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Target Corpus" value={inrFormat.format(targetAmount)} />
        {currentSavings > 0 && (
          <StatCard
            label="Savings Contribution"
            value={inrFormat.format(savingsGrown)}
            sub={`Grown from ${inrFormat.format(currentSavings)}`}
          />
        )}
        {currentSavings > 0 && (
          <StatCard
            label="SIP Needs to Cover"
            value={inrFormat.format(effectiveTarget)}
          />
        )}
        <StatCard
          label="Required Monthly SIP"
          value={inrFormat.format(requiredSipAmount)}
          accent
        />
        <StatCard
          label="Total SIP Investment"
          value={inrFormat.format(totalToInvest)}
          sub={`Over ${years} year${years !== 1 ? "s" : ""}`}
        />
      </div>

      {requiredSipAmount > 0 && <ProjectionChart data={projection} />}
    </div>
  );
}
