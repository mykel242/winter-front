import API_BASE_URL from "./config.js";
import UserService from "./UserService.js";

// Expose UserService globally for testing
window.UserService = UserService;

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
    const saveButton = row.querySelector(".save-button");

    if (nameCell && emailCell && row.classList.contains("edit-mode")) {
      // Restore original values
      const originalName = nameCell.getAttribute("data-original");
      const originalEmail = emailCell.getAttribute("data-original");
      nameCell.innerHTML = originalName;
      emailCell.innerHTML = originalEmail;

      // Toggle button visibility
      editButton.style.display = "inline-block";
      saveButton.style.display = "none";

      // Remove edit mode class
      row.classList.remove("edit-mode");
    }
  });
}

function toggleEditMode(row) {
  closeOtherEdits();
  const nameCell = row.querySelector(".name-cell");
  const emailCell = row.querySelector(".email-cell");
  const editButton = row.querySelector(".edit-button");
  const saveButton = row.querySelector(".save-button");

  if (editButton.style.display !== "none") {
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

    // Toggle button visibility
    editButton.style.display = "none";
    saveButton.style.display = "inline-block";

    [nameInput, emailInput].forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          saveUserEdits(row);
        } else if (event.key === "Tab") {
          event.preventDefault();
          if (input === nameInput) {
            emailInput.focus();
          } else {
            saveButton.focus();
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
  const saveButton = row.querySelector(".save-button");
  const userId = row.dataset.id;

  const newName = nameCell.querySelector("input").value.trim();
  const newEmail = emailCell.querySelector("input").value.trim();

  // Basic validation
  if (!newName || !newEmail) {
    showNotification("Name and email cannot be empty!", NotificationType.ERROR);
    return;
  }

  if (!/^[a-zA-Z0-9\s]+$/.test(newName)) {
    showNotification(
      "Invalid name format! Only letters, numbers, and spaces are allowed.",
      NotificationType.ERROR,
    );
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    showNotification("Invalid email format!", NotificationType.ERROR);
    return;
  }

  try {
    const result = await UserService.updateUser(userId, newName, newEmail);

    if (!result.success) {
      showNotification(result.message, NotificationType.ERROR, true);
      return;
    }

    nameCell.innerHTML = newName;
    emailCell.innerHTML = newEmail;
    row.classList.remove("edit-mode");

    // Toggle button visibility
    editButton.style.display = "inline-block";
    saveButton.style.display = "none";

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
    const result = await UserService.deleteUser(userId);
    if (!result.success) {
      showNotification(result.message, "error", true);
      return;
    }
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
  const usersTable = document.getElementById("users");
  usersTable.innerHTML = `<tr><td colspan="3">Loading users...</td></tr>`; // Show loading text

  const result = await UserService.fetchUsers();

  if (!result.success) {
    showNotification(result.message, "error", true);
    usersTable.innerHTML = `<tr><td colspan="3">Error loading users.</td></tr>`;
    return;
  }

  const users = result.data;
  console.log("Users loaded:", users);

  usersTable.innerHTML = users
    .map(
      (user) =>
        `<tr class="user-row" data-id="${user.uuid}">
          <td class='name-cell'>${user.name}</td>
          <td class='email-cell'>${user.email}</td>
          <td>
              <div class="actions">
                  <button class='edit-button' data-mode="edit">✏️</button>
                  <button class='save-button' data-mode="save" style="display: none;">💾</button>
                  <button class='delete-button'>🗑️</button>
              </div>
          </td>
      </tr>`,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const userTable = document.getElementById("users");

  // Double-click to enter edit mode (EXCLUDES new user row)
  userTable.addEventListener("dblclick", (event) => {
    let row = event.target.closest("tr");

    // Ensure it's a valid user row and NOT the new user input row
    if (
      row &&
      row.classList.contains("user-row") &&
      row.id !== "new-user-row"
    ) {
      toggleEditMode(row);
    }
  });

  // Delegate click events for Edit, Save, and Delete buttons
  userTable.addEventListener("click", async (event) => {
    let row = event.target.closest("tr");
    if (!row) return;

    if (event.target.classList.contains("edit-button")) {
      toggleEditMode(row);
    }

    if (event.target.classList.contains("save-button")) {
      saveUserEdits(row);
    }

    if (event.target.classList.contains("delete-button")) {
      const userId = row.dataset.id;
      await handleDeleteUser(userId);
    }

    if (event.target.id === "add-user-button") {
      const nameInput = document.getElementById("new-name");
      const emailInput = document.getElementById("new-email");

      const newName = nameInput.value.trim();
      const newEmail = emailInput.value.trim();

      if (!newName || !newEmail) {
        showNotification(
          "Name and email cannot be empty!",
          NotificationType.ERROR,
        );
        return;
      }

      if (!/^[a-zA-Z0-9\s]+$/.test(newName)) {
        showNotification(
          "Invalid name format! Only letters, numbers, and spaces are allowed.",
          NotificationType.ERROR,
        );
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        showNotification("Invalid email format!", NotificationType.ERROR);
        return;
      }

      try {
        const result = await UserService.addUser(newName, newEmail);
        if (!result.success) {
          showNotification(result.message, "error", true);
          return;
        }
        showNotification("User added successfully!", NotificationType.SUCCESS);

        // Clear input fields
        nameInput.value = "";
        emailInput.value = "";

        renderUsers();
      } catch (error) {
        showNotification(
          "Error adding user: " + error.message,
          NotificationType.ERROR,
        );
      }
    }
  });

  // Click outside to close edit mode
  document.addEventListener("click", (event) => {
    if (
      !event.target.closest(".user-row.edit-mode") &&
      !event.target.classList.contains("edit-button") &&
      !event.target.classList.contains("save-button")
    ) {
      closeOtherEdits();
    }
  });
});

checkBackendHealth();
renderUsers();
