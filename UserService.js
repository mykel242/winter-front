class UserService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async fetchUsers() {
    try {
      const res = await fetch(`${this.baseUrl}/users`);
      if (!res.ok) throw new Error("Failed to load users.");
      return await res.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  async addUser(name, email) {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add user");
      }
      return true;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  }

  async deleteUser(uuid) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${uuid}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  async updateUser(uuid, name, email) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
}

export default new UserService("http://localhost:3000/api");
