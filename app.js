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
                        <td><button class='delete-button'>🗑️</button></td>
                    </tr>`,
                  )
                  .join("")}
            </tbody>
        </table>`;

  // Attach event listeners to delete buttons
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", async function () {
      const userRow = this.closest("tr");
      const userId = userRow.dataset.id;
      await handleDeleteUser(userId);
    });
  });
}

async function handleAddUser(event) {
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
}

async function handleDeleteUser(uuid) {
  try {
    await UserService.deleteUser(uuid);
    renderUsers(); // Refresh user list after deletion
  } catch (error) {
    document.getElementById("message").textContent = "Error: " + error.message;
  }
}

document.getElementById("userForm").addEventListener("submit", handleAddUser);
renderUsers();
