import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form, useSearchParams } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  TextField,
  Select,
  Checkbox,
  Button,
  Banner,
  InlineStack,
  Badge,
  Divider,
  Box,
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

  return json({ settings });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const form = await request.formData();

  const threshold = parseFloat(form.get("threshold") as string);
  if (isNaN(threshold) || threshold <= 0) {
    return json({ error: "Threshold must be a positive number." }, { status: 400 });
  }

  const existing = await db.shippingBarSettings.findUnique({ where: { shop } });

  await db.shippingBarSettings.upsert({
    where: { shop },
    update: {
      isEnabled:    form.get("isEnabled") === "true",
      threshold,
      messageBelow: form.get("messageBelow") as string,
      messageAbove: form.get("messageAbove") as string,
      position:     form.get("position") as string,
      ...(existing?.isPro && {
        barColor:     form.get("barColor") as string,
        bgColor:      form.get("bgColor") as string,
        textColor:    form.get("textColor") as string,
        showBranding: form.get("showBranding") === "true",
      }),
    },
    create: {
      shop,
      isEnabled:    form.get("isEnabled") === "true",
      threshold,
      messageBelow: form.get("messageBelow") as string,
      messageAbove: form.get("messageAbove") as string,
      position:     form.get("position") as string,
    },
  });

  return json({ success: true });
};

export default function SettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const isSaving = navigation.state === "submitting";
  const billingSuccess = searchParams.get("billing") === "success";

  const [threshold, setThreshold]     = useState(String(settings.threshold));
  const [messageBelow, setMessageBelow] = useState(settings.messageBelow);
  const [messageAbove, setMessageAbove] = useState(settings.messageAbove);
  const [barColor, setBarColor]         = useState(settings.barColor);
  const [bgColor, setBgColor]           = useState(settings.bgColor);
  const [textColor, setTextColor]       = useState(settings.textColor);
  const [position, setPosition]         = useState(settings.position);
  const [showBranding, setShowBranding] = useState(settings.showBranding);

  return (
    <Page>
      <TitleBar title="Bar Settings" />
      <BlockStack gap="500">
        {billingSuccess && (
          <Banner tone="success" title="You're now on Pro! All Pro features are unlocked." onDismiss={() => {}} />
        )}
        {actionData && "success" in actionData && (
          <Banner tone="success" title="Settings saved." onDismiss={() => {}} />
        )}
        {actionData && "error" in actionData && (
          <Banner tone="critical" title={actionData.error as string} onDismiss={() => {}} />
        )}

        <Form method="post">
          <Layout>
            {/* Threshold */}
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Threshold</Text>
                  <TextField
                    label="Free shipping threshold (USD)"
                    name="threshold"
                    type="number"
                    value={threshold}
                    onChange={setThreshold}
                    prefix="$"
                    helpText="The truck drives toward this cart total."
                    autoComplete="off"
                  />
                  <input type="hidden" name="isEnabled" value={settings.isEnabled ? "true" : "false"} />
                </BlockStack>
              </Card>
            </Layout.Section>

            {/* Messages */}
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Messages</Text>
                  <TextField
                    label="Message — below threshold"
                    name="messageBelow"
                    value={messageBelow}
                    onChange={setMessageBelow}
                    helpText="Use {amount} as a placeholder for the remaining amount."
                    autoComplete="off"
                  />
                  <TextField
                    label="Message — threshold reached"
                    name="messageAbove"
                    value={messageAbove}
                    onChange={setMessageAbove}
                    autoComplete="off"
                  />
                </BlockStack>
              </Card>
            </Layout.Section>

            {/* Appearance — Pro */}
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">Appearance</Text>
                    {!settings.isPro && <Badge tone="info">Pro</Badge>}
                  </InlineStack>
                  <Divider />
                  {settings.isPro ? (
                    <BlockStack gap="400">
                      <Box>
                        <Text as="p" variant="bodyMd">Truck & bar color</Text>
                        <InlineStack gap="300" blockAlign="center">
                          <input
                            type="color"
                            name="barColor"
                            value={barColor}
                            onChange={(e) => setBarColor(e.target.value)}
                            style={{ width: 40, height: 40, padding: 2, border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" }}
                          />
                          <Text as="span" variant="bodySm" tone="subdued">{barColor}</Text>
                        </InlineStack>
                      </Box>
                      <Box>
                        <Text as="p" variant="bodyMd">Background color</Text>
                        <InlineStack gap="300" blockAlign="center">
                          <input
                            type="color"
                            name="bgColor"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            style={{ width: 40, height: 40, padding: 2, border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" }}
                          />
                          <Text as="span" variant="bodySm" tone="subdued">{bgColor}</Text>
                        </InlineStack>
                      </Box>
                      <Box>
                        <Text as="p" variant="bodyMd">Text color</Text>
                        <InlineStack gap="300" blockAlign="center">
                          <input
                            type="color"
                            name="textColor"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            style={{ width: 40, height: 40, padding: 2, border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" }}
                          />
                          <Text as="span" variant="bodySm" tone="subdued">{textColor}</Text>
                        </InlineStack>
                      </Box>
                      <Checkbox
                        label="Show 'Powered by DeliveryBar' branding"
                        name="showBranding"
                        checked={showBranding}
                        onChange={setShowBranding}
                      />
                    </BlockStack>
                  ) : (
                    <BlockStack gap="300">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Custom colors and branding removal are available on the Pro plan.
                      </Text>
                      <Button url="/app/billing" variant="plain">Upgrade to Pro →</Button>
                      <input type="hidden" name="barColor"     value={barColor} />
                      <input type="hidden" name="bgColor"      value={bgColor} />
                      <input type="hidden" name="textColor"    value={textColor} />
                      <input type="hidden" name="showBranding" value="true" />
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
            </Layout.Section>

            {/* Position — Free */}
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Position</Text>
                  <Divider />
                  <Select
                    label="Bar position"
                    name="position"
                    options={[
                      { label: "Bottom of page (sticky)", value: "bottom" },
                      { label: "Top of page (sticky)", value: "top" },
                    ]}
                    value={position}
                    onChange={setPosition}
                  />
                </BlockStack>
              </Card>
            </Layout.Section>

            {/* Save */}
            <Layout.Section>
              <InlineStack align="end">
                <Button submit loading={isSaving} variant="primary" size="large">
                  Save settings
                </Button>
              </InlineStack>
            </Layout.Section>
          </Layout>
        </Form>
      </BlockStack>
    </Page>
  );
}
