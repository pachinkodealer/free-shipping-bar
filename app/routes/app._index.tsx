import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Banner,
  List,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let settings = await db.shippingBarSettings.findUnique({ where: { shop } });
  if (!settings) {
    settings = await db.shippingBarSettings.create({ data: { shop } });
  }

  // Build theme editor deep-link
  const themeEditorUrl = `https://${shop}/admin/themes/current/editor?context=apps`;

  return json({ settings, themeEditorUrl, shop });
};

export default function DashboardPage() {
  const { settings, themeEditorUrl } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="DeliveryBar" />
      <BlockStack gap="500">

        {/* Step 1: Activate extension */}
        <Banner
          tone="info"
          title="Step 1 — Activate the bar in your theme"
          action={{ content: "Open Theme Editor", url: themeEditorUrl, target: "_blank" }}
        >
          <Text as="p" variant="bodyMd">
            Go to your theme editor, click "App embeds" in the left panel, and toggle on{" "}
            <strong>Delivery Bar</strong>. The truck will appear instantly — no code changes needed.
          </Text>
        </Banner>

        <Layout>
          {/* Status card */}
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Bar status</Text>
                  <Badge tone={settings.isEnabled ? "success" : "critical"}>
                    {settings.isEnabled ? "Active" : "Disabled"}
                  </Badge>
                </InlineStack>
                <Divider />
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="span" tone="subdued">Threshold</Text>
                    <Text as="span" fontWeight="semibold">${settings.threshold.toFixed(2)}</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" tone="subdued">Position</Text>
                    <Text as="span" fontWeight="semibold">
                      {settings.position.charAt(0).toUpperCase() + settings.position.slice(1)}
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" tone="subdued">Plan</Text>
                    <Badge tone={settings.isPro ? "info" : undefined}>
                      {settings.isPro ? "Pro" : "Free"}
                    </Badge>
                  </InlineStack>
                </BlockStack>
                <Button url="/app/settings" variant="secondary">Edit settings</Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Checklist card */}
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Launch checklist</Text>
                <Divider />
                <List>
                  <List.Item>Set your free shipping threshold in Bar Settings</List.Item>
                  <List.Item>Customize your message copy</List.Item>
                  <List.Item>Enable the bar in your theme editor (App Embeds)</List.Item>
                  <List.Item>Test it by adding items to your cart</List.Item>
                  {!settings.isPro && (
                    <List.Item>Upgrade to Pro to customize colors & remove branding</List.Item>
                  )}
                </List>
                {!settings.isPro && (
                  <Button url="/app/billing" variant="plain">
                    View Pro plan →
                  </Button>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

      </BlockStack>
    </Page>
  );
}
