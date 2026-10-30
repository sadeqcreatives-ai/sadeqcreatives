
// ==========================================
// SADEQ CREATIVES — ADMIN DASHBOARD
// ==========================================

// 1. SUPABASE CONNECTION
const SUPABASE_URL = "https://ggrixtcvslhmsnfjjiwq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_9s-vlv4eHrm3dPY3LT5mOA_tPx13joi";

const ADMIN_USER_ID = "3c9c58d2-70c2-4b96-8299-79deb7ee5b8d";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// 2. GET HTML ELEMENTS
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const loginButton = document.getElementById("login-button");
const loginStatus = document.getElementById("login-status");

const logoutButton = document.getElementById("logout-button");
const refreshButton = document.getElementById("refresh-button");
const dashboardStatus = document.getElementById("dashboard-status");

const appointmentsList = document.getElementById("appointments-list");

const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const approvedCount = document.getElementById("approved-count");
const rejectedCount = document.getElementById("rejected-count");

const appointmentDialog = document.getElementById("appointment-dialog");
const closeDialogButton = document.getElementById("close-dialog");
const appointmentDetails = document.getElementById("appointment-details");

let appointments = [];

// 3. SHOW LOGIN OR DASHBOARD
function showLogin(message = "") {
  loginSection.hidden = false;
  dashboardSection.hidden = true;

  if (message) {
    loginStatus.textContent = message;
  }
}

function showDashboard() {
  loginSection.hidden = true;
  dashboardSection.hidden = false;
}

// 4. VERIFY THAT THE USER IS THE ADMIN
function isAdmin(user) {
  return user && user.id === ADMIN_USER_ID;
}

// 5. ADMIN LOGIN
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginButton.disabled = true;
  loginStatus.textContent = "Signing in...";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  loginButton.disabled = false;

  if (error) {
    loginStatus.textContent = error.message;
    return;
  }

  if (!isAdmin(data.user)) {
    await supabaseClient.auth.signOut();
    loginStatus.textContent = "Access denied. This account is not authorized.";
    return;
  }

  loginStatus.textContent = "";
  showDashboard();
  await loadAppointments();
});

// 6. LOAD APPOINTMENTS FROM SUPABASE
async function loadAppointments() {
  dashboardStatus.textContent = "Loading appointments...";
  refreshButton.disabled = true;

  const { data, error } = await supabaseClient
    .from("appointment")
    .select("*")
    .order("created_at", { ascending: false });

  refreshButton.disabled = false;

  if (error) {
    dashboardStatus.textContent =
      "Could not load appointments: " + error.message;
    return;
  }

  appointments = data || [];

  updateStatistics();
  displayAppointments();

  dashboardStatus.textContent =
    appointments.length + " appointment(s) loaded.";
}

// 7. UPDATE DASHBOARD STATISTICS
function updateStatistics() {
  totalCount.textContent = appointments.length;

  pendingCount.textContent = appointments.filter(
    item => item.status?.toLowerCase() === "pending"
  ).length;

  approvedCount.textContent = appointments.filter(
    item => item.status?.toLowerCase() === "approved"
  ).length;

  rejectedCount.textContent = appointments.filter(
    item => item.status?.toLowerCase() === "rejected"
  ).length;
}

// 8. CREATE A TABLE CELL SAFELY
function createCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value || "—";
  return cell;
}

