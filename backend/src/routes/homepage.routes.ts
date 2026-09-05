import { Router, Request, Response, NextFunction } from "express";
import { getHomepageContent } from "../services/admin.service";

const router = Router();

/** GET /api/homepage — public, powers the storefront hero/fabric tiles/promo banner. */
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getHomepageContent());
  } catch (err) {
    next(err);
  }
});

export default router;
