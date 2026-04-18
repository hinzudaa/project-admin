"use client";

import { use } from "react";
import useSWR from "swr";
import GameZoneForm from "@/components/admin/GameZoneForm";
import { Loader2 } from "lucide-react";
import { gameZoneApi } from "@/apis/game-zone";

export default function EditGameZonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useSWR(id ? ["game-zone", id] : null, () =>
    gameZoneApi.getGameZoneDetail(id)
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-gray-500 animate-pulse">Loading game zone details...</p>
      </div>
    );
  }

  return <GameZoneForm id={id} initialData={data?.data} />;
}
