// Verify keys are present
const BF_USER = process.env.BREWFATHER_USER_ID || "";
const BF_KEY = process.env.BREWFATHER_API_KEY || "";

// Helper for Basic Auth header
export function getAuthHeaders() {
    const authString = Buffer.from(`${BF_USER}:${BF_KEY}`).toString("base64");
    return {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
    };
}