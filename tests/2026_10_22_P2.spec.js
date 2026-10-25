// ============================================================
// CRUD API AUTOMATION USING PLAYWRIGHT
// CREATE | READ | UPDATE | DELETE
// ============================================================

import { test, expect } from "@playwright/test";

// Serial execution ensures that tests run in the declared order.
test.describe.serial("ReqRes API CRUD Test", () => {

    let userId;

    const baseURL = "https://reqres.in/api/users";

    const headers = {
        "Accept": "application/json",
        "x-api-key": "free_user_3DzSLfCJDjQBnmCwQpEIh1Pisbf"
    };

    // ========================================================
    // 1. GET - READ USERS
    // ========================================================

    test("GET - Validate users response", async ({ request }) => {

        const startTime = Date.now();

        const response = await request.get(`${baseURL}?page=2`, {
            headers
        });

        const endTime = Date.now();

        // Calculate API response time in milliseconds.
        const responseTime = endTime - startTime;

        console.log("Response Time:", responseTime, "ms");

        // Validate response time.
        expect(responseTime).toBeLessThan(2000);

        // Validate status code.
        expect(response.status()).toBe(200);

        // Deserialize JSON response into a JavaScript object.
        const body = await response.json();

        console.log("GET Response:", JSON.stringify(body, null, 2));

        // Validate response structure.
        expect(body).toHaveProperty("data");
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);

        // Validate first user.
        expect(body.data[0]).toHaveProperty("id");
        expect(body.data[0]).toHaveProperty("email");

        console.log("GET request validated successfully");
    });

    // ========================================================
    // 2. POST - CREATE USER
    // ========================================================

    test("POST - Create user", async ({ request }) => {

        const payload = {
            name: "Amit",
            job: "QA Automation Tester"
        };

        const response = await request.post(baseURL, {
            headers,
            data: payload //Allows to set post data of the request. If the data parameter is
            // an object, it will be serialized to json string and
        });

        console.log("POST Status:", response.status());

        // Validate HTTP status code.
        expect(response.status()).toBe(201);

        const body = await response.json();

        console.log(
            "POST Response:",
            JSON.stringify(body, null, 2)
        );

        // Validate response data.
        expect(body.name).toBe(payload.name);
        expect(body.job).toBe(payload.job);

        // Store created user ID for subsequent tests.
        expect(body.id).toBeTruthy();
        userId = body.id;

        console.log("Created User ID:", userId);
    });

    // ========================================================
    // 3. PUT - UPDATE USER
    // ========================================================

    test("PUT - Update user", async ({ request }) => {

        // Ensure the previous POST test created an ID.
        expect(userId).toBeTruthy();

        const payload = {
            name: "Virat",
            job: "Developer"
        };

        const response = await request.put(`${baseURL}/${userId}`, {
            headers,
            data: payload
        });

        console.log("PUT Status:", response.status());
        console.log("PUT Status Text:", response.statusText());

        expect(response.status()).toBe(200);

        const body = await response.json();

        console.log(
            "PUT Response:",
            JSON.stringify(body, null, 2)
        );

        expect(body.name).toBe(payload.name);
        expect(body.job).toBe(payload.job);

        // Validate that the response includes an update timestamp.
        expect(body).toHaveProperty("updatedAt");

        console.log("User updated successfully");
    });

    // ========================================================
    // 4. DELETE - DELETE USER
    // ========================================================

    test("DELETE - Delete user", async ({ request }) => {

        expect(userId).toBeTruthy();

        const response = await request.delete(`${baseURL}/${userId}`, {
            headers
        });

        console.log("DELETE Status:", response.status());
        console.log("DELETE Status Text:", response.statusText());

        // ReqRes normally returns 204 No Content for DELETE.
        expect(response.status()).toBe(204);

        console.log("Delete request completed successfully");
    });

});