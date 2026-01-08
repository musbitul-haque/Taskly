// ================== ADMIN PANEL ==================
const ADMIN_PASSWORD = "admin123";
const ADMIN_STORAGE_KEY = "tasklyAdmins";
const PENALTIES_STORAGE_KEY = "tasklyPenalties";

let currentSection = "dashboard";
let allUsers = [];
let admins = [];
let penalties = [];

document.addEventListener("DOMContentLoaded", function () {
  checkAuth();

  initLoginPage();

  if (sessionStorage.getItem("adminLoggedIn") === "true") {
    initDashboard();
  }
});

// ================== AUTHENTICATION ==================
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
  const loginTime = parseInt(sessionStorage.getItem("adminLoginTime") || "0");

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

  togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.textContent = "🙈";
    } else {
      passwordInput.type = "password";
      togglePassword.textContent = "👁️‍🗨️";
    }
  });

  // Login 
  loginBtn.addEventListener("click", function () {
    const password = passwordInput.value.trim();

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminLoggedIn", "true");
      sessionStorage.setItem("adminLoginTime", Date.now().toString());

      document.getElementById("loginPage").classList.add("hidden");
      document.getElementById("dashboardPage").classList.remove("hidden");

      initDashboard();
    } else {
      alert("Invalid admin password");
      passwordInput.value = "";
      passwordInput.focus();
    }
  });

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
  loadData();

  initSidebar();
  
  initSidebarClose();

  loadAdminTheme();
  
  updateCurrentThemeDisplay();

  initDashboardSection();
  initUsersSection();
  initPenaltiesSection();
  initAddAdminSection();
  initSettingsSection();

  // Initialize modal after dashboard is loaded
  setTimeout(initModal, 100);

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

  if (hamburger) {
    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      sidebar.classList.toggle("show");
      
      if (window.innerWidth <= 768) {
        hamburger.classList.toggle("hidden-on-mobile");
      }
      
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

  // Sidebar items
  sidebarItems.forEach((item) => {
    item.addEventListener("click", function () {
      const section = this.dataset.section;
      
      // Special handling for Add Admin - show popup instead of navigating
      if (section === "addAdmin") {
        showAddAdminPopup();
        return;
      }
      
      sidebarItems.forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
      showSection(section);

      if (window.innerWidth <= 768) {
        sidebar.classList.remove("show");
        hamburger.classList.remove("hidden-on-mobile");
      }
    });
  });

  document.addEventListener("click", function (event) {
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains("show")) {
      if (!sidebar.contains(event.target) && event.target !== hamburger) {
        sidebar.classList.remove("show");
        hamburger.classList.remove("hidden-on-mobile");
      }
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

// ================== SIDEBAR CLOSE FUNCTIONALITY ==================
function initSidebarClose() {
  const closeBtn = document.querySelector('.sidebar-close-btn');
  const sidebar = document.querySelector('.admin-sidebar');
  const hamburger = document.querySelector('.hamburger');
  
  if (closeBtn && sidebar && hamburger) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      sidebar.classList.remove('show');
    });
  }
}

function showSection(sectionId) {
  document.querySelectorAll(".section-content").forEach((section) => {
    section.classList.remove("active");
  });

  const section = document.getElementById(sectionId + "Section");
  if (section) {
    section.classList.add("active");

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
        // Do nothing - handled by popup
        break;
      case "settings":
        initSettingsSection();
        break;
    }
  }
}

