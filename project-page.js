const params = new URLSearchParams(window.location.search);
const submissionId = params.get("submission_id");

function setLinkState(linkElement, label, url) {
  if (url) {
    linkElement.textContent = label;
    linkElement.href = url;
    linkElement.classList.remove("is-disabled");
  } else {
    linkElement.textContent = `${label}: N/A`;
    linkElement.removeAttribute("href");
    linkElement.classList.add("is-disabled");
  }
}

async function loadProject() {
  if (!submissionId) {
    document.getElementById("project-title").textContent = "No submission selected.";
    document.getElementById("description").textContent = "Go back to the leaderboard or submit page and choose a project.";
    document.getElementById("team-name").textContent = "N/A";
    document.getElementById("team-members").textContent = "N/A";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${encodeURIComponent(submissionId)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Could not load project.");
    }

    document.getElementById("project-title").textContent = data.project_title || "Untitled project";
    document.getElementById("team-name").textContent = data.team_name || "Unknown";
    document.getElementById("team-members").textContent = data.team_members || "Unknown";
    document.getElementById("description").textContent = data.description || "No description provided.";

    setLinkState(document.getElementById("github-url"), "Open GitHub Repository", data.github_url);
    setLinkState(document.getElementById("project-url"), "Open Project Website", data.project_url);

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
    document.getElementById("team-name").textContent = "N/A";
    document.getElementById("team-members").textContent = "N/A";
    document.getElementById("github-url").classList.add("is-disabled");
    document.getElementById("project-url").classList.add("is-disabled");
  }
}

loadProject();
