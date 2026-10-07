const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

async function loadMySubmission() {
  const response = await fetch(`${API_BASE_URL}/submissions/me`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.detail || "Could not load submission");
    window.location.href = "submissions.html";
    return;
  }

  document.getElementById("team-name").value = data.team_name;
  document.getElementById("team-members").value = data.team_members;
  document.getElementById("contact-email").value = data.contact_email;
  document.getElementById("project-title").value = data.project_title;
  document.getElementById("description").value = data.description;
  document.getElementById("category").value = data.category;
  document.getElementById("project-url").value = data.project_url;
  document.getElementById("github-url").value = data.github_url || "";
  document.getElementById("demo-video-url").value = data.demo_video_url || "";
}

document.getElementById("save-button").addEventListener("click", async function () {
  const updatedData = {
    team_name: document.getElementById("team-name").value.trim(),
    team_members: document.getElementById("team-members").value.trim(),
    contact_email: document.getElementById("contact-email").value.trim(),
    project_title: document.getElementById("project-title").value.trim(),
    description: document.getElementById("description").value.trim(),
    category: document.getElementById("category").value.trim(),
    project_url: document.getElementById("project-url").value.trim(),
    github_url: document.getElementById("github-url").value.trim() || null,
    demo_video_url: document.getElementById("demo-video-url").value.trim() || null
  };

  const response = await fetch(`${API_BASE_URL}/submissions/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(updatedData)
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.detail || "Update failed");
    return;
  }

  alert("Submission updated!");
});
loadMySubmission();