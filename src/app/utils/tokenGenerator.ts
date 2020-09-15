import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth.json';

export default (params = {}) => {
  return jwt.sign(params, authConfig.secret, { expiresIn: 86400 })
};