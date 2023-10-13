import { Router } from "express";
import ViewsController from "../controllers/views.controller.js";
import authToken from "../middleware/usersessiontoken.js";
import { passportCall, validateRecoveryToken } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js"

const router = Router();
const viewsController = new ViewsController();

router.get('/chat', [passportCall("jwt"), handlePolicies(["USER"]), authToken], viewsController.getChatView);
router.get("/", viewsController.getLoginView);
router.get("/login", viewsController.getLoginView);
router.get("/logout", viewsController.logout);
router.get("/products", [authToken, passportCall("jwt"), handlePolicies(["ADMIN", "USER","PREMIUM", "PUBLIC"])], viewsController.getProductsView);
router.get("/profile", [passportCall("jwt"), handlePolicies(["ADMIN", "USER", "PUBLIC", "PREMIUM"])], viewsController.getProfileView);
router.get("/register", viewsController.getRegisterView);
router.get("/recover", validateRecoveryToken , viewsController.getRecoverView);
router.get("/emailsendrecover", viewsController.getEmailRecover);
router.get("/settings",[authToken, passportCall("jwt"), handlePolicies(["ADMIN"])], viewsController.getsettings);
router.get("/updocument", [passportCall("jwt"), handlePolicies(["USER", "PREMIUM", "PUBLIC"])], viewsController.upldocument);

export default router