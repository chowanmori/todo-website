const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const inboxList = document.getElementById("inboxList");
const filterButtons = document.querySelectorAll(".filter-btn");
const taskCounter = document.getElementById("taskCounter");
const calendarView = document.getElementById("calendarView");
const calendarMonth = document.getElementById("calendarMonth");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const themeSelect = document.getElementById("themeSelect");
const focusBtn = document.getElementById("focusBtn");
const shortBreakBtn = document.getElementById("shortBreakBtn");
const startTimerBtn = document.getElementById("startTimerBtn");
const pauseTimerBtn = document.getElementById("pauseTimerBtn");
const resetTimerBtn = document.getElementById("resetTimerBtn");
const timerDisplay = document.getElementById("timerDisplay");
const dailyProgressBar = document.getElementById("dailyProgressBar");
const dailyProgressText = document.getElementById("dailyProgressText");
const overdueList = document.getElementById("overdueList");
const dayModal = document.getElementById("dayModal");
const modalTaskList = document.getElementById("modalTaskList");
const modalDateTitle = document.getElementById("modalDateTitle");
const closeModalBtn = document.getElementById("closeModalBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let currentCalendarDate = new Date();
let selectedDate = "";
let timer;
let timerMinutes = 25;
let timerSeconds = 0;
let isRunning = false;
let currentMode = "focus";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);
}

