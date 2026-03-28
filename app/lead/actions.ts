"use server";

export async function submitLead(formData: any) {
  const WEBHOOK_URL = process.env.WEBHOOK_MAKE_URL;

  if (!WEBHOOK_URL) {
    console.error("WEBHOOK_MAKE_URL is not defined in .env");
    return { success: false, error: "Configuration error" };
  }

  const now = new Date();
  const sentAt = now.toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", hour12: false });
  
  // Générer un code unique simple si nécessaire
  const leadCode = `ML-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        lead_code: leadCode,
        sent_at: sentAt,
        source: "website-form",
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending to webhook:", error);
    return { success: false, error: "Failed to send data" };
  }
}
