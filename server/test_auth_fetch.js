const jwt = require("jsonwebtoken");
const secret = "2e9b7c47982c9f0bb10a8ef51d0f022cc372c4272912f8fa3e09757b5d6c9fbc69504c3b1592624f3558b09af32789d7dd637c1a4b39d4b935d";
const token = jwt.sign({ id: "fake_admin_id" }, secret, { expiresIn: "10m" });

async function testFetchWithToken() {
  const res = await fetch("https://akram-platform-server.vercel.app/api/students", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(data?.data?.length || data)
}
testFetchWithToken();
