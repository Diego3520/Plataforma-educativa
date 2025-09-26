import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req: Request, res: Response) => {res.json({ message: 'Hello from the backend!' });});

app.listen(PORT, () => {console.log(`Server started on port ${PORT}`)});
