// ================== ADMIN PANEL ==================

// Configuration
const ADMIN_PASSWORD = "admin123";
const ADMIN_STORAGE_KEY = "tasklyAdmins";
const PENALTIES_STORAGE_KEY = "tasklyPenalties";

// State
let currentSection = "dashboard";
let allUsers = [];
let admins = [];
let penalties = [];

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check authentication
  checkAuth();

  // Initialize login page
  initLoginPage();

  // Initialize dashboard if authenticated
  if (sessionStorage.getItem("adminLoggedIn") === "true") {
    initDashboard();
  }
});

// ================== AUTHENTICATION ==================
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
  const loginTime = parseInt(sessionStorage.getItem("adminLoginTime") || "0");

  // Check if session expired (8 hours)
  if (isLoggedIn && Date.now() - loginTime > 8 * 60 * 60 * 1000) {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminLoginTime");
    window.location.reload();
  }
}

function initLoginPage() {
  const loginBtn = document.getElementById("loginBtn");
  const togglePassword = document.getElementById("toggleAdminPass");
  const passwordInput = document.getElementById("adminPassword");

  if (!loginBtn) return;

  // Toggle password visibility
  togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.textContent = "🙈";
    } else {
      passwordInput.type = "password";
      togglePassword.textContent = "👁️‍🗨️";
    }
  });

  // Login handler
  loginBtn.addEventListener("click", function () {
    const password = passwordInput.value.trim();

    if (password === ADMIN_PASSWORD) {
      // Create admin session
      sessionStorage.setItem("adminLoggedIn", "true");
      sessionStorage.setItem("adminLoginTime", Date.now().toString());

      // Switch to dashboard
      document.getElementById("loginPage").classList.add("hidden");
      document.getElementById("dashboardPage").classList.remove("hidden");

      // Initialize dashboard
      initDashboard();
    } else {
      alert("Invalid admin password");
      passwordInput.value = "";
      passwordInput.focus();
    }
  });

  // Enter key support
  passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      loginBtn.click();
    }
  });
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminLoginTime");
    window.location.reload();
  }
}

// ================== DASHBOARD INITIALIZATION ==================
function initDashboard() {
  // Load data
  loadData();

  // Initialize sidebar
  initSidebar();

  // Load saved theme
  loadAdminTheme();

  // Initialize sections
  initDashboardSection();
  initUsersSection();
  initPenaltiesSection();
  initAddAdminSection();
  initAppearanceSection();

  // Initialize modal
  initModal();

  // Show dashboard section
  showSection("dashboard");
}

function loadData() {
  allUsers = getAllUsers();
  admins = getAdmins();
  penalties = getPenalties();
}

function initSidebar() {
  const hamburger = document.querySelector(".hamburger");
  const sidebar = document.querySelector(".admin-sidebar");
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const logoutBtn = document.querySelector(".logout-btn");

  // Hamburger menu (mobile) - TOGGLE SIDEBAR
  hamburger.addEventListener("click", function (e) {
    e.stopPropagation(); // Prevent event bubbling
    sidebar.classList.toggle("show");
    
    // Add click outside to close
    if (sidebar.classList.contains("show")) {
      setTimeout(() => {
        document.addEventListener("click", function closeSidebar(event) {
          if (!sidebar.contains(event.target) && event.target !== hamburger) {
            sidebar.classList.remove("show");
            document.removeEventListener("click", closeSidebar);
          }
        });
      }, 10);
    }
  });

  // Sidebar navigation
  sidebarItems.forEach((item) => {
    item.addEventListener("click", function () {
      const section = this.dataset.section;
      
      // Check if it's app info
      if (section === "appInfo") {
        showAppInfoModal();
        // Close sidebar on mobile after clicking
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("show");
        }
        return; // Don't change active states
      }
      
      // Remove active class from all items
      sidebarItems.forEach((i) => i.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Show the corresponding section
      showSection(section);

      // Close sidebar on mobile after clicking
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("show");
      }
    });
  });

  // Logout button
  logoutBtn.addEventListener("click", logout);
}

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll(".section-content").forEach((section) => {
    section.classList.remove("active");
  });

  // Show selected section
  const section = document.getElementById(sectionId + "Section");
  if (section) {
    section.classList.add("active");

    // Load section data
    switch (sectionId) {
      case "dashboard":
        loadDashboard();
        break;
      case "users":
        loadUsers();
        break;
      case "penalties":
        loadPenalties();
        break;
      case "addAdmin":
        loadAddAdminForm();
        break;
      case "appearance":
        loadAppearanceForm();
        break;
    }
  }
}

