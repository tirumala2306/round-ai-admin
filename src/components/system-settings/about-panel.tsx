import { SettingsPanel } from "@/components/system-settings/settings-fields";
import { aboutProduct } from "@/features/system-settings/types";

const rows = [
  ["Product", aboutProduct.productName],
  ["Application version", aboutProduct.version],
  ["Environment", aboutProduct.environment],
  ["Build", aboutProduct.build],
  ["Copyright", aboutProduct.copyright],
] as const;

export function AboutPanel() {
  return (
    <SettingsPanel
      title="About & Version"
      description="Sample product information for this demonstration workspace."
    >
      <p className="mb-4 text-sm leading-6 text-muted-foreground">
        This label identifies the demo environment. It is not a production deployment record.
      </p>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-background px-3 py-3">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
            <dd className="mt-1 text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </SettingsPanel>
  );
}
