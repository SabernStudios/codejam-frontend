const submissionToken = localStorage.getItem("token");

if (!submissionToken) {
  window.location.href = "login.html";
}

const projectForm = document.getElementById("project-form");

projectForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = localStorage.getItem("username") || "Unknown";

  const projectTitle = document.getElementById("project-title").value.trim();
  const description = document.getElementById("description").value.trim();
  const contactEmail = document.getElementById("contact-email").value.trim();
  const projectUrlInput = document.getElementById("project-url").value.trim();
  const githubUrl = document.getElementById("github-url").value.trim();

  if (!projectTitle || !description || !contactEmail || !githubUrl) {
    alert("Please fill out the project title, description, contact email, and GitHub link.");
    return;
  }

  const submissionData = {
    team_name: username,
    team_members: username,
    contact_email: contactEmail,
    project_title: projectTitle,
    description: description,
    category: "General",
    project_url: projectUrlInput || githubUrl,
    github_url: githubUrl,
    demo_video_url: null
  };

  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${submissionToken}`
    },
    body: JSON.stringify(submissionData)
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.detail || "Submission failed.");
    console.error("Submission error:", data);
    return;
  }

  alert("Project submitted successfully!");
  window.location.href = `project-page.html?submission_id=${data.id}`;
});
