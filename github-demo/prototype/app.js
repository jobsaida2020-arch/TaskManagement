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

let tasks = loadTasks();
let editingTaskId = null;
let draggingTaskId = null;

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
      return JSON.parse(raw);
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
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  Object.keys(STATUS_LABELS).forEach((status) => {
    const list = board.querySelector(`.card-list[data-status="${status}"]`);
    list.innerHTML = '';
    tasks
      .filter((task) => task.status === status)
      .forEach((task) => list.appendChild(createCardElement(task)));
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

function setupDragAndDrop() {
  board.querySelectorAll('.card-list').forEach((list) => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      list.classList.add('drag-over');
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
      if (task && task.status !== newStatus) {
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();
        saveTasks();
        render();
        setupDragAndDrop();
      }
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
    tasks.push({
      id: crypto.randomUUID(),
      title,
      description: descriptionInput.value.trim(),
      dueDate: dueDateInput.value,
      priority: priorityInput.value,
      status: modalOverlay.dataset.status || 'not_started',
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

saveTasks();
render();
setupDragAndDrop();
