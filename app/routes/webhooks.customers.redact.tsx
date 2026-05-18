import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// GDPR: we store no customer PII — nothing to delete
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  console.log(`customers/redact for shop ${shop}, customer ${payload?.customer?.id} — no PII stored`);
  return new Response(null, { status: 200 });
};
