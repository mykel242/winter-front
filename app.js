import API_BASE_URL from "./config.js";
import UserService from "./UserService.js";

async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/test`);
    if (!response.ok)
      throw new Error(`Backend is unreachable at ${API_BASE_URL}`);

    const backendStatus = document.getElementById("backend-status");
    backendStatus.textContent = "✅ Backend is online";
    backendStatus.classList.add("online");
    backendStatus.classList.remove("offline");
  } catch (error) {
    const backendStatus = document.getElementById("backend-status");
    backendStatus.textContent = "❌ Backend is offline";
    backendStatus.classList.add("offline");
    backendStatus.classList.remove("online");
  }
}

function toggleUserForm() {
  const formContainer = document.getElementById("userFormContainer");
  formContainer.style.display =
    formContainer.style.display === "none" ? "block" : "none";
}

function closeOtherEdits() {
  document.querySelectorAll("tr").forEach((row) => {
    const nameCell = row.querySelector(".name-cell");
    const emailCell = row.querySelector(".email-cell");
    const editButton = row.querySelector(".edit-button");

    if (
      nameCell &&
      emailCell &&
      editButton &&
      editButton.textContent === "💾 Save"
    ) {
      // Cancel edit mode and revert back to original text
      const originalName = nameCell.getAttribute("data-original");
      const originalEmail = emailCell.getAttribute("data-original");
      nameCell.innerHTML = originalName;
      emailCell.innerHTML = originalEmail;
      editButton.textContent = "✏️ Edit";
    }
  });
}

function toggleEditMode(row) {
  const nameCell = row.querySelector(".name-cell");
  const emailCell = row.querySelector(".email-cell");
  const editButton = row.querySelector(".edit-button");

  if (editButton.textContent === "✏️ Edit") {
    // Store original values in case edit is canceled
    nameCell.setAttribute("data-original", nameCell.textContent);
    emailCell.setAttribute("data-original", emailCell.textContent);

    // Switch to edit mode
    nameCell.innerHTML = `<input type='text' value='${nameCell.textContent}' style='width: 100%;'>`;
    emailCell.innerHTML = `<input type='text' value='${emailCell.textContent}' style='width: 100%;'>`;
    editButton.textContent = "💾 Save";
  } else {
    saveUserEdits(row);
  }
}

async function saveUserEdits(row) {
  const nameCell = row.querySelector(".name-cell");
  const emailCell = row.querySelector(".email-cell");
  const editButton = row.querySelector(".edit-button");
  const userId = row.dataset.id;

  const newName = nameCell.querySelector("input").value;
  const newEmail = emailCell.querySelector("input").value;

  try {
    await UserService.updateUser(userId, newName, newEmail);
    renderUsers();
  } catch (error) {
    alert("Error updating user: " + error.message);
  }
}

async function handleDeleteUser(userId) {
  try {
    await UserService.deleteUser(userId);
    renderUsers();
  } catch (error) {
    alert("Error deleting user: " + error.message);
  }
}

async function renderUsers() {
  const users = await UserService.fetchUsers();
  const usersTable = document.getElementById("users");

  usersTable.innerHTML = `
        <table style="width: 100%; table-layout: auto;">
            <thead>
                <tr>
                    <th style="width: 40%">Name</th>
                    <th style="width: 40%">Email</th>
                    <th style="width: 20%">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users
                  .map(
                    (user) =>
                      `<tr data-id="${user.uuid}">
                        <td class='name-cell'>${user.name}</td>
                        <td class='email-cell'>${user.email}</td>
                        <td>
                            <div class="actions">
                                <button class='edit-button'>✏️ Edit</button>
                                <button class='delete-button'>🗑️ Delete</button>
                            </div>
                        </td>
                    </tr>`,
                  )
                  .join("")}
            </tbody>
        </table>`;

  document.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", function () {
      const userRow = this.closest("tr");
      if (button.textContent === "✏️ Edit") {
        closeOtherEdits();
        toggleEditMode(userRow);
      } else {
        saveUserEdits(userRow);
      }
    });
  });

  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", async function () {
      const userRow = this.closest("tr");
      const userId = userRow.dataset.id;
      await handleDeleteUser(userId);
    });
  });
}

document
  .getElementById("showUserForm")
  .addEventListener("click", toggleUserForm);
document
  .getElementById("cancelUserForm")
  .addEventListener("click", toggleUserForm);

document
  .getElementById("userForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageDiv = document.getElementById("message");
    try {
      await UserService.addUser(nameInput.value, emailInput.value);
      messageDiv.style.color = "green";
      messageDiv.textContent = "User added successfully!";
      nameInput.value = "";
      emailInput.value = "";
      document.getElementById("userFormContainer").style.display = "none"; // Hide form on success
      renderUsers();
    } catch (error) {
      messageDiv.style.color = "red";
      messageDiv.textContent = error.message;
    }
  });

checkBackendHealth();
renderUsers();
