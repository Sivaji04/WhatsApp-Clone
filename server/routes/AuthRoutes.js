import { Router } from "express";
import { checkUser, getAllUsers, onBoardUSer } from "../controllers/AuthController.js";


const router = Router()

router.post("/check-user", checkUser);
router.post("/onboard-user", onBoardUSer);
router.get("/get-contacts", getAllUsers);

export default  router