const STORAGE_KEY = 'taskManagementPrototype.tasks';

const STATUS_LABELS = {
  not_started: '未着手',
  in_progress: '進行中',
  done: '完了',
};

const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

let tasks = loadTasks();
let editingTaskId = null;
let draggingTaskId = null;
let sortModes = { not_started: 'manual', in_progress: 'manual', done: 'manual' };

const board = document.getElementById('board');
const modalOverlay = document.getElementById('taskModalOverlay');
const modalTitle = document.getElementById('modalTitle');
const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('titleInput');
const titleError = document.getElementById('titleError');
const descriptionInput = document.getElementById('descriptionInput');
const dueDateInput = document.getElementById('dueDateInput');
const priorityInput = document.getElementById('priorityInput');
const deleteBtn = document.getElementById('deleteBtn');
const cancelBtn = document.getElementById('cancelBtn');

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      parsed.forEach((task, index) => {
        if (typeof task.order !== 'number') task.order = index;
      });
      return parsed;
    } catch (e) {
      console.error('タスクの読み込みに失敗しました', e);
    }
  }
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      title: '要件定義書を読む',
      description: 'requirements.md の内容を確認する',
      dueDate: '',
      priority: 'medium',
      status: 'not_started',
      order: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'プロトタイプ画面の認識合わせ',
      description: 'HTML/CSS/JSのモックをレビューする',
      dueDate: '',
      priority: 'high',
      status: 'in_progress',
      order: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: 'プロジェクトの雛形作成',
      description: '',
      dueDate: '',
      priority: 'low',
      status: 'done',
      order: 0,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function nextOrderValue(status) {
  const inStatus = tasks.filter((t) => t.status === status);
  if (inStatus.length === 0) return 0;
  return Math.max(...inStatus.map((t) => t.order)) + 1;
}

function getSortedTasksForStatus(status) {
  const list = tasks.filter((task) => task.status === status);
  const mode = sortModes[status];
  if (mode === 'priority') {
    list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.order - b.order);
  } else if (mode === 'dueDate') {
    list.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return a.order - b.order;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate) || a.order - b.order;
    });
  } else {
    list.sort((a, b) => a.order - b.order);
  }
  return list;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  Object.keys(STATUS_LABELS).forEach((status) => {
    const list = board.querySelector(`.card-list[data-status="${status}"]`);
    list.innerHTML = '';
    getSortedTasksForStatus(status).forEach((task) => list.appendChild(createCardElement(task)));
  });
}

function createCardElement(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.draggable = true;
  card.dataset.id = task.id;

  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = task.title;
  card.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const badge = document.createElement('span');
  badge.className = `priority-badge priority-${task.priority}`;
  badge.textContent = PRIORITY_LABELS[task.priority];
  meta.appendChild(badge);

  if (task.dueDate) {
    const due = document.createElement('span');
    due.className = 'due-date';
    due.textContent = task.dueDate;
    meta.appendChild(due);
  }

  card.appendChild(meta);

  card.addEventListener('click', () => openEditModal(task.id));
  card.addEventListener('dragstart', () => {
    draggingTaskId = task.id;
    card.classList.add('dragging');
  });
  card.addEventListener('dragend', () => {
    draggingTaskId = null;
    card.classList.remove('dragging');
  });

  return card;
}

function getDragAfterElement(list, y) {
  const elements = [...list.querySelectorAll('.task-card:not(.dragging)')];
  return elements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

function setupDragAndDrop() {
  board.querySelectorAll('.card-list').forEach((list) => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      list.classList.add('drag-over');
      const dragging = list.querySelector('.task-card.dragging');
      if (!dragging) return;
      const afterElement = getDragAfterElement(list, e.clientY);
      if (afterElement == null) {
        list.appendChild(dragging);
      } else {
        list.insertBefore(dragging, afterElement);
      }
    });
    list.addEventListener('dragleave', () => {
      list.classList.remove('drag-over');
    });
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      list.classList.remove('drag-over');
      if (!draggingTaskId) return;
      const newStatus = list.dataset.status;
      const task = tasks.find((t) => t.id === draggingTaskId);
      if (!task) return;

      task.status = newStatus;
      task.updatedAt = new Date().toISOString();

      // 表示順(DOM上の並び)をそのままtaskのorderに反映し、手動並び替えモードに切り替える
      const orderedIds = [...list.querySelectorAll('.task-card')].map((el) => el.dataset.id);
      orderedIds.forEach((id, index) => {
        const t = tasks.find((x) => x.id === id);
        if (t) t.order = index;
      });
      sortModes[newStatus] = 'manual';
      updateSortButtons(newStatus);

      saveTasks();
      render();
      setupDragAndDrop();
    });
  });
}

function openAddModal(status) {
  editingTaskId = null;
  modalTitle.textContent = 'タスクを追加';
  taskForm.reset();
  priorityInput.value = 'medium';
  clearTitleError();
  deleteBtn.classList.add('hidden');
  modalOverlay.dataset.status = status;
  modalOverlay.classList.add('open');
  titleInput.focus();
}

function openEditModal(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  editingTaskId = taskId;
  modalTitle.textContent = 'タスクを編集';
  titleInput.value = task.title;
  descriptionInput.value = task.description || '';
  dueDateInput.value = task.dueDate || '';
  priorityInput.value = task.priority;
  clearTitleError();
  deleteBtn.classList.remove('hidden');
  modalOverlay.classList.add('open');
  titleInput.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  editingTaskId = null;
  clearTitleError();
}

function clearTitleError() {
  titleInput.classList.remove('invalid');
  titleError.classList.remove('visible');
}

function showTitleError() {
  titleInput.classList.add('invalid');
  titleError.classList.add('visible');
}

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    showTitleError();
    return;
  }
  clearTitleError();

  const now = new Date().toISOString();

  if (editingTaskId) {
    const task = tasks.find((t) => t.id === editingTaskId);
    task.title = title;
    task.description = descriptionInput.value.trim();
    task.dueDate = dueDateInput.value;
    task.priority = priorityInput.value;
    task.updatedAt = now;
  } else {
    const status = modalOverlay.dataset.status || 'not_started';
    tasks.push({
      id: crypto.randomUUID(),
      title,
      description: descriptionInput.value.trim(),
      dueDate: dueDateInput.value,
      priority: priorityInput.value,
      status,
      order: nextOrderValue(status),
      createdAt: now,
      updatedAt: now,
    });
  }

  saveTasks();
  render();
  setupDragAndDrop();
  closeModal();
});

deleteBtn.addEventListener('click', () => {
  if (!editingTaskId) return;
  if (!confirm('このタスクを削除しますか？')) return;
  tasks = tasks.filter((t) => t.id !== editingTaskId);
  saveTasks();
  render();
  setupDragAndDrop();
  closeModal();
});

cancelBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});

board.querySelectorAll('.add-btn').forEach((btn) => {
  btn.addEventListener('click', () => openAddModal(btn.dataset.status));
});

function updateSortButtons(status) {
  const controls = board.querySelector(`.sort-controls[data-status="${status}"]`);
  controls.querySelectorAll('.sort-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.sort === sortModes[status]);
  });
}

board.querySelectorAll('.sort-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const status = btn.closest('.sort-controls').dataset.status;
    sortModes[status] = btn.dataset.sort;
    updateSortButtons(status);
    render();
    setupDragAndDrop();
  });
});

saveTasks();
render();
setupDragAndDrop();
