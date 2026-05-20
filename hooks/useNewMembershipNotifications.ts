"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { financeApi } from "@/apis";
import { sendMembershipNotification } from "@/app/admin/actions";

export function useNewMembershipNotifications() {
    const lastSeenIdRef = useRef<string | null>(null);
    const isFirstLoadRef = useRef(true);

    const { data } = useSWR(
        "membership-notifications",
        () => financeApi.getList({ source: "membership", limit: 5 }),
        { refreshInterval: 30_000 }
    );

    useEffect(() => {
        if (!data?.data?.length) return;

        if (isFirstLoadRef.current) {
            lastSeenIdRef.current = data.data[0]._id;
            isFirstLoadRef.current = false;
            return;
        }

        const lastSeenIndex = data.data.findIndex(e => e._id === lastSeenIdRef.current);
        const newEntries = lastSeenIndex === -1 ? [data.data[0]] : data.data.slice(0, lastSeenIndex);

        if (newEntries.length > 0) {
            lastSeenIdRef.current = data.data[0]._id;
            newEntries.forEach(entry => {
                const planTitle = entry.membership?.planTitle ?? "Unknown plan";
                const userName = entry.user?.name || entry.user?.username || "Unknown";
                const amount = entry.amount;

                // In-browser toast
                toast.success(
                    `New membership: ${planTitle} • ${userName} • ₮${amount.toLocaleString()}`,
                    { duration: 7000 }
                );

                // Mobile push notification
                sendMembershipNotification({ planTitle, userName, amount });
            });
        }
    }, [data]);
}
