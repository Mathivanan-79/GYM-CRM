import { db, formatDate } from './db.js';

// Global reference to the current view container for easy re-renders
let activeContainer = null;
let activeViewName = '';

// Re-render helper
export function refreshActiveView() {
  if (activeContainer && activeViewName) {
    renderView(activeViewName, activeContainer);
  }
}

// Global modal helpers (imported or defined here)
export function openModal(modalId, title, bodyHTML, footerHTML = '') {
  const backdrop = document.getElementById(modalId);
  if (!backdrop) return;
  
  const titleEl = backdrop.querySelector('.modal-title');
  const bodyEl = backdrop.querySelector('.modal-body');
  const footerEl = backdrop.querySelector('.modal-footer');
  
  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = bodyHTML;
  if (footerEl) {
    if (footerHTML) {
      footerEl.innerHTML = footerHTML;
      footerEl.style.display = 'flex';
    } else {
      footerEl.style.display = 'none';
    }
  }
  
  backdrop.classList.add('open');
}

export function closeModal(modalId) {
  const backdrop = document.getElementById(modalId);
  if (backdrop) {
    backdrop.classList.remove('open');
  }
}

// Toast helper
export function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '🔔';
  if (type === 'success') icon = '✅';
  if (type === 'info') icon = 'ℹ️';
  if (type === 'warning') icon = '⚠️';
  if (type === 'danger') icon = '🚨';

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);
  
  // Triggers slide in animation
  setTimeout(() => toast.classList.add('show'), 10);

  const closeToast = () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', closeToast);
  
  // Auto close after 4 seconds
  setTimeout(closeToast, 4000);
}

// Router main call
export function renderView(viewName, container) {
  activeContainer = container;
  activeViewName = viewName;
  container.innerHTML = ''; // Clear container

  switch (viewName) {
    case 'dashboard':
      renderDashboard(container);
      break;
    case 'members':
      renderMembers(container);
      break;
    case 'payments':
      renderRenewals(container);
      break;
    case 'trainers':
      renderTrainers(container);
      break;
    case 'plans':
      renderPlans(container);
      break;
    default:
      renderDashboard(container);
  }
}

/* ==========================================================================
   1. DASHBOARD VIEW RENDERER
   ========================================================================== */
function renderDashboard(container) {
  const stats = db.getDashboardStats();
  const members = db.getMembers();
  
  // Title
  document.getElementById('view-title-text').textContent = 'Dashboard';
  document.getElementById('view-subtitle-text').textContent = 'Gym overview and quick check-in.';

  // Construct HTML
  let html = `
    <!-- Stats Row -->
    <div class="dashboard-grid">
      <div class="card stat-card">
        <div class="stat-info">
          <span class="stat-title">Total Members</span>
          <span class="stat-value">${stats.totalMembers}</span>
          <span class="stat-trend positive">📈 Overall Base</span>
        </div>
        <div class="stat-icon">👥</div>
      </div>
      
      <div class="card stat-card">
        <div class="stat-info">
          <span class="stat-title">Active Members</span>
          <span class="stat-value">${stats.activeMembers}</span>
          <span class="stat-trend positive">🟢 Checked Active</span>
        </div>
        <div class="stat-icon">🔥</div>
      </div>
      
      <div class="card stat-card">
        <div class="stat-info">
          <span class="stat-title">Pending/Overdue</span>
          <span class="stat-value" style="color: var(--status-overdue)">${stats.overdueMembers}</span>
          <span class="stat-trend negative">⚠️ Action Needed</span>
        </div>
        <div class="stat-icon" style="color: var(--status-overdue)">💳</div>
      </div>

      <div class="card stat-card">
        <div class="stat-info">
          <span class="stat-title">Monthly Revenue</span>
          <span class="stat-value">$${stats.monthlyRevenue}</span>
          <span class="stat-trend positive">💰 Last 30 Days</span>
        </div>
        <div class="stat-icon">💵</div>
      </div>
    </div>

    <!-- Interactive Section -->
    <div class="dashboard-interactive-row">
      <!-- Quick Check-In Widget -->
      <div class="card check-in-widget">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Quick Check-In</h2>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 12px;">Type name or member ID to log attendance instantly.</p>
        
        <div class="check-in-input-wrapper">
          <div class="search-wrapper" style="flex-grow: 1;">
            <i class="search-icon">🔍</i>
            <input type="text" id="dashboard-check-in-input" class="form-input search-input" style="width: 100%;" placeholder="Enter member name..." autocomplete="off">
          </div>
          <button id="dashboard-check-in-btn" class="btn btn-primary">Check In</button>
        </div>
        <div id="check-in-suggestions" style="position: relative;"></div>

        <div style="margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 10px;">Today's Attendance (${stats.checkedInToday})</h3>
          <div id="today-attendance-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 140px; overflow-y: auto;">
            ${renderTodayAttendanceList()}
          </div>
        </div>
      </div>

      <!-- Weekly Attendance Chart -->
      <div class="card">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">Weekly Activity</h2>
        <div class="chart-container" id="dashboard-chart-box"></div>
      </div>
    </div>

    <!-- Renewal Alerts Feed -->
    <div class="card">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">Membership Renewal Alerts</h2>
      <div class="alert-feed">
        ${renderRenewalAlerts()}
      </div>
    </div>
  `;

  container.innerHTML = html;
  
  // Draw Chart
  drawWeeklyAttendanceChart();

  // Attach Event Listeners
  setupDashboardListeners();
}

