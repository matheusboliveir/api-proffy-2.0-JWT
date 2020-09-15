import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth.json';
import { Request, Response, NextFunction } from 'express';

export default (request: Request, response: Response, next: NextFunction) => {
  const authHeader = request.headers.authorization;

  if (!authHeader)
    return response.status(401).send({ error: 'No token provided' });

  const parts = authHeader.split(' ');

  if (parts.length != 2)
    return response.status(401).send({ error: 'Token error' });

  const [schema, token] = parts;

  if (!/^Bearer$/i.test(schema))
    return response.status(401).send({ error: 'Incorrectly formatted token' });

  jwt.verify(token, authConfig.secret, (err:any, decoded:any) => {

    if(err) return response.status(401).send({error: 'Token invalid'});

    request.body.userId = decoded.id;

    return next();

  })

}