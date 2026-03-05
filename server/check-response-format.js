const axios = require("axios");

async function checkEndpoints() {
  try {
    // Test IT Fields
    console.log("\n🔍 IT FIELDS RESPONSE:");
    const fields = await axios.get(
      "http://localhost:5000/api/discussions/it-fields",
    );
    console.log(JSON.stringify(fields.data[0], null, 2));

    // Test Degrees
    console.log("\n🎓 DEGREES RESPONSE:");
    const degrees = await axios.get(
      "http://localhost:5000/api/discussions/degrees",
    );
    console.log(JSON.stringify(degrees.data[0], null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkEndpoints();
