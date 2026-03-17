const coreServiceUrl = process.env.CORE_SERVICE_URL || `http://localhost:${process.env.CORE_PORT || 3000}`;
const healthUrl = new URL('/health', coreServiceUrl);
const retryCount = parseInt(process.env.CORE_STARTUP_RETRIES || '15', 10);
const retryDelayMs = parseInt(process.env.CORE_STARTUP_DELAY_MS || '1000', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastError;

for (let attempt = 1; attempt <= retryCount; attempt += 1) {
	try {
		const response = await fetch(healthUrl);

		if (!response.ok) {
			throw new Error(`Core health check failed with status ${response.status}`);
		}

		const data = await response.json();
		console.log('Core health check:', data);
		lastError = undefined;
		break;
	} catch (error) {
		lastError = error;

		if (attempt === retryCount) {
			throw error;
		}

		await sleep(retryDelayMs);
	}
}

if (lastError) {
	throw lastError;
}