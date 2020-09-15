import express from 'express';
import AccountController from './app/controllers/AccountController';
import ConnectionsController from './app/controllers/ConnectionsController';
import ShareController from './app/controllers/ShareController';
import PerfilController from './app/controllers/PerfilController';
import Auth from './app/middleware/middleware';

const routes = express.Router();
const accountControllers = new AccountController();
const connectionsControllers = new ConnectionsController();
const shareControllers = new ShareController();
const perfilController = new PerfilController();

routes.post('/register', accountControllers.register);
routes.post('/login', accountControllers.login);
routes.post('/forgotpass', accountControllers.forgotPass);
routes.post('/resetpass', accountControllers.resetPass);

routes.use(Auth).put('/account', perfilController.perfilConfig);

routes.use(Auth).get('/classes', shareControllers.index);

routes.get('/connections', connectionsControllers.index);
routes.post('/connections', connectionsControllers.create);

export default routes;