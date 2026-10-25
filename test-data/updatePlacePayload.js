export function updatePlacePayload(placeID, cityName, apiKey) {

    return {
        place_id: placeID,
        address: cityName,
        key: apiKey
    };
}