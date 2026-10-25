/*
1. Serialization

Serialization is the process of converting an object or data structure into a format 
that can be transmitted over a network or stored for later use.

In JavaScript, when working with JSON, we commonly use JSON.stringify() 
to convert a JavaScript value into a JSON string.


Playwright's API request methods can automatically serialize a JavaScript object
when you pass it through the data option.

data is a property defined by Playwright's API, not a JavaScript keyword. 
Playwright uses that property to determine what data to send in the request body.

2. What is deserialization?
Deserialization is the process of converting serialized data back into a usable data structure.

In JavaScript, when the input is a JSON string, we commonly use JSON.parse().

“Whenever we send data to an API, the data must be represented in a format the receiving 
system understands. JSON is one of the most common formats used by REST APIs. In Playwright,
 we can pass JavaScript objects directly through the data option, and Playwright serializes
  them for us. When the server returns JSON, response.json() parses it into a JavaScript value. 
  We then use that value to validate the API response.”

Playwright generally sets the JSON content type automatically when you pass an object through data.


Remember that Content-Type describes the request body, while Accept can indicate the response 
format the client wants.

Playwright automates the JSON parsing step through response.json()
but you do not need to write JSON.parse() in every API test.
*/


const student = {

  name: "Amit",
  age: 25,
  course: "Playwright"

};

console.log(student);
console.log(typeof student);


const jsonData = JSON.stringify(student); //Converts a JavaScript value to a JavaScript Object Notation (JSON) string.


console.log(jsonData);
console.log(typeof jsonData);


const jsonData1 = '{"name":"Amit","age":25,"course":"Playwright"}';
console.log(typeof jsonData1);
const student1 = JSON.parse(jsonData1); //Converts a JavaScript Object Notation (JSON) string into an object.
console.log(typeof student1);
console.log(student.age);