function renderTodayAttendanceList() {
  const members = db.getMembers();
  const todayStr = formatDate(new Date());
  const checkedIn = members.filter(m => m.attendance.includes(todayStr));

  if (checkedIn.length === 0) {
    return `<p style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 12px 0;">No check-ins yet today.</p>`;
  }

  return checkedIn.map(m => {
    const time = "Today"; // client side simulated timestamp if required
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background-color: var(--bg-surface); border-radius: 8px; font-size: 13px;">
        <div style="font-weight: 500;">${m.name} <span style="font-size: 11px; color: var(--text-muted);">(${m.membershipTier})</span></div>
        <div style="color: var(--primary); font-size: 12px; font-weight: 600;">Checked In</div>
      </div>
    `;
  }).join('');
}

function renderRenewalAlerts() {
  const members = db.getMembers();
  const today = new Date();
  
  // Calculate status: overdue or upcoming (within 7 days)
  const alerts = [];
  members.forEach(m => {
    const rDate = new Date(m.renewalDate);
    const diffTime = rDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (m.membershipStatus === 'Overdue') {
      alerts.push({
        member: m,
        days: Math.abs(diffDays),
        type: 'urgent',
        text: `Membership expired ${Math.abs(diffDays)} day(s) ago (${m.renewalDate})`
      });
    } else if (m.membershipStatus === 'Active' && diffDays >= 0 && diffDays <= 7) {
      alerts.push({
        member: m,
        days: diffDays,
        type: 'warning',
        text: `Membership expiring in ${diffDays} day(s) (${m.renewalDate})`
      });
    }
  });

  if (alerts.length === 0) {
    return `<p style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 24px 0;">No renewal alerts. All members are paid up!</p>`;
  }

  // Sort urgent first, then warning
  alerts.sort((a, b) => (a.type === 'urgent' ? -1 : 1));

  return alerts.map(a => `
    <div class="alert-item ${a.type}">
      <div class="alert-info">
        <span class="alert-member-name">${a.member.name}</span>
        <span class="alert-detail">${a.text}</span>
      </div>
      <div class="alert-actions">
        <button class="btn btn-secondary btn-icon-only send-reminder-btn" data-id="${a.member.id}" title="Send Reminder">✉️</button>
        <button class="btn btn-primary renew-membership-btn" data-id="${a.member.id}">Renew</button>
      </div>
    </div>
  `).join('');
}

function drawWeeklyAttendanceChart() {
  const box = document.getElementById('dashboard-chart-box');
  if (!box) return;

  const { labels, counts } = db.getWeeklyAttendanceData();
  const width = box.clientWidth || 500;
  const height = 200;
  const padding = 35;
  const maxCount = Math.max(...counts, 4); // minimum vertical scale of 4 check-ins

  // Build grid lines and labels
  let gridLines = '';
  const gridDivisions = 4;
  for (let i = 0; i <= gridDivisions; i++) {
    const y = padding + (i / gridDivisions) * (height - 2 * padding);
    const value = Math.round(maxCount - (i / gridDivisions) * maxCount);
    gridLines += `
      <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" class="chart-grid-line" />
      <text x="${padding - 10}" y="${y + 4}" fill="var(--text-secondary)" font-size="10" text-anchor="end">${value}</text>
    `;
  }

  // Build points & paths
  const points = [];
  for (let i = 0; i < labels.length; i++) {
    const x = padding + (i / (labels.length - 1)) * (width - 2 * padding);
    const y = height - padding - (counts[i] / maxCount) * (height - 2 * padding);
    points.push({ x, y, label: labels[i], val: counts[i] });
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  let dots = '';
  let dayLabels = '';
  points.forEach(p => {
    dots += `<circle cx="${p.x}" cy="${p.y}" r="5" class="chart-dot" title="${p.label}: ${p.val} check-ins"><title>${p.label}: ${p.val} check-ins</title></circle>`;
    dayLabels += `<text x="${p.x}" y="${height - 10}" fill="var(--text-secondary)" font-size="11" text-anchor="middle">${p.label}</text>`;
  });

  const svg = `
    <svg class="chart-svg" width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" />
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
        </linearGradient>
      </defs>
      
      <!-- Grid -->
      ${gridLines}
      
      <!-- Area Under Line -->
      <path d="${areaPath}" class="chart-area" />
      
      <!-- Chart Line -->
      <path d="${linePath}" class="chart-line" />
      
      <!-- Dots -->
      ${dots}
      
      <!-- X-Axis Labels -->
      ${dayLabels}
    </svg>
  `;

  box.innerHTML = svg;
}

function setupDashboardListeners() {
  const input = document.getElementById('dashboard-check-in-input');
  const checkInBtn = document.getElementById('dashboard-check-in-btn');
  const suggestionsBox = document.getElementById('check-in-suggestions');

  if (!input || !checkInBtn) return;

  const performCheckIn = (member) => {
    const res = db.checkInMember(member.id);
    if (res.success) {
      showToast('Checked In', res.message, 'success');
      refreshActiveView();
    } else {
      showToast('Attendance Warning', res.message, 'warning');
    }
    input.value = '';
    suggestionsBox.innerHTML = '';
  };

  // Autocomplete suggestion rendering
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    suggestionsBox.innerHTML = '';
    if (!query) return;

    const matched = db.getMembers().filter(m => 
      m.name.toLowerCase().includes(query) && m.membershipStatus !== 'Inactive'
    ).slice(0, 5);

    if (matched.length === 0) return;

    const listHtml = matched.map(m => `
      <div class="suggestion-item" data-id="${m.id}" style="padding: 10px 16px; background-color: var(--bg-surface); border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background var(--transition-fast);">
        <strong style="color: var(--text-primary); font-size: 13px;">${m.name}</strong> 
        <span style="font-size: 11px; color: var(--text-secondary); margin-left: 8px;">(${m.membershipTier})</span>
      </div>
    `).join('');

    suggestionsBox.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; right: 0; background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; z-index: 50; box-shadow: var(--shadow-md); max-height: 200px; overflow-y: auto;">
        ${listHtml}
      </div>
    `;

    // Click handler for autocomplete
    suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const member = db.getMemberById(item.dataset.id);
        performCheckIn(member);
      });
    });
  });

  // Submit via button click
  checkInBtn.addEventListener('click', () => {
    const query = input.value.trim().toLowerCase();
    if (!query) return;
    const match = db.getMembers().find(m => m.name.toLowerCase() === query || m.id.toLowerCase() === query);
    if (match) {
      performCheckIn(match);
    } else {
      showToast('Not Found', 'No active member matches that description.', 'danger');
    }
  });

  // Submit via Enter
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = input.value.trim().toLowerCase();
      if (!query) return;
      const match = db.getMembers().find(m => m.name.toLowerCase() === query || m.id.toLowerCase() === query);
      if (match) {
        performCheckIn(match);
      } else {
        // Try to check in the first autocomplete item if available
        const firstSuggestion = suggestionsBox.querySelector('.suggestion-item');
        if (firstSuggestion) {
          const member = db.getMemberById(firstSuggestion.dataset.id);
          performCheckIn(member);
        } else {
          showToast('Not Found', 'No active member matches that description.', 'danger');
        }
      }
    }
  });

  // Global Alert Actions
  document.querySelectorAll('.renew-membership-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const res = db.renewMembership(id);
      if (res) {
        showToast('Membership Renewed', `Collected $${res.amount}. Next renewal is ${res.nextRenewal}.`, 'success');
        refreshActiveView();
      }
    });
  });

  document.querySelectorAll('.send-reminder-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      triggerReminderModal(id);
    });
  });
}

/* ==========================================================================
   2. MEMBERS VIEW RENDERER
   ========================================================================== */
let membersFilterStatus = 'All';
let membersFilterTier = 'All';
let membersSearchQuery = '';

function renderMembers(container) {
  document.getElementById('view-title-text').textContent = 'Members Directory';
  document.getElementById('view-subtitle-text').textContent = 'Manage memberships, assignments, and check profiles.';

  let filtered = db.getMembers().filter(m => {
    const statusMatch = membersFilterStatus === 'All' || m.membershipStatus === membersFilterStatus;
    const tierMatch = membersFilterTier === 'All' || m.membershipTier === membersFilterTier;
    const searchMatch = !membersSearchQuery || 
                        m.name.toLowerCase().includes(membersSearchQuery) ||
                        m.email.toLowerCase().includes(membersSearchQuery) ||
                        m.phone.includes(membersSearchQuery);
    return statusMatch && tierMatch && searchMatch;
  });

  let html = `
    <!-- Top Action bar with search & filter pills -->
    <div class="card" style="display: flex; flex-direction: column; gap: 20px;">
      <div class="member-filters-row">
        <!-- Search bar -->
        <div class="search-wrapper">
          <i class="search-icon">🔍</i>
          <input type="text" id="member-search-input" class="form-input search-input" placeholder="Search by name, email, or phone..." value="${membersSearchQuery}">
        </div>

        <button id="add-member-trigger-btn" class="btn btn-primary">➕ Add Member</button>
      </div>

      <!-- Filters Row -->
      <div class="member-filters-row" style="border-top: 1px solid var(--border-color); padding-top: 16px;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Status Filter</span>
          <div class="filter-pills" id="status-filter-pills">
            <button class="filter-pill ${membersFilterStatus === 'All' ? 'active' : ''}" data-val="All">All</button>
            <button class="filter-pill ${membersFilterStatus === 'Active' ? 'active' : ''}" data-val="Active">Active</button>
            <button class="filter-pill ${membersFilterStatus === 'Overdue' ? 'active' : ''}" data-val="Overdue">Overdue</button>
            <button class="filter-pill ${membersFilterStatus === 'Inactive' ? 'active' : ''}" data-val="Inactive">Inactive</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Tier Filter</span>
          <div class="filter-pills" id="tier-filter-pills">
            <button class="filter-pill ${membersFilterTier === 'All' ? 'active' : ''}" data-val="All">All</button>
            <button class="filter-pill ${membersFilterTier === 'Basic' ? 'active' : ''}" data-val="Basic">Basic</button>
            <button class="filter-pill ${membersFilterTier === 'Standard' ? 'active' : ''}" data-val="Standard">Standard</button>
            <button class="filter-pill ${membersFilterTier === 'VIP' ? 'active' : ''}" data-val="VIP">VIP</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Members Grid -->
    <div class="member-grid">
      ${filtered.length === 0 ? `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 48px;">
          <span style="font-size: 40px; display: block; margin-bottom: 12px;">🔍</span>
          <h3 style="font-size: 18px; margin-bottom: 8px;">No members found</h3>
          <p style="color: var(--text-secondary); font-size: 14px;">Try adjusting your filters or search terms.</p>
        </div>
      ` : filtered.map(m => renderMemberCard(m)).join('')}
    </div>
  `;

  container.innerHTML = html;
  setupMembersListeners();
}

function renderMemberCard(m) {
  const trainer = m.assignedTrainerId ? db.getTrainerById(m.assignedTrainerId) : null;
  const statusClass = `badge-${m.membershipStatus.toLowerCase()}`;
  const tierClass = `badge-tier-${m.membershipTier.toLowerCase()}`;

  return `
    <div class="card member-card" data-id="${m.id}">
      <div class="member-card-header">
        <div class="member-main-info">
          <span class="member-card-name">${m.name}</span>
          <span class="member-card-email">${m.email}</span>
        </div>
        <span class="badge ${statusClass}">${m.membershipStatus}</span>
      </div>

      <div class="member-card-details">
        <div class="detail-row">
          <span class="detail-label">Tier:</span>
          <span class="detail-val badge ${tierClass}">${m.membershipTier}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone:</span>
          <span class="detail-val">${m.phone}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Trainer:</span>
          <span class="detail-val">${trainer ? trainer.name : '<span style="color: var(--text-muted);">None Assigned</span>'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Renewal Date:</span>
          <span class="detail-val" style="color: ${m.membershipStatus === 'Overdue' ? 'var(--status-overdue)' : 'var(--text-primary)'}">${m.renewalDate}</span>
        </div>
      </div>

      <div class="member-card-footer">
        <span style="font-size: 11px; color: var(--text-muted);">Joined ${m.joinedDate}</span>
        <button class="btn btn-secondary btn-icon-only view-profile-btn" data-id="${m.id}" title="View Details">👤</button>
      </div>
    </div>
  `;
}

function setupMembersListeners() {
  const searchInput = document.getElementById('member-search-input');
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      membersSearchQuery = searchInput.value.trim().toLowerCase();
      // Fast list update (grid only) without tearing down filters
      const grid = document.querySelector('.member-grid');
      if (grid) {
        const filtered = db.getMembers().filter(m => {
          const statusMatch = membersFilterStatus === 'All' || m.membershipStatus === membersFilterStatus;
          const tierMatch = membersFilterTier === 'All' || m.membershipTier === membersFilterTier;
          const searchMatch = !membersSearchQuery || 
                              m.name.toLowerCase().includes(membersSearchQuery) ||
                              m.email.toLowerCase().includes(membersSearchQuery) ||
                              m.phone.includes(membersSearchQuery);
          return statusMatch && tierMatch && searchMatch;
        });

        grid.innerHTML = filtered.length === 0 ? `
          <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 48px;">
            <span style="font-size: 40px; display: block; margin-bottom: 12px;">🔍</span>
            <h3 style="font-size: 18px; margin-bottom: 8px;">No members found</h3>
            <p style="color: var(--text-secondary); font-size: 14px;">Try adjusting your filters or search terms.</p>
          </div>
        ` : filtered.map(m => renderMemberCard(m)).join('');

        attachGridCardListeners();
      }
    });
  }

  // Filter Pills
  const statusPills = document.getElementById('status-filter-pills');
  if (statusPills) {
    statusPills.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        membersFilterStatus = btn.dataset.val;
        refreshActiveView();
      });
    });
  }

  const tierPills = document.getElementById('tier-filter-pills');
  if (tierPills) {
    tierPills.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        membersFilterTier = btn.dataset.val;
        refreshActiveView();
      });
    });
  }

  // Add Member Modal trigger
  const addBtn = document.getElementById('add-member-trigger-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const trainersList = db.getTrainers();
      const trainerOptions = trainersList.map(t => `<option value="${t.id}">${t.name} (${t.specialty})</option>`).join('');
      
      const body = `
        <form id="add-member-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" name="name" class="form-input" required placeholder="John Doe">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" name="email" class="form-input" required placeholder="john.doe@gmail.com">
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" name="phone" class="form-input" required placeholder="555-0101">
          </div>
          <div class="form-group">
            <label class="form-label">Membership Tier</label>
            <select name="membershipTier" class="form-select" required>
              <option value="Basic">Basic ($30/mo)</option>
              <option value="Standard" selected>Standard ($50/mo)</option>
              <option value="VIP">VIP ($100/mo)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="membershipStatus" class="form-select">
              <option value="Active" selected>Active</option>
              <option value="Overdue">Overdue</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Assign Trainer</label>
            <select name="assignedTrainerId" class="form-select">
              <option value="">No Trainer Assigned</option>
              ${trainerOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Membership End / Renewal Date</label>
            <input type="date" name="renewalDate" class="form-input" required value="${formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}">
          </div>
        </form>
      `;

      const footer = `
        <button class="btn btn-secondary close-modal-btn" data-modal="global-modal">Cancel</button>
        <button type="submit" form="add-member-form" class="btn btn-primary">Save Member</button>
      `;

      openModal('global-modal', 'Add New Member', body, footer);

      // Submit listener
      document.getElementById('add-member-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        db.addMember(data);
        closeModal('global-modal');
        showToast('Member Added', `${data.name} was successfully registered!`, 'success');
        refreshActiveView();
      });

      document.querySelectorAll('.close-modal-btn').forEach(b => {
        b.addEventListener('click', () => closeModal(b.dataset.modal));
      });
    });
  }

  attachGridCardListeners();
}

function attachGridCardListeners() {
  document.querySelectorAll('.view-profile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMemberProfileModal(btn.dataset.id);
    });
  });

  // Make whole card clickable to view profile
  document.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('click', () => {
      openMemberProfileModal(card.dataset.id);
    });
  });
}

/* MEMBER PROFILE MODAL */
function openMemberProfileModal(memberId) {
  const m = db.getMemberById(memberId);
  if (!m) return;

  const trainer = m.assignedTrainerId ? db.getTrainerById(m.assignedTrainerId) : null;
  const statusClass = `badge-${m.membershipStatus.toLowerCase()}`;
  const tierClass = `badge-tier-${m.membershipTier.toLowerCase()}`;

  // Workout / Diet
  const wPlan = m.workoutPlanId ? db.getPlanById(m.workoutPlanId) : null;
  const dPlan = m.dietPlanId ? db.getPlanById(m.dietPlanId) : null;

  // Payments History List
  const paymentsHtml = m.payments.length === 0 
    ? '<p style="color: var(--text-muted); font-size: 13px;">No payments recorded.</p>' 
    : m.payments.map(p => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background-color: var(--bg-surface); border-radius: 8px; font-size: 13px; margin-bottom: 6px;">
          <div>
            <strong>$${p.amount}</strong> 
            <span style="font-size: 11px; color: var(--text-muted); margin-left: 8px;">Recieved ${p.date}</span>
          </div>
          <span class="badge badge-active" style="padding: 2px 8px; font-size: 10px;">${p.status}</span>
        </div>
      `).join('');

  // Attendance History Calendar (Simulation of last 14 days grid)
  let attendanceHtml = `
    <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary);">
      Total check-ins: <strong>${m.attendance.length}</strong>
    </div>
    <div class="attendance-grid-calendar">
  `;
  // Add headers
  const daysHeader = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  daysHeader.forEach(d => {
    attendanceHtml += `<div class="calendar-day-header">${d}</div>`;
  });

  // Render last 14 days
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const day = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = formatDate(day);
    const dayNum = day.getDate();
    const isAttended = m.attendance.includes(dayStr);
    
    attendanceHtml += `
      <div class="calendar-cell ${isAttended ? 'attended' : ''}" title="${dayStr}">
        ${dayNum}
      </div>
    `;
  }
  attendanceHtml += `</div>`;

  // Workout details preview
  const workoutHtml = wPlan 
    ? `
      <div class="card" style="padding: 16px; margin-bottom: 12px;">
        <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${wPlan.name}</h4>
        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">${wPlan.description}</p>
        <pre style="white-space: pre-wrap; font-size: 12px; background: var(--bg-surface); padding: 10px; border-radius: 6px; font-family: inherit; line-height: 1.4;">${wPlan.details}</pre>
      </div>
    `
    : `<p style="color: var(--text-muted); font-size: 13px;">No workout plan assigned.</p>`;

  const dietHtml = dPlan 
    ? `
      <div class="card" style="padding: 16px; margin-bottom: 12px;">
        <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${dPlan.name}</h4>
        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">${dPlan.description}</p>
        <pre style="white-space: pre-wrap; font-size: 12px; background: var(--bg-surface); padding: 10px; border-radius: 6px; font-family: inherit; line-height: 1.4;">${dPlan.details}</pre>
      </div>
    `
    : `<p style="color: var(--text-muted); font-size: 13px;">No diet plan assigned.</p>`;

  const body = `
    <div class="profile-modal-grid">
      <!-- Profile Left bar -->
      <div class="profile-sidebar">
        <div class="profile-avatar-large">${m.name.charAt(0)}</div>
        <div class="profile-name">${m.name}</div>
        <span class="badge ${statusClass}">${m.membershipStatus}</span>

        <div class="profile-meta-list" style="margin-top: 12px;">
          <div><strong style="color: var(--text-muted)">Tier:</strong> <span class="badge ${tierClass}" style="margin-left:4px;">${m.membershipTier}</span></div>
          <div><strong style="color: var(--text-muted)">Email:</strong> <span style="word-break:break-all;">${m.email}</span></div>
          <div><strong style="color: var(--text-muted)">Phone:</strong> <span>${m.phone}</span></div>
          <div><strong style="color: var(--text-muted)">Trainer:</strong> <span>${trainer ? trainer.name : 'Unassigned'}</span></div>
          <div><strong style="color: var(--text-muted)">Renewal:</strong> <span>${m.renewalDate}</span></div>
          <div><strong style="color: var(--text-muted)">Joined:</strong> <span>${m.joinedDate}</span></div>
        </div>

        <button class="btn btn-secondary delete-member-trigger-btn" data-id="${m.id}" style="margin-top: auto; width: 100%; border-color: rgba(255, 71, 87, 0.4); color: var(--status-overdue);">🗑️ Delete Member</button>
      </div>

      <!-- Tabs and Details area -->
      <div style="display: flex; flex-direction: column;">
        <div class="profile-tabs">
          <button class="profile-tab-btn active" data-tab="tab-attendance">Attendance</button>
          <button class="profile-tab-btn" data-tab="tab-payments">Payments</button>
          <button class="profile-tab-btn" data-tab="tab-plans">Diet & Workouts</button>
        </div>

        <!-- Attendance Content -->
        <div id="tab-attendance" class="profile-tab-content active">
          ${attendanceHtml}
          
          <button class="btn btn-primary check-in-profile-btn" data-id="${m.id}" style="margin-top: 24px; width: 100%;">⚡ Manual Check-In Today</button>
        </div>

        <!-- Payments Content -->
        <div id="tab-payments" class="profile-tab-content">
          ${paymentsHtml}
          ${m.membershipStatus === 'Overdue' ? `
            <button class="btn btn-danger renew-profile-btn" data-id="${m.id}" style="margin-top: 20px; width: 100%;">💳 Collect Payment ($${m.membershipTier === 'VIP' ? '100' : m.membershipTier === 'Standard' ? '50' : '30'}) & Renew</button>
          ` : `
            <button class="btn btn-secondary renew-profile-btn" data-id="${m.id}" style="margin-top: 20px; width: 100%;">💳 Extend Membership (Add 30 Days)</button>
          `}
        </div>

        <!-- Plans Content -->
        <div id="tab-plans" class="profile-tab-content">
          <div style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="font-size: 14px; font-weight: 700; text-transform: uppercase;">Workout Routine</h4>
              <button class="btn btn-secondary assign-plan-trigger" data-id="${m.id}" data-type="workout" style="padding: 4px 10px; font-size:11px;">Change</button>
            </div>
            ${workoutHtml}
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="font-size: 14px; font-weight: 700; text-transform: uppercase;">Diet Plan</h4>
              <button class="btn btn-secondary assign-plan-trigger" data-id="${m.id}" data-type="diet" style="padding: 4px 10px; font-size:11px;">Change</button>
            </div>
            ${dietHtml}
          </div>
          
          <button class="btn btn-secondary print-profile-plans-btn" style="margin-top: 16px; width:100%;">🖨️ Print Diet & Workouts</button>
        </div>
      </div>
    </div>
  `;

  openModal('global-modal', 'Member Profile & Records', body, '');

  // Setup tab toggling
  const modal = document.getElementById('global-modal');
  modal.querySelectorAll('.profile-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
      modal.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      modal.querySelector(`#${tabId}`).classList.add('active');
    });
  });

  // Setup profile actions
  modal.querySelector('.check-in-profile-btn').addEventListener('click', () => {
    const res = db.checkInMember(m.id);
    if (res.success) {
      showToast('Checked In', res.message, 'success');
      closeModal('global-modal');
      refreshActiveView();
    } else {
      showToast('Check-In Failed', res.message, 'warning');
    }
  });

  modal.querySelector('.renew-profile-btn').addEventListener('click', () => {
    const res = db.renewMembership(m.id);
    if (res) {
      showToast('Success', `Collected $${res.amount}. Next renewal is ${res.nextRenewal}.`, 'success');
      closeModal('global-modal');
      refreshActiveView();
    }
  });

  modal.querySelector('.delete-member-trigger-btn').addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete member "${m.name}"? This action is permanent.`)) {
      db.deleteMember(m.id);
      closeModal('global-modal');
      showToast('Member Deleted', `${m.name} was removed.`, 'danger');
      refreshActiveView();
    }
  });

  // Assign plans modal wrapper inside member profile
  modal.querySelectorAll('.assign-plan-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const plansList = db.getPlans().filter(p => p.type === type);
      const activePlanId = type === 'workout' ? m.workoutPlanId : m.dietPlanId;
      
      const optionsHtml = plansList.map(p => `
        <label class="card" style="display: flex; gap:12px; align-items: flex-start; padding: 14px; margin-bottom:12px; cursor: pointer; border-color:${activePlanId === p.id ? 'var(--primary)' : 'var(--border-color)'};">
          <input type="radio" name="planSelect" value="${p.id}" ${activePlanId === p.id ? 'checked' : ''} style="margin-top:4px;">
          <div>
            <strong style="font-size:14px; color:var(--text-primary);">${p.name}</strong>
            <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${p.description}</p>
          </div>
        </label>
      `).join('');

      const assignBody = `
        <form id="assign-plan-form">
          <input type="hidden" name="type" value="${type}">
          <input type="hidden" name="memberId" value="${m.id}">
          <div style="max-height: 250px; overflow-y: auto; padding-right:4px;">
            ${optionsHtml}
            <label class="card" style="display: flex; gap:12px; align-items: flex-start; padding: 14px; margin-bottom:12px; cursor: pointer; border-color:${!activePlanId ? 'var(--primary)' : 'var(--border-color)'};">
              <input type="radio" name="planSelect" value="" ${!activePlanId ? 'checked' : ''} style="margin-top:4px;">
              <div>
                <strong style="font-size:14px; color:var(--text-primary);">None (Remove assigned plan)</strong>
              </div>
            </label>
          </div>
        </form>
      `;

      const assignFooter = `
        <button class="btn btn-secondary back-to-profile" data-id="${m.id}">Back</button>
        <button type="submit" form="assign-plan-form" class="btn btn-primary">Assign Plan</button>
      `;

      openModal('sub-modal', `Assign ${type === 'workout' ? 'Workout' : 'Diet'} Plan`, assignBody, assignFooter);

      document.getElementById('assign-plan-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const planId = formData.get('planSelect');
        
        db.assignPlanToMember(m.id, planId, type);
        closeModal('sub-modal');
        showToast('Plan Assigned', 'Client program was updated.', 'success');
        openMemberProfileModal(m.id); // reload profile
        refreshActiveView();
      });

      document.querySelector('.back-to-profile').addEventListener('click', () => {
        closeModal('sub-modal');
      });
    });
  });

  // Printable plan triggering
  modal.querySelector('.print-profile-plans-btn').addEventListener('click', () => {
    window.print();
  });
}

/* ==========================================================================
   3. PAYMENTS & RENEWALS VIEW RENDERER
   ========================================================================== */
let renewalFilter = 'All'; // 'All', 'Overdue', 'Upcoming', 'Paid'

function renderRenewals(container) {
  document.getElementById('view-title-text').textContent = 'Renewals & Payments';
  document.getElementById('view-subtitle-text').textContent = 'Track billing history, upcoming charges, and simulated notifications.';

  const members = db.getMembers();
  const today = new Date();
  const upcomingLimit = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Group members into lists
  const overdueList = members.filter(m => m.membershipStatus === 'Overdue');
  const upcomingList = members.filter(m => {
    if (m.membershipStatus !== 'Active') return false;
    const rDate = new Date(m.renewalDate);
    return rDate >= today && rDate <= upcomingLimit;
  });
  const activePaidList = members.filter(m => {
    if (m.membershipStatus !== 'Active') return false;
    const rDate = new Date(m.renewalDate);
    return rDate > upcomingLimit;
  });
  const inactiveList = members.filter(m => m.membershipStatus === 'Inactive');

  let tableList = [];
  if (renewalFilter === 'All') {
    tableList = [...overdueList, ...upcomingList, ...activePaidList, ...inactiveList];
  } else if (renewalFilter === 'Overdue') {
    tableList = overdueList;
  } else if (renewalFilter === 'Upcoming') {
    tableList = upcomingList;
  } else if (renewalFilter === 'Paid') {
    tableList = activePaidList;
  }

  let html = `
    <!-- Top summary panel -->
    <div class="dashboard-grid" style="margin-bottom: 8px;">
      <div class="card stat-card">
        <div class="stat-info">
          <span class="stat-title">Overdue Invoices</span>
          <span class="stat-value" style="color:var(--status-overdue);">${overdueList.length}</span>
        </div>
        <div class="stat-icon" style="color:var(--status-overdue);">🚨</div>
      </div>
      <div class="card stat-card">
        <div class="stat-info">
          <span class="stat-title">Expiring Soon (7d)</span>
          <span class="stat-value" style="color:var(--accent-vip);">${upcomingList.length}</span>
        </div>
        <div class="stat-icon" style="color:var(--accent-vip);">⏳</div>
      </div>
      <div class="card stat-card">
        <div class="stat-info">
          <span class="stat-title">Fully Paid Members</span>
          <span class="stat-value">${activePaidList.length}</span>
        </div>
        <div class="stat-icon">✅</div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="card renewals-table-card">
      <div class="table-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div class="filter-pills" id="renewal-table-pills">
          <button class="filter-pill ${renewalFilter === 'All' ? 'active' : ''}" data-val="All">All Renewals (${members.length})</button>
          <button class="filter-pill ${renewalFilter === 'Overdue' ? 'active' : ''}" data-val="Overdue">Overdue (${overdueList.length})</button>
          <button class="filter-pill ${renewalFilter === 'Upcoming' ? 'active' : ''}" data-val="Upcoming">Upcoming 7 Days (${upcomingList.length})</button>
          <button class="filter-pill ${renewalFilter === 'Paid' ? 'active' : ''}" data-val="Paid">Paid (${activePaidList.length})</button>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Renewal Date</th>
              <th>Monthly Fee</th>
              <th style="text-align: right;">Billing Actions</th>
            </tr>
          </thead>
          <tbody>
            ${tableList.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 48px;">
                  No members matched this billing filter.
                </td>
              </tr>
            ` : tableList.map(m => {
              const amounts = { Basic: 30, Standard: 50, VIP: 100 };
              const fee = amounts[m.membershipTier] || 50;
              const statusClass = `badge-${m.membershipStatus.toLowerCase()}`;
              
              // Renewal date highlighted red if overdue
              const dateColor = m.membershipStatus === 'Overdue' ? 'color: var(--status-overdue); font-weight:600;' : '';

              return `
                <tr data-id="${m.id}">
                  <td>
                    <div style="font-weight:600; color:var(--text-primary);">${m.name}</div>
                    <div style="font-size:12px; color:var(--text-secondary);">${m.email}</div>
                  </td>
                  <td><span class="badge badge-tier-${m.membershipTier.toLowerCase()}">${m.membershipTier}</span></td>
                  <td><span class="badge ${statusClass}">${m.membershipStatus}</span></td>
                  <td style="${dateColor}">${m.renewalDate}</td>
                  <td>$${fee}/mo</td>
                  <td style="text-align: right;">
                    <div style="display:inline-flex; gap:8px;">
                      <button class="btn btn-secondary send-reminder-btn" data-id="${m.id}" title="Send Reminder">✉️ Reminder</button>
                      <button class="btn btn-primary renew-membership-btn" data-id="${m.id}">Collect & Renew</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
  setupRenewalsListeners();
}

