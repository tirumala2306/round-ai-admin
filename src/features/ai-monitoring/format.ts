import { monitoringCurrency } from "@/features/ai-monitoring/catalog";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonitoringStamp(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!match) {
    return iso;
  }
  const month = months[Number(match[2]) - 1];
  if (!month) {
    return iso;
  }
  return `${month} ${Number(match[3])}, ${match[1]}, ${match[4]}:${match[5]} UTC`;
}

export function formatBucketDay(isoDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  const month = months[Number(match[2]) - 1];
  return month ? `${month} ${Number(match[3])}` : isoDate;
}

export function formatCount(value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatLatency(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "0 ms";
  }
  if (ms >= 1000) {
    const seconds = ms / 1000;
    return `${seconds.toFixed(seconds >= 10 ? 1 : 2)} s`;
  }
  return `${Math.round(ms)} ms`;
}

export function formatMoney(amount: number, currency = monitoringCurrency) {
  const symbol = currency === "USD" ? "$" : `${currency} `;
  const negative = amount < 0;
  const fixed = Math.abs(amount).toFixed(2);
  const [whole, fraction] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${symbol}${grouped}.${fraction}`;
}

export function formatCompact(value: number, money = false) {
  const prefix = money ? "$" : "";
  const absolute = Math.abs(value);
  if (absolute >= 1000) {
    return `${prefix}${(value / 1000).toFixed(1)}k`;
  }
  if (money) {
    return `${prefix}${value.toFixed(absolute >= 100 ? 0 : 2)}`;
  }
  return `${prefix}${Math.round(value)}`;
}

export function comparePeriods(current: number, previous: number) {
  if (previous === 0) {
    return {
      text: current === 0 ? "0.0% vs previous period" : "No prior sample",
      direction: current === 0 ? ("flat" as const) : ("none" as const),
    };
  }
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 0.05) {
    return { text: "0.0% vs previous period", direction: "flat" as const };
  }
  const sign = change > 0 ? "+" : "";
  return {
    text: `${sign}${change.toFixed(1)}% vs previous period`,
    direction: change > 0 ? ("up" as const) : ("down" as const),
  };
}
