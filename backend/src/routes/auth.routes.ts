import { Router, Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { requireAuth, AuthenticatedRequest } from "../middleware/jwtAuth";

const router = Router();

/** POST /api/auth/register — customer self-registration. */
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required." });
    }
    const result = await authService.registerCustomer({ name, email, password, phone });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof authService.AuthError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

/** POST /api/auth/login — shared by customer and admin accounts. */
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required." });
    }
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof authService.AuthError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

/** GET /api/auth/me — resolve the current session from the Bearer token. */
router.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.userId!);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

/** GET /api/auth/orders — logged-in customer's order history. */
router.get("/orders", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await authService.getCustomerOrders(req.userId!);
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
});

export default router;
