-- CreateTable
CREATE TABLE "ShippingBarSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "threshold" REAL NOT NULL DEFAULT 50.0,
    "messageBelow" TEXT NOT NULL DEFAULT 'Add {amount} more for free delivery!',
    "messageAbove" TEXT NOT NULL DEFAULT 'Your order qualifies for free delivery!',
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "barColor" TEXT NOT NULL DEFAULT '#22c55e',
    "bgColor" TEXT NOT NULL DEFAULT '#f1f5f9',
    "textColor" TEXT NOT NULL DEFAULT '#1e293b',
    "position" TEXT NOT NULL DEFAULT 'top',
    "showBranding" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingBarSettings_shop_key" ON "ShippingBarSettings"("shop");
