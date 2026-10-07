document.getElementById("register-button").addEventListener("click", async function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (!name || !username || !password) {
    alert("Please fill out all required fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

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
    alert(data.detail || "Registration failed");
    return;
  }

  alert("Account created! Now sign in.");
  window.location.href = "login.html";
});