function initModal() {
  const modal = document.getElementById("userDetailsModal");
  const closeBtn = modal.querySelector(".close-modal");

  closeBtn.addEventListener("click", function () {
    modal.classList.remove("active");
  });

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
}

// ================== APP INFORMATION MODAL ==================
function showAppInfoModal() {
  const modalBody = document.getElementById("modalBody");
  if (!modalBody) return;
  
  modalBody.innerHTML = `
    <div class="app-info-modal">
      <div class="app-info-header-modal">
        <img src="https://ui-avatars.com/api/?name=Taskly&background=FFC107&color=2C1810&size=100" 
             class="app-logo" alt="Taskly Logo">
        <h2>Taskly Admin Panel</h2>
        <p class="app-version">Version 1.2.1</p>
      </div>
      
      <div class="app-info-details">
        <div class="info-row">
          <span class="info-label">App Name:</span>
          <span class="info-value">Taskly</span>
        </div>
        <div class="info-row">
          <span class="info-label">Version:</span>
          <span class="info-value">1.2.1</span>
        </div>
        <div class="info-row">
          <span class="info-label">Developer:</span>
          <span class="info-value">Musbitul Haque</span>
        </div>
        <div class="info-row">
          <span class="info-label">Contact:</span>
          <a href="mailto:musbitul.haque.nafis@gmail.com" class="info-value email-link">
            musbitul.haque.nafis@gmail.com
          </a>
        </div>
        <div class="info-row">
          <span class="info-label">Storage:</span>
          <span class="info-value">Local Browser Storage</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total Users:</span>
          <span class="info-value">${allUsers.length}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total Admins:</span>
          <span class="info-value">${admins.length}</span>
        </div>
      </div>
    </div>
  `;
  
  // Show the modal
  document.getElementById("userDetailsModal").classList.add("active");
  
  // Change modal title
  document.querySelector('.modal-header h2').textContent = 'App Information';
}

// ================== DASHBOARD SECTION ==================
function initDashboardSection() {
  // Nothing specific needed here
}

function loadDashboard() {
  const activePenalties = getActivePenalties();

  // Update stats
  document.getElementById("totalUsers").textContent = allUsers.length;
  document.getElementById("activeUsers").textContent =
    allUsers.length - activePenalties.length;
  document.getElementById("adminsCount").textContent = admins.length;
  document.getElementById("suspendedCount").textContent =
    activePenalties.length;

  // Update recent users table
  updateRecentUsersTable(allUsers.slice(-10).reverse());
}

function updateRecentUsersTable(users) {
  const tbody = document.getElementById("recentUsersTable");

  tbody.innerHTML = "";

  users.forEach((user) => {
    const isAdmin = isUserAdmin(user.email);
    const penalty = getPenaltyForUser(user.email);

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${user.fName} ${user.lName}</td>
            <td>${user.email}</td>
            <td>${isAdmin ? "Admin" : "User"}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td><span class="user-status ${
              penalty ? "status-suspended" : "status-active"
            }">
                ${penalty ? "Suspended" : "Active"}
            </span></td>
            <td>
                <button class="action-btn btn-view" onclick="showUserDetails('${
                  user.email
                }')">
                    View
                </button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

// ================== USERS SECTION ==================
function initUsersSection() {
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");

  searchBtn.addEventListener("click", function () {
    searchUsers(searchInput.value);
  });

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchUsers(this.value);
    }
  });
}

function loadUsers() {
  // Update badge
  document.getElementById("usersCount").textContent = allUsers.length;

  // Populate table
  updateUsersTable(allUsers);
}

