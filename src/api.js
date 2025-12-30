const BASE_URL = "http://31.207.77.139:8000";

const setTokens = (access_token, refresh_token) => {
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);
};

const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

const authFetch = async (url, options = {}) => {
  const access_token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (access_token) {
    headers["Authorization"] = `Bearer ${access_token}`;
  }
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

export const registerUser = async (data) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

export const loginUser = async (data) => {
  const response = await fetch(`${BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  const tokens = await response.json();
  setTokens(tokens.access_token, tokens.refresh_token);
  return tokens;
};

export const logoutUser = async () => {
  const refresh_token = getRefreshToken();
  if (refresh_token) {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });
  }
  clearTokens();
};

export const refreshToken = async () => {
  const refresh_token = getRefreshToken();
  if (!refresh_token) throw new Error("No refresh token");

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  const tokens = await response.json();
  setTokens(tokens.access_token, tokens.refresh_token);
  return tokens;
};

export const getCurrentUser = async () => {
  return authFetch(`${BASE_URL}/auth/me`);
};

export const getQueues = async () => {
  return authFetch(`${BASE_URL}/queues/`);
};
