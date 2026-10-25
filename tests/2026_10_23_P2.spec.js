
import { test, expect } from "@playwright/test";

// ============================================================
// Google Maps Place API - CRUD Operations
// ============================================================

// Store the place ID generated during the POST request.
// The same ID will be used for GET, PUT, and DELETE requests.
let placeID;

const apiKey = "qaclick123";
const baseUrl = "https://rahulshettyacademy.com/maps/api/place";

// Test execution sequence:
// POST -> GET -> PUT -> GET -> DELETE -> GET

// serial ensures that tests execute in order because
// each test depends on the place created by TC01.
test.describe.serial("Google Maps Place API", () => {

    // ========================================================
    // TC01 - Add Place (POST)
    // ========================================================

    test("TC01 - Add Place", async ({ request }) => {

        // Request payload: JavaScript object containing place details.
        const payload = {
            location: {
                lat: -38.383494,
                lng: 33.427362
            },
            accuracy: 1000,
            name: "Playwright API Automation",
            phone_number: "(+91) 5687654567",
            address: "Latur",
            types: [
                "Playwright",
                "Javascript"
            ],
            website: "http://google.com",
            language: "English-IN"
        };

        // Send POST request to create a new place.
        // params adds the API key as a query parameter.
        // data sends the payload in the request body.
        const response = await request.post(`${baseUrl}/add/json`, {
            params: {
                key: apiKey
            },
            data: payload
        });

        // Validate HTTP response status.
        console.log("POST Status Code:", response.status());
        console.log("POST Status Text:", response.statusText());

        expect(response.status()).toBe(200);

        // Parse the JSON response into a JavaScript object.
        const body = await response.json();
        console.log("POST Response:", body);

        // Validate the response status and required properties.
        expect(body.status).toBe("OK");
        expect(body).toHaveProperty("place_id");
        expect(body).toHaveProperty("scope");
        expect(body).toHaveProperty("reference");

        // Store the generated place ID for subsequent tests.
        placeID = body.place_id;

        // Verify that the place ID was returned.
        expect(placeID).toBeTruthy();

        console.log("Generated Place ID:", placeID);
        console.log("CREATE validation passed");
    });


    // ========================================================
    // TC02 - Get Place (GET)
    // ========================================================

    test("TC02 - Get Place", async ({ request }) => {

        console.log("-".repeat(50));

        // Confirm that TC01 generated a place ID.
        expect(placeID).toBeTruthy();

        // Retrieve the place using its ID.
        const response = await request.get(`${baseUrl}/get/json`, {
            params: {
                key: apiKey,
                place_id: placeID
            }
        });

        console.log("GET Status Code:", response.status());
        console.log("GET Status Text:", response.statusText());

        expect(response.status()).toBe(200);

        // Deserialize the JSON response.
        const body = await response.json();
        console.log("GET Response:", body);

        // Validate required response properties.
        expect(body).toHaveProperty("name");
        expect(body).toHaveProperty("phone_number");
        expect(body).toHaveProperty("address");
        expect(body).toHaveProperty("language");

        // Validate the actual values.
        expect(body.name).toBe("Playwright API Automation");
        expect(body.address).toBe("Latur");

        // Verify that values are not null or undefined.
        expect(body.name).not.toBeNull();
        expect(body.address).not.toBeNull();

        console.log("READ validation passed");
    });


    // ========================================================
    // TC03 - Update Place Address (PUT)
    // ========================================================

    test("TC03 - Update Place Address", async ({ request }) => {

        console.log("-".repeat(50));

        expect(placeID).toBeTruthy();

        const newAddress = "Mumbai";

        // Update the existing place address.
        const response = await request.put(`${baseUrl}/update/json`, {
            params: {
                key: apiKey
            },
            data: {
                place_id: placeID,
                address: newAddress
            }
        });

        console.log("PUT Status Code:", response.status());
        console.log("PUT Status Text:", response.statusText());

        expect(response.status()).toBe(200);

        // Parse and validate the update response.
        const body = await response.json();
        console.log("PUT Response:", body);

        expect(body).toHaveProperty("msg");
        expect(body.msg).toBe("Address successfully updated");

        console.log("UPDATE validation passed");
    });


    // ========================================================
    // TC04 - Verify Updated Address (GET)
    // ========================================================

    test("TC04 - Verify Updated Address", async ({ request }) => {

        console.log("-".repeat(50));

        expect(placeID).toBeTruthy();

        // Fetch the place again to verify the update.
        const response = await request.get(`${baseUrl}/get/json`, {
            params: {
                key: apiKey,
                place_id: placeID
            }
        });

        console.log("GET Status Code:", response.status());
        console.log("GET Status Text:", response.statusText());

        expect(response.status()).toBe(200);

        const body = await response.json();
        console.log("GET Response:", body);

        // Confirm that the name remains unchanged.
        expect(body.name).toBe("Playwright API Automation");

        // Confirm that the address has been updated.
        expect(body.address).toBe("Mumbai");

        expect(body).toHaveProperty("phone_number");
        expect(body).toHaveProperty("language");

        console.log("UPDATED ADDRESS validation passed");
    });


    // ========================================================
    // TC05 - Delete Place (DELETE)
    // ========================================================

    test("TC05 - Delete Place", async ({ request }) => {

        console.log("-".repeat(50));

        expect(placeID).toBeTruthy();

        // Delete the place using its ID.
        const response = await request.delete(`${baseUrl}/delete/json`, {
            params: {
                key: apiKey
            },
            data: {
                place_id: placeID
            }
        });

        console.log("DELETE Status Code:", response.status());
        console.log("DELETE Status Text:", response.statusText());

        expect(response.status()).toBe(200);

        const body = await response.json();
        console.log("DELETE Response:", body);

        // Validate the delete confirmation.
        expect(body).toHaveProperty("status");
        expect(body.status).toBe("OK");

        console.log("DELETE validation passed");
    });


    // ========================================================
    // TC06 - Verify Deleted Place (GET)
    // ========================================================

    test("TC06 - Verify Deleted Place", async ({ request }) => {

        console.log("-".repeat(50));

        expect(placeID).toBeTruthy();

        // Attempt to retrieve the deleted place.
        const response = await request.get(`${baseUrl}/get/json`, {
            params: {
                key: apiKey,
                place_id: placeID
            }
        });

        console.log("GET Status Code:", response.status());
        console.log("GET Status Text:", response.statusText());

        // Verify the expected status after deletion.
        expect(response.status()).toBe(404);

        // Read the error response only if the API returns JSON.
        const body = await response.json();
        console.log("GET Response After Delete:", body);

        console.log("DELETE verification completed");
    });

});