function updateTimerDisplay() {
  const minutes = String(timerMinutes).padStart(2, "0");
  const seconds = String(timerSeconds).padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (isRunning) {
    return;
  }

  isRunning = true;

  timer = setInterval(() => {
    if (timerMinutes === 0 && timerSeconds === 0) {
      clearInterval(timer);
      isRunning = false;

      if (currentMode === "focus") {
        alert("Focus session finished! Starting break...");
        setShortBreakMode();
      } else {
        alert("Break finished! Back to focus...");
        setFocusMode();
      }

      startTimer();
      return;
    }

    if (timerSeconds === 0) {
      timerMinutes--;
      timerSeconds = 59;
    } else {
      timerSeconds--;
    }

    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;

  if (currentMode === "focus") {
    timerMinutes = 25;
    timerSeconds = 0;
  } else if (currentMode === "shortBreak") {
    timerMinutes = 5;
    timerSeconds = 0;
  }

  updateTimerDisplay();
}

function setFocusMode() {
  currentMode = "focus";
  timerMinutes = 25;
  timerSeconds = 0;
  clearInterval(timer);
  isRunning = false;
  updateTimerDisplay();
}

function setShortBreakMode() {
  currentMode = "shortBreak";
  timerMinutes = 5;
  timerSeconds = 0;
  clearInterval(timer);
  isRunning = false;
  updateTimerDisplay();
}

function updateTaskCounter() {
  const activeTasks = tasks.filter((task) => !task.completed).length;

  if (activeTasks === 1) {
    taskCounter.textContent = "1 task left";
  } else {
    taskCounter.textContent = `${activeTasks} tasks left`;
  }
}

function updateDailyProgress() {
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const todaysTasks = tasks.filter((task) => task.dueDate === todayString);
  const completedTodayTasks = todaysTasks.filter((task) => task.completed);

  const total = todaysTasks.length;
  const completed = completedTodayTasks.length;

  let percentage = 0;

  if (total > 0) {
    percentage = (completed / total) * 100;
  }

  dailyProgressBar.style.width = `${percentage}%`;
  dailyProgressText.textContent = `${completed} / ${total} completed (${percentage.toFixed(1)}%)`;
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function renderCalendarView() {
  calendarView.innerHTML = "";

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  calendarMonth.textContent = `${monthNames[month]} ${year}`;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const filteredTasks = getFilteredTasks().filter((task) => task.dueDate);

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-cell empty";
    calendarView.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    const dayString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (dayString === todayString) {
      cell.classList.add("today");
    }

    if (dayString === selectedDate) {
      cell.classList.add("selected");
    }

    cell.addEventListener("click", () => {
      selectedDate = dayString;
      taskDate.value = dayString;
      taskInput.focus();
      renderCalendarView();
      openDayModal(dayString);
    });

    const dateLabel = document.createElement("div");
    dateLabel.className = "calendar-date";
    dateLabel.textContent = day;

    cell.appendChild(dateLabel);

    const tasksForDay = filteredTasks.filter((task) => task.dueDate === dayString);

    tasksForDay.forEach((task) => {
      const taskDiv = document.createElement("div");
      taskDiv.className = task.completed ? "calendar-task completed" : "calendar-task";
      taskDiv.textContent = task.text;
      cell.appendChild(taskDiv);
    });

    calendarView.appendChild(cell);
  }
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item";

  const span = document.createElement("span");
  span.className = task.completed ? "task-text completed" : "task-text";

  if (task.dueDate) {
    span.textContent = `${task.text} (Due: ${task.dueDate})`;
  } else {
    span.textContent = task.text;
  }

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "task-buttons";

  const completeBtn = document.createElement("button");
  completeBtn.textContent = task.completed ? "Undo" : "Complete";
  completeBtn.addEventListener("click", () => toggleTask(task.id));

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => editTask(task.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  buttonGroup.appendChild(completeBtn);
  buttonGroup.appendChild(editBtn);
  buttonGroup.appendChild(deleteBtn);

  li.appendChild(span);
  li.appendChild(buttonGroup);

  return li;
}

function getTodayString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function renderTasks() {
  taskList.innerHTML = "";
  inboxList.innerHTML = "";
  overdueList.innerHTML = "";

  updateTaskCounter();
  updateDailyProgress();
  renderCalendarView();

  const filteredTasks = getFilteredTasks();
  const todayString = getTodayString();

  const overdueTasks = filteredTasks.filter(
    (task) => task.dueDate && task.dueDate < todayString && !task.completed
  );

  const datedTasks = filteredTasks.filter(
    (task) => task.dueDate && task.dueDate >= todayString
  );

  const undatedTasks = filteredTasks.filter((task) => !task.dueDate);

  overdueTasks.forEach((task) => {
    const li = createTaskElement(task);
    overdueList.appendChild(li);
  });

  datedTasks.forEach((task) => {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  });

  undatedTasks.forEach((task) => {
    const li = createTaskElement(task);
    inboxList.appendChild(li);
  });

  if (overdueTasks.length === 0) {
    overdueList.innerHTML = "<li>No overdue tasks.</li>";
  }

  if (datedTasks.length === 0) {
    taskList.innerHTML = "<li>No upcoming or today's tasks.</li>";
  }

  if (undatedTasks.length === 0) {
    inboxList.innerHTML = "<li>No inbox tasks.</li>";
  }
}

function addTask() {
  const text = taskInput.value.trim();
  const dueDate = taskDate.value;

  if (text === "") {
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
    dueDate: dueDate || ""
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskDate.value = "";
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function isValidDateString(dateString) {
  if (dateString === "") {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function editTask(id) {
  const taskToEdit = tasks.find((task) => task.id === id);

  if (!taskToEdit) {
    return;
  }

  const newText = prompt("Edit your task:", taskToEdit.text);

  if (newText === null) {
    return;
  }

  const trimmedText = newText.trim();

  if (trimmedText === "") {
    return;
  }

  const newDueDate = prompt(
    "Edit due date (YYYY-MM-DD). Leave blank for no due date:",
    taskToEdit.dueDate || ""
  );

  if (newDueDate === null) {
    return;
  }

  const trimmedDueDate = newDueDate.trim();

  if (!isValidDateString(trimmedDueDate)) {
    alert("Please enter a real date in YYYY-MM-DD format.");
    return;
  }

  tasks = tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          text: trimmedText,
          dueDate: trimmedDueDate
        }
      : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    button.classList.remove("active-filter");

    if (button.dataset.filter === filter) {
      button.classList.add("active-filter");
    }
  });

  renderTasks();
}

function openDayModal(dateString) {
  if (!dayModal || !modalTaskList || !modalDateTitle) {
    return;
  }

  modalTaskList.innerHTML = "";
  modalDateTitle.textContent = dateString;

  const dayTasks = tasks.filter((task) => task.dueDate === dateString);

  if (dayTasks.length === 0) {
    modalTaskList.innerHTML = "<li>No tasks for this day.</li>";
  } else {
    dayTasks.forEach((task) => {
      const li = createTaskElement(task);
      modalTaskList.appendChild(li);
    });
  }

  dayModal.classList.remove("hidden");
}

function closeModal() {
  dayModal.classList.add("hidden");
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

if (dayModal) {
  dayModal.addEventListener("click", (e) => {
    if (e.target === dayModal) {
      closeModal();
    }
  });
}

prevMonthBtn.addEventListener("click", () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  renderCalendarView();
});

nextMonthBtn.addEventListener("click", () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  renderCalendarView();
});

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter);
  });
});

themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  localStorage.setItem("theme", selectedTheme);
  applyTheme(selectedTheme);
});

focusBtn.addEventListener("click", setFocusMode);
shortBreakBtn.addEventListener("click", setShortBreakMode);
startTimerBtn.addEventListener("click", startTimer);
pauseTimerBtn.addEventListener("click", pauseTimer);
resetTimerBtn.addEventListener("click", resetTimer);

loadTheme();
updateTimerDisplay();
renderTasks();