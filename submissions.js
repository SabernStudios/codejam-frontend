if (!token) {
  window.location.href = "login.html";
}
document.getElementById("submit-button").addEventListener("click", async function () {
  const token = localStorage.getItem("token");

  const submissionData = {
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

  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(submissionData)
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.detail || "Submission failed");
    return;
  }

  alert("Submission saved!");
  window.location.href = "project-page.html?submission_id=" + data.id;
});