"use server";

import webpush, { PushSubscription as WebPushSubscription } from "web-push";

const VAPID_PUBLIC_KEY = "BLV1o4tOhCdKw-4MfOdDWpleIcyiV_Y8C6GXK23HaNnjnX_zN7ExxhWwCHrAZvUMOXLIx33bgbunAvM016Yv8hw";
const VAPID_PRIVATE_KEY = "VNA2L0o3ohPmsR1ZHPuU33tuI6_rq2XjuPzQaHYhCWg";

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
    if (subscriptions.size === 0) return { success: true };

    webpush.setVapidDetails(
        "mailto:tushig.l@bishrelt.mn",
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );

    const message = JSON.stringify({
        title: "New Membership Purchase",
        body: `${payload.planTitle} • ${payload.userName} • ₮${payload.amount.toLocaleString()}`,
        icon: "/icon-192x192.png",
        url: "/admin",
    });

    const entries = Array.from(subscriptions.entries());
    const results = await Promise.allSettled(
        entries.map(([, sub]) => webpush.sendNotification(sub, message))
    );

    results.forEach((result, i) => {
        if (result.status === "rejected") {
            subscriptions.delete(entries[i][0]);
        }
    });

    return { success: true };
}