function setupRenewalsListeners() {
  const pills = document.getElementById('renewal-table-pills');
  if (pills) {
    pills.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        renewalFilter = btn.dataset.val;
        refreshActiveView();
      });
    });
  }

  // Table inner row actions
  document.querySelectorAll('.renew-membership-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const res = db.renewMembership(id);
      if (res) {
        showToast('Membership Renewed', `Collected $${res.amount}. Next renewal is ${res.nextRenewal}.`, 'success');
        refreshActiveView();
      }
    });
  });

  document.querySelectorAll('.send-reminder-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      triggerReminderModal(id);
    });
  });
}

/* AUTOMATIC / SIMULATED RENEWAL REMINDERS MODAL */
function triggerReminderModal(memberId) {
  const m = db.getMemberById(memberId);
  if (!m) return;

  const amounts = { Basic: 30, Standard: 50, VIP: 100 };
  const fee = amounts[m.membershipTier] || 50;

  const subject = `Urgent: Gym Membership Renewal Reminder - GymFlow`;
  const body = `Hi ${m.name},\n\nThis is a friendly reminder that your ${m.membershipTier} Membership ($${fee}/month) at GymFlow is due for renewal on ${m.renewalDate}.\n\nTo avoid any interruption to your facility access, please complete your payment at our front desk or reply directly to this message to renew using your card on file.\n\nThank you for training with us!\n\nBest regards,\nGymFlow Team`;

  const modalBodyHTML = `
    <div class="form-group">
      <label class="form-label">Recipient</label>
      <input type="text" class="form-input" value="${m.name} (${m.email})" readonly>
    </div>
    <div class="form-group">
      <label class="form-label">Reminder Method</label>
      <select id="reminder-method" class="form-select">
        <option value="email" selected>📧 Send Real Email (Opens Mail App)</option>
        <option value="sms">💬 Send Real SMS (Opens SMS App)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Subject</label>
      <input type="text" id="reminder-subject" class="form-input" value="${subject}">
    </div>
    <div class="form-group">
      <label class="form-label">Message Template</label>
      <textarea id="reminder-body" class="form-textarea" rows="8">${body}</textarea>
    </div>
  `;

  const modalFooterHTML = `
    <button class="btn btn-secondary close-modal-btn" data-modal="global-modal">Cancel</button>
    <button id="send-simulated-notification" class="btn btn-primary">🚀 Send Reminder</button>
  `;

  openModal('global-modal', 'Automatic Renewal Reminder Tool', modalBodyHTML, modalFooterHTML);

  document.getElementById('send-simulated-notification').addEventListener('click', () => {
    const method = document.getElementById('reminder-method').value;
    const subjectVal = document.getElementById('reminder-subject').value;
    const bodyVal = document.getElementById('reminder-body').value;
    
    closeModal('global-modal');
    
    if (method === 'email') {
      const mailtoUrl = `mailto:${m.email}?subject=${encodeURIComponent(subjectVal)}&body=${encodeURIComponent(bodyVal)}`;
      window.location.href = mailtoUrl;
      showToast(
        'Email Dispatched', 
        `Opening email client for ${m.name} (${m.email})`, 
        'success'
      );
    } else if (method === 'sms') {
      const smsUrl = `sms:${m.phone}?body=${encodeURIComponent(bodyVal)}`;
      window.location.href = smsUrl;
      showToast(
        'SMS Dispatched', 
        `Opening messaging app for ${m.name} (${m.phone})`, 
        'success'
      );
    }
  });

  document.querySelectorAll('.close-modal-btn').forEach(b => {
    b.addEventListener('click', () => closeModal(b.dataset.modal));
  });
}

