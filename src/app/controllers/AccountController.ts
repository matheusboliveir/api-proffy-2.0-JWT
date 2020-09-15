import db from '../../database/connection';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import token from '../utils/tokenGenerator';
import crypto from 'crypto';
import mailer from '../../modules/mailer';

export default class ClassesController {

  async register(request: Request, resp: Response) {
    const {
      name,
      surname,
      email,
      password
    } = request.body;

    const cryptPassword = await bcrypt.hash(password, 10);

    try {
      const register = await db('users').insert({
        name,
        surname,
        email,
        password: cryptPassword
      });
      return resp.status(201).send({ token: token({ id: register[0] }) });
    } catch (err) {
      return resp.status(400).send({
        error: 'Unexpected error while creating new class'
      });
    }

  }

  async login(request: Request, resp: Response) {
    const { email, password } = request.body;

    try {
      const user = await db('users').where('email', '=', email).select();

      if (!await bcrypt.compare(password, user[0].password))
        return resp.status(400).json({ error: 'Invalid password' });



      return resp.status(200).send({ token: token({ id: user[0].id }) });
    } catch (err) {
      return resp.status(400).send({
        error: 'No users with this email found',
      });
    }
  }

  async forgotPass(request: Request, resp: Response) {
    const { email } = request.body;

    try {
      const user = await db('users').where('email', '=', email).select();

      if (user === [])
        return resp.status(400).send({ error: 'User not found' });

      const token = crypto.randomBytes(20).toString('hex');
      const date = new Date();
      date.setHours(date.getHours() + 1);

      await db('users').where('id', '=', user[0].id)
        .update({ passResetToken: token, passResetExpires: date });

      mailer.sendMail({
        to: email,
        from: 'theus.braz18@gmail.com',
        subject: 'Password reset Proffy 2.0',
        html: `<p>Forgot your password? Use this token to reset:</p><p>${token}</p>`,
      }, (err) => {
        if (err)
          return resp.status(400).send({ error: 'Cannot send forgot password email' });
        return resp.send();
      })

    } catch (err) {
      return resp.status(400).send({ error: 'Error on forgot password, try again' });
    }
  }

  async resetPass(request: Request, resp: Response) {
    const { email, token, password } = request.body;

    try {

      const user = await db('users').where('email', '=', email).select();

      if (user === [])
        return resp.status(400).send({ error: 'User not found' });

      if (token !== user[0].passResetToken)
        return resp.status(400).send({ error: 'Token invalid' });

      const now = new Date();

      if (now > user[0].passResetExpires)
        return resp.status(400).send({ error: 'Token expired' });

      const cryptPassword = await bcrypt.hash(password, 10);

      await db('users').where('email', '=', email).update({password: cryptPassword});

      return resp.status(200).send();

    } catch (error) {
      resp.status(400).send({ error: 'Cannot reset password, try again' });
    }
  }

}