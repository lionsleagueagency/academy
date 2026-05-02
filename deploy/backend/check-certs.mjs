import { query } from './src/config/database.js';

async function main() {
  const cols = await query('SHOW COLUMNS FROM certificates');
  console.log(JSON.stringify(cols, null, 2));
}
main().catch(console.error);
