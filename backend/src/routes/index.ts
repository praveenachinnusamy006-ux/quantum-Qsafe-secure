import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vendorsRouter from "./vendors";
import threatsRouter from "./threats";
import dashboardRouter from "./dashboard";
import shorRouter from "./shor";
import bumblebeeRouter from "./bumblebee";

const router: IRouter = Router();

router.use(healthRouter);
router.use(vendorsRouter);
router.use(threatsRouter);
router.use(dashboardRouter);
router.use(shorRouter);
router.use(bumblebeeRouter);

export default router;
