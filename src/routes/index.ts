import { Request, Response, Router } from 'express';
import { responseSuccess } from '../utils/response.utils';
import {registerUser} from '../controllers/index'

const router = Router();
router.get("/", (req: Request, res: Response) => {
  res.send("Knights Ecommerce API");
});
router.get('/api/v1/status', (req: Request, res: Response) => {
  return responseSuccess(res, 202, 'This is a testing route that returns: 201');
});
router.post('/api/v1/users/register', registerUser);

// All routes should be imported here and get export after specifying first route
// example router.use("/stock". stockRoutes) =>:: First import stockRoutes and use it here, This shows how the route export will be handled

export default router;
