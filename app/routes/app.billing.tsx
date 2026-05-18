import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  List,
  Button,
  Badge,
  Banner,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

const PRO_PLAN_NAME = "Pro Plan";
const PRO_PLAN_PRICE = 7.99;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await db.shippingBarSettings.findUnique({
    where: { shop: session.shop },
    select: { isPro: true },
  });
  return json({ isPro: settings?.isPro ?? false });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const form = await request.formData();

  if (form.get("intent") !== "subscribe") {
    return json({ error: "Unknown action." }, { status: 400 });
  }

  const appUrl = process.env.SHOPIFY_APP_URL ?? "https://example.com";

  const res = await admin.graphql(
    `#graphql
    mutation CreateSubscription(
      $name: String!
      $lineItems: [AppSubscriptionLineItemInput!]!
      $returnUrl: URL!
      $test: Boolean
    ) {
      appSubscriptionCreate(
        name: $name
        lineItems: $lineItems
        returnUrl: $returnUrl
        test: $test
      ) {
        userErrors { field message }
        appSubscription { id }
        confirmationUrl
      }
    }`,
    {
      variables: {
        name: PRO_PLAN_NAME,
        returnUrl: `${appUrl}/app/billing/confirm`,
        test: process.env.NODE_ENV !== "production",
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: PRO_PLAN_PRICE, currencyCode: "USD" },
                interval: "EVERY_30_DAYS",
              },
            },
          },
        ],
      },
    },
  );

  const resJson = await res.json();
  const result = resJson.data.appSubscriptionCreate;

  if (result.userErrors.length > 0) {
    return json({ error: result.userErrors[0].message }, { status: 400 });
  }

  return redirect(result.confirmationUrl);
};

export default function BillingPage() {
  const { isPro } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Page>
      <TitleBar title="Plans" />
      <BlockStack gap="500">
        {"error" in (actionData ?? {}) && (
          <Banner tone="critical" title={(actionData as any).error} onDismiss={() => {}} />
        )}

        <Layout>
          {/* Free plan */}
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">Free</Text>
                  {!isPro && <Badge tone="success">Current plan</Badge>}
                </InlineStack>
                <Text as="p" variant="heading2xl">
                  $0{" "}
                  <Text as="span" variant="bodyMd" tone="subdued">/ month</Text>
                </Text>
                <Divider />
                <List>
                  <List.Item>Animated delivery truck bar</List.Item>
                  <List.Item>Custom threshold amount</List.Item>
                  <List.Item>Custom messages</List.Item>
                  <List.Item>Top-of-page position</List.Item>
                  <List.Item>Default green color scheme</List.Item>
                  <List.Item>"Powered by DeliveryBar" branding</List.Item>
                </List>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Pro plan */}
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">Pro</Text>
                  {isPro && <Badge tone="success">Current plan</Badge>}
                </InlineStack>
                <Text as="p" variant="heading2xl">
                  $7.99{" "}
                  <Text as="span" variant="bodyMd" tone="subdued">/ month</Text>
                </Text>
                <Divider />
                <List>
                  <List.Item>Everything in Free</List.Item>
                  <List.Item>Custom truck & bar color</List.Item>
                  <List.Item>Custom background color</List.Item>
                  <List.Item>Custom text color</List.Item>
                  <List.Item>Top or bottom position</List.Item>
                  <List.Item>Remove branding</List.Item>
                  <List.Item>Priority support</List.Item>
                </List>
                {!isPro && (
                  <Form method="post">
                    <input type="hidden" name="intent" value="subscribe" />
                    <Button
                      submit
                      variant="primary"
                      size="large"
                      loading={isSubmitting}
                      fullWidth
                    >
                      Upgrade to Pro — $7.99/month
                    </Button>
                  </Form>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