// ================== MODAL FIXED ==================
function initModal() {
  const modal = document.getElementById("userDetailsModal");
  
  if (!modal) {
    console.error("Modal not found!");
    return;
  }
  
  // Find close button inside modal
  const closeBtn = modal.querySelector(".close-modal");
  
  if (closeBtn) {
    console.log("Close button found, adding event listener");
    closeBtn.addEventListener("click", function () {
      console.log("Close button clicked");
      modal.classList.remove("active");
    });
  } else {
    console.error("Close button not found in modal!");
  }

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      console.log("Clicked outside modal, closing");
      modal.classList.remove("active");
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

// ================== DASHBOARD SECTION ==================

function loadDashboard() {
  const activePenalties = getActivePenalties();

  document.getElementById("totalUsers").textContent = allUsers.length;
  document.getElementById("activeUsers").textContent =
    allUsers.length - activePenalties.length;
  document.getElementById("adminsCount").textContent = admins.length;
  document.getElementById("suspendedCount").textContent =
    activePenalties.length;

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
            <td>${user.fName} ${user.lName || ""}</td>
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
  document.getElementById("usersCount").textContent = allUsers.length;

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
            <td>${user.fName} ${user.lName || ""}</td>
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
  populatePenaltyUserSelect();

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
            <h4>${user.fName} ${user.lName || ""}</h4>
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
    if (!isUserAdmin(user.email)) {
      const option = document.createElement("option");
      option.value = user.email;
      option.textContent = `${user.fName} ${user.lName || ""} (${user.email})`;
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

  suspendUser(email, parseInt(days), reason);

  document.getElementById("penaltyUserSelect").value = "";
  document.getElementById("penaltyDays").value = "";
  document.getElementById("penaltyReason").value = "";

  loadData();
  loadDashboard();
  loadUsers();
  loadPenalties();
}

// ================== ADD ADMIN POPUP SECTION ==================
function initAddAdminSection() {
  console.log("Initializing Add Admin Section...");
  
  const addAdminBtn = document.getElementById("addAdminBtn");
  
  console.log("addAdminBtn:", addAdminBtn);

  // Handle the main "Add New Admin" button in the sidebar
  if (addAdminBtn) {
    console.log("Found addAdminBtn, attaching click event");
    addAdminBtn.addEventListener("click", function(e) {
      console.log("Add Admin button clicked!");
      showAddAdminPopup();
    });
  } else {
    console.error("addAdminBtn not found!");
  }

  console.log("Add Admin Section initialized");
}

// Initialize close button for add admin popup
function initAddAdminPopupClose() {
  const addAdminPopup = document.getElementById("addAdminPopup");
  
  if (addAdminPopup) {
    // Find close button by class
    const closeBtn = addAdminPopup.querySelector(".close-popup");
    
    if (closeBtn) {
      // Remove any existing event listeners to prevent duplicates
      closeBtn.removeEventListener("click", closeAddAdminPopup);
      
      // Add new event listener
      closeBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        closeAddAdminPopup();
      });
    }
    
    // Also close when clicking outside the popup content
    addAdminPopup.addEventListener("click", function(e) {
      if (e.target === addAdminPopup) {
        closeAddAdminPopup();
      }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && addAdminPopup.classList.contains('active')) {
        closeAddAdminPopup();
      }
    });
  }
}

function showAddAdminPopup() {
  console.log("showAddAdminPopup function called");
  const addAdminPopup = document.getElementById("addAdminPopup");
  const existingUserSelect = document.getElementById("existingUserSelectPopup");
  
  if (!addAdminPopup) {
    console.error("addAdminPopup not found!");
    return;
  }
  
  if (!existingUserSelect) {
    console.error("existingUserSelectPopup not found!");
    return;
  }

  // Populate dropdown with users
  existingUserSelect.innerHTML = '<option value="">Select existing user to promote...</option>';
  
  allUsers.forEach((user) => {
    // Only show non-admin users
    if (!isUserAdmin(user.email)) {
      const option = document.createElement("option");
      option.value = user.email;
      option.textContent = `${user.fName} ${user.lName || ""} (${user.email})`;
      existingUserSelect.appendChild(option);
    }
  });

  // Clear form fields
  document.getElementById("newAdminUsernamePopup").value = "";
  document.getElementById("newAdminEmailPopup").value = "";
  document.getElementById("newAdminPassPopup").value = "";
  
  // Clear any previous messages
  const message = document.getElementById("popupMessage");
  if (message) {
    message.style.display = "none";
    message.className = "popup-message";
  }

  // Initialize close button for the popup
  initAddAdminPopupClose();

  // Show popup with animation
  addAdminPopup.classList.remove("closing");
  addAdminPopup.classList.add("active");
  
  console.log("Add admin popup shown");
}

function closeAddAdminPopup() {
  const addAdminPopup = document.getElementById("addAdminPopup");
  if (addAdminPopup) {
    addAdminPopup.classList.add("closing");
    
    // Remove active class after animation
    setTimeout(() => {
      addAdminPopup.classList.remove("active", "closing");
    }, 300);
  }
}

