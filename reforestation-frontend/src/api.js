import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const loginUser = async (credentials) => {
  try {
    const loginData = new URLSearchParams();
    loginData.append("username", credentials.email);
    loginData.append("password", credentials.password);

    const response = await axios.post(`${API_BASE_URL}/users/login`, loginData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response.status === 200) {
      return response.data; // Ensure successful response is returned
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data?.detail || "Login failed"; // Provide detailed error
  }
};

// Register user
export const registerUser  = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Registration failed";
  }
};