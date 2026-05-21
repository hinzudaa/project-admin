"use server";

import webpush, { PushSubscription as WebPushSubscription } from "web-push";
import fs from "fs";
import path from "path";

const VAPID_PUBLIC_KEY = "BLV1o4tOhCdKw-4MfOdDWpleIcyiV_Y8C6GXK23HaNnjnX_zN7ExxhWwCHrAZvUMOXLIx33bgbunAvM016Yv8hw";
const VAPID_PRIVATE_KEY = "VNA2L0o3ohPmsR1ZHPuU33tuI6_rq2XjuPzQaHYhCWg";

const SUBS_FILE = path.join(process.cwd(), ".push-subscriptions.json");

function loadSubscriptions(): Map<string, WebPushSubscription> {
    try {
        const raw = fs.readFileSync(SUBS_FILE, "utf-8");
        const entries: [string, WebPushSubscription][] = JSON.parse(raw);
        return new Map(entries);
    } catch {
        return new Map();
    }
}

function saveSubscriptions(map: Map<string, WebPushSubscription>) {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(Array.from(map.entries())));
}

export async function subscribeUser(sub: WebPushSubscription & { endpoint: string }) {
    const subs = loadSubscriptions();
    subs.set(sub.endpoint, sub);
    saveSubscriptions(subs);
    return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
    const subs = loadSubscriptions();
    subs.delete(endpoint);
    saveSubscriptions(subs);
    return { success: true };
}

export async function sendMembershipNotification(payload: {
    planTitle: string;
    userName: string;
    amount: number;
}) {
    const subs = loadSubscriptions();
    if (subs.size === 0) return { success: true };

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

    const entries = Array.from(subs.entries());
    const results = await Promise.allSettled(
        entries.map(([, sub]) => webpush.sendNotification(sub, message))
    );

    results.forEach((result, i) => {
        if (result.status === "rejected") {
            subs.delete(entries[i][0]);
        }
    });

    saveSubscriptions(subs);
    return { success: true };
}
