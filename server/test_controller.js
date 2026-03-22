const controller = require("./controllers/searchController");

async function run() {
  const req = {
    query: { q: 'diwash', limit: 5 },
    user: { portal_user_id: 1, current_semester: null, program_id: null, academic_degree_id: null } // simulate authenticated call with missing fields
  };
  
  const res = {
    json: (data) => console.log("SUCCESS DATA:", JSON.stringify(data).substring(0, 500)),
    status: (code) => ({
      json: (err) => console.error("HTTP ERROR:", code, err)
    })
  };

  try {
    const oldError = console.error;
    console.error = (...args) => {
      oldError("TRUE ERROR CAUGHT:", ...args);
    };
    await controller.universalSearch(req, res);
  } catch(e) {
    console.log("CATCH CAUGHT:", e);
  } finally {
    process.exit(0);
  }
}
run();
