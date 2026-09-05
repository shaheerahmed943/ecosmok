import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";
import * as importService from "../services/import.service";
import * as paymentService from "../services/payment.service";

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.listCategories());
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, parentId } = req.body as { name?: string; parentId?: string };
    if (!name) {
      return res.status(400).json({ error: "name is required." });
    }
    res.status(201).json(await adminService.createCategory(name, parentId));
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await adminService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.listProductsAdmin());
  } catch (err) {
    next(err);
  }
}

export async function updateVariant(req: Request, res: Response, next: NextFunction) {
  try {
    const { stockQuantity, variantPrice } = req.body as {
      stockQuantity: number;
      variantPrice?: number;
    };
    const variant = await adminService.updateVariantStock(
      req.params.variantId,
      stockQuantity,
      variantPrice,
    );
    res.status(200).json(variant);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await adminService.getProductByIdAdmin(req.params.productId);
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await adminService.updateProduct(req.params.productId, req.body);
    res.status(200).json(product);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.deleteProduct(req.params.productId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.getDashboardStats());
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.listOrdersAdmin());
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body as { status: string };
    const order = await adminService.updateOrderStatus(req.params.orderId, status as never);
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getShippingRates(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.listShippingRates());
  } catch (err) {
    next(err);
  }
}

export async function upsertShippingRate(req: Request, res: Response, next: NextFunction) {
  try {
    const { city, fee, etaDays } = req.body as { city: string; fee: number; etaDays: number };
    const rate = await adminService.upsertShippingRate(city, fee, etaDays);
    res.status(200).json(rate);
  } catch (err) {
    next(err);
  }
}

export async function getHomepageContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.getHomepageContent());
  } catch (err) {
    next(err);
  }
}

export async function updateHomepageContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.updateHomepageContent(req.body));
  } catch (err) {
    next(err);
  }
}

export async function getAboutContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.getAboutContent());
  } catch (err) {
    next(err);
  }
}

export async function updateAboutContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.updateAboutContent(req.body));
  } catch (err) {
    next(err);
  }
}

export async function getContactContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.getContactContent());
  } catch (err) {
    next(err);
  }
}

export async function updateContactContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.updateContactContent(req.body));
  } catch (err) {
    next(err);
  }
}

export async function getFooterContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.getFooterContent());
  } catch (err) {
    next(err);
  }
}

export async function updateFooterContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.updateFooterContent(req.body));
  } catch (err) {
    next(err);
  }
}

export async function getHeaderContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.getHeaderContent());
  } catch (err) {
    next(err);
  }
}

export async function updateHeaderContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.updateHeaderContent(req.body));
  } catch (err) {
    next(err);
  }
}

export async function getPrivacyContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.getPrivacyContent());
  } catch (err) {
    next(err);
  }
}

export async function updatePrivacyContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.updatePrivacyContent(req.body));
  } catch (err) {
    next(err);
  }
}

export async function getTermsContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.getTermsContent());
  } catch (err) {
    next(err);
  }
}

export async function updateTermsContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.updateTermsContent(req.body));
  } catch (err) {
    next(err);
  }
}

export async function getReturnsContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.getReturnsContent());
  } catch (err) {
    next(err);
  }
}

export async function updateReturnsContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.updateReturnsContent(req.body));
  } catch (err) {
    next(err);
  }
}

export async function getSizeGuideContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.getSizeGuideContent());
  } catch (err) {
    next(err);
  }
}

export async function updateSizeGuideContent(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await adminService.updateSizeGuideContent(req.body));
  } catch (err) {
    next(err);
  }
}

export async function uploadImage(req: Request, res: Response) {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) {
    return res.status(400).json({ error: "No image file was uploaded." });
  }
  const baseUrl = process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;
  res.status(201).json({ url: `${baseUrl}/uploads/${file.filename}` });
}

async function importCsv(req: Request, res: Response, next: NextFunction, importer: (file: Express.Multer.File) => Promise<{ imported: number }>) {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    res.status(200).json(await importer(file as Express.Multer.File));
  } catch (err) {
    if (err instanceof Error) return res.status(400).json({ error: err.message });
    next(err);
  }
}

export const importProducts = (req: Request, res: Response, next: NextFunction) => importCsv(req, res, next, importService.importProducts);
export const importCategories = (req: Request, res: Response, next: NextFunction) => importCsv(req, res, next, importService.importCategories);
export const importUsers = (req: Request, res: Response, next: NextFunction) => importCsv(req, res, next, importService.importUsers);

export async function getStripeSettings(req: Request, res: Response, next: NextFunction) {
  try { res.status(200).json(await paymentService.getStripeSettings()); } catch (err) { next(err); }
}

export async function saveStripeSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { secretKey, webhookSecret } = req.body as { secretKey?: string; webhookSecret?: string };
    if (!secretKey || !webhookSecret) return res.status(400).json({ error: "Both Stripe keys are required." });
    res.status(200).json(await paymentService.saveStripeSettings(secretKey.trim(), webhookSecret.trim()));
  } catch (err) {
    if (err instanceof Error) return res.status(400).json({ error: err.message });
    next(err);
  }
}
