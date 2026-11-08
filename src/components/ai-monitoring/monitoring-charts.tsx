"use client";

import { formatCompact } from "@/features/ai-monitoring/format";
import { cn } from "@/lib/utils";

export type ChartSeries = {
  id: string;
  label: string;
  color: string;
  values: number[];
};

export function MonitoringLineChart({
  labels,
  series,
  ariaLabel,
  money = false,
  formatValue,
}: {
  labels: string[];
  series: ChartSeries[];
  ariaLabel: string;
  money?: boolean;
  formatValue?: (value: number) => string;
}) {
  const width = 640;
  const height = 228;
  const pad = { top: 16, right: 16, bottom: 32, left: 48 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const max = Math.max(1, ...series.flatMap((item) => item.values));
  const ticks = [max, max / 2, 0];
  const labelStep = labels.length > 12 ? Math.ceil(labels.length / 6) : 1;

  function xAt(index: number) {
    if (labels.length <= 1) {
      return pad.left + innerWidth / 2;
    }
    return pad.left + (index / (labels.length - 1)) * innerWidth;
  }

  function yAt(value: number) {
    return pad.top + innerHeight - (value / max) * innerHeight;
  }

  const display = formatValue ?? ((value: number) => formatCompact(value, money));

  return (
    <figure className="min-w-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="h-auto w-full"
      >
        {ticks.map((tick) => {
          const y = yAt(tick);
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1"
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px]"
              >
                {display(tick)}
              </text>
            </g>
          );
        })}
        {series.map((item) => {
          const points = item.values
            .map((value, index) => `${xAt(index)},${yAt(value)}`)
            .join(" ");
          return (
            <g key={item.id}>
              <polyline
                fill="none"
                stroke={item.color}
                strokeWidth="2.25"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={points}
              />
              {item.values.map((value, index) =>
                labels.length > 16 ? null : (
                  <circle key={`${item.id}-${index}`} cx={xAt(index)} cy={yAt(value)} r="2.5" fill={item.color} />
                ),
              )}
            </g>
          );
        })}
        {labels.map((label, index) =>
          index % labelStep === 0 ? (
            <text
              key={`${label}-${index}`}
              x={xAt(index)}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {label}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {series.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function MonitoringBars({
  items,
  selectedId,
  valueLabel,
  onSelect,
}: {
  items: {
    id: string;
    label: string;
    value: number;
    detail: string;
  }[];
  selectedId?: string;
  valueLabel: (value: number) => string;
  onSelect?: (id: string) => void;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No sample requests in this view.</p>;
  }

  return (
    <ul className="grid gap-2">
      {items.map((item) => {
        const selected = selectedId === item.id;
        const width = `${Math.max(item.value === 0 ? 0 : 2, (item.value / max) * 100)}%`;
        const content = (
          <>
            <span className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium">{item.label}</span>
              <span className="shrink-0 text-sm tabular-nums">{valueLabel(item.value)}</span>
            </span>
            <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-muted">
              <span
                className={cn("block h-full rounded-full", selected ? "bg-brand" : "bg-foreground")}
                style={{ width }}
              />
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">{item.detail}</span>
          </>
        );

        return (
          <li key={item.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={selected}
                className={cn(
                  "w-full rounded-md px-2 py-1.5 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  selected && "bg-accent",
                )}
              >
                {content}
              </button>
            ) : (
              <div className="px-2 py-1.5">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ChartEmpty() {
  return <p className="text-sm text-muted-foreground">No sample requests in this view.</p>;
}
