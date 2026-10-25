export function addBookPayload(isbn, aisle, name, author) {

    return {
        name: name,
        isbn: isbn,
        aisle: aisle,
        author: author
    }
}

export function deleteBookPayload(id) {

    return {
        ID: id
    };
}