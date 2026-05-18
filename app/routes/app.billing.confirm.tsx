import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");

  if (!chargeId) {
    return redirect("/app/billing?error=missing_charge");
  }

  const res = await admin.graphql(
    `#graphql
    query GetSubscription($id: ID!) {
      node(id: $id) {
        ... on AppSubscription {
          id
          status
        }
      }
    }`,
    { variables: { id: `gid://shopify/AppSubscription/${chargeId}` } },
  );

  const resJson = await res.json();
  const sub = resJson.data?.node;

  if (sub?.status === "ACTIVE") {
    await db.shippingBarSettings.update({
      where: { shop: session.shop },
      data: {
        isPro:          true,
        subscriptionId: sub.id,
        showBranding:   false,
      },
    });
    return redirect("/app/settings?billing=success");
  }

  return redirect("/app/billing?error=not_active");
};
