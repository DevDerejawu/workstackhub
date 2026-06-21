import 'dotenv/config';
import express from 'express';
const app = express();
const PORT = process.env.PORT;

app.use(express.json());


app.get('/', (_, res: Res) => {
  res.send('Hello, World!');
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});