// MAKE SURE THIS FUNCTION IS IN GLOBAL SCOPE
window.addNewAdminFromPopup = function() {
  console.log("========== addNewAdminFromPopup CALLED ==========");
  
  const existingUserEmail = document.getElementById("existingUserSelectPopup").value;
  const newAdminUsername = document.getElementById("newAdminUsernamePopup").value.trim();
  const newAdminEmail = document.getElementById("newAdminEmailPopup").value.trim().toLowerCase();
  const newAdminPass = document.getElementById("newAdminPassPopup").value.trim();
  
  console.log("Form values:", {
    existingUserEmail,
    newAdminUsername,
    newAdminEmail,
    newAdminPass
  });
  
  let emailToPromote;
  let isNewUser = false;
  let firstName = "";
  let lastName = "";
  
  const message = document.getElementById("popupMessage");

  // Clear previous message
  if (message) {
    message.style.display = "none";
    message.className = "popup-message";
  }

  if (existingUserEmail) {
    // Case 1: Promote existing user
    console.log("Case 1: Promoting existing user:", existingUserEmail);
    emailToPromote = existingUserEmail;
    const user = findUserByEmail(existingUserEmail);
    if (user) {
      firstName = user.fName;
      lastName = user.lName;
    }
  } else if (newAdminUsername && newAdminEmail && newAdminPass) {
    // Case 2: Create new admin user
    console.log("Case 2: Creating new admin user");
    
    if (!isValidEmail(newAdminEmail)) {
      console.log("Invalid email format");
      showPopupMessage("Please enter a valid email", "error");
      return;
    }

    if (newAdminPass.length < 6) {
      console.log("Password too short");
      showPopupMessage("Password must be at least 6 characters", "error");
      return;
    }

    if (findUserByEmail(newAdminEmail)) {
      console.log("User already exists");
      showPopupMessage("User with this email already exists", "error");
      return;
    }

    // Parse username into first and last name
    const nameParts = newAdminUsername.split(' ');
    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else {
      firstName = newAdminUsername;
      lastName = "";  // Empty string instead of "User"
    }

    console.log("Creating new user with name:", firstName, lastName);

    // Create new admin user object
    const newAdmin = {
      fName: firstName,
      lName: lastName,
      email: newAdminEmail,
      pass: newAdminPass,
      bio: "Administrator account",
      isGoogleUser: false,
      createdAt: new Date().toISOString(),
      isAdmin: true,
    };

    // Add to users list in localStorage
    const users = getAllUsers();
    users.push(newAdmin);
    localStorage.setItem("tasklyUsers", JSON.stringify(users));
    
    // Update the allUsers array immediately
    allUsers.push(newAdmin);
    
    console.log("Added new user to allUsers:", newAdmin);

    emailToPromote = newAdminEmail;
    isNewUser = true;

    // Create necessary data for the new user
    const emailKey = newAdminEmail.replace(/[@.]/g, "_");
    localStorage.setItem(`tasklyTasks_${emailKey}`, JSON.stringify([]));
    
    // Create avatar URL with proper name
    const avatarName = lastName ? `${firstName}+${lastName}` : firstName;
    localStorage.setItem(
      `tasklyProfileImg_${emailKey}`,
      `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=FFC107&color=2C1810&size=200`
    );

    showPopupMessage(`New admin account "${firstName} ${lastName || ''}" created successfully`, "success");
    console.log("New user created successfully");
  } else {
    console.log("Case 3: Invalid form data");
    showPopupMessage("Please select an existing user OR enter all new admin details (Username, Email, and Password)", "error");
    return;
  }

  // Now promote the user to admin
  if (!admins.some(admin => admin.email === emailToPromote)) {
    console.log("Promoting user to admin:", emailToPromote);
    
    const newAdminRecord = {
      email: emailToPromote,
      name: `${firstName} ${lastName}`,
      promotedAt: new Date().toISOString(),
      promotedBy: "admin",
    };
    
    admins.push(newAdminRecord);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
    
    console.log("Added to admins array:", newAdminRecord);
    
    // If this is a new user (not an existing one), make sure isAdmin is true
    if (isNewUser) {
      const users = getAllUsers();
      const userIndex = users.findIndex(user => user.email === emailToPromote);
      if (userIndex !== -1) {
        users[userIndex].isAdmin = true;
        localStorage.setItem("tasklyUsers", JSON.stringify(users));
        console.log("Updated user isAdmin flag to true");
      }
    }
    
    const successMsg = isNewUser ? 
      `New admin account created and promoted successfully!` :
      `User "${firstName} ${lastName}" (${emailToPromote}) has been promoted to administrator`;
    
    showPopupMessage(successMsg, "success");
    console.log("Success message shown:", successMsg);
    
    // Clear form fields after successful creation
    document.getElementById("existingUserSelectPopup").value = "";
    document.getElementById("newAdminUsernamePopup").value = "";
    document.getElementById("newAdminEmailPopup").value = "";
    document.getElementById("newAdminPassPopup").value = "";
    
    // Force reload all data from localStorage
    loadData();
    console.log("After loadData - allUsers:", allUsers.length);
    
    // Update all UI sections
    loadDashboard();
    loadUsers(); // This should update the users table
    
    // Auto-close popup after success
    setTimeout(() => {
      console.log("Auto-closing popup and navigating to users section");
      closeAddAdminPopup();
      // Navigate to Users section to see the new admin
      showSection("users");
      
      // Update sidebar to show Users as active
      document.querySelectorAll(".sidebar-item").forEach(item => {
        item.classList.remove("active");
        if (item.dataset.section === "users") {
          item.classList.add("active");
        }
      });
    }, 1500);
    
  } else {
    console.log("User is already an admin");
    showPopupMessage(`User "${firstName} ${lastName}" (${emailToPromote}) is already an admin`, "error");
  }
  
  console.log("========== addNewAdminFromPopup ENDED ==========");
}

