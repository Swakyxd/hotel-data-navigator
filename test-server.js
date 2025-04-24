import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello World! ES Modules are working!');
});

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
