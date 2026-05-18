import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// GDPR: respond with what data we store for this customer (none — we only store shop-level settings)
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  const settings = await db.shippingBarSettings.findUnique({
    where: { shop },
    select: { shop: true, threshold: true, isEnabled: true },
  });

  console.log(`customers/data_request for shop ${shop}, customer ${payload?.customer?.id}`);
  console.log("Data held:", settings ? "shop-level settings only (no PII)" : "none");

  return new Response(null, { status: 200 });
};
