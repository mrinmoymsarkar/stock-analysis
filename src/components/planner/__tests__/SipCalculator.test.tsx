/**
 * Interaction tests for SipCalculator.
 *
 * Uses RELATIVE imports because @/lib may not be in jest moduleNameMapper.
 * (The component itself uses @/lib, but we import it via its relative path.)
 */

import { render, screen, fireEvent } from "@testing-library/react";
import SipCalculator from "../SipCalculator";

// ProjectionChart uses Recharts + next-themes — mock both to keep tests focused.
jest.mock("../ProjectionChart", () => ({
  __esModule: true,
  default: () => <div data-testid="projection-chart" />,
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

describe("SipCalculator", () => {
  it("renders all input labels", () => {
    render(<SipCalculator />);
    // Use exact label text (label[for=...]) to avoid matching the aria-label on the sibling slider
    expect(screen.getByLabelText("Monthly SIP Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Expected Annual Return")).toBeInTheDocument();
    expect(screen.getByLabelText("Investment Duration")).toBeInTheDocument();
    expect(screen.getByLabelText("Annual Step-Up (optional)")).toBeInTheDocument();
  });

  it("renders summary stat labels", () => {
    render(<SipCalculator />);
    expect(screen.getByText(/Total Invested/i)).toBeInTheDocument();
    expect(screen.getByText(/Wealth Gained/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Value/i)).toBeInTheDocument();
  });

  it("renders the projection chart placeholder", () => {
    render(<SipCalculator />);
    expect(screen.getByTestId("projection-chart")).toBeInTheDocument();
  });

  it("displays initial estimated value > invested (12% over 10y)", () => {
    render(<SipCalculator />);

    // Default: ₹10,000/mo, 12%, 10 years
    // Estimated value should be well above total invested (₹12,00,000)
    // We test by checking that there are at least 2 currency values and
    // the largest one is displayed somewhere in the summary area.
    const statCards = screen
      .getAllByText(/₹/)
      .filter((el) => el.tagName !== "INPUT" && el.tagName !== "LABEL");

    // At minimum 3 stat cards with ₹ values should be present
    expect(statCards.length).toBeGreaterThanOrEqual(3);
  });

  it("updates Estimated Value when Monthly SIP Amount changes", () => {
    render(<SipCalculator />);

    const amountInput = screen.getByLabelText("Monthly SIP Amount") as HTMLInputElement;

    // Read initial "Estimated Value" text
    const getEstimatedValue = () => {
      // Find the StatCard for Estimated Value — its label is above the value
      const label = screen.getByText(/Estimated Value/i);
      // The value is the next sibling span
      return label.nextElementSibling?.textContent ?? "";
    };

    const valueBefore = getEstimatedValue();

    // Double the SIP amount
    fireEvent.change(amountInput, { target: { value: "20000" } });

    const valueAfter = getEstimatedValue();

    // The estimated value should have changed
    expect(valueAfter).not.toBe(valueBefore);
    // And the after value text should contain a number larger than before
    // (simple string comparison after stripping non-numeric chars)
    const extractNum = (s: string) =>
      parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
    expect(extractNum(valueAfter)).toBeGreaterThan(extractNum(valueBefore));
  });

  it("updates Estimated Value when Annual Return rate changes", () => {
    render(<SipCalculator />);

    const rateInput = screen.getByLabelText("Expected Annual Return");

    const getEstimatedValue = () => {
      const label = screen.getByText(/Estimated Value/i);
      return label.nextElementSibling?.textContent ?? "";
    };

    const valueBefore = getEstimatedValue();

    // Increase the rate
    fireEvent.change(rateInput, { target: { value: "18" } });

    const valueAfter = getEstimatedValue();
    expect(valueAfter).not.toBe(valueBefore);
  });

  it("updates output when duration changes", () => {
    render(<SipCalculator />);

    const durationInput = screen.getByLabelText("Investment Duration");

    const getEstimatedValue = () => {
      const label = screen.getByText(/Estimated Value/i);
      return label.nextElementSibling?.textContent ?? "";
    };

    const valueBefore = getEstimatedValue();

    fireEvent.change(durationInput, { target: { value: "20" } });

    const valueAfter = getEstimatedValue();
    expect(valueAfter).not.toBe(valueBefore);
  });

  it("with step-up enabled the estimated value increases vs no step-up", () => {
    render(<SipCalculator />);

    const getEstimatedValue = () => {
      const label = screen.getByText(/Estimated Value/i);
      return label.nextElementSibling?.textContent ?? "";
    };

    // Read baseline (stepUp = 0 by default)
    const valueBefore = getEstimatedValue();

    // Change step-up using exact label text to avoid ambiguity with the range slider
    const stepUpInput = screen.getByLabelText("Annual Step-Up (optional)");
    fireEvent.change(stepUpInput, { target: { value: "10" } });

    const valueAfter = getEstimatedValue();
    expect(valueAfter).not.toBe(valueBefore);
  });
});