function updateUsersTable(users) {
  const tbody = document.getElementById("allUsersTable");
  tbody.innerHTML = "";

  users.forEach((user) => {
    const isAdmin = isUserAdmin(user.email);
    const penalty = getPenaltyForUser(user.email);

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${user.fName} ${user.lName}</td>
            <td>${user.email}</td>
            <td>${isAdmin ? "Admin" : "Regular"}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <span class="user-status ${
                  isAdmin
                    ? "status-admin"
                    : penalty
                    ? "status-suspended"
                    : "status-active"
                }">
                    ${isAdmin ? "Admin" : penalty ? "Suspended" : "Active"}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-view" onclick="showUserDetails('${
                      user.email
                    }')">
                        👁️ View
                    </button>
                    ${
                      !isAdmin
                        ? `
                        <button class="action-btn btn-suspend" onclick="suspendUserPrompt('${user.email}')">
                            ⚠️ Suspend
                        </button>
                        <button class="action-btn btn-delete" onclick="deleteUserPrompt('${user.email}')">
                            🗑️ Delete
                        </button>
                        <button class="action-btn btn-promote" onclick="promoteToAdminPrompt('${user.email}')">
                            ⬆️ Promote
                        </button>
                    `
                        : ""
                    }
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function searchUsers(query) {
  const lowerQuery = query.toLowerCase();

  const filteredUsers = allUsers.filter(
    (user) =>
      user.fName.toLowerCase().includes(lowerQuery) ||
      user.lName.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
  );

  updateUsersTable(filteredUsers);
}

// ================== PENALTIES SECTION ==================
function initPenaltiesSection() {
  document
    .getElementById("applyPenaltyBtn")
    .addEventListener("click", applyPenalty);
}

function loadPenalties() {
  // Populate user select
  populatePenaltyUserSelect();

  // Load active penalties
  const activePenalties = getActivePenalties();
  const container = document.getElementById("activePenaltiesList");

  if (activePenalties.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary); text-align: center;">No active penalties</p>';
    return;
  }

  container.innerHTML = "";

  activePenalties.forEach((penalty) => {
    const user = findUserByEmail(penalty.email);
    if (!user) return;

    const penaltyEl = document.createElement("div");
    penaltyEl.className = "penalty-item";
    penaltyEl.innerHTML = `
            <h4>${user.fName} ${user.lName}</h4>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Suspended until:</strong> ${formatDate(
              penalty.endsAt
            )}</p>
            <p><strong>Reason:</strong> ${penalty.reason}</p>
            <div class="penalty-actions">
                <button class="action-btn btn-view" onclick="showUserDetails('${
                  user.email
                }')">
                    View User
                </button>
                <button class="action-btn btn-delete" onclick="removePenalty('${
                  user.email
                }')">
                    Remove Penalty
                </button>
            </div>
        `;
    container.appendChild(penaltyEl);
  });
}

function populatePenaltyUserSelect() {
  const select = document.getElementById("penaltyUserSelect");

  select.innerHTML = '<option value="">Select user...</option>';

  allUsers.forEach((user) => {
    // Don't include admins in penalty list
    if (!isUserAdmin(user.email)) {
      const option = document.createElement("option");
      option.value = user.email;
      option.textContent = `${user.fName} ${user.lName} (${user.email})`;
      select.appendChild(option);
    }
  });
}

function applyPenalty() {
  const email = document.getElementById("penaltyUserSelect").value;
  const days = parseInt(document.getElementById("penaltyDays").value);
  const reason = document.getElementById("penaltyReason").value.trim();

  if (!email || !days || !reason) {
    alert("Please fill all fields");
    return;
  }

  if (days < 1 || days > 30) {
    alert("Please enter days between 1 and 30");
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    alert("User not found");
    return;
  }

  suspendUser(email, days, reason);

  // Clear form
  document.getElementById("penaltyUserSelect").value = "";
  document.getElementById("penaltyDays").value = "";
  document.getElementById("penaltyReason").value = "";

  // Reload data
  loadData();
  loadDashboard();
  loadUsers();
  loadPenalties();
}

// ================== ADD ADMIN SECTION ==================
function initAddAdminSection() {
  document.getElementById("addAdminBtn").addEventListener("click", addNewAdmin);
}

function loadAddAdminForm() {
  const select = document.getElementById("existingUserSelect");

  select.innerHTML = '<option value="">Select existing user...</option>';

  allUsers.forEach((user) => {
    // Only show non-admin users
    if (!isUserAdmin(user.email)) {
      const option = document.createElement("option");
      option.value = user.email;
      option.textContent = `${user.fName} ${user.lName} (${user.email})`;
      select.appendChild(option);
    }
  });
}

function addNewAdmin() {
  const existingUserEmail = document.getElementById("existingUserSelect").value;
  const newAdminEmail = document
    .getElementById("newAdminEmail")
    .value.trim()
    .toLowerCase();
  const newAdminPass = document.getElementById("newAdminPass").value.trim();

  let emailToPromote;

  if (existingUserEmail) {
    emailToPromote = existingUserEmail;
    promoteToAdmin(emailToPromote);
  } else if (newAdminEmail && newAdminPass) {
    // Validate email
    if (!isValidEmail(newAdminEmail)) {
      alert("Please enter a valid email");
      return;
    }

    if (newAdminPass.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // Check if user exists
    if (findUserByEmail(newAdminEmail)) {
      alert("User with this email already exists");
      return;
    }

    // Create new admin user
    const newAdmin = {
      fName: "Admin",
      lName: "User",
      email: newAdminEmail,
      pass: newAdminPass,
      bio: "Administrator account",
      isGoogleUser: false,
      createdAt: new Date().toISOString(),
      isAdmin: true,
    };

    // Save user
    const users = getAllUsers();
    users.push(newAdmin);
    localStorage.setItem("tasklyUsers", JSON.stringify(users));

    // Promote to admin
    emailToPromote = newAdminEmail;

    // Initialize storage
    const emailKey = newAdminEmail.replace(/[@.]/g, "_");
    localStorage.setItem(`tasklyTasks_${emailKey}`, JSON.stringify([]));
    localStorage.setItem(
      `tasklyProfileImg_${emailKey}`,
      `https://ui-avatars.com/api/?name=Admin+User&background=FFC107&color=2C1810&size=200`
    );

    alert("New admin account created successfully");
  } else {
    alert("Please select an existing user or enter new admin details");
    return;
  }

  // Promote user
  promoteToAdmin(emailToPromote);

  // Clear form
  document.getElementById("existingUserSelect").value = "";
  document.getElementById("newAdminEmail").value = "";
  document.getElementById("newAdminPass").value = "";

  // Reload data
  loadData();
  loadDashboard();
  loadUsers();
  loadAddAdminForm();
}

// ================== APPEARANCE SECTION ==================
function initAppearanceSection() {
  // Initialize theme cards
  updateActiveThemeCard();

  // Load saved theme
  loadAdminTheme();
}

function loadAppearanceForm() {
  // This function is called when appearance section is shown
  updateActiveThemeCard();
}

function updateActiveThemeCard() {
  const currentTheme = localStorage.getItem("adminTheme") || "light";
  const themeCards = document.querySelectorAll(".theme-card-admin");

  themeCards.forEach((card) => {
    if (card.dataset.theme === currentTheme) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });
}

function switchAdminTheme(themeName) {
  console.log("Switching to theme:", themeName);

  // Save theme preference
  localStorage.setItem("adminTheme", themeName);

  // Apply theme
  applyAdminTheme(themeName);

  // Update active card
  updateActiveThemeCard();

  // Show confirmation
  showThemeAppliedMessage(themeName);
}

function applyAdminTheme(themeName) {
  // Remove all theme classes
  const classes = document.body.className.split(" ");
  const filteredClasses = classes.filter((c) => !c.startsWith("theme-"));
  document.body.className = filteredClasses.join(" ");

  // Add the selected theme class
  document.body.classList.add(`theme-${themeName}`);
}

function loadAdminTheme() {
  const savedTheme = localStorage.getItem("adminTheme") || "light";
  applyAdminTheme(savedTheme);
}

function showThemeAppliedMessage(themeName) {
  const themeNames = {
    light: "Light Theme",
    dark: "Dark Theme",
    blue: "Blue Theme",
    green: "Green Theme",
  };

  // Show a subtle notification
  alert(`Admin panel theme changed to ${themeNames[themeName]}`);
}

// ================== USER ACTIONS ==================
function showUserDetails(email) {
  const user = findUserByEmail(email);
  if (!user) return;

  const isAdmin = isUserAdmin(email);
  const penalty = getPenaltyForUser(email);
  const userTasksKey = `tasklyTasks_${email.replace(/[@.]/g, "_")}`;
  const tasks = JSON.parse(localStorage.getItem(userTasksKey) || "[]");

  const modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = `
        <div class="user-details-grid">
            <img src="${
              localStorage.getItem(
                `tasklyProfileImg_${email.replace(/[@.]/g, "_")}`
              ) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.fName + " " + user.lName
              )}&background=FFC107&color=2C1810&size=200`
            }" 
                class="user-avatar" alt="Profile">
            <div class="user-info">
                <h3>${user.fName} ${user.lName}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Account Type:</strong> ${
                  isAdmin ? "Administrator" : "Regular User"
                }</p>
                <p><strong>Joined:</strong> ${formatDate(user.createdAt)}</p>
                <p><strong>Bio:</strong> ${user.bio || "No bio set"}</p>
                <p><strong>Status:</strong> ${
                  penalty
                    ? `Suspended until ${formatDate(penalty.endsAt)}`
                    : "Active"
                }</p>
                ${
                  penalty
                    ? `<p><strong>Reason:</strong> ${penalty.reason}</p>`
                    : ""
                }
                <p><strong>Google User:</strong> ${
                  user.isGoogleUser ? "Yes" : "No"
                }</p>
                <p><strong>Total Tasks:</strong> ${tasks.length}</p>
            </div>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
            ${
              !isAdmin
                ? `
                <button class="action-btn btn-promote" onclick="promoteToAdmin('${email}'); document.getElementById('userDetailsModal').classList.remove('active')">
                    Make Admin
                </button>
                <button class="action-btn btn-suspend" onclick="suspendUserPrompt('${email}'); document.getElementById('userDetailsModal').classList.remove('active')">
                    Suspend
                </button>
                <button class="action-btn btn-delete" onclick="deleteUserPrompt('${email}'); document.getElementById('userDetailsModal').classList.remove('active')">
                    Delete Account
                </button>
            `
                : `
                <button class="action-btn btn-delete" onclick="demoteFromAdmin('${email}'); document.getElementById('userDetailsModal').classList.remove('active')">
                    Remove Admin
                </button>
            `
            }
        </div>
    `;

  document.getElementById("userDetailsModal").classList.add("active");
}

function suspendUserPrompt(email) {
  const user = findUserByEmail(email);
  if (!user) return;

  const days = prompt(
    `Suspend ${user.fName} ${user.lName} for how many days? (1-30):`,
    "7"
  );
  if (!days || isNaN(days) || days < 1 || days > 30) {
    alert("Please enter a valid number between 1 and 30");
    return;
  }

  const reason = prompt(
    "Reason for suspension:",
    "Violation of terms of service"
  );
  if (!reason) {
    alert("Please provide a reason");
    return;
  }

  suspendUser(email, parseInt(days), reason);
}

function suspendUser(email, days, reason) {
  const user = findUserByEmail(email);

  if (!user) {
    alert("User not found");
    return;
  }

  // Remove existing penalty for this user
  const filteredPenalties = penalties.filter((p) => p.email !== email);

  const penalty = {
    email,
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    reason,
    active: true,
  };

  filteredPenalties.push(penalty);
  localStorage.setItem(
    PENALTIES_STORAGE_KEY,
    JSON.stringify(filteredPenalties)
  );

  alert(`${user.fName} ${user.lName} suspended for ${days} days.`);

  // Reload data
  loadData();
  loadDashboard();
  loadUsers();
  loadPenalties();
}

function removePenalty(email) {
  const updatedPenalties = penalties.map((p) => {
    if (p.email === email) {
      return { ...p, active: false };
    }
    return p;
  });

  localStorage.setItem(PENALTIES_STORAGE_KEY, JSON.stringify(updatedPenalties));
  alert("Penalty removed");

  // Reload data
  loadData();
  loadDashboard();
  loadUsers();
  loadPenalties();
}

function deleteUserPrompt(email) {
  const user = findUserByEmail(email);
  if (!user) return;

  if (
    !confirm(
      `Are you sure you want to delete ${user.fName} ${user.lName}'s account? This will remove ALL their data permanently.`
    )
  ) {
    return;
  }

  const confirmation = prompt(`Type "DELETE ${user.email}" to confirm:`);
  if (confirmation !== `DELETE ${user.email}`) {
    alert("Deletion cancelled");
    return;
  }

  deleteUser(email);
}

