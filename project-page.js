const params = new URLSearchParams(window.location.search);
const submissionId = params.get("submission_id");

async function loadProject() {
  if (!submissionId) {
    alert("No submission selected.");
    window.location.href = "team-leaderboard.html";
    return;
  }

  const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`);
  const data = await response.json();

  if (!response.ok) {
    alert(data.detail || "Could not load project.");
    return;
  }

  document.getElementById("project-title").textContent = data.project_title;
  document.getElementById("team-name").textContent = data.team_name;
  document.getElementById("team-members").textContent = data.team_members;
  document.getElementById("description").textContent = data.description;

  document.getElementById("project-url").href = data.project_url;

  if (data.github_url) {
    document.getElementById("github-url").href = data.github_url;
  } else {
    document.getElementById("github-url").style.display = "none";
  }

  if (data.demo_video_url) {
    document.getElementById("demo-video-url").href = data.demo_video_url;
  } else {
    document.getElementById("demo-video-url").style.display = "none";
  }
}

loadProject();