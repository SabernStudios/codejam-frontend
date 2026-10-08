let leaderboardItems = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeScoredItem(item) {
  return {
    submission_id: item.submission_id,
    project_title: item.project_title,
    team_name: item.team_name,
    category: item.category,
    total_score: item.total_score,
    number_of_scores: item.number_of_scores ?? 0,
    is_scored: true
  };
}

function normalizeSubmission(item) {
  return {
    submission_id: item.id,
    project_title: item.project_title,
    team_name: item.team_name,
    category: item.category,
    total_score: null,
    number_of_scores: 0,
    is_scored: false
  };
}

function sortItems(items) {
  const sortBy = document.getElementById("sort-by").value;
  const sorted = [...items];

  if (sortBy === "project") {
    sorted.sort((a, b) => a.project_title.localeCompare(b.project_title));
  } else if (sortBy === "team") {
    sorted.sort((a, b) => a.team_name.localeCompare(b.team_name));
  } else if (sortBy === "category") {
    sorted.sort((a, b) => a.category.localeCompare(b.category));
  } else {
    sorted.sort((a, b) => (b.total_score ?? -1) - (a.total_score ?? -1));
  }

  return sorted;
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  const count = document.getElementById("leaderboard-count");
  const status = document.getElementById("leaderboard-status");

  const sortedItems = sortItems(leaderboardItems);

  count.textContent = `${sortedItems.length} project${sortedItems.length === 1 ? "" : "s"}`;
  list.innerHTML = "";

  if (sortedItems.length === 0) {
    status.textContent = "No projects have been submitted yet.";
    status.style.display = "block";
    return;
  }

  status.style.display = "none";

  sortedItems.forEach(function (item, index) {
    const rank = index + 1;
    const scoreText = item.is_scored ? item.total_score : "Pending";
    const scoreSubtext = item.is_scored
      ? `${item.number_of_scores} judge score${item.number_of_scores === 1 ? "" : "s"}`
      : "Awaiting judging";

    const card = document.createElement("article");
    card.className = "leaderboard-card";

    card.innerHTML = `
      <div class="leaderboard-rank">#${rank}</div>

      <div class="leaderboard-main-info">
        <div class="leaderboard-card-topline">
          <span class="leaderboard-pill">${escapeHtml(item.category || "General")}</span>
          <span class="leaderboard-team">${escapeHtml(item.team_name || "Unknown team")}</span>
        </div>
        <h3>${escapeHtml(item.project_title || "Untitled Project")}</h3>
        <a class="leaderboard-view-link" href="project-page.html?submission_id=${encodeURIComponent(item.submission_id)}">
          View project →
        </a>
      </div>

      <div class="leaderboard-score-box">
        <span class="leaderboard-score">${escapeHtml(scoreText)}</span>
        <span class="leaderboard-score-label">${escapeHtml(scoreSubtext)}</span>
      </div>
    `;

    list.appendChild(card);
  });
}

async function loadLeaderboard() {
  const status = document.getElementById("leaderboard-status");

  try {
    const leaderboardResponse = await fetch(`${API_BASE_URL}/leaderboard`);
    const leaderboardData = await leaderboardResponse.json();

    if (leaderboardResponse.ok && leaderboardData.length > 0) {
      leaderboardItems = leaderboardData.map(normalizeScoredItem);
      renderLeaderboard();
      return;
    }

    const submissionsResponse = await fetch(`${API_BASE_URL}/submissions`);
    const submissionsData = await submissionsResponse.json();

    if (!submissionsResponse.ok) {
      throw new Error(submissionsData.detail || "Could not load submissions.");
    }

    leaderboardItems = submissionsData.map(normalizeSubmission);
    renderLeaderboard();
  } catch (error) {
    console.error(error);
    status.textContent = error.message || "Could not load leaderboard.";
    status.style.display = "block";
  }
}

document.getElementById("sort-by").addEventListener("change", renderLeaderboard);
loadLeaderboard();
