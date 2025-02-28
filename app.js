import UserService from "./UserService.js";

async function renderUsers() {
  const users = await UserService.fetchUsers();
  const usersTable = document.getElementById("users");

  usersTable.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users
                  .map(
                    (user) =>
                      `<tr data-id="${user.uuid}">
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>
                            <button class='edit-button'>✏️ Edit</button>
                            <button class='delete-button'>🗑️ Delete</button>
                        </td>
                    </tr>`,
                  )
                  .join("")}
            </tbody>
        </table>`;

  // Attach event listeners to edit and delete buttons
  document.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", function () {
      const userRow = this.closest("tr");
      const userId = userRow.dataset.id;
      handleEditUser(userId);
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

async function handleEditUser(uuid) {
  const userRow = document.querySelector(`tr[data-id='${uuid}']`);
  const nameCell = userRow.children[0];
  const emailCell = userRow.children[1];

  const newName = prompt("Enter new name:", nameCell.textContent);
  const newEmail = prompt("Enter new email:", emailCell.textContent);

  if (newName && newEmail) {
    try {
      await UserService.updateUser(uuid, newName, newEmail);
      renderUsers();
    } catch (error) {
      alert("Error updating user: " + error.message);
    }
  }
}

async function handleDeleteUser(uuid) {
  try {
    await UserService.deleteUser(uuid);
    renderUsers();
  } catch (error) {
    document.getElementById("message").textContent = "Error: " + error.message;
  }
}

document
  .getElementById("userForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const messageDiv = document.getElementById("message");

    try {
      await UserService.addUser(name, email);
      messageDiv.style.color = "green";
      messageDiv.textContent = "User added successfully!";
      renderUsers();
    } catch (error) {
      messageDiv.style.color = "red";
      messageDiv.textContent = error.message;
    }
  });

renderUsers();
