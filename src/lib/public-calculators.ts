export type PublicCalculatorType = "real-estate-yield" | "marketing-roi";

export function isPublicCalculatorType(value: string): value is PublicCalculatorType {
  return value === "real-estate-yield" || value === "marketing-roi";
}

function toNumber(value: string | number | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function percent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function buildPublicCalculatorTitle(type: PublicCalculatorType) {
  return type === "real-estate-yield" ? "Real Estate Yield" : "Marketing ROI";
}

export function computePublicCalculator(
  type: PublicCalculatorType,
  inputs: Record<string, string | number>
) {
  if (type === "real-estate-yield") {
    const purchasePrice = toNumber(inputs.purchase_price);
    const monthlyRent = toNumber(inputs.monthly_rent);
    const annualCosts = toNumber(inputs.annual_costs);
    const annualIncome = monthlyRent * 12;
    const netAnnualIncome = annualIncome - annualCosts;
    const capRate = purchasePrice > 0 ? (netAnnualIncome / purchasePrice) * 100 : 0;

    return {
      title: buildPublicCalculatorTitle(type),
      summary: `Cap rate: ${percent(capRate)}`,
      rows: [
        ["Purchase price", money(purchasePrice)],
        ["Annual income", money(annualIncome)],
        ["Annual costs", money(annualCosts)],
        ["Net annual income", money(netAnnualIncome)],
        ["Cap rate", percent(capRate)],
      ],
    };
  }

  const spend = toNumber(inputs.marketing_spend);
  const revenue = toNumber(inputs.marketing_revenue);
  const profit = revenue - spend;
  const roi = spend > 0 ? (profit / spend) * 100 : 0;

  return {
    title: buildPublicCalculatorTitle(type),
    summary: `ROI: ${percent(roi)}`,
    rows: [
      ["Marketing spend", money(spend)],
      ["Revenue from campaign", money(revenue)],
      ["Net return", money(profit)],
      ["ROI", percent(roi)],
    ],
  };
}
