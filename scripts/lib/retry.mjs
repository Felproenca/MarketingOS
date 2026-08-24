export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isRetryable(error) {
  const status = Number(error?.status || error?.statusCode || 0);
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500 || error?.retryable === true || /timeout|aborted|aborterror/i.test(String(error?.message || error));
}

export async function withRetry(task, { attempts = 3, timeoutMs = 120000, baseDelayMs = 1000, onRetry } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs);
    try {
      const result = await Promise.race([
        task({ attempt, signal: controller.signal }),
        new Promise((_, reject) => controller.signal.addEventListener('abort', () => reject(controller.signal.reason), { once: true })),
      ]);
      return result;
    } catch (error) {
      lastError = error;
      if (attempt >= attempts || !isRetryable(error)) throw error;
      const delay = baseDelayMs * (2 ** (attempt - 1)) + Math.floor(Math.random() * 250);
      await onRetry?.({ attempt, delay, error });
      await sleep(delay);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}
