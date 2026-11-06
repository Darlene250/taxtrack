// ===== STATE (kept in memory) =====
let tasks = [];
let nextId = 1;

// ===== HELPERS =====
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  children.forEach((child) => node.appendChild(child));
  return node;
}

function todayString() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function isOverdue(task) {
  return task.status !== "Done" && task.deadline < todayString();
}

// ===== RENDERING =====
function renderSummary() {
  const summary = document.getElementById("summary");
  summary.innerHTML = "";
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "Done").length;
  const overdue = tasks.filter(isOverdue).length;

  [["Total tasks", total], ["Done", done], ["Overdue", overdue]].forEach(([title, value]) => {
    summary.appendChild(el("div", { class: "card" }, [
      el("h2", { text: title }),
      el("p", { text: String(value) })
    ]));
  });
}

function renderTable() {
  const container = document.getElementById("tableContainer");
  container.innerHTML = "";

  const headRow = el("tr");
  ["Client", "Document / task", "Deadline", "Status", "Actions"].forEach((label) => {
    headRow.appendChild(el("th", { scope: "col", text: label }));
  });

  const tbody = el("tbody");
  if (tasks.length === 0) {
    tbody.appendChild(el("tr", {}, [el("td", { colspan: "5", class: "empty", text: "No tasks yet. Add one above." })]));
  }

  // Earliest deadline first
  [...tasks].sort((a, b) => a.deadline.localeCompare(b.deadline)).forEach((task) => {
    const statusSelect = el("select", { "aria-label": "Status for " + task.client });
    ["Pending", "In progress", "Done"].forEach((s) => {
      const option = el("option", { value: s, text: s });
      if (s === task.status) option.selected = true;
      statusSelect.appendChild(option);
    });
    statusSelect.addEventListener("change", () => {
      task.status = statusSelect.value;
      refresh();
    });

    const deleteBtn = el("button", { type: "button", class: "danger", text: "Delete" });
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      refresh();
    });

    const rowClass = task.status === "Done" ? "done" : isOverdue(task) ? "overdue" : "";
    tbody.appendChild(el("tr", { class: rowClass }, [
      el("td", { text: task.client }),
      el("td", { text: task.task }),
      el("td", { text: task.deadline }),
      el("td", {}, [statusSelect]),
      el("td", {}, [deleteBtn])
    ]));
  });

  container.appendChild(el("table", {}, [el("thead", {}, [headRow]), tbody]));
}

function refresh() {
  renderSummary();
  renderTable();
}

// ===== ADD FORM =====
document.getElementById("addForm").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const client = document.getElementById("client").value.trim();
  const task = document.getElementById("task").value.trim();
  const deadline = document.getElementById("deadline").value;
  const status = document.getElementById("status").value;
  const error = document.getElementById("error");

  if (!client || !task || !deadline) {
    error.textContent = "Client, task and deadline are required.";
    return;
  }
  error.textContent = "";
  tasks.push({ id: nextId++, client, task, deadline, status });
  ev.target.reset();
  refresh();
});

// ===== START =====
refresh();