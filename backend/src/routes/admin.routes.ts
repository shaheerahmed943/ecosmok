import { Router } from "express";
import { requireAdmin } from "../middleware/jwtAuth";
import { uploadMiddleware } from "../middleware/upload";
import { csvUploadMiddleware } from "../middleware/csvUpload";
import * as admin from "../controllers/admin.controller";

const router = Router();

router.use(requireAdmin);

router.get("/categories", admin.getCategories);
router.post("/categories", admin.createCategory);

router.get("/products", admin.listProducts);
router.get("/products/:productId", admin.getProduct);
router.post("/products", admin.createProduct);
router.patch("/products/:productId", admin.updateProduct);
router.delete("/products/:productId", admin.deleteProduct);
router.patch("/variants/:variantId", admin.updateVariant);

router.get("/dashboard", admin.getDashboard);

router.get("/orders", admin.listOrders);
router.patch("/orders/:orderId/status", admin.updateOrderStatus);

router.get("/shipping-rates", admin.getShippingRates);
router.put("/shipping-rates", admin.upsertShippingRate);

router.get("/homepage", admin.getHomepageContent);
router.put("/homepage", admin.updateHomepageContent);

router.get("/about", admin.getAboutContent);
router.put("/about", admin.updateAboutContent);

router.get("/contact", admin.getContactContent);
router.put("/contact", admin.updateContactContent);

router.get("/footer", admin.getFooterContent);
router.put("/footer", admin.updateFooterContent);

router.get("/header", admin.getHeaderContent);
router.put("/header", admin.updateHeaderContent);

router.get("/privacy", admin.getPrivacyContent);
router.put("/privacy", admin.updatePrivacyContent);

router.get("/terms", admin.getTermsContent);
router.put("/terms", admin.updateTermsContent);

router.get("/returns", admin.getReturnsContent);
router.put("/returns", admin.updateReturnsContent);

router.get("/size-guide", admin.getSizeGuideContent);
router.put("/size-guide", admin.updateSizeGuideContent);

router.post("/upload", uploadMiddleware.single("image"), admin.uploadImage);
router.post("/imports/products", csvUploadMiddleware.single("file"), admin.importProducts);
router.post("/imports/categories", csvUploadMiddleware.single("file"), admin.importCategories);
router.post("/imports/users", csvUploadMiddleware.single("file"), admin.importUsers);
router.get("/payments/stripe", admin.getStripeSettings);
router.put("/payments/stripe", admin.saveStripeSettings);

export default router;
