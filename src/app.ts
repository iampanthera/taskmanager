import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './routes';
import { PORT, MONGO_URI } from './utils/secrets';

const app = express();

// Connect to MongoDB
console.log({ MONGO_URI });
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

// Middleware
app.use(cors());
app.use(express.json());

// app.use('/api', (req, res) => res.send('Hello World'));

// Routes
app.use('/api', routes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
