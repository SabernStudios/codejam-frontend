const params = new URLSearchParams(window.location.search);
const submissionId = params.get("submission_id");
let currentLiked = false;

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

function updateLikeUi(status) {
  const likeCount = document.getElementById("like-count");
  const likeButton = document.getElementById("like-button");
  const likeMessage = document.getElementById("like-message");
  const token = localStorage.getItem("token");

  currentLiked = Boolean(status.liked);
  likeCount.textContent = status.likes ?? 0;
  likeButton.textContent = currentLiked ? "Liked" : "Like";
  likeButton.classList.toggle("is-liked", currentLiked);

  if (!token) {
    likeButton.disabled = true;
    likeMessage.textContent = "Sign in with an account older than 2 days to like this project.";
    return;
  }

  if (currentLiked) {
    likeButton.disabled = false;
    likeMessage.textContent = "You liked this project. Click again to remove your like.";
    return;
  }

  if (status.can_like) {
    likeButton.disabled = false;
    likeMessage.textContent = "Your account is eligible to like this project.";
  } else {
    likeButton.disabled = true;
    likeMessage.textContent = status.reason || "Your account is not eligible to like yet.";
  }
}

async function loadLikeStatus() {
  if (!submissionId) {
    return;
  }

  const token = localStorage.getItem("token");
  const headers = {};
  const endpoint = token
    ? `${API_BASE_URL}/submissions/${encodeURIComponent(submissionId)}/like-status`
    : `${API_BASE_URL}/submissions/${encodeURIComponent(submissionId)}/likes`;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, { headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Could not load like status.");
    }

    updateLikeUi(data);
  } catch (error) {
    console.error(error);
    document.getElementById("like-message").textContent = error.message || "Could not load like status.";
  }
}

async function toggleLike() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please sign in before liking projects.");
    return;
  }

  const method = currentLiked ? "DELETE" : "POST";

  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${encodeURIComponent(submissionId)}/like`, {
      method: method,
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Could not update like.");
      await loadLikeStatus();
      return;
    }

    updateLikeUi(data);
  } catch (error) {
    console.error(error);
    alert(error.message || "Could not update like.");
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

    const participantType = data.participant_type === "team" ? "team" : "individual";
    const isTeam = participantType === "team";

    document.getElementById("project-title").textContent = data.project_title || "Untitled project";
    document.getElementById("team-name-label").textContent = isTeam ? "Team" : "Creator";
    document.getElementById("team-members-label").textContent = isTeam ? "Team members" : "Participant";
    document.getElementById("team-name").textContent = data.team_name || "Unknown";
    document.getElementById("team-members").textContent = data.team_members || data.team_name || "Unknown";
    document.getElementById("description").textContent = data.description || "No description provided.";

    setLinkState(document.getElementById("github-url"), "Open GitHub Repository", data.github_url);
    setLinkState(document.getElementById("project-url"), "Open Project Website", data.project_url);

    const scoreButton = document.getElementById("score-button");
    if (scoreButton) {
      scoreButton.addEventListener("click", function () {
        window.location.href = `scoring.html?submission_id=${encodeURIComponent(submissionId)}`;
      });
    }

    const likeButton = document.getElementById("like-button");
    if (likeButton) {
      likeButton.addEventListener("click", toggleLike);
    }

    await loadLikeStatus();
  } catch (error) {
    console.error(error);
    document.getElementById("project-title").textContent = "Could not load this submission";
    document.getElementById("description").textContent = error.message || "Unknown error.";
    document.getElementById("team-name").textContent = "N/A";
    document.getElementById("team-members").textContent = "N/A";
    document.getElementById("github-url").classList.add("is-disabled");
    document.getElementById("project-url").classList.add("is-disabled");
    document.getElementById("like-button").disabled = true;
    document.getElementById("like-message").textContent = "Could not load like status.";
  }
}

loadProject();
