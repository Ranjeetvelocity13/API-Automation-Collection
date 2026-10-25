
import { test, expect } from "@playwright/test";
import { addBookPayload, deleteBookPayload } from "../test-data/LibraryPayload";

// ======================================================
// LIBRARY API OPERATIONS
// ======================================================

test.describe.serial("Library API Operations", () => {

    const baseURL = "https://rahulshettyacademy.com/Library";

    // Generate unique test data
    const uniqueId = Date.now();

    const isbn = `isbn${uniqueId}`;
    const aisle = `${Math.floor(1000 + Math.random() * 9000)}`;
    const bookName = `Playwright Automation ${uniqueId}`;
    const authorName = `Virat ${uniqueId}`;
    const bookId = isbn + aisle;

    // ==================================================
    // TC01 - Add Book
    // ==================================================

    test("TC01 - Add Book", async ({ request }) => {

        // Prepare request payload
        const payload = addBookPayload(
            isbn,
            aisle,
            bookName,
            authorName
        );

        console.log("Request Payload:", payload);

        // Send POST request
        const response = await request.post(`${baseURL}/Addbook.php`, {
            headers: {
                "Content-Type": "application/json"
            },
            data: payload
        });

        console.log("POST Status:", response.status());

        // Validate HTTP status
        expect(response.status()).toBe(200);

        // Parse JSON response
        const body = await response.json();
        console.log("Response Body:", body);

        // Validate response data
        expect(body).toHaveProperty("ID");
        expect(body.ID).toBe(bookId);

        console.log("Book Created:", body.ID);
        console.log("Book Name:", bookName);
        console.log("Author Name:", authorName);
    
    

    });


    // ==================================================
    // TC02 - Get Book
    // ==================================================

    test("TC02 - Get Book", async ({ request }) => {

        // Send GET request using the generated Book ID
        const response = await request.get(`${baseURL}/GetBook.php`, {
            params: {
                ID: bookId
            }
        });

        console.log("GET Status:", response.status());

        // Parse the response body only once
        const body = await response.json();
        console.log("Response Body:", body);

        // Validate HTTP status
        expect(response.status()).toBe(200);

        // Validate that the returned book exists
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);

        // Validate book details
        expect(body[0].book_name).toBe(bookName);
        expect(body[0].isbn).toBe(isbn);
        expect(String(body[0].aisle)).toBe(aisle);

        console.log("Book Name:", body[0].book_name);
        console.log("ISBN:", body[0].isbn);
        console.log("Aisle:", body[0].aisle);
    });


    // ============================================================
    // TC03 - DELETE BOOK
    // ============================================================

    test("TC03 - Delete Book", async ({ request }) => {

        // 1. Prepare the delete request payload using the Book ID
        const payload = deleteBookPayload(bookId);

        console.log("DELETE Payload:", JSON.stringify(payload, null, 2));

        // 2. Send DELETE operation using POST as required by this API
        const response = await request.post(`${baseURL}/DeleteBook.php`, {
            headers: {
                "Content-Type": "application/json"
            },
            data: payload
        });

        // 3. Validate HTTP status code
        console.log("DELETE Status:", response.status());

        expect(response.status()).toBe(200);

        // 4. Parse the JSON response
        const body = await response.json();

        console.log("DELETE Response:", JSON.stringify(body, null, 2));

        // 5. Validate the delete response
        expect(body).toHaveProperty("msg");
        expect(body.msg).toBe("book is successfully deleted");

        console.log("Delete Message:", body.msg);
    });

});
