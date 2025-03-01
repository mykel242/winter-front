// Ensure API_URL is set from config-generated.js or fallback to default
const API_BASE_URL = window.API_URL;

console.log(`Using API URL: ${API_BASE_URL}`);

export default API_BASE_URL;
