import API_BASE_URL from "./config.js";
class UserService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async fetchUsers() {
    try {
      const res = await fetch(`${this.baseUrl}/api/users`);
      if (!res.ok) throw new Error("Failed to load users.");

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: Expected an array.");
      }

      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return []; // Always return an empty array on failure
    }
  }

  async getUserById(userId) {
    try {
      const res = await fetch(`${this.baseUrl}/api/users/${userId}`, {
        signal: this.controller.signal,
      });
      if (!res.ok) throw new Error("User not found.");
      return await res.json();
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  async addUser(name, email) {
    try {
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add user");
      }
      return { success: true };
    } catch (error) {
      console.error("Error adding user:", error);
      return { success: false, message: error.message };
    }
  }

  async deleteUser(uuid) {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${uuid}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user.");
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, message: error.message };
    }
  }

  async updateUser(userId, newName, newEmail) {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, message: error.message };
    }
  }
}

export default new UserService(API_BASE_URL);
