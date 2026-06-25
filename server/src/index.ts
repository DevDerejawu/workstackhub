import 'dotenv/config';
import express from 'express';
import crypto from 'crypto'
const app = express();
const SERVER_PORT = process.env.SERVER_PORT;

app.use(express.json());


app.get('/', (_, res: Res) => {
  res.send('Hello, World there!nnghghhhhhhhhhhhhh');
});

const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET:', jwtSecret);

// For Refresh Token - 64 characters hex
const refreshSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_REFRESH_SECR:', refreshSecret);

// For production - 128 characters base64
const prodSecret = crypto.randomBytes(64).toString('base64');
console.log('Refresh_secret:', prodSecret);
console.log('access_secret', prodSecret)
console.log("TEST CHANGggggggggEmmm")

app.listen(SERVER_PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${SERVER_PORT}`);
});