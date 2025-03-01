import API_BASE_URL from "./config.js";
import UserService from "./UserService.js";

async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/test`);
    if (!response.ok)
      throw new Error(`Backend is unreachable at ${API_BASE_URL}`);
    showMessage("✅ Backend Online.");
  } catch (error) {
    showError("❌ Backend is offline");
  }
}

function toggleUserForm() {
  const formContainer = document.getElementById("userFormContainer");
  formContainer.style.display =
    formContainer.style.display === "none" ? "block" : "none";
}

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.color = "red";
  errorDiv.style.display = "block";
  setTimeout(() => (errorDiv.style.display = "none"), 3000); // Hide after 3s
}
function showMessage(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.color = "green";
  errorDiv.style.display = "block";
  setTimeout(() => (errorDiv.style.display = "none"), 3000); // Hide after 3s
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
      row.classList.remove("edit-mode");
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

    // Create input fields
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = nameCell.textContent;
    nameInput.style.width = "100%";

    const emailInput = document.createElement("input");
    emailInput.type = "text";
    emailInput.value = emailCell.textContent;
    emailInput.style.width = "100%";

    // Replace cell content with input fields
    nameCell.innerHTML = "";
    emailCell.innerHTML = "";
    nameCell.appendChild(nameInput);
    emailCell.appendChild(emailInput);

    // Focus on the name field
    nameInput.focus();

    // Add edit mode class to highlight row
    row.classList.add("edit-mode");
    editButton.textContent = "💾 Save";

    // Event listener for Enter key (submits the edit)
    [nameInput, emailInput].forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          saveUserEdits(row);
        } else if (event.key === "Tab") {
          event.preventDefault(); // Prevent default tabbing behavior
          if (input === nameInput) {
            emailInput.focus(); // Move to email field
          } else {
            editButton.focus(); // Move to Save button
          }
        }
      });
    });
  } else {
    saveUserEdits(row);
    row.classList.remove("edit-mode");
  }
}

async function saveUserEdits(row) {
  const nameCell = row.querySelector(".name-cell");
  const emailCell = row.querySelector(".email-cell");
  const userId = row.dataset.id;

  const newName = nameCell.querySelector("input").value.trim();
  const newEmail = emailCell.querySelector("input").value.trim();

  if (!newName || !newEmail) {
    showError("Name and email cannot be empty!");
    return;
  }

  try {
    await UserService.updateUser(userId, newName, newEmail);
    nameCell.innerHTML = newName;
    emailCell.innerHTML = newEmail;
    row.classList.remove("edit-mode");
    row.querySelector(".edit-button").textContent = "✏️ Edit";
  } catch (error) {
    showError("Error updating user: " + error.message);
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
                      `<tr class="user-row" data-id="${user.uuid}">
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

document.addEventListener("DOMContentLoaded", () => {
  const userTable = document.getElementById("users");

  userTable.addEventListener("dblclick", (event) => {
    let row = event.target.closest("tr"); // Get the row being double-clicked

    if (row && row.classList.contains("user-row")) {
      const editButton = row.querySelector(".edit-button");

      // If not already in edit mode, trigger edit mode
      if (editButton.textContent === "✏️ Edit") {
        closeOtherEdits();
        toggleEditMode(row);
      }
    }
  });
});

document.addEventListener("click", (event) => {
  if (
    !event.target.closest("tr.edit-mode") &&
    !event.target.classList.contains("edit-button")
  ) {
    closeOtherEdits();
  }
});
