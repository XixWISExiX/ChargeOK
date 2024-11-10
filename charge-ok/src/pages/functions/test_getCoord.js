import getCoord from "./getCoord.js";

async function test_getCoord() {
  const address = "173 Felgar St, Norman, OK 73019";

  try {
    console.log("Testing address:", address);
    const coordinates = await getCoord(address);
    console.log("Coordinates:", coordinates);
  } catch (error) {
    console.error("Failed to get coordinates:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

test_getCoord();