/* ==========================================================================
   4. TRAINERS VIEW RENDERER
   ========================================================================== */
function renderTrainers(container) {
  document.getElementById('view-title-text').textContent = 'Trainer Staff & Roster';
  document.getElementById('view-subtitle-text').textContent = 'Assign trainers to members, check client caseloads, and specialities.';

  const trainers = db.getTrainers();
  const members = db.getMembers();

  let html = `
    <div class="trainers-grid">
      ${trainers.map(t => {
        // Find members assigned to this trainer
        const assignedMembers = members.filter(m => m.assignedTrainerId === t.id && m.membershipStatus !== 'Inactive');
        
        // Build assigned members list inside trainer card
        const memberListHtml = assignedMembers.length === 0 
          ? '<p style="color:var(--text-muted); font-size:12px; text-align:center; padding: 12px 0;">No active assigned clients.</p>'
          : assignedMembers.map(m => `
              <div class="assigned-member-pill">
                <span>${m.name}</span>
                <span class="badge badge-tier-${m.membershipTier.toLowerCase()}" style="font-size:10px; padding:2px 6px;">${m.membershipTier}</span>
              </div>
            `).join('');

        return `
          <div class="card trainer-card">
            <div class="trainer-profile-header">
              <div class="trainer-avatar">${t.avatar}</div>
              <div class="trainer-meta">
                <h3>${t.name}</h3>
                <p>${t.specialty}</p>
              </div>
            </div>

            <div class="trainer-stats-row">
              <div class="trainer-stat-item" style="border-right: 1px solid var(--border-color);">
                <span class="trainer-stat-label">Active Clients</span>
                <span class="trainer-stat-val" style="color: var(--primary);">${assignedMembers.length}</span>
              </div>
              <div class="trainer-stat-item">
                <span class="trainer-stat-label">Contact</span>
                <span class="trainer-stat-val" style="font-size:12px; font-weight:600; margin-top:4px;">${t.phone}</span>
              </div>
            </div>

            <div>
              <h4 style="font-size:13px; text-transform:uppercase; color:var(--text-secondary); margin-bottom:8px;">Active Clients List</h4>
              <div class="trainer-assigned-members-list">
                ${memberListHtml}
              </div>
            </div>

            <div style="border-top:1px solid var(--border-color); padding-top:16px; margin-top:auto;">
              <button class="btn btn-secondary assign-client-btn" data-trainer-id="${t.id}" style="width:100%;">➕ Assign Client to ${t.name.split(' ')[0]}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = html;
  setupTrainersListeners();
}

