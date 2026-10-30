
/* ===== SADEQ CREATIVES CONTACT DETAILS ===== */

const BUSINESS_WHATSAPP = "2349126317546";
const BUSINESS_EMAIL = "sadeqcreatives@gmail.com";

/* ===== SUPABASE CONNECTION ===== */

// Replace these two placeholders with your own values.
// Use your BASE Project URL, without /rest/v1/ at the end.
// Use your publishable key, NEVER a secret/service_role key.

const SUPABASE_URL = "https://ggrixtcvslhmsnfjjiwq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9s-vlv4eHrm3dPY3LT5mOA_tPx13joi";

/* ===== SELECT FORM ELEMENTS ===== */

const form = document.getElementById("appointment-form");
const statusMessage = document.getElementById("form-status");
const contactOptions = document.getElementById("contact-options");
const whatsappLink = document.getElementById("whatsapp-link");
const emailLink = document.getElementById("email-link");
const submitButton = form.querySelector('button[type="submit"]');

/* ===== UPDATE COPYRIGHT YEAR ===== */

document.getElementById("current-year").textContent =
  new Date().getFullYear();

/* ===== HANDLE APPOINTMENT FORM ===== */

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("client-name").value.trim();
  const email = document.getElementById("client-email").value.trim();
  const phone = document.getElementById("client-phone").value.trim();
  const budget = document.getElementById("client-budget").value;
  const service = document.getElementById("client-service").value;
  const details = document.getElementById("client-message").value.trim();

  if (
    !SUPABASE_URL.startsWith("https://") ||
    SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR_")
  ) {
    statusMessage.textContent =
      "The database connection is not configured yet.";
    return;
  }

  const message = `
SADEQ CREATIVES - NEW SERVICE INQUIRY

Customer Name: ${name}
Customer Email: ${email}
Customer WhatsApp: ${phone}
Service Requested: ${service}
Budget: ${budget || "Not specified"}

Project Details:
${details}
  `.trim();

  const encodedMessage = encodeURIComponent(message);

  // Prepare the existing contact options.
  whatsappLink.href =
    "https://wa.me/" +
    BUSINESS_WHATSAPP +
    "?text=" +
    encodedMessage;

  emailLink.href =
    "mailto:" +
    BUSINESS_EMAIL +
    "?subject=" +
    encodeURIComponent("New Sadeq Creatives Service Inquiry") +
    "&body=" +
    encodedMessage;

  // Prevent duplicate submissions while saving.
  submitButton.disabled = true;
  statusMessage.textContent = "Saving your request...";
  contactOptions.hidden = true;

  try {
    const response = await fetch(
      SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/appointment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Authorization": "Bearer " + SUPABASE_PUBLISHABLE_KEY,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          client_name: name,
          email: email,
          whatsapp: phone,
          service: service,
          budget: budget || null,
          message: details,
          status: "pending"
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Database request failed.");
    }

    statusMessage.textContent =
      "Your request has been saved! Choose WhatsApp or email to contact us.";
    form.reset();

    contactOptions.hidden = false;

    contactOptions.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  } catch (error) {
    console.error("Appointment submission error:", error);

    statusMessage.textContent =
      "We couldn't save your request. Please try again. Your WhatsApp option is still available.";

    // Keep WhatsApp available even if the database fails.
    contactOptions.hidden = false;

  } finally {
    submitButton.disabled = false;
  }
});
