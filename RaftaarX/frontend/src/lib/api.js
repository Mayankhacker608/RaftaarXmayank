const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

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

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : {};

  if (!response.ok) {
    if (data.message) {
      throw new Error(data.message);
    }

    if (response.status === 413) {
      throw new Error(
        "Upload size too large. Please compress files or upload smaller PDFs/images."
      );
    }

    throw new Error(`Request failed (${response.status})`);
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
