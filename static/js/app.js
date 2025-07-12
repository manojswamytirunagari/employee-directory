const employeeListContainer = document.getElementById("employee-list-container");
const formContainer = document.getElementById("employee-form-container");
const form = document.getElementById("employee-form");
const formTitle = document.getElementById("form-title");

const idInput = document.getElementById("employee-id");
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const emailInput = document.getElementById("email");
const departmentInput = document.getElementById("department");
const roleInput = document.getElementById("role");
const cancelBtn = document.getElementById("cancel-btn");

const sortSelect = document.getElementById("sortSelect");
const itemsPerPageSelect = document.getElementById("itemsPerPage");
const paginationContainer = document.getElementById("pagination");

let currentPage = 1;
let itemsPerPage = 10;
let currentSort = "";
let employeesFiltered = employees;


// ----------- RENDER ----------
function renderEmployees(list) {
  employeeListContainer.innerHTML = "";

  if (list.length === 0) {
    employeeListContainer.innerHTML = "<p>No employees found.</p>";
    return;
  }

  list.forEach(emp => {
    const card = document.createElement("div");
    card.classList.add("employee-card");

    card.innerHTML = `
      <h3>${emp.firstName} ${emp.lastName}</h3>
      <p><strong>ID:</strong> ${emp.id}</p>
      <p><strong>Email:</strong> ${emp.email}</p>
      <p><strong>Department:</strong> ${emp.department}</p>
      <p><strong>Role:</strong> ${emp.role}</p>
      <button class="edit-btn" data-id="${emp.id}">Edit</button>
      <button class="delete-btn" data-id="${emp.id}">Delete</button>
    `;

    employeeListContainer.appendChild(card);
  });
}


function paginate(list, page, perPage) {
  const start = (page - 1) * perPage;
  const end = page * perPage;
  return list.slice(start, end);
}

function renderPaginationButtons(listLength) {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(listLength / itemsPerPage);
  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      updateRender();
    }
  };
  paginationContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      updateRender();
    };
    paginationContainer.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateRender();
    }
  };
  paginationContainer.appendChild(nextBtn);
}

// ---------- SORT ----------
function sortEmployees(sortValue, list) {
  if (!sortValue) return [...list];
  const sorted = [...list];
  const [key, order] = sortValue.split("-");
  sorted.sort((a, b) => {
    let valA = a[key].toLowerCase();
    let valB = b[key].toLowerCase();
    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

// ---------- FORM ----------
function showForm(editing = false, data = null) {
  formContainer?.classList.remove("hidden");
  formTitle.textContent = editing ? "Edit Employee" : "Add Employee";

  if (editing && data) {
    idInput.value = data.id;
    firstNameInput.value = data.firstName;
    lastNameInput.value = data.lastName;
    emailInput.value = data.email;
    departmentInput.value = data.department;
    roleInput.value = data.role;
  } else {
    form?.reset();
    idInput.value = "";
  }
}

function hideForm() {
  formContainer?.classList.add("hidden");
  form?.reset();
  idInput.value = "";
}

// ---------- EVENTS ----------
document.getElementById("add-new-btn")?.addEventListener("click", () => showForm(false));

document.addEventListener("click", e => {
  // Edit
  if (e.target.classList.contains("edit-btn")) {
    const id = parseInt(e.target.dataset.id);
    const emp = employees.find(emp => emp.id === id);
    showForm(true, emp);
  }

  // Delete
  if (e.target.classList.contains("delete-btn")) {
    const id = parseInt(e.target.dataset.id);
    const index = employees.findIndex(emp => emp.id === id);
    if (index !== -1 && confirm("Are you sure you want to delete this employee?")) {
      employees.splice(index, 1);
      employeesFiltered = [...employees];
      updateRender();
    }
  }
});

cancelBtn?.addEventListener("click", hideForm);

form?.addEventListener("submit", e => {
  e.preventDefault();

  const id = idInput.value ? parseInt(idInput.value) : null;
  const employeeData = {
    id: id || Date.now(),
    firstName: firstNameInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
    department: departmentInput.value.trim(),
    role: roleInput.value.trim(),
  };

  if (!employeeData.firstName || !employeeData.lastName || !employeeData.email ||
      !employeeData.department || !employeeData.role) {
    alert("Please fill all fields.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(employeeData.email)) {
    alert("Invalid email format.");
    return;
  }

  if (id) {
    const index = employees.findIndex(emp => emp.id === id);
    if (index !== -1) employees[index] = employeeData;
  } else {
    employees.push(employeeData);
  }

  employeesFiltered = [...employees];
  hideForm();
  updateRender();
});

// ---------- SORT HANDLER ----------
sortSelect?.addEventListener("change", e => {
  currentSort = e.target.value;
  currentPage = 1;
  updateRender();
});

// ---------- PAGINATION HANDLER ----------
itemsPerPageSelect?.addEventListener("change", e => {
  itemsPerPage = parseInt(e.target.value);
  currentPage = 1;
  updateRender();
});

// ---------- FILTER HANDLER ----------
document.getElementById("applyFilterBtn")?.addEventListener("click", () => {
  const selectedDept = document.getElementById("filterDepartment").value;
  const selectedRole = document.getElementById("filterRole").value;

  employeesFiltered = employees.filter(emp => {
    const matchDept = selectedDept ? emp.department === selectedDept : true;
    const matchRole = selectedRole ? emp.role === selectedRole : true;
    return matchDept && matchRole;
  });

  currentPage = 1;
  updateRender();
});

// ---------- TOGGLE FILTER PANEL ----------
document.getElementById("filterToggleBtn")?.addEventListener("click", () => {
  const panel = document.getElementById("filterPanel");
  panel.classList.toggle("hidden");
});

// ---------- FINAL RENDER ----------
function updateRender() {
  let displayList = sortEmployees(currentSort, employeesFiltered);
  const visible = paginate(displayList, currentPage, itemsPerPage);
  renderEmployees(visible);
  renderPaginationButtons(displayList.length);
}

updateRender();
