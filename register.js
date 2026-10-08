const registerForm = document.getElementById("register-form");
const registerButton = document.getElementById("register-button");
const registerStatus = document.getElementById("register-status");

function setRegisterStatus(message, type = "") {
  registerStatus.textContent = message;
  registerStatus.classList.remove("is-error", "is-success");

  if (type) {
    registerStatus.classList.add(type);
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

async function signInAfterRegister(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Account created, but automatic sign in failed."));
  }

  localStorage.setItem("token", data.access_token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("role", data.role);
}

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (!name || !username || !password || !confirmPassword) {
    setRegisterStatus("Please fill out every field.", "is-error");
    return;
  }

  if (password.length < 8) {
    setRegisterStatus("Your password must be at least 8 characters.", "is-error");
    return;
  }

  if (password !== confirmPassword) {
    setRegisterStatus("Passwords do not match.", "is-error");
    return;
  }

  registerButton.disabled = true;
  setRegisterStatus("Creating your account...");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        username: username,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getApiErrorMessage(data, "Registration failed."));
    }

    setRegisterStatus("Account created. Signing you in...", "is-success");
    await signInAfterRegister(username, password);

    window.location.href = "submissions.html";
  } catch (error) {
    console.error(error);
    setRegisterStatus(error.message || "Registration failed.", "is-error");
    registerButton.disabled = false;
  }
});
