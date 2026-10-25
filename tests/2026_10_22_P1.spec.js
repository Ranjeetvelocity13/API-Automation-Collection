import { test, expect } from '@playwright/test';

// ============================================================
// GET API - COMPLETE RESPONSE VALIDATION
// ============================================================

test("Get Users - Complete Response Validation", async ({ request }) => {

    // --------------------------------------------------------
    // 1. Send GET request
    // --------------------------------------------------------

    const response = await request.get(
        'https://reqres.in/api/users?page=2',
        {
            headers: {
                "Accept": "application/json",
                "x-api-key": "free_user_3DzSLfCJDjQBnmCwQpEIh1Pisbf"
            }
        }
    );

    // --------------------------------------------------------
    // 2. Validate status code
    // --------------------------------------------------------

    expect(response.status()).toBe(200);

    // Validate response content type
    expect(response.headers()['content-type']).toContain('application/json');

    // --------------------------------------------------------
    // 3. Deserialize JSON response
    // --------------------------------------------------------

    const body = await response.json();

    console.log("API Response Object:");
    console.log(body);

    // --------------------------------------------------------
    // 4. Serialize object into a JSON string
    // --------------------------------------------------------

    console.log("-".repeat(50));

    // JSON.stringify() converts a JavaScript object into a JSON string.
    console.log(JSON.stringify(body, null, 2));

    // --------------------------------------------------------
    // 5. Validate response structure
    // --------------------------------------------------------

    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('per_page');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('total_pages');
    expect(body).toHaveProperty('data');

    // Validate data array
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);

    // --------------------------------------------------------
    // 6. Validate first user object
    // --------------------------------------------------------

    const firstUser = body.data[0];

    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('first_name');
    expect(firstUser).toHaveProperty('last_name');
    expect(firstUser).toHaveProperty('avatar');

    // --------------------------------------------------------
    // 7. Validate data types
    // --------------------------------------------------------

    expect(typeof firstUser.id).toBe('number');
    expect(typeof firstUser.email).toBe('string');
    expect(typeof firstUser.first_name).toBe('string');
    expect(typeof firstUser.last_name).toBe('string');
    expect(typeof firstUser.avatar).toBe('string');

    // --------------------------------------------------------
    // 8. Validate email
    // --------------------------------------------------------

    expect(firstUser.email).toContain('@reqres.in');

    // --------------------------------------------------------
    // 9. Validate required values
    // --------------------------------------------------------

    expect(firstUser.id).toBeGreaterThan(0);
    expect(firstUser.first_name.length).toBeGreaterThan(0);
    expect(firstUser.last_name.length).toBeGreaterThan(0);

    // --------------------------------------------------------
    // 10. Print first user
    // --------------------------------------------------------

    console.log("-".repeat(50));
    console.log("First User Details:");
    console.log(firstUser);
});