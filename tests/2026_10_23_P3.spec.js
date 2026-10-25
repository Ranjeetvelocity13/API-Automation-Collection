import { test, expect } from "@playwright/test";
import { placePayload } from "../test-data/placePayload.js";
import { updatePlacePayload } from "../test-data/updatePlacePayload.js";
import { deletePlacePayload } from "../test-data/deletePlacePayload.js";


let placeID;

const apiKey = 'qaclick123';
const baseUrl = 'https://rahulshettyacademy.com/maps/api/place';

//POST, GET, PUT , GET, Delete, GET
//serial 

test.describe.serial("Google Map place API", () => {


    test("TC01 - Add Place", async ({ request }) => {

        const response = await request.post(`${baseUrl}/add/json`, {
            params: { //Query parameters to be sent with the URL.
                key: apiKey
            },
            data: placePayload
        });

        console.log("POST Status code :", response.status());
        console.log("POST Status text :", response.statusText());
        await expect(response.status()).toBe(200);

        //Parese reosne body

        const body = await response.json();
        console.log(body);

        expect(body.status).toBe("OK");

        expect(body).toHaveProperty("status");
        expect(body).toHaveProperty("place_id");
        expect(body).toHaveProperty("scope");
        expect(body).toHaveProperty("reference");

        placeID = body.place_id;
        console.log("Generated palce ID :", placeID);

        expect(placeID).toBeTruthy();
        console.log("CREATE validation passed");
    });

    //TC02 Read Place

    test("TC02 - Get Palce", async ({ request }) => {

        console.log("--".repeat(20));
        expect(placeID).toBeTruthy();

        const response = await request.get(`${baseUrl}/get/json`, {
            params: {
                key: apiKey,
                place_id: placeID
            }
        });

        console.log("GET Status code :", response.status());
        console.log("GET Status text :", response.statusText());
        await expect(response.status()).toBe(200);

        const body = await response.json();
        console.log(body);

        expect(body).toHaveProperty("name");
        expect(body).toHaveProperty("phone_number");
        expect(body).toHaveProperty("address");
        expect(body).toHaveProperty("language");

        expect(body.name).toBe('Playwright API Automation');

        expect(body.address).toBe('Latur');

        //validate values are not null

        expect(body.name).not.toBeNull();
        expect(body.address).not.toBeNull();

    });

    //PUT
    test("TC03 - Update Palce Address", async ({ request }) => {
        console.log("--".repeat(20));
        expect(placeID).toBeTruthy();

        const payload = updatePlacePayload(placeID, "Mumbai", apiKey);
        console.log(payload);
        const response = await request.put(`${baseUrl}/update/json`, {
            params: { //Query parameters to be sent with the URL.
                key: apiKey
            },
            data: payload
        });


        console.log("PUT Status code :", response.status());
        console.log("PUT Status text :", response.statusText());
        await expect(response.status()).toBe(200);

        const body = await response.json();
        console.log(body);

        expect(body).toHaveProperty('msg');
        expect(body.msg).toBe('Address successfully updated')

    });

    test("TC04 - Verify Updated Address", async ({ request }) => {

        console.log("--".repeat(20));
        expect(placeID).toBeTruthy();

        const response = await request.get(`${baseUrl}/get/json`, {
            params: {
                key: apiKey,
                place_id: placeID
            }
        });

        console.log("GET Status code :", response.status());
        console.log("GET Status text :", response.statusText());
        await expect(response.status()).toBe(200);

        const body = await response.json();
        console.log(body);

        expect(body).toHaveProperty("name");
        expect(body).toHaveProperty("phone_number");
        expect(body).toHaveProperty("address");
        expect(body).toHaveProperty("language");

        expect(body.name).toBe('Playwright API Automation');

        expect(body.address).toBe('Mumbai');

        //validate values are not null

        expect(body.name).not.toBeNull();
        expect(body.address).not.toBeNull();

    });
    //deleet

    test("TC05 - Delete Place", async ({ request }) => {

        console.log("--".repeat(20));
        expect(placeID).toBeTruthy();

        const payload = deletePlacePayload(placeID);
        const response = await request.delete(`${baseUrl}/delete/json`, {
            params: {
                key: apiKey,
            },
            data: payload
        });

        console.log("Delete Status code :", response.status());
        console.log("Delete Status text :", response.statusText());
        await expect(response.status()).toBe(200);

        const body = await response.json();
        console.log(body);
        expect(body).toHaveProperty("status");
        expect(body.status).toBe("OK");

    });

    test("TC06 - Verify deleted Place", async ({ request }) => {

        console.log("--".repeat(20));
        expect(placeID).toBeTruthy();

        const response = await request.get(`${baseUrl}/get/json`, {
            params: {
                key: apiKey,
                place_id: placeID
            }
        });

        console.log("GET Status code :", response.status());
        console.log("GET Status text :", response.statusText());
        await expect(response.status()).toBe(404);

        const body = await response.json();
        console.log(body);
    });
});
