// ── State ──────────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('tm_tasks')) || [];
let currentFilter = 'all';

// ── DOM refs ───────────────────────────────────────────
const taskForm      = document.getElementById('task-form');
const taskInput     = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const taskList      = document.getElementById('task-list');
const emptyState    = document.getElementById('empty-state');
const taskCount     = document.getElementById('task-count');
const clearBtn      = document.getElementById('clear-completed');
const filterBtns    = document.querySelectorAll('.filter-btn');

// ── Persistence ────────────────────────────────────────
function save() {
  localStorage.setItem('tm_tasks', JSON.stringify(tasks));
}

// ── Core: addTask ──────────────────────────────────────
function addTask(text, priority = 'medium') {
  const task = {
    id:        Date.now(),
    text:      text.trim(),
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(task);
  save();
  render();
}

// ── Core: deleteTask ───────────────────────────────────
function deleteTask(id) {
  const item = taskList.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.classList.add('removing');
    item.addEventListener('animationend', () => {
      tasks = tasks.filter(t => t.id !== id);
      save();
      render();
    }, { once: true });
  }
}

// ── Core: toggleTask ───────────────────────────────────
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    save();
    render();
  }
}

// ── Helpers ────────────────────────────────────────────
function escape(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

function getFiltered() {
  if (currentFilter === 'active')    return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t =>  t.completed);
  return tasks;
}

function buildTaskItem(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.completed ? ' completed' : ''}`;
  li.dataset.id = task.id;

  li.innerHTML = `
    <label class="task-checkbox">
      <input type="checkbox" ${task.completed ? 'checked' : ''} />
      <span class="checkmark">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="2,6 5,9 10,3"/>
        </svg>
      </span>
    </label>
    <span class="task-text">${escape(task.text)}</span>
    <span class="badge badge-${task.priority}">${task.priority}</span>
    <button class="btn-delete" title="Delete task" aria-label="Delete task">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  li.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleTask(task.id));
  li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));

  return li;
}

// ── Render ─────────────────────────────────────────────
function render() {
  const filtered = getFiltered();
  taskList.innerHTML = '';
  filtered.forEach(task => taskList.appendChild(buildTaskItem(task)));

  const remaining = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
  emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';
}

// ── Event: form submit ─────────────────────────────────
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text, prioritySelect.value);
  taskInput.value = '';
  taskInput.focus();
});

// ── Event: filters ─────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ── Event: clear completed ─────────────────────────────
clearBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed);
  save();
  render();
});

// ── Init ───────────────────────────────────────────────
render();