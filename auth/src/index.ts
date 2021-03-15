import mongoose from 'mongoose';
import { app } from './app';


const start = async () => {
  console.log('starting up!');

  if (! process.env.JWT_KEY) {
    throw new Error('JWT_KEY env var must be defined.')
  }

  if (! process.env.MONGO_URI) {
    throw new Error('MONGO_URI env var must be defined.')
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log('Connected to mongodb')
  } catch (err) {
    console.log(err);
  }
}



const port = 3000;
app.listen(port, () => {
  console.log('Listening on Port ', port)
});

start();
