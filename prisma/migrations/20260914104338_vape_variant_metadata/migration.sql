-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "flavour" TEXT,
ADD COLUMN     "nicotineStrength" TEXT;

-- CreateIndex
CREATE INDEX "ProductVariant_nicotineStrength_idx" ON "ProductVariant"("nicotineStrength");
