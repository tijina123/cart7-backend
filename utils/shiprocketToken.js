const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external";// Ensure this is in your .env

let authToken = null;

async function getAuthToken() {
    if (authToken) return authToken; // Reuse token if available

    try {
        const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
            email: SHIPROCKET_EMAIL,
            password: SHIPROCKET_PASSWORD,
        });

        authToken = response.data.token;
        return authToken;
    } catch (error) {
        console.error("Error getting Shiprocket token:", error.response?.data || error.message);
    }
}
module.exports = { getAuthToken };