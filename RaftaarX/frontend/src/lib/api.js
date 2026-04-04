const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      "Unable to reach server. Check backend is running and VITE_API_URL/CORS are correct."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  get(path, token) {
    return request(path, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  post(path, body, token) {
    return request(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  patch(path, body, token) {
    return request(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  asset(path) {
    if (!path) {
      return "";
    }

    if (path.startsWith("http") || path.startsWith("data:")) {
      return path;
    }

    return `${API_URL.replace(/\/api$/, "")}${path}`;
  },
};
