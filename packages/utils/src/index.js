const response = await fetch(`http://localhost:${process.env.CORE_PORT || 3000}/health`);
const data = await response.json();
console.log('Core health check:', data);