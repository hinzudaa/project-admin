"use server";

import webpush, { PushSubscription as WebPushSubscription } from "web-push";

webpush.setVapidDetails(
    "mailto:tushig.l@bishrelt.mn",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

// In-memory store — survives for the lifetime of the server process.
// For multi-device or persistence across restarts, move to a database.
const subscriptions = new Map<string, WebPushSubscription>();

export async function subscribeUser(sub: WebPushSubscription & { endpoint: string }) {
    subscriptions.set(sub.endpoint, sub);
    return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
    subscriptions.delete(endpoint);
    return { success: true };
}

export async function sendMembershipNotification(payload: {
    planTitle: string;
    userName: string;
    amount: number;
}) {
    const message = JSON.stringify({
        title: "New Membership Purchase",
        body: `${payload.planTitle} • ${payload.userName} • ₮${payload.amount.toLocaleString()}`,
        icon: "/icon-192x192.png",
        url: "/admin",
    });

    const results = await Promise.allSettled(
        Array.from(subscriptions.values()).map((sub) =>
            webpush.sendNotification(sub, message)
        )
    );

    // Remove expired/invalid subscriptions
    const entries = Array.from(subscriptions.entries());
    results.forEach((result, i) => {
        if (result.status === "rejected") {
            subscriptions.delete(entries[i][0]);
        }
    });

    return { success: true };
}
