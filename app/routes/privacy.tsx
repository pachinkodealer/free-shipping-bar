// Public privacy policy page — required for Shopify App Store listing.
// Serve at: https://your-app.railway.app/privacy

export default function PrivacyPage() {
  const appName = "DeliveryBar";
  const contactEmail = "support@deliverybar.app"; // update before submitting

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 720,
        margin: "60px auto",
        padding: "0 24px",
        lineHeight: 1.7,
        color: "#1e293b",
      }}
    >
      <h1>{appName} — Privacy Policy</h1>
      <p>
        <em>Last updated: {new Date().getFullYear()}</em>
      </p>

      <h2>What data we collect</h2>
      <p>
        When a merchant installs <strong>{appName}</strong>, we store the
        following shop-level information in our database:
      </p>
      <ul>
        <li>The Shopify store domain (e.g. <code>your-store.myshopify.com</code>)</li>
        <li>
          App configuration settings: free shipping threshold, message copy,
          color preferences, and bar position
        </li>
        <li>Shopify OAuth session tokens (required for API authentication)</li>
        <li>Subscription status (Free or Pro plan)</li>
      </ul>
      <p>
        We do <strong>not</strong> collect, store, or process any customer
        personal information (names, emails, addresses, payment details, or
        browsing data).
      </p>

      <h2>How we use data</h2>
      <p>
        The data we collect is used exclusively to operate the app — displaying
        your configured delivery progress bar in your storefront and managing
        your subscription.
      </p>

      <h2>Data sharing</h2>
      <p>
        We do not sell, rent, or share your data with any third parties for
        marketing or advertising purposes.
      </p>
      <p>
        We use the following infrastructure providers to run the app. They
        process data only as instructed and do not use it for their own
        purposes:
      </p>
      <ul>
        <li>
          <strong>Railway</strong> — cloud hosting for the app server and
          database
        </li>
      </ul>

      <h2>Data retention</h2>
      <p>
        Your settings data is retained for as long as the app is installed on
        your store. When you uninstall the app, your configuration settings are
        reset. All remaining data (including session records) is permanently
        deleted within 48 hours of uninstall in response to Shopify's{" "}
        <code>shop/redact</code> webhook.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request a copy of the data we hold about your store, or ask us
        to delete it, at any time by contacting us at the email below.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy?{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </p>
    </main>
  );
}