function setupTrainersListeners() {
  document.querySelectorAll('.assign-client-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trainerId = btn.dataset.trainerId;
      const trainer = db.getTrainerById(trainerId);
      const members = db.getMembers().filter(m => m.assignedTrainerId !== trainerId && m.membershipStatus !== 'Inactive');

      const options = members.map(m => `<option value="${m.id}">${m.name} (Current: ${m.assignedTrainerId ? db.getTrainerById(m.assignedTrainerId).name : 'None'})</option>`).join('');

      const body = `
        <form id="assign-trainer-form">
          <input type="hidden" name="trainerId" value="${trainerId}">
          <div class="form-group">
            <label class="form-label">Select Member</label>
            <select name="memberId" class="form-select" required>
              <option value="" disabled selected>Choose a member...</option>
              ${options}
            </select>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary);">Assigning a member will update their active trainer records instantly.</p>
        </form>
      `;

      const footer = `
        <button class="btn btn-secondary close-modal-btn" data-modal="global-modal">Cancel</button>
        <button type="submit" form="assign-trainer-form" class="btn btn-primary">Assign Client</button>
      `;

      openModal('global-modal', `Assign Client to ${trainer.name}`, body, footer);

      document.getElementById('assign-trainer-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const memberId = formData.get('memberId');
        const member = db.getMemberById(memberId);
        
        db.assignTrainer(memberId, trainerId);
        closeModal('global-modal');
        showToast('Trainer Assigned', `Successfully assigned ${member.name} to ${trainer.name}!`, 'success');
        refreshActiveView();
      });

      document.querySelectorAll('.close-modal-btn').forEach(b => {
        b.addEventListener('click', () => closeModal(b.dataset.modal));
      });
    });
  });
}

