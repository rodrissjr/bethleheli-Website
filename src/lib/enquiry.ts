type SubmissionResult = { ok: boolean; message: string };
type PortalResult = { ok: boolean; skipped?: boolean; error?: string };

const fallbackError = "Your enquiry could not be sent. Please try again later.";
const successMessage = "Your enquiry was sent. The team will be in touch.";
const web3FormsEndpoint = "https://api.web3forms.com/submit";
const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://safari-digital-portal.vercel.app";
const portalKey = process.env.NEXT_PUBLIC_PORTAL_FORM_KEY || "sdf_oFw6oahp09bJbfeelcJ10za7";

function stringFields(form: HTMLFormElement) {
  return Object.fromEntries(
    Array.from(new FormData(form).entries()).map(([key, value]) => [key, typeof value === "string" ? value.trim() : ""]),
  );
}

function storedTracking() {
  try {
    const stored = JSON.parse(sessionStorage.getItem("utm") || "{}") as unknown;
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
    return Object.fromEntries(
      ["utm_source", "utm_medium", "utm_campaign", "fbclid"]
        .map(key => [key, (stored as Record<string, unknown>)[key]])
        .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0),
    );
  } catch {
    return {};
  }
}

function cookieValue(name: string) {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  const value = document.cookie.split("; ").find(cookie => cookie.startsWith(prefix))?.slice(prefix.length) || "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function portalPayload(fields: Record<string, string>, extras: Record<string, string>, key: string) {
  const email = fields.email;
  const phone = fields.phone || fields.whatsapp;
  const interestedIn = extras.interest || extras.topic || fields.interested_in || fields.interest || fields.topic;
  const explicitDates = [fields.arrival, fields.departure].filter(Boolean).join(" to ");
  const travelDates = extras.timing || explicitDates || fields.timing || extras.departure || fields.dateStyle || fields.dateFlexibility;
  const travellerParts = [
    fields.adults && `${fields.adults} ${fields.adults === "1" ? "adult" : "adults"}`,
    fields.children && `${fields.children} ${fields.children === "1" ? "child" : "children"}`,
  ].filter(Boolean);
  const messageParts = [
    fields.message || fields.notes,
    (extras.travelStyle || fields.travelStyle) && `Travel style: ${extras.travelStyle || fields.travelStyle}`,
    fields.days && `Available duration: ${fields.days}`,
  ].filter(Boolean);

  const optional = {
    email,
    phone,
    interested_in: interestedIn,
    travel_dates: travelDates,
    travellers: travellerParts.join(", "),
    country: fields.country,
    message: messageParts.join("\n"),
    ...storedTracking(),
    fbc: cookieValue("_fbc"),
    fbp: cookieValue("_fbp"),
  };

  return {
    key,
    name: fields.name,
    _gotcha: fields._gotcha || "",
    ...Object.fromEntries(Object.entries(optional).filter(([, value]) => value)),
  };
}

async function sendToPortal(fields: Record<string, string>, extras: Record<string, string>): Promise<PortalResult> {
  try {
    const response = await fetch(`${portalUrl.replace(/\/$/, "")}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(portalPayload(fields, extras, portalKey)),
      signal: AbortSignal.timeout(10000),
    });
    const result: unknown = await response.json().catch(() => null);
    const error = result && typeof result === "object" && "error" in result && typeof result.error === "string" ? result.error : undefined;
    return { ok: response.ok, error };
  } catch {
    return { ok: false };
  }
}

function web3FormsPayload(kind: "contact" | "trip", fields: Record<string, string>, extras: Record<string, string>, accessKey: string) {
  const submission: Record<string, string> = {
    access_key: accessKey,
    subject: kind === "contact" ? "New contact enquiry | Betheli Expeditions" : "New trip request | Betheli Expeditions",
    from_name: "Betheli Expeditions Website",
    name: fields.name,
    email: fields.email,
    message: kind === "contact" ? fields.message : fields.notes || "Please contact me about a Tanzania trip.",
    botcheck: fields._gotcha || "",
  };

  if (kind === "contact") {
    submission.topic = extras.topic || fields.topic || "";
  } else {
    for (const key of ["interest", "dateStyle", "dateFlexibility", "arrival", "departure", "timing", "adults", "children", "days", "travelStyle", "whatsapp", "country"] as const) {
      submission[key] = extras[key] || fields[key] || "";
    }
  }

  return submission;
}

async function sendToWeb3Forms(kind: "contact" | "trip", fields: Record<string, string>, extras: Record<string, string>, accessKey: string): Promise<SubmissionResult> {
  if (!accessKey) return { ok: false, message: "Enquiries cannot be sent yet. Please connect Web3Forms before publishing." };

  try {
    const response = await fetch(web3FormsEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(web3FormsPayload(kind, fields, extras, accessKey)),
      signal: AbortSignal.timeout(15000),
    });
    const result: unknown = await response.json().catch(() => null);
    const success = Boolean(result && typeof result === "object" && "success" in result && result.success === true);
    const message = result && typeof result === "object" && "message" in result && typeof result.message === "string" ? result.message : fallbackError;
    return { ok: response.ok && success, message: response.status === 429 ? "Too many requests. Please try again shortly." : message };
  } catch {
    return { ok: false, message: fallbackError };
  }
}

export async function sendEnquiry(kind: "contact" | "trip", form: HTMLFormElement, extras: Record<string, string> = {}, web3FormsAccessKey = "") {
  const fields = stringFields(form);
  if (!fields.name || (!fields.email && !fields.phone && !fields.whatsapp)) {
    return { ok: false, message: "Please enter your name and either an email address or phone number." };
  }
  const [existing, portal] = await Promise.all([
    sendToWeb3Forms(kind, fields, extras, web3FormsAccessKey),
    sendToPortal(fields, extras),
  ]);

  if (existing.ok) return existing;
  if (portal.ok) return { ok: true, message: successMessage };
  if (!portal.skipped && portal.error) return { ok: false, message: portal.error };
  return existing;
}
