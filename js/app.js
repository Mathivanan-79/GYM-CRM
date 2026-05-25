import { renderView, closeModal } from './views.js';

document.addEventListener('DOMContentLoaded', () => {
  const mainView = document.getElementById('main-view-window');
  const sidebar = document.getElementById('sidebar-nav-container');
  const burgerMenu = document.getElementById('mobile-menu-burger');
  const themeCheckbox = document.getElementById('theme-checkbox');
  const liveDateEl = document.getElementById('live-calendar-date');

  // Set live calendar date in header to readable locale string
  const today = new Date();
  liveDateEl.textContent = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // ==========================================================================
  // Theme Management
  // ==========================================================================
  const currentTheme = localStorage.getItem('gymflow_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  if (themeCheckbox) {
    // Checkbox checked = light mode, unchecked = dark mode
    themeCheckbox.checked = currentTheme === 'light';
    
    themeCheckbox.addEventListener('change', () => {
      const newTheme = themeCheckbox.checked ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('gymflow_theme', newTheme);
    });
  }

  // ==========================================================================
  // Router & Navigation
  // ==========================================================================
  function handleRouting() {
    let hash = window.location.hash.substring(1) || 'dashboard';
    
    // Validate hash list
    const validViews = ['dashboard', 'members', 'payments', 'trainers', 'plans'];
    if (!validViews.includes(hash)) {
      hash = 'dashboard';
    }

    // Update active nav link visual styling
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      if (item.dataset.view === hash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile menu sidebar drawer if open
    if (sidebar) {
      sidebar.classList.remove('open');
    }

    // Render the view page contents
    renderView(hash, mainView);
  }

  window.addEventListener('hashchange', handleRouting);
  // Initial page load trigger
  handleRouting();

  // ==========================================================================
  // Mobile Sidebar Hamburger Control
  // ==========================================================================
  if (burgerMenu && sidebar) {
    burgerMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });

    // Click outside mobile menu to close it
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== burgerMenu) {
        sidebar.classList.remove('open');
      }
    });
  }

  // ==========================================================================
  // Global Modal Event Listeners
  // ==========================================================================
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.modal);
    });
  });

  // Clicking modal backdrop also closes the modal
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });
});
