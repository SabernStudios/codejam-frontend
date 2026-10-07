document.getElementById("login-button").addEventListener("click", async function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please enter your username and password.");
    return;
  }

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
    alert(data.detail || "Login failed");
    return;
  }

  localStorage.setItem("token", data.access_token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("role", data.role);

  alert("Logged in!");
  window.location.href = "index.html";
});
