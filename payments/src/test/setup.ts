import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';


declare global {
  namespace NodeJS {
    interface Global {
      signin( userId?: string): string[];
    }
  }
}

jest.mock('../nats-wrapper');
process.env.STRIPE_KEY = 'sk_test_51IGsSSE9UpXBIwMkM1Co6LaJTASGP9j5QaldRh1nlwanl920ddnFd9si997iKnJVK4Vq9ym4meJ32dvRR0VbIzRR00lH6SzK8k';

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach( async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for  (let collection of collections) {
    await collection.deleteMany({});
  }
})

afterAll( async () => {
  await mongo.stop();
  await mongoose.connection.close();
})

global.signin = ( userId?: string) => {

  if (!userId) {
    userId = new mongoose.Types.ObjectId().toHexString();
  }

  //eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall3TXpRek4yWmtZekEzWldZNU1EQXpabUZsTWpFd1lpSXNJbVZ0WVdsc0lqb2lhM1JsYzNReVFHZHRZV2xzTG1OdmJTSXNJbWxoZENJNk1UWXhOREF6TkRrME1YMC4xaWtYRGNDa3libmNWN1pvb1JuWGlfLWVUSFkzWnlpYmhMcW1Vd1hwNnVnIn0=
  // Build a JWT payload. {id, email }
  const payload = {
    id: userId,
    email: 'test@test.com'
  }

  // Create the JWT!
  const token = jwt.sign(
    payload, process.env.JWT_KEY!  )

  // Build session object ie { jwt: MY_JWT }
  const session = { jwt: token }


  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session)

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data 
  return [`express:sess=${base64}`];


  /*const email = 'test@test.com';
  const password = 'password';

  const signupResponse = await request(app)
    .post('/api/users/signup')
    .send({
      email, password,
    })
    .expect(201);

    const cookie = signupResponse.get('Set-Cookie');  

    return cookie;*/
}