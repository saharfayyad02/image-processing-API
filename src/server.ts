// src/server.ts
import app from './index';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
