const fetch = require('node-fetch');

async function testFetch() {
  try {
    const res = await fetch("https://akram-platform-server.vercel.app/api/students");
    const data = await res.json();
    console.log("Fetched students length:", data.data?.length || data.length || 0);
  } catch (e) {
    console.error(e);
  }
}
testFetch();
