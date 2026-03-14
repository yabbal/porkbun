import { PorkbunError } from "./errors";

export interface CreateFetchOptions {
	baseURL: string;
	retry?: number;
	retryDelay?: number;
	retryStatusCodes?: number[];
}

export type FetchFn = <T = unknown>(
	path: string,
	options?: { method?: string; body?: Record<string, unknown> },
) => Promise<T>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const createFetch = (config: CreateFetchOptions): FetchFn => {
	const {
		baseURL,
		retry = 2,
		retryDelay = 500,
		retryStatusCodes = [408, 429, 500, 502, 503, 504],
	} = config;

	return async <T = unknown>(
		path: string,
		options?: { method?: string; body?: Record<string, unknown> },
	): Promise<T> => {
		const url = `${baseURL}/${path}`;
		const method = options?.method ?? "POST";
		const body = options?.body ? JSON.stringify(options.body) : undefined;

		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= retry; attempt++) {
			if (attempt > 0) {
				await sleep(retryDelay * attempt);
			}

			try {
				const response = await fetch(url, {
					method,
					headers: { "Content-Type": "application/json" },
					body,
				});

				const data = (await response.json()) as Record<string, unknown>;

				if (!response.ok || (data.status && data.status !== "SUCCESS")) {
					const message = (data.message as string) ?? response.statusText;

					if (attempt < retry && retryStatusCodes.includes(response.status)) {
						lastError = new PorkbunError(message, response.status, path, data);
						continue;
					}

					throw new PorkbunError(message, response.status, path, data);
				}

				return data as T;
			} catch (error) {
				if (error instanceof PorkbunError) throw error;
				lastError = error as Error;
				if (attempt === retry) break;
			}
		}

		throw lastError ?? new PorkbunError("Request failed", 0, path);
	};
};