function deleteUser(email) {
  // Remove from users
  const updatedUsers = allUsers.filter((u) => u.email !== email);
  localStorage.setItem("tasklyUsers", JSON.stringify(updatedUsers));

  // Remove from admins
  const updatedAdmins = admins.filter((a) => a.email !== email);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updatedAdmins));

  // Remove user data
  const emailKey = email.replace(/[@.]/g, "_");
  const keysToRemove = [
    `tasklyTasks_${emailKey}`,
    `tasklyReminders_${emailKey}`,
    `tasklyTrash_${emailKey}`,
    `tasklyProfileImg_${emailKey}`,
    `tasklyTheme_${emailKey}`,
  ];

  keysToRemove.forEach((key) => localStorage.removeItem(key));

  // Remove penalties
  const updatedPenalties = penalties.filter((p) => p.email !== email);
  localStorage.setItem(PENALTIES_STORAGE_KEY, JSON.stringify(updatedPenalties));

  alert("User account and all data deleted successfully");

  // Reload data
  loadData();
  loadDashboard();
  loadUsers();
  loadPenalties();
  loadAddAdminForm();
}

function promoteToAdminPrompt(email) {
  const user = findUserByEmail(email);
  if (!user) return;

  if (confirm(`Promote ${user.fName} ${user.lName} to administrator?`)) {
    promoteToAdmin(email);
  }
}

