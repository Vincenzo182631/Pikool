import Link from "next/link";
import { Map as MapIcon, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { IconButton } from "@/components/ui/icon-button";
import { FindCourt } from "@/components/court/find-court";

export const metadata = { title: "Find a Court" };

export default function CourtsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Find a Court"
        action={
          <div className="flex items-center gap-2">
            <IconButton asChild aria-label="Map view">
              <Link href="/map">
                <MapIcon className="size-[18px]" strokeWidth={1.8} />
              </Link>
            </IconButton>
            <IconButton asChild variant="dark" aria-label="Add a court">
              <Link href="/courts/new">
                <Plus className="size-[18px]" strokeWidth={1.8} />
              </Link>
            </IconButton>
          </div>
        }
      />
      <FindCourt />
    </div>
  );
}
