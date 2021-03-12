import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@kdhamricorg/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signin',  [
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('You must supply a password')
], 
validateRequest,
async (req: Request, res: Response) => {

  const { email, password } = req.body;

  const existingUser = await User.findOne({email});
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials');
  }

  const passwordsMatch = await Password.compare(existingUser.password, password);
  
  if (! passwordsMatch) {
    throw new BadRequestError('Invalid credentials');
  }

  // generate jwt
  const userJwt = jwt.sign({
    id: existingUser.id,
    email: existingUser.email
  }, process.env.JWT_KEY!
  );
  //note: ! on end of the process.env.JWT_KEY! tells typescript to ignore the checking of this variable


  //cmd to store this: kubectl create secret generic jwt-secret --from-literal=JWT_Key=asdf
  // store on the session cookie
  req.session = {
    jwt: userJwt
  };

  res.status(200).send(existingUser);

 

})

export { router as signinRouter };
