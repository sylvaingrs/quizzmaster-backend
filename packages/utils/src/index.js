const response = await fetch(`${process.env.CORE_SERVICE_URL}/health`);
const data = await response.json();
console.log('Core health check:', data);
