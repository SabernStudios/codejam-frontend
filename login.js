const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const loginStatus = document.getElementById("login-status");

function setLoginStatus(message, type = "") {
  loginStatus.textContent = message;
  loginStatus.classList.remove("is-error", "is-success");

  if (type) {
    loginStatus.classList.add(type);
  }
}

function getApiErrorMessage(data, fallback) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map(function (error) {
        return error.msg || "Invalid field.";
      })
      .join(" ");
  }

  return fallback;
}

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    setLoginStatus("Please enter your username and password.", "is-error");
    return;
  }

  loginButton.disabled = true;
  setLoginStatus("Signing you in...");

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getApiErrorMessage(data, "Login failed."));
    }

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("role", data.role);

    setLoginStatus("Signed in. Redirecting...", "is-success");

    const params = new URLSearchParams(window.location.search);
    const nextPage = params.get("next") || "index.html";
    window.location.href = nextPage;
  } catch (error) {
    console.error(error);
    setLoginStatus(error.message || "Login failed.", "is-error");
    loginButton.disabled = false;
  }
});
