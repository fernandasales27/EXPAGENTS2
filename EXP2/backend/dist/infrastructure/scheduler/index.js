"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailDispatchScheduler = createEmailDispatchScheduler;
function parseBoolean(value, defaultValue) {
    if (value === undefined) {
        return defaultValue;
    }
    return value.toLowerCase() === 'true';
}
function parseDispatchTime(raw) {
    if (!raw) {
        return { hour: 23, minute: 59 };
    }
    const match = raw.match(/^(\d{2}):(\d{2})$/);
    if (!match) {
        return { hour: 23, minute: 59 };
    }
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return { hour: 23, minute: 59 };
    }
    return { hour, minute };
}
function calculateNextRun(now, time) {
    const next = new Date(now);
    next.setHours(time.hour, time.minute, 0, 0);
    if (next <= now) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}
function createEmailDispatchScheduler(service, env) {
    const enabled = parseBoolean(env.ENABLE_EMAIL_SCHEDULER, true);
    const dispatchTime = parseDispatchTime(env.EMAIL_DISPATCH_TIME);
    let timer;
    let stopped = false;
    async function runDispatch() {
        const date = new Date().toISOString().slice(0, 10);
        const result = await service.dispatchDaily(date);
        console.log(`[email-scheduler] Daily dispatch executed for ${date}. Processed batches: ${result.processed}.`);
    }
    function scheduleNextRun() {
        if (stopped || !enabled) {
            return;
        }
        const now = new Date();
        const nextRun = calculateNextRun(now, dispatchTime);
        const delay = nextRun.getTime() - now.getTime();
        timer = setTimeout(() => {
            void runDispatch()
                .catch((error) => {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`[email-scheduler] Dispatch failed: ${message}`);
            })
                .finally(() => {
                scheduleNextRun();
            });
        }, delay);
        timer.unref?.();
    }
    return {
        start() {
            if (!enabled) {
                console.log('[email-scheduler] Disabled by environment configuration.');
                return;
            }
            scheduleNextRun();
            console.log(`[email-scheduler] Enabled. Daily dispatch scheduled at ${String(dispatchTime.hour).padStart(2, '0')}:${String(dispatchTime.minute).padStart(2, '0')}.`);
        },
        stop() {
            stopped = true;
            if (timer) {
                clearTimeout(timer);
            }
        }
    };
}