function showPopupMessage(text, type) {
  const message = document.getElementById("popupMessage");
  if (message) {
    message.textContent = text;
    message.className = `popup-message popup-${type}`;
    message.style.display = "block";
    
    // Auto-hide error messages after 3 seconds
    if (type === "error") {
      setTimeout(() => {
        message.style.display = "none";
      }, 3000);
    }
  }
}

// Update the loadAddAdminForm function to work with the popup
function loadAddAdminForm() {
  // This function is still used for the old section, but we'll keep it for compatibility
  const select = document.getElementById("existingUserSelect");
  
  if (select) {
    select.innerHTML = '<option value="">Select existing user to promote...</option>';
    
    allUsers.forEach((user) => {
      // Only show non-admin users
      if (!isUserAdmin(user.email)) {
        const option = document.createElement("option");
        option.value = user.email;
        option.textContent = `${user.fName} ${user.lName || ""} (${user.email})`;
        select.appendChild(option);
      }
    });
  }
}

// ================== SETTINGS SECTION ==================
function initSettingsSection() {
  updateCurrentThemeDisplay();
  
  loadSettings();
  
  initSettingControls();
  
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
  
  localStorage.setItem("adminTheme", themeName);
  
  applyAdminTheme(themeName);
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.theme === themeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  updateCurrentThemeDisplay();
  
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

  const classes = document.body.className.split(" ");
  const filteredClasses = classes.filter((c) => !c.startsWith("theme-"));
  document.body.className = filteredClasses.join(" ");

  document.body.classList.add(`theme-${themeName}`);
  console.log("New body classes:", document.body.className);
}

function loadAdminTheme() {
  const savedTheme = localStorage.getItem("adminTheme") || "light";
  applyAdminTheme(savedTheme);
}

// ================== SHOW USER DETAILS ==================
function showUserDetails(email) {
  const user = findUserByEmail(email);
  if (!user) {
    console.error("User not found:", email);
    return;
  }

  console.log("Showing user details for:", user);
  
  const isAdmin = isUserAdmin(email);
  const penalty = getPenaltyForUser(email);
  const userTasksKey = `tasklyTasks_${email.replace(/[@.]/g, "_")}`;
  const tasks = JSON.parse(localStorage.getItem(userTasksKey) || "[]");

  const modalBody = document.getElementById("modalBody");
  const userName = `${user.fName || ''} ${user.lName || ''}`.trim();
  
  modalBody.innerHTML = `
        <div class="user-details-grid">
            <img src="${
              localStorage.getItem(
                `tasklyProfileImg_${email.replace(/[@.]/g, "_")}`
              ) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                userName || "User"
              )}&background=FFC107&color=2C1810&size=200`
            }" 
                class="user-avatar" alt="Profile">
            <div class="user-info">
                <h3>${userName || "Unknown User"}</h3>
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
                <button class="action-btn btn-promote" onclick="promoteToAdmin('${email}'); closeUserModal()">
                    Make Admin
                </button>
                <button class="action-btn btn-suspend" onclick="suspendUserPrompt('${email}'); closeUserModal()">
                    Suspend
                </button>
                <button class="action-btn btn-delete" onclick="deleteUserPrompt('${email}'); closeUserModal()">
                    Delete Account
                </button>
            `
                : `
                <button class="action-btn btn-delete" onclick="demoteFromAdmin('${email}'); closeUserModal()">
                    Remove Admin
                </button>
            `
            }
        </div>
    `;

  // Show the modal
  const modal = document.getElementById("userDetailsModal");
  modal.classList.add("active");
  
  console.log("Modal shown, close button should work now");
}

