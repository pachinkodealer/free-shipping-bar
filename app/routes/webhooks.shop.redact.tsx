import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// GDPR: delete all data for this shop (fired 48h after uninstall)
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticate.webhook(request);

  await db.shippingBarSettings.deleteMany({ where: { shop } });
  await db.session.deleteMany({ where: { shop } });

  console.log(`shop/redact: deleted all data for ${shop}`);
  return new Response(null, { status: 200 });
};
