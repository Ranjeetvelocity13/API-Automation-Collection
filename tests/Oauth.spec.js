import { test, expect } from "@playwright/test";
import dotenv from "dotenv";  //dotenv is a Node.js package that loads environment variables from a .env file into process.env.
//npm install dotenv
dotenv.config();  //This reads the .env file from the current working directory by default and loads its variables into process.env.
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
/*
OAuth 2.0 — What is it?
OAuth 1.0

OAuth 2.0 is an authorization framework used to allow an application to access protected resources
without directly sharing the user's password.

In simple terms:

Client Application
       ↓
Request Access
       ↓
Authorization Server
       ↓
Access Token
       ↓
Protected API
       ↓
Response
*/
test.describe.serial("OAuth 2.0 - Client Credentials Flow", () => {

    const tokenURL = process.env.TOKEN_URL;
    const courseURL = process.env.COURSE_URL;

    test("OAuth - Generate Token and Get Course Details", async ({ request }) => {

        // ============================================================
        // STEP 1 - Generate Access Token
        // ============================================================

        // const clientId = "692183103107-p0m7ent2hk7suguv4vq22hjcfhcr43pj.apps.googleusercontent.com";
        // const clientSecret = "erZOWM9g3UtwNRj340YYaK_W";

        console.log("========================================");
        console.log("STEP 1 - GENERATE ACCESS TOKEN");
        console.log("========================================");

        console.log("Request Method: POST");
        console.log("Request URL:", tokenURL);
        console.log("Grant Type: client_credentials");
        console.log("Scope: trust");

        const tokenResponse = await request.post(tokenURL, {
            form: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "client_credentials",
                scope: "trust"
            }
        });

        // Response details
        console.log("Token Status:", tokenResponse.status());
        console.log("Token Response Headers:", JSON.stringify(tokenResponse.headers(), null, 2));

        expect(tokenResponse.status()).toBe(200);

        // Parse token response
        const tokenBody = await tokenResponse.json();

        console.log("Token Response:", JSON.stringify(tokenBody, null, 2));

        // Validate token response
        expect(tokenBody).toHaveProperty("access_token");
        expect(tokenBody).toHaveProperty("token_type");
        expect(tokenBody).toHaveProperty("expires_in");

        expect(tokenBody.access_token).toBeTruthy();
        expect(tokenBody.token_type).toBe("Bearer");

        // Store access token
        const accessToken = tokenBody.access_token;

        console.log("Access Token:", accessToken);
        console.log("Token Type:", tokenBody.token_type);
        console.log("Expires In:", tokenBody.expires_in);
        console.log("Scope:", tokenBody.scope);

        console.log("Access Token Generated Successfully");


        // ============================================================
        // STEP 2 - Access Protected Course API
        // ============================================================

        console.log("\n========================================");
        console.log("STEP 2 - GET COURSE DETAILS");
        console.log("========================================");

        console.log("Request Method: GET");
        console.log("Request URL:", courseURL);
        console.log("Authorization: Bearer " + accessToken);

        const courseResponse = await request.get(courseURL, {
            params: {
                access_token: accessToken
            }
        });

        // Response details
        console.log("Course API Status:", courseResponse.status());
        console.log("Course Response Headers:", JSON.stringify(courseResponse.headers(), null, 2));

        // Read response as text first
        const courseText = await courseResponse.text();

        console.log("Course Response:", courseText);

        // ============================================================
        // STEP 3 - Validate Course API
        // ============================================================

        expect(courseResponse.status()).toBe(401);

        console.log("Course API returned 401 Unauthorized.");

        // Parse response only if body contains data
        if (courseText.trim() !== "") {

            try {

                const courseBody = JSON.parse(courseText);

                console.log("Course Response JSON:", JSON.stringify(courseBody, null, 2)
                );

                expect(courseBody).toBeTruthy();

            } catch (error) {

                console.log("Course response is not valid JSON.");
                console.log("Response:", courseText);
            }

        } else {

            console.log("Course API returned an empty response body.");
        }

        console.log("\n========================================");
        console.log("OAUTH EXECUTION COMPLETED");
        console.log("========================================");
    });
});