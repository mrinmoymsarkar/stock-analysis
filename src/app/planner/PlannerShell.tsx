"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import SipCalculator from "@/components/planner/SipCalculator";
import LumpsumCalculator from "@/components/planner/LumpsumCalculator";
import GoalPlanner from "@/components/planner/GoalPlanner";

type Tab = "sip" | "lumpsum" | "goal";

const TABS: { id: Tab; label: string }[] = [
  { id: "sip", label: "SIP Calculator" },
  { id: "lumpsum", label: "Lumpsum" },
  { id: "goal", label: "Goal Planner" },
];

export default function PlannerShell() {
  const [activeTab, setActiveTab] = useState<Tab>("sip");

  return (
    <div className="bg-background min-h-screen text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium shrink-0"
            >
              ← Dashboard
            </Link>
            <h1 className="text-lg font-bold truncate">SIP &amp; Goal Planner</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Tab bar — matches TimeRangeSelector button-group style */}
        <div className="flex justify-center">
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === id
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
          {activeTab === "sip" && (
            <section aria-labelledby="sip-heading">
              <h2
                id="sip-heading"
                className="text-xl font-bold text-foreground mb-6"
              >
                SIP Calculator
              </h2>
              <SipCalculator />
            </section>
          )}
          {activeTab === "lumpsum" && (
            <section aria-labelledby="lumpsum-heading">
              <h2
                id="lumpsum-heading"
                className="text-xl font-bold text-foreground mb-6"
              >
                Lumpsum Calculator
              </h2>
              <LumpsumCalculator />
            </section>
          )}
          {activeTab === "goal" && (
            <section aria-labelledby="goal-heading">
              <h2
                id="goal-heading"
                className="text-xl font-bold text-foreground mb-6"
              >
                Goal Planner
              </h2>
              <GoalPlanner />
            </section>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground px-4">
          Projections assume constant returns; markets vary. Not investment advice.
        </p>
      </main>
    </div>
  );
}
