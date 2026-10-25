
import { test, expect } from "@playwright/test";
import { coursePayload } from "../test-data/payload";

// ======================================================
// TEST CASE 1: JSON Parsing and Data Validation
// ======================================================

test("JSON Parsing", async ({ request }) => {

    // Access the JavaScript object from the imported payload
    const body = coursePayload;

    // 1. Print the number of courses
    const count = body.courses.length;

    console.log("Number of Courses:", count);
    expect(count).toBe(5);

    // 2. Print the purchase amount
    const purchaseAmount = body.dashboard.purchaseAmount;

    console.log("Purchase Amount:", purchaseAmount);
    expect(purchaseAmount).toBe(1162);

    // 3. Print the title of the first course
    const firstCourseTitle = body.courses[0].title;

    console.log("First Course:", firstCourseTitle);
    expect(firstCourseTitle).toBe("Selenium Python");

    // 4. Print the title of the second course
    const secondCourseTitle = body.courses[1].title;

    console.log("Second Course:", secondCourseTitle);
    expect(secondCourseTitle).toBe("Cypress");

    // 5. Print all course titles and their prices
    console.log("-".repeat(50));
    console.log("All Course Titles and Prices");

    for (let i = 0; i < count; i++) {

        const courseTitle = body.courses[i].title;
        const coursePrice = body.courses[i].price;

        console.log(`Course: ${courseTitle} | Price: ${coursePrice}`);
    }

    // 6. Print and validate the number of copies sold by RPA
    const rpaCourse = body.courses.find(
        (course) => course.title === "RPA"
    );

    expect(rpaCourse).toBeTruthy();

    const rpaCopies = rpaCourse.copies;

    console.log("RPA Copies:", rpaCopies);
    expect(rpaCopies).toBe(10);
});


// ======================================================
// TEST CASE 2: Validate Total Course Amount
// ======================================================

test("Validate Sum of Course Amount", async () => {

    const body = coursePayload;

    let sum = 0;
    const size = body.courses.length;

    console.log("Total Courses:", size);
    console.log("-".repeat(50));

    // Calculate the total amount using price × copies
    for (let i = 0; i < size; i++) {

        const course = body.courses[i];

        const coursePrice = course.price;
        const courseCopies = course.copies;

        const amount = coursePrice * courseCopies;

        console.log(
            `${course.title} --> ${coursePrice} * ${courseCopies} = ${amount}`
        );

        sum = sum + amount;
    }

    // Print the calculated amount
    console.log("-".repeat(50));
    console.log("Calculated Total:", sum);

    // Get the expected purchase amount
    const purchaseAmount = body.dashboard.purchaseAmount;

    console.log("Purchase Amount:", purchaseAmount);

    // Verify the calculated amount against the expected amount
    expect(sum).toBe(purchaseAmount);
});
