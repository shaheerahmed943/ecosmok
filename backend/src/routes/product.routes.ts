import { Router } from "express";
import {
  checkVariantAvailability,
  getProduct,
  listProducts,
} from "../controllers/product.controller";

const router = Router();

router.get("/", listProducts);
router.get("/variants/:variantId/availability", checkVariantAvailability);
router.get("/:slug", getProduct);

export default router;
