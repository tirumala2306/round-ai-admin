import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
        This page is not available
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        The address does not match an administration screen.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
