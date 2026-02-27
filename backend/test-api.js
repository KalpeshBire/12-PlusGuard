const axios = require('axios');

async function testApi() {
    try {
        console.log("1. Registering new test user...");
        const registerRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: "Test User",
            email: "test@example.com",
            password: "password123"
        });
        const token = registerRes.data.token;
        console.log("Registration successful. Token acquired.");

        console.log("2. Fetching monitors without token...");
        try {
            await axios.get('http://localhost:5000/api/monitors');
        } catch (e) {
            console.log("   Successfully blocked unauthorized access (expected).");
        }

        console.log("3. Creating a new advanced monitor...");
        const createRes = await axios.post('http://localhost:5000/api/monitors', {
            name: "Google Search Test",
            url: "https://www.google.com",
            interval: 1,
            enabled: true,
            httpMethod: "GET",
            expectedStatusCode: 200
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        console.log("Monitor Created:");
        console.log(createRes.data);

        console.log("4. Fetching monitors...");
        const getRes = await axios.get('http://localhost:5000/api/monitors', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Fetched Monitors:");
        console.log(getRes.data);

        console.log("All tests completed successfully.");
    } catch(err) {
        console.error("Test failed:", err?.response?.data || err.message);
    }
}

testApi();
