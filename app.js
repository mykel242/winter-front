import API_BASE_URL from "./config.js";
import UserService from "./UserService.js";

const NotificationType = {
  SUCCESS: "success",
  ERROR: "error",
};

async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/test`);
    if (!response.ok)
      throw new Error(`Backend is unreachable at ${API_BASE_URL}`);
    showNotification("✅ Backend Online.", NotificationType.SUCCESS);
  } catch (error) {
    showNotification("❌ Backend is offline", NotificationType.ERROR, true);
  }
}

function toggleUserForm() {
  const formContainer = document.getElementById("userFormContainer");
  formContainer.style.display =
    formContainer.style.display === "none" ? "block" : "none";
}

function showNotification(
  message,
  type = NotificationType.SUCCESS,
  persistent = false,
) {
  const messageDiv = document.getElementById("error-message");

  // Validate type (fallback to success)
  if (!Object.values(NotificationType).includes(type)) {
    console.warn(`Invalid notification type: ${type}. Defaulting to SUCCESS.`);
    type = NotificationType.SUCCESS;
  }

  // Set the correct notification type class
  messageDiv.className = `notification ${type}`;

  // Set text content
  messageDiv.innerHTML = `<span>${message}</span>`;

  if (persistent) {
    // Create a dismiss button
    const dismissButton = document.createElement("button");
    dismissButton.textContent = "✖";
    dismissButton.className = "dismiss-button";

    // Dismiss the message when button is clicked
    dismissButton.addEventListener("click", () => {
      messageDiv.style.display = "none";
    });

    // Append dismiss button to the message
    messageDiv.appendChild(dismissButton);
  } else {
    // Automatically hide after 3 seconds if not persistent
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 3000);
  }

  // Show the notification
  messageDiv.style.display = "flex";
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
      editButton.dataset.mode === "save"
    ) {
      // Cancel edit mode and revert back to original text
      const originalName = nameCell.getAttribute("data-original");
      const originalEmail = emailCell.getAttribute("data-original");
      nameCell.innerHTML = originalName;
      emailCell.innerHTML = originalEmail;
      editButton.textContent = "✏️";
      row.classList.remove("edit-mode");
      editButton.dataset.mode = "edit"; // Update state
    }
  });
}

function toggleEditMode(row) {
  const nameCell = row.querySelector(".name-cell");
  const emailCell = row.querySelector(".email-cell");
  const editButton = row.querySelector(".edit-button");

  if (editButton.dataset.mode === "edit") {
    nameCell.setAttribute("data-original", nameCell.textContent);
    emailCell.setAttribute("data-original", emailCell.textContent);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = nameCell.textContent;
    nameInput.style.width = "100%";

    const emailInput = document.createElement("input");
    emailInput.type = "text";
    emailInput.value = emailCell.textContent;
    emailInput.style.width = "100%";

    nameCell.innerHTML = "";
    emailCell.innerHTML = "";
    nameCell.appendChild(nameInput);
    emailCell.appendChild(emailInput);

    nameInput.focus();
    row.classList.add("edit-mode");
    editButton.textContent = "💾";
    editButton.dataset.mode = "save"; // Update state

    [nameInput, emailInput].forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          saveUserEdits(row);
        } else if (event.key === "Tab") {
          event.preventDefault();
          if (input === nameInput) {
            emailInput.focus();
          } else {
            editButton.focus();
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
  const editButton = row.querySelector(".edit-button");
  const userId = row.dataset.id;

  const newName = nameCell.querySelector("input").value.trim();
  const newEmail = emailCell.querySelector("input").value.trim();

  // Basic validation
  if (!newName || !newEmail) {
    showNotification("Name and email cannot be empty!", NotificationType.ERROR);
    return;
  }

  if (!/^[a-zA-Z\s]+$/.test(newName)) {
    showNotification("Invalid name format!", NotificationType.ERROR);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    showNotification("Invalid email format!", NotificationType.ERROR);
    return;
  }

  try {
    await UserService.updateUser(userId, newName, newEmail);
    nameCell.innerHTML = newName;
    emailCell.innerHTML = newEmail;
    row.classList.remove("edit-mode");
    // Reset button text and mode
    editButton.textContent = "✏️";
    editButton.dataset.mode = "edit";
    showNotification("User updated successfully!", NotificationType.SUCCESS);
  } catch (error) {
    showNotification(
      "Error updating user: " + error.message,
      NotificationType.ERROR,
    );
  }
}

async function handleDeleteUser(userId) {
  try {
    await UserService.deleteUser(userId);
    renderUsers();
    showNotification("User deleted successfully!", NotificationType.SUCCESS);
  } catch (error) {
    showNotification(
      "Error deleting user: " + error.message,
      NotificationType.ERROR,
    );
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
                              <button class='edit-button' data-mode="edit">✏️</button>
                              <button class='delete-button'>🗑️</button>
                            </div>
                        </td>
                    </tr>`,
                  )
                  .join("")}
            </tbody>
        </table>`;
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

document.addEventListener("DOMContentLoaded", () => {
  const userTable = document.getElementById("users");

  // Double-click to enter edit mode
  userTable.addEventListener("dblclick", (event) => {
    let row = event.target.closest("tr"); // Get the row being double-clicked

    if (row && row.classList.contains("user-row")) {
      const editButton = row.querySelector(".edit-button");

      // If not already in edit mode, trigger edit mode
      if (editButton.dataset.mode === "edit") {
        closeOtherEdits();
        toggleEditMode(row);
      }
    }
  });

  // Delegate click events for Edit, Save, and Delete buttons
  userTable.addEventListener("click", async (event) => {
    let row = event.target.closest("tr");
    if (!row) return;

    if (event.target.classList.contains("edit-button")) {
      if (event.target.dataset.mode === "edit") {
        closeOtherEdits();
        toggleEditMode(row);
      } else {
        saveUserEdits(row);
      }
    }

    if (event.target.classList.contains("delete-button")) {
      const userId = row.dataset.id;
      await handleDeleteUser(userId);
    }
  });
});

// Click outside to close edit mode
document.addEventListener("click", (event) => {
  if (
    !event.target.closest(".user-row.edit-mode") &&
    !event.target.classList.contains("edit-button")
  ) {
    closeOtherEdits();
  }
});

checkBackendHealth();
renderUsers();
