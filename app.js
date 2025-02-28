const API_URL = "http://localhost:3000/api/users";

async function fetchUsers() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to load users.");
    const users = await res.json();
    document.getElementById("users").innerHTML = users
      .map(
        (user) =>
          `<div class='user'>
                <span>${user.name} (${user.email})</span>
                <button class='delete-button' onclick='deleteUser("${user.uuid}")'>🗑️</button>
            </div>`,
      )
      .join("");
  } catch (error) {
    document.getElementById("message").textContent =
      "Error: Unable to fetch users.";
  }
}

async function addUser(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const messageDiv = document.getElementById("message");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add user");
    }

    messageDiv.style.color = "green";
    messageDiv.textContent = "User added successfully!";
    fetchUsers();
  } catch (error) {
    messageDiv.style.color = "red";
    messageDiv.textContent = error.message;
  }
}

async function deleteUser(uuid) {
  try {
    const response = await fetch(`${API_URL}/${uuid}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete user");
    }
    fetchUsers();
  } catch (error) {
    document.getElementById("message").textContent = "Error: " + error.message;
  }
}

document.getElementById("userForm").addEventListener("submit", addUser);
fetchUsers();