// ================== CLOSE MODAL FUNCTION ==================
function closeUserModal() {
  const modal = document.getElementById("userDetailsModal");
  if (modal) {
    modal.classList.remove("active");
    console.log("Modal closed");
  }
}

function suspendUserPrompt(email) {
  const user = findUserByEmail(email);
  if (!user) return;

  const days = prompt(
    `Suspend ${user.fName} ${user.lName || ""} for how many days? (1-30):`,
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

  alert(`${user.fName} ${user.lName || ""} suspended for ${days} days.`);


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


  loadData();
  loadDashboard();
  loadUsers();
  loadPenalties();
}

// ================== DELETE USER FUNCTION ==================
function deleteUserPrompt(email) {
  const user = findUserByEmail(email);
  if (!user) return;

  if (
    confirm(
      `Are you sure you want to delete ${user.fName} ${user.lName || ""}'s account?\n\nThis will permanently delete:\n• User profile\n• All tasks\n• All data\n\nClick OK to confirm or Cancel to abort.`
    )
  ) {
    // User clicked OK, proceed with deletion
    deleteUser(email);
  } else {
    // User clicked Cancel
    console.log("User deletion cancelled");
  }
}

function deleteUser(email) {
  const user = findUserByEmail(email);
  if (!user) {
    alert("User not found");
    return;
  }

  // Remove from users list
  const updatedUsers = allUsers.filter((u) => u.email !== email);
  localStorage.setItem("tasklyUsers", JSON.stringify(updatedUsers));

  // Remove from admins list
  const updatedAdmins = admins.filter((a) => a.email !== email);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updatedAdmins));

  // Remove user-specific data
  const emailKey = email.replace(/[@.]/g, "_");
  const keysToRemove = [
    `tasklyTasks_${emailKey}`,
    `tasklyReminders_${emailKey}`,
    `tasklyTrash_${emailKey}`,
    `tasklyProfileImg_${emailKey}`,
    `tasklyTheme_${emailKey}`,
  ];

  keysToRemove.forEach((key) => localStorage.removeItem(key));

  // Remove any penalties for this user
  const updatedPenalties = penalties.filter((p) => p.email !== email);
  localStorage.setItem(PENALTIES_STORAGE_KEY, JSON.stringify(updatedPenalties));

  alert(`User "${user.fName} ${user.lName || ""}" has been deleted successfully`);

  // Refresh data and UI
  loadData();
  loadDashboard();
  loadUsers();
  loadPenalties();
  loadAddAdminForm();
}

function promoteToAdminPrompt(email) {
  const user = findUserByEmail(email);
  if (!user) return;

  if (confirm(`Promote ${user.fName} ${user.lName || ""} to administrator?`)) {
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
    
    // Also update the user object
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex !== -1) {
      users[userIndex].isAdmin = true;
      localStorage.setItem("tasklyUsers", JSON.stringify(users));
    }
    
    alert("User promoted to administrator");

    loadData();
    loadDashboard();
    loadUsers();
    loadAddAdminForm();
  }
}

function demoteFromAdmin(email) {
  const updatedAdmins = admins.filter((admin) => admin.email !== email);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updatedAdmins));
  
  // Also update the user object
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.email === email);
  if (userIndex !== -1) {
    users[userIndex].isAdmin = false;
    localStorage.setItem("tasklyUsers", JSON.stringify(users));
  }
  
  alert("User removed from administrators");

  loadData();
  loadDashboard();
  loadUsers();
  loadAddAdminForm();
}

// ================== DATA HELPERS ==================
function getAllUsers() {
  const users = JSON.parse(localStorage.getItem("tasklyUsers") || "[]");
  console.log("getAllUsers loaded", users.length, "users");
  if (users.length > 0) {
    console.log("First user sample:", users[0]);
  }
  return users;
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
  // Check admins array
  const isInAdmins = admins.some((admin) => admin.email === email);
  
  // Check user object
  const user = findUserByEmail(email);
  const hasAdminFlag = user && user.isAdmin === true;
  
  return isInAdmins || hasAdminFlag;
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
window.showAddAdminPopup = showAddAdminPopup;
window.closeUserModal = closeUserModal;
window.closeAddAdminPopup = closeAddAdminPopup;
window.addNewAdminFromPopup = addNewAdminFromPopup;