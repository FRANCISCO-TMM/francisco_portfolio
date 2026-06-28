/* =============================================
   NAVIGATION
   ============================================= */
(function () {
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Active nav link highlighting
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();


/* =============================================
   INTERSECTION OBSERVER — FADE-IN ON SCROLL
   ============================================= */
(function () {
  const targets = document.querySelectorAll('.card, .project-card, .timeline-item, .interest-card, .skill-chip, .task-item');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(t => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(20px)';
    t.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    io.observe(t);
  });
})();


/* =============================================
   ACADEMIC PLANNER
   ============================================= */
(function () {
  if (!document.getElementById('taskForm')) return;

  // State
  let tasks  = JSON.parse(localStorage.getItem('portfolio_tasks') || '[]');
  let filter = 'all';

  const form        = document.getElementById('taskForm');
  const taskInput   = document.getElementById('taskInput');
  const prioritySel = document.getElementById('taskPriority');
  const taskList    = document.getElementById('taskList');
  const totalEl     = document.getElementById('totalCount');
  const doneEl      = document.getElementById('doneCount');
  const pendingEl   = document.getElementById('pendingCount');
  const filterBtns  = document.querySelectorAll('.filter-btn');

  function save () { localStorage.setItem('portfolio_tasks', JSON.stringify(tasks)); }

  function genId () { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

  function addTask (text, priority) {
    tasks.unshift({ id: genId(), text, priority, done: false, created: new Date().toISOString() });
    save();
    render();
  }

  function toggleTask (id) {
    tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    save();
    render();
  }

  function deleteTask (id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }

  function visibleTasks () {
    if (filter === 'pending')   return tasks.filter(t => !t.done);
    if (filter === 'completed') return tasks.filter(t =>  t.done);
    return tasks;
  }

  function updateSummary () {
    const total   = tasks.length;
    const done    = tasks.filter(t => t.done).length;
    const pending = total - done;
    if (totalEl)   totalEl.textContent   = total;
    if (doneEl)    doneEl.textContent    = done;
    if (pendingEl) pendingEl.textContent = pending;
  }

  function render () {
    updateSummary();
    const visible = visibleTasks();
    if (!visible.length) {
      taskList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>No tasks here yet.<br>Add one above to get started!</p>
        </div>`;
      return;
    }

    taskList.innerHTML = visible.map(t => `
      <div class="task-item ${t.done ? 'completed' : ''}" data-id="${t.id}">
        <button class="task-check ${t.done ? 'checked' : ''}" onclick="toggleTask('${t.id}')" title="${t.done ? 'Mark incomplete' : 'Mark complete'}"></button>
        <div class="task-content">
          <div class="task-text">${escHtml(t.text)}</div>
          <div class="task-meta">
            <span class="task-priority priority-${t.priority}">${t.priority}</span>
          </div>
        </div>
        <button class="task-delete" onclick="deleteTask('${t.id}')" title="Delete task">✕</button>
      </div>
    `).join('');
  }

  function escHtml (str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Expose to global for inline onclick
  window.toggleTask = toggleTask;
  window.deleteTask = deleteTask;

  // Form submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) { taskInput.focus(); return; }
    addTask(text, prioritySel.value);
    taskInput.value = '';
    taskInput.focus();
  });

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  render();
})();


/* =============================================
   CONTACT FORM VALIDATION
   ============================================= */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  function showError (id, msg) {
    const el = document.getElementById(id);
    const errEl = document.getElementById(id + 'Error');
    if (el) el.classList.add('error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError (id) {
    const el = document.getElementById(id);
    const errEl = document.getElementById(id + 'Error');
    if (el) el.classList.remove('error');
    if (errEl) errEl.textContent = '';
  }

  function validateEmail (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone (phone) {
    return /^\d{7,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // Live validation
  ['contactName','contactEmail','contactPhone','contactMessage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => clearError(id));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const name    = document.getElementById('contactName');
    const email   = document.getElementById('contactEmail');
    const phone   = document.getElementById('contactPhone');
    const message = document.getElementById('contactMessage');

    if (!name || !name.value.trim()) { showError('contactName', 'Please enter your name.'); valid = false; }
    if (!email || !email.value.trim()) { showError('contactEmail', 'Please enter your email.'); valid = false; }
    else if (!validateEmail(email.value)) { showError('contactEmail', 'Please enter a valid email address.'); valid = false; }
    if (!phone || !phone.value.trim()) { showError('contactPhone', 'Please enter your phone number.'); valid = false; }
    else if (!validatePhone(phone.value)) { showError('contactPhone', 'Phone number must contain only digits.'); valid = false; }
    if (!message || !message.value.trim()) { showError('contactMessage', 'Please enter a message.'); valid = false; }

    if (valid) {
      const success = document.getElementById('formSuccess');
      if (success) success.classList.add('show');
      form.reset();
      setTimeout(() => { if (success) success.classList.remove('show'); }, 5000);
    }
  });
})();


/* =============================================
   SKILLS PROGRESS BARS — ANIMATED ON SCROLL
   ============================================= */
(function () {
  const bars = document.querySelectorAll('.bar-fill');
  if (!bars.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => {
    bar.style.animationPlayState = 'paused';
    io.observe(bar);
  });
})();


/* =============================================
   DYNAMIC YEAR IN FOOTER
   ============================================= */
document.querySelectorAll('.year').forEach(el => {
  el.textContent = new Date().getFullYear();
});
