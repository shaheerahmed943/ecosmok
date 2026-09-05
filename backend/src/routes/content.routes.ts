import { Router, Request, Response, NextFunction } from "express";
import {
  getAboutContent,
  getContactContent,
  getFooterContent,
  getHeaderContent,
  getPrivacyContent,
  getTermsContent,
  getReturnsContent,
  getSizeGuideContent,
} from "../services/admin.service";

const router = Router();

/** GET /api/content/about — public, powers the About page. */
router.get("/about", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getAboutContent());
  } catch (err) {
    next(err);
  }
});

/** GET /api/content/contact — public, powers the Contact page. */
router.get("/contact", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getContactContent());
  } catch (err) {
    next(err);
  }
});

/** GET /api/content/footer — public, powers the site footer. */
router.get("/footer", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getFooterContent());
  } catch (err) {
    next(err);
  }
});

/** GET /api/content/header — public, powers the site header nav. */
router.get("/header", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getHeaderContent());
  } catch (err) {
    next(err);
  }
});

/** GET /api/content/privacy — public, powers the Privacy Policy page. */
router.get("/privacy", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getPrivacyContent());
  } catch (err) {
    next(err);
  }
});

/** GET /api/content/terms — public, powers the Terms of Service page. */
router.get("/terms", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getTermsContent());
  } catch (err) {
    next(err);
  }
});

/** GET /api/content/returns — public, powers the Returns & Exchanges page. */
router.get("/returns", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getReturnsContent());
  } catch (err) {
    next(err);
  }
});

/** GET /api/content/size-guide — public, powers the Size Guide page. */
router.get("/size-guide", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await getSizeGuideContent());
  } catch (err) {
    next(err);
  }
});

export default router;
