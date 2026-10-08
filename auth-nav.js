(function loadGlobalThemeStyles() {
  const fontHref = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap";
  const themeHref = "sharp-theme.css";

  function addStylesheet(href) {
    if (document.querySelector(`link[href="${href}"]`)) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  addStylesheet(fontHref);
  addStylesheet(themeHref);
})();

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
