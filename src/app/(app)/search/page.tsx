import { PageHeader } from "@/components/layout/page-header";
import { SearchClient } from "@/components/search/search-client";

export const metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Search" />
      <SearchClient />
    </div>
  );
}
