import { query } from './src/config/database.js';

async function main() {
  const [u] = await query("SELECT id, email, role FROM users WHERE role='admin' LIMIT 1");
  console.log(JSON.stringify(u));
}
main();
