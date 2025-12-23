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
  
  // Initialize sidebar close button
  initSidebarClose();

  // Load saved theme
  loadAdminTheme();
  
  // Update theme display
  updateCurrentThemeDisplay();

  // Initialize sections
  initDashboardSection();
  initUsersSection();
  initPenaltiesSection();
  initAddAdminSection();
  initSettingsSection();

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
  if (hamburger) {
    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      sidebar.classList.toggle("show");
      
      // Add overlay to content area when sidebar is open
      const contentArea = document.querySelector(".admin-content-area");
      if (sidebar.classList.contains("show")) {
        contentArea.style.position = "relative";
        contentArea.style.zIndex = "1";
      } else {
        contentArea.style.position = "";
        contentArea.style.zIndex = "";
      }
    });
  }

  // Sidebar navigation
  sidebarItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      sidebarItems.forEach((i) => i.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Show the corresponding section
      const section = this.dataset.section;
      showSection(section);

      // Close sidebar on mobile after clicking
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("show");
      }
    });
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", function (event) {
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains("show")) {
      if (!sidebar.contains(event.target) && event.target !== hamburger) {
        sidebar.classList.remove("show");
      }
    }
  });

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

// ================== SIDEBAR CLOSE FUNCTIONALITY ==================
function initSidebarClose() {
  const closeBtn = document.querySelector('.sidebar-close-btn');
  const sidebar = document.querySelector('.admin-sidebar');
  
  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      sidebar.classList.remove('show');
    });
  }
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
      case "settings":
        initSettingsSection();
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

// ================== SETTINGS SECTION ==================
function initSettingsSection() {
  // Update current theme display
  updateCurrentThemeDisplay();
  
  // Load saved settings
  loadSettings();
  
  // Initialize setting controls
  initSettingControls();
  
  // Calculate storage usage
  updateStorageUsage();
}

function updateCurrentThemeDisplay() {
  const currentTheme = localStorage.getItem("adminTheme") || "light";
  const themeNames = {
    light: "Light Theme",
    dark: "Dark Theme",
    blue: "Blue Theme",
    green: "Green Theme"
  };
  
  const currentThemeElement = document.getElementById("currentThemeName");
  if (currentThemeElement) {
    currentThemeElement.textContent = themeNames[currentTheme];
  }
  
  // Update active theme button
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.theme === currentTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function loadSettings() {
  const autoLogout = document.getElementById('autoLogout');
  const saveLogin = document.getElementById('saveLogin');
  
  if (autoLogout) {
    autoLogout.checked = localStorage.getItem('adminAutoLogout') !== 'false';
  }
  
  if (saveLogin) {
    saveLogin.checked = localStorage.getItem('adminSaveLogin') === 'true';
  }
}

function initSettingControls() {
  const autoLogout = document.getElementById('autoLogout');
  const saveLogin = document.getElementById('saveLogin');
  
  if (autoLogout) {
    autoLogout.addEventListener('change', function() {
      localStorage.setItem('adminAutoLogout', this.checked);
      alert(`Auto logout ${this.checked ? 'enabled' : 'disabled'}`);
    });
  }
  
  if (saveLogin) {
    saveLogin.addEventListener('change', function() {
      localStorage.setItem('adminSaveLogin', this.checked);
      if (this.checked) {
        alert('Login will be remembered for 7 days');
      } else {
        alert('Login will not be remembered');
      }
    });
  }
}

function updateStorageUsage() {
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    totalSize += key.length + value.length;
  }
  
  const storageUsed = document.getElementById('storageUsed');
  if (storageUsed) {
    storageUsed.textContent = `${(totalSize / 1024).toFixed(2)} KB`;
  }
}

// ================== SETTINGS ACTIONS ==================
function changeAdminPassword() {
  const currentPass = prompt("Enter current admin password:");
  if (currentPass !== ADMIN_PASSWORD) {
    alert("Incorrect current password!");
    return;
  }
  
  const newPass = prompt("Enter new admin password:");
  if (!newPass || newPass.length < 6) {
    alert("Password must be at least 6 characters!");
    return;
  }
  
  const confirmPass = prompt("Confirm new admin password:");
  if (newPass !== confirmPass) {
    alert("Passwords don't match!");
    return;
  }
  
  alert(`Admin password changed to: ${newPass}`);
}

function exportData() {
  const data = {
    users: getAllUsers(),
    admins: getAdmins(),
    penalties: getPenalties(),
    exportDate: new Date().toISOString(),
    version: "1.2.1"
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `taskly_admin_export_${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  alert(`Data exported successfully!\n\nFile: ${exportFileDefaultName}\nUsers: ${data.users.length}\nAdmins: ${data.admins.length}\nPenalties: ${data.penalties.length}`);
}

function clearCache() {
  if (confirm("Clear admin panel cache? This will reset theme and settings preferences.")) {
    const keysToKeep = ['tasklyUsers', 'tasklyAdmins', 'tasklyPenalties'];
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!keysToKeep.includes(key) && !key.startsWith('tasklyTasks_') && 
          !key.startsWith('tasklyProfileImg_') && !key.startsWith('tasklyReminders_') &&
          !key.startsWith('tasklyTrash_') && !key.startsWith('tasklyTheme_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    alert(`Cache cleared! Removed ${keysToRemove.length} items.\n\nPage will reload to apply changes.`);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

function resetAdminPanel() {
  if (confirm("Reset all admin panel settings to default?\n\nThis will:\n• Reset theme to Light\n• Clear all settings\n• Keep user data intact")) {
    const keysToRemove = ['adminTheme', 'adminAutoLogout', 'adminSaveLogin'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    alert("Settings reset to default. Page will reload.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

function switchAdminTheme(themeName) {
  console.log("Switching to theme:", themeName);
  
  // Save theme preference
  localStorage.setItem("adminTheme", themeName);
  
  // Apply theme
  applyAdminTheme(themeName);
  
  // Update active theme button
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.theme === themeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update current theme display
  updateCurrentThemeDisplay();
  
  // Show confirmation
  const themeNames = {
    light: "Light Theme",
    dark: "Dark Theme",
    blue: "Blue Theme",
    green: "Green Theme"
  };
  
  alert(`Theme changed to ${themeNames[themeName]}`);
}

function applyAdminTheme(themeName) {
  console.log("Applying theme:", themeName);

  // Remove all theme classes
  const classes = document.body.className.split(" ");
  const filteredClasses = classes.filter((c) => !c.startsWith("theme-"));
  document.body.className = filteredClasses.join(" ");

  // Add the selected theme class
  document.body.classList.add(`theme-${themeName}`);
  console.log("New body classes:", document.body.className);
}

function loadAdminTheme() {
  const savedTheme = localStorage.getItem("adminTheme") || "light";
  applyAdminTheme(savedTheme);
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
window.changeAdminPassword = changeAdminPassword;
window.exportData = exportData;
window.clearCache = clearCache;
window.resetAdminPanel = resetAdminPanel;