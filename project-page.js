const params = new URLSearchParams(window.location.search);
const submissionId = params.get("submission_id");

async function loadProject() {
  if (!submissionId) {
    document.getElementById("project-title").textContent = "No submission selected.";
    document.getElementById("description").textContent = "Go back to the leaderboard or submit page and choose a project.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${encodeURIComponent(submissionId)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Could not load project.");
    }

    document.getElementById("project-title").textContent = data.project_title;
    document.getElementById("team-name").textContent = `Project Name: ${data.project_title}`;
    document.getElementById("team-members").textContent = `Team members: ${data.team_members}`;
    document.getElementById("description").textContent = data.description;

    const githubLink = document.getElementById("github-url");
    if (data.github_url) {
      githubLink.textContent = `Github link: ${data.github_url}`;
      githubLink.href = data.github_url;
      githubLink.style.display = "inline";
    } else {
      githubLink.textContent = "Github link: N/A";
      githubLink.removeAttribute("href");
    }

    const projectLink = document.getElementById("project-url");
    if (data.project_url) {
      projectLink.textContent = `Website link: ${data.project_url}`;
      projectLink.href = data.project_url;
      projectLink.style.display = "inline";
    } else {
      projectLink.textContent = "Website link: N/A";
      projectLink.removeAttribute("href");
    }

    const scoreButton = document.getElementById("score-button");
    if (scoreButton) {
      scoreButton.addEventListener("click", function () {
        window.location.href = `scoring.html?submission_id=${encodeURIComponent(submissionId)}`;
      });
    }
  } catch (error) {
    console.error(error);
    document.getElementById("project-title").textContent = "Could not load this submission";
    document.getElementById("description").textContent = error.message || "Unknown error.";
    document.getElementById("team-name").textContent = "";
    document.getElementById("team-members").textContent = "";
    document.getElementById("github-url").style.display = "none";
    document.getElementById("project-url").style.display = "none";
  }
}

loadProject();
