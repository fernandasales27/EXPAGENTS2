import type { EmailDispatchService } from '../../modules/emails/email-dispatch.service';

interface DispatchTime {
	hour: number;
	minute: number;
}

export interface EmailDispatchScheduler {
	start(): void;
	stop(): void;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
	if (value === undefined) {
		return defaultValue;
	}

	return value.toLowerCase() === 'true';
}

function parseDispatchTime(raw: string | undefined): DispatchTime {
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

function calculateNextRun(now: Date, time: DispatchTime): Date {
	const next = new Date(now);
	next.setHours(time.hour, time.minute, 0, 0);

	if (next <= now) {
		next.setDate(next.getDate() + 1);
	}

	return next;
}

export function createEmailDispatchScheduler(
	service: EmailDispatchService,
	env: NodeJS.ProcessEnv
): EmailDispatchScheduler {
	const enabled = parseBoolean(env.ENABLE_EMAIL_SCHEDULER, true);
	const dispatchTime = parseDispatchTime(env.EMAIL_DISPATCH_TIME);

	let timer: NodeJS.Timeout | undefined;
	let stopped = false;

	async function runDispatch(): Promise<void> {
		const date = new Date().toISOString().slice(0, 10);
		const result = await service.dispatchDaily(date);
		console.log(
			`[email-scheduler] Daily dispatch executed for ${date}. Processed batches: ${result.processed}.`
		);
	}

	function scheduleNextRun(): void {
		if (stopped || !enabled) {
			return;
		}

		const now = new Date();
		const nextRun = calculateNextRun(now, dispatchTime);
		const delay = nextRun.getTime() - now.getTime();

		timer = setTimeout(() => {
			void runDispatch()
				.catch((error: unknown) => {
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
		start(): void {
			if (!enabled) {
				console.log('[email-scheduler] Disabled by environment configuration.');
				return;
			}

			scheduleNextRun();
			console.log(
				`[email-scheduler] Enabled. Daily dispatch scheduled at ${String(dispatchTime.hour).padStart(2, '0')}:${String(dispatchTime.minute).padStart(2, '0')}.`
			);
		},
		stop(): void {
			stopped = true;
			if (timer) {
				clearTimeout(timer);
			}
		}
	};
}
