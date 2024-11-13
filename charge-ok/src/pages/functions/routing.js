async function getRouteWithChargers(start, dest, maxDist) {
  try {
    const response = await fetch(
      "http://localhost:9000/.netlify/functions/api/get-route", // development
      {
        method: "POST", // Specify the HTTP method
        headers: {
          "Content-Type": "application/json", // Tell server to expect JSON data
        },
        body: JSON.stringify([start, dest, maxDist]), // Convert JavaScript object to JSON string
      }
    );
    if (response.ok) {
      const result = await response.json();
      if (result === null) throw Error;
      return result;
    } else {
      console.error("Error:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export default getRouteWithChargers;
