import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  // Reset billing state — Shopify auto-cancels the subscription, we just update our DB
  await db.shippingBarSettings.updateMany({
    where: { shop },
    data: { isPro: false, subscriptionId: null },
  });

  return new Response();
};
