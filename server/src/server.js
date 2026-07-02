import 'dotenv/config';

console.log("MONGO_URI =", process.env.MONGO_URI);
console.log("CWD =", process.cwd());

import { connectDB } from './config/db.js';
import app from './app.js';

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`DevConnect API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});