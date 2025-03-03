import API_BASE_URL from "./config.js";
class UserService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.controller = null;
  }

  // Helper function to create a new AbortController
  createAbortSignal() {
    if (this.controller) {
      this.controller.abort(); // Cancel the previous request
    }
    this.controller = new AbortController();
    return this.controller.signal;
  }

  async fetchUsers() {
    try {
      const res = await fetch(`${this.baseUrl}/api/users`, {
        signal: this.createAbortSignal(),
      });
      if (!res.ok) throw new Error("Failed to load users.");

      const data = await res.json();
      if (!Array.isArray(data))
        throw new Error("Invalid response format: Expected an array.");

      return { success: true, data };
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Fetch aborted: fetchUsers was canceled.");
        return { success: false, message: "Request was canceled.", data: [] };
      }
      console.error("Error fetching users:", error);
      return { success: false, message: error.message, data: [] };
    }
  }

  async getUserById(userId) {
    try {
      const res = await fetch(`${this.baseUrl}/api/users/${userId}`, {
        signal: this.createAbortSignal(),
      });
      if (!res.ok) throw new Error("User not found.");

      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Fetch aborted: getUserById was canceled.");
        return { success: false, message: "Request was canceled.", data: null };
      }
      console.error("Error fetching user:", error);
      return { success: false, message: error.message, data: null };
    }
  }

  async addUser(name, email) {
    try {
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
        signal: this.createAbortSignal(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add user.");
      }
      return { success: true };
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Fetch aborted: addUser was canceled.");
        return { success: false, message: "Request was canceled." };
      }
      console.error("Error adding user:", error);
      return { success: false, message: error.message };
    }
  }

  async deleteUser(uuid) {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${uuid}`, {
        method: "DELETE",
        signal: this.createAbortSignal(),
      });

      if (!response.ok) throw new Error("Failed to delete user.");
      return { success: true };
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Fetch aborted: deleteUser was canceled.");
        return { success: false, message: "Request was canceled." };
      }
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
        signal: this.createAbortSignal(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user.");
      }
      return { success: true };
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Fetch aborted: updateUser was canceled.");
        return { success: false, message: "Request was canceled." };
      }
      console.error("Error updating user:", error);
      return { success: false, message: error.message };
    }
  }
}

export default new UserService(API_BASE_URL);