/* ==========================================================================
   5. PLANS VIEW RENDERER
   ========================================================================== */
function renderPlans(container) {
  document.getElementById('view-title-text').textContent = 'Diet & Workouts Planner';
  document.getElementById('view-subtitle-text').textContent = 'Design training routines and nutritional guidelines for gym members.';

  const plans = db.getPlans();
  const workouts = plans.filter(p => p.type === 'workout');
  const diets = plans.filter(p => p.type === 'diet');

  let html = `
    <div class="plans-layout">
      <!-- Workouts Section -->
      <div>
        <div class="plan-section-header">
          <h2 style="font-size:20px; font-weight:700;">Workout Routines</h2>
          <button class="btn btn-primary create-plan-btn" data-type="workout" style="padding:8px 16px; font-size:13px;">➕ Add Workout</button>
        </div>
        <div class="plans-list">
          ${workouts.map(w => renderPlanItemCard(w)).join('')}
        </div>
      </div>

      <!-- Diets Section -->
      <div>
        <div class="plan-section-header">
          <h2 style="font-size:20px; font-weight:700;">Diet & Nutrition</h2>
          <button class="btn btn-primary create-plan-btn" data-type="diet" style="padding:8px 16px; font-size:13px;">➕ Add Diet</button>
        </div>
        <div class="plans-list">
          ${diets.map(d => renderPlanItemCard(d)).join('')}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  setupPlansListeners();
}

function renderPlanItemCard(plan) {
  return `
    <div class="card plan-item-card" data-id="${plan.id}">
      <div class="plan-item-header">
        <span class="plan-item-title">${plan.name}</span>
        <span class="badge badge-tier-basic" style="font-size:10px; padding:2px 8px; text-transform:uppercase;">${plan.type}</span>
      </div>
      <p class="plan-item-desc">${plan.description}</p>
      <span class="plan-item-preview-btn">🔎 View Routine Details</span>
    </div>
  `;
}

function setupPlansListeners() {
  document.querySelectorAll('.plan-item-card').forEach(card => {
    card.addEventListener('click', () => {
      const plan = db.getPlanById(card.dataset.id);
      if (!plan) return;

      const body = `
        <div style="font-size:14px; line-height:1.5;">
          <p style="color: var(--text-secondary); margin-bottom:16px; font-style:italic;">${plan.description}</p>
          <h4 style="font-weight:700; text-transform:uppercase; font-size:12px; color:var(--text-muted); margin-bottom:8px;">Plan Program Structure:</h4>
          <pre style="white-space: pre-wrap; font-size: 13px; background: var(--bg-surface); padding: 16px; border-radius: 10px; border:1px solid var(--border-color); font-family: inherit; line-height: 1.5; color:var(--text-primary);">${plan.details}</pre>
        </div>
      `;

      const footer = `
        <button class="btn btn-secondary close-modal-btn" data-modal="global-modal">Close</button>
        <button id="assign-plan-global-btn" class="btn btn-primary" data-id="${plan.id}" data-type="${plan.type}">Assign to Member</button>
      `;

      openModal('global-modal', plan.name, body, footer);

      document.querySelectorAll('.close-modal-btn').forEach(b => {
        b.addEventListener('click', () => closeModal(b.dataset.modal));
      });

      // Quick assign inside detail modal
      document.getElementById('assign-plan-global-btn').addEventListener('click', () => {
        closeModal('global-modal');
        // Trigger assignment flow
        const type = plan.type;
        const membersList = db.getMembers().filter(m => m.membershipStatus !== 'Inactive');
        const optionsHtml = membersList.map(m => `<option value="${m.id}">${m.name} (${m.membershipTier})</option>`).join('');

        const assignBody = `
          <form id="assign-plan-global-form">
            <input type="hidden" name="planId" value="${plan.id}">
            <input type="hidden" name="type" value="${type}">
            <div class="form-group">
              <label class="form-label">Select Gym Member</label>
              <select name="memberId" class="form-select" required>
                <option value="" disabled selected>Choose a member...</option>
                ${optionsHtml}
              </select>
            </div>
            <p style="font-size:12px; color:var(--text-secondary);">This will apply the plan "${plan.name}" directly to the member's profile program sheet.</p>
          </form>
        `;

        const assignFooter = `
          <button class="btn btn-secondary close-modal-btn" data-modal="global-modal">Cancel</button>
          <button type="submit" form="assign-plan-global-form" class="btn btn-primary">Confirm Assignment</button>
        `;

        openModal('global-modal', `Assign Plan: ${plan.name}`, assignBody, assignFooter);

        document.getElementById('assign-plan-global-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const memberId = formData.get('memberId');
          const member = db.getMemberById(memberId);

          db.assignPlanToMember(memberId, plan.id, type);
          closeModal('global-modal');
          showToast('Plan Assigned', `Successfully assigned ${plan.name} to ${member.name}!`, 'success');
          refreshActiveView();
        });

        document.querySelectorAll('.close-modal-btn').forEach(b => {
          b.addEventListener('click', () => closeModal(b.dataset.modal));
        });
      });
    });
  });

  // Create plan triggers
  document.querySelectorAll('.create-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;

      const body = `
        <form id="create-plan-form">
          <input type="hidden" name="type" value="${type}">
          <div class="form-group">
            <label class="form-label">Plan Name</label>
            <input type="text" name="name" class="form-input" required placeholder="e.g. Strength Training A, Ketogenic Phase 1">
          </div>
          <div class="form-group">
            <label class="form-label">Brief Description</label>
            <input type="text" name="description" class="form-input" required placeholder="Describe target audience and key goals">
          </div>
          <div class="form-group">
            <label class="form-label">Program Structure Details</label>
            <textarea name="details" class="form-textarea" required placeholder="Detail the exercises, reps, sets or daily meals..."></textarea>
          </div>
        </form>
      `;

      const footer = `
        <button class="btn btn-secondary close-modal-btn" data-modal="global-modal">Cancel</button>
        <button type="submit" form="create-plan-form" class="btn btn-primary">Create Plan</button>
      `;

      openModal('global-modal', `Create New ${type === 'workout' ? 'Workout Routine' : 'Diet Plan'}`, body, footer);

      document.getElementById('create-plan-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        db.createPlan(data);
        closeModal('global-modal');
        showToast('Plan Created', `The plan "${data.name}" is now available in the templates library!`, 'success');
        refreshActiveView();
      });

      document.querySelectorAll('.close-modal-btn').forEach(b => {
        b.addEventListener('click', () => closeModal(b.dataset.modal));
      });
    });
  });
}
