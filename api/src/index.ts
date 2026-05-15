import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT: string = process.env['PORT'] ?? '3000';

app.listen(Number(PORT), (): void => {
  console.log(`Listening on port ${PORT}`);
});
