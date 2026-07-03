import { ShiftInputPage } from "@/components/shifts/ShiftInputPage";

export default async function ShiftInputRoute({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialDate = typeof params.date === "string" ? params.date : null;

  return <ShiftInputPage initialDate={initialDate} />;
}