// 9. DISPLAY APPOINTMENTS
function displayAppointments() {
  appointmentsList.replaceChildren();

  if (appointments.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.textContent = "No appointments have been received yet.";

    row.appendChild(cell);
    appointmentsList.appendChild(row);
    return;
  }

  appointments.forEach((appointment) => {
    const row = document.createElement("tr");

    row.appendChild(createCell(appointment.client_name));
    row.appendChild(createCell(appointment.service));
    row.appendChild(createCell(appointment.budget));

    const statusCell = createCell(appointment.status);
    statusCell.className = "status-" +
      String(appointment.status || "pending").toLowerCase();

    row.appendChild(statusCell);

    const actionCell = document.createElement("td");

    // VIEW BUTTON
    const viewButton = document.createElement("button");
    viewButton.textContent = "View";
    viewButton.className = "action-button view-button";

    viewButton.addEventListener("click", () => {
      viewAppointment(appointment.id);
    });

    actionCell.appendChild(viewButton);

    // APPROVE BUTTON
    const approveButton = document.createElement("button");
    approveButton.textContent = "Approve";
    approveButton.className = "action-button approve-button";

    approveButton.addEventListener("click", () => {
      updateAppointmentStatus(appointment.id, "approved");
    });

    actionCell.appendChild(approveButton);

    // REJECT BUTTON
    const rejectButton = document.createElement("button");
    rejectButton.textContent = "Reject";
    rejectButton.className = "action-button reject-button";

    rejectButton.addEventListener("click", () => {
      updateAppointmentStatus(appointment.id, "rejected");
    });

    actionCell.appendChild(rejectButton);

    row.appendChild(actionCell);
    appointmentsList.appendChild(row);
  });
}

// 10. VIEW APPOINTMENT DETAILS
function viewAppointment(id) {
  const appointment = appointments.find(item => item.id === id);

  if (!appointment) return;

  appointmentDetails.replaceChildren();

  const fields = [
    ["Customer", appointment.client_name],
    ["Email", appointment.email],
    ["WhatsApp", appointment.whatsapp],
    ["Service", appointment.service],
    ["Budget", appointment.budget],
    ["Message", appointment.message],
    ["Status", appointment.status],
    ["Date received", appointment.created_at
      ? new Date(appointment.created_at).toLocaleString()
      : "Not available"]
  ];

  fields.forEach(([label, value]) => {
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = label + ": ";
    paragraph.appendChild(strong);
    paragraph.appendChild(
      document.createTextNode(value || "Not provided")
    );

    appointmentDetails.appendChild(paragraph);
  });

  // WHATSAPP CONTACT LINK
  if (appointment.whatsapp) {
    let phone = String(appointment.whatsapp).replace(/\D/g, "");

    if (phone.startsWith("0")) {
      phone = "234" + phone.substring(1);
    }

    const whatsappLink = document.createElement("a");
    whatsappLink.href =
      "https://wa.me/" + phone +
      "?text=" + encodeURIComponent("Hello, regarding your design request.");
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
    whatsappLink.textContent = "Contact customer on WhatsApp";

    appointmentDetails.appendChild(whatsappLink);
  }

  appointmentDialog.showModal();
}

// 11. APPROVE OR REJECT AN APPOINTMENT
async function updateAppointmentStatus(id, newStatus) {
  const action = newStatus === "approved" ? "approve" : "reject";

  if (!confirm("Are you sure you want to " + action + " this appointment?")) {
    return;
  }

  dashboardStatus.textContent = "Updating appointment...";

  const { error } = await supabaseClient
    .from("appointment")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    dashboardStatus.textContent =
      "Update failed: " + error.message;
    return;
  }

  dashboardStatus.textContent = "Appointment updated successfully.";
  await loadAppointments();
}

// 12. REFRESH BUTTON
refreshButton.addEventListener("click", loadAppointments);

// 13. CLOSE APPOINTMENT DETAILS
closeDialogButton.addEventListener("click", () => {
  appointmentDialog.close();
});

// 14. LOG OUT
logoutButton.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  appointments = [];
  appointmentsList.replaceChildren();
  showLogin("You have been logged out.");
});

// 15. RESTORE SESSION WHEN PAGE OPENS
async function checkExistingSession() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    showLogin();
    return;
  }

  if (!isAdmin(data.session.user)) {
    await supabaseClient.auth.signOut();
    showLogin("Access denied. This account is not authorized.");
    return;
  }

  showDashboard();
  await loadAppointments();
}

// 16. WATCH AUTHENTICATION CHANGES
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    showLogin();
  }

  if (event === "SIGNED_IN" && session) {
    if (!isAdmin(session.user)) {
      supabaseClient.auth.signOut();
      showLogin("Access denied.");
    }
  }
});

// START THE DASHBOARD
checkExistingSession();
