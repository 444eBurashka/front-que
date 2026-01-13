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


export const createRecord = async ({ queue_id, purpose, meeting_datetime, urgency_level }) => {
  return authFetch(`${BASE_URL}/records/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queue_id,
      purpose,
      meeting_datetime,
      urgency_level,
    }),
  });
};

export const updateUser = async (user_uuid, data) => {
  return authFetch(`${BASE_URL}/users/${user_uuid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const getMyRecords = async () => {
  return authFetch(`${BASE_URL}/records/me`);
};


export const deleteRecord = async (record_id) => {
  return authFetch(`${BASE_URL}/records/${record_id}`, {
    method: "DELETE",
  });
};

export const getRecordsByQueue = async (queue_id) => {
  if (!queue_id) throw new Error("queue_id is required");
  return authFetch(`${BASE_URL}/records/queue/${queue_id}`);
};

export const getMyQueues = async () => {
  return authFetch(`${BASE_URL}/queues/owner/me`);
};

export const createQueue = async ({ name, cleanup_interval = 'P1D', record_interval = 'PT30M' }) => {
  if (!name || name.trim() === '') {
    throw new Error("Name is required");
  }

  return authFetch(`${BASE_URL}/queues/`, {
    method: "POST",
    body: JSON.stringify({
      name,
      cleanup_interval,
      record_interval
    })
  });
};