function promoteToAdmin(email) {
  if (!admins.some((admin) => admin.email === email)) {
    admins.push({
      email,
      promotedAt: new Date().toISOString(),
      promotedBy: "admin",
    });
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
    alert("User promoted to administrator");

    // Reload data
    loadData();
    loadDashboard();
    loadUsers();
    loadAddAdminForm();
  }
}

function demoteFromAdmin(email) {
  const updatedAdmins = admins.filter((admin) => admin.email !== email);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updatedAdmins));
  alert("User removed from administrators");

  // Reload data
  loadData();
  loadDashboard();
  loadUsers();
  loadAddAdminForm();
}

// ================== DATA HELPERS ==================
function getAllUsers() {
  return JSON.parse(localStorage.getItem("tasklyUsers") || "[]");
}

function findUserByEmail(email) {
  return allUsers.find((user) => user.email === email);
}

function getAdmins() {
  return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || "[]");
}

function getPenalties() {
  return JSON.parse(localStorage.getItem(PENALTIES_STORAGE_KEY) || "[]");
}

function getActivePenalties() {
  const now = new Date();

  return penalties.filter((penalty) => {
    if (!penalty.active) return false;

    const endsAt = new Date(penalty.endsAt);
    if (endsAt <= now) {
      // Penalty expired, mark as inactive
      penalty.active = false;
      return false;
    }
    return true;
  });
}

function getPenaltyForUser(email) {
  return penalties.find((p) => p.email === email && p.active);
}

function isUserAdmin(email) {
  return admins.some((admin) => admin.email === email);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function formatDate(dateString) {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ================== EXPORT FUNCTIONS FOR GLOBAL USE ==================
window.showUserDetails = showUserDetails;
window.suspendUserPrompt = suspendUserPrompt;
window.deleteUserPrompt = deleteUserPrompt;
window.promoteToAdminPrompt = promoteToAdminPrompt;
window.promoteToAdmin = promoteToAdmin;
window.demoteFromAdmin = demoteFromAdmin;
window.removePenalty = removePenalty;
window.switchAdminTheme = switchAdminTheme;
window.showAppInfoModal = showAppInfoModal;