import type { Metadata } from "next";
import PlannerShell from "./PlannerShell";

export const metadata: Metadata = {
  title: "SIP & Goal Planner | Indian Stock Market Dashboard",
  description:
    "Plan your SIP investments and financial goals with projections for the Indian market.",
};

export default function PlannerPage() {
  return <PlannerShell />;
}
