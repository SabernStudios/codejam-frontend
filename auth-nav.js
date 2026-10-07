document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  const authLinks = document.querySelectorAll(".register-link");
  authLinks.forEach(function (link) {
    if (token) {
      link.textContent = "Log out";
      link.href = "#";

      link.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        window.location.href = "index.html";
      });
    } else {
      link.textContent = "Sign in";
      link.href = "login.html";
    }
  });

  const submitLinks = document.querySelectorAll('a[href="submissions.html"]');
  submitLinks.forEach(function (link) {
    if (!token) {
      link.style.display = "none";
    } else {
      link.style.display = "";
    }
  });

  const path = window.location.pathname.split("/").pop();
  if (!token && path === "submissions.html") {
    window.location.href = "login.html";
  }
});
