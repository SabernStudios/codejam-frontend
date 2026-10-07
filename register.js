document.getElementById("register-button").addEventListener("click", async function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const response = await fetch("${API_BASE_URL}/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
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
  window.location.href = "sign-in.html";
});
