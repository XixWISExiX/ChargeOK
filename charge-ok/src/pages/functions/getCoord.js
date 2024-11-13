async function getCoord(address) {
  try {
    const response = await fetch(
      "http://localhost:9000/.netlify/functions/api/get-coord", // development
      {
        method: "POST", // Specify the HTTP method
        headers: {
          "Content-Type": "application/json", // Tell server to expect JSON data
        },
        body: JSON.stringify(address), // Convert JavaScript object to JSON string
      }
    );
    if (response.ok) {
      const result = await response.json();
      if (result == null) throw Error;
      // console.log("got new coord:", result);
      // console.log("got new coord:", );
      // return [result.latitude, result.longitude];
      return result;
    } else {
      console.error("Error:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getBestCoord(address, startPoint) {}

export default { getCoord, getBestCoord };
