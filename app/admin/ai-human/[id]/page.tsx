"use client";


import useSWR from "swr";
import { useParams } from "next/navigation";
import { aiHumanApi } from "@/apis";
import AIHumanForm from "@/components/admin/AIHumanForm";
import { Loader2 } from "lucide-react";

export default function EditAIHumanPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useSWR(id ? ["ai-human", id] : null, () =>
    aiHumanApi.getAIHuman(id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-gray-500 animate-pulse font-medium">Fetching persona data...</p>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Not Found</h2>
        <p className="text-gray-500">The AI Human you are looking for does not exist.</p>
      </div>
    );
  }

  return <AIHumanForm id={id} initialData={data.data} />;
}
