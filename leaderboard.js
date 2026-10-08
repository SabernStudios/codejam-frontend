let leaderboardItems = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getParticipantType(item) {
  return item.participant_type === "team" ? "team" : "individual";
}

function getParticipantLabel(item) {
  return getParticipantType(item) === "team" ? "Team" : "Individual";
}

function normalizeScoredItem(item) {
  const scoreCount = item.number_of_scores ?? 0;

  return {
    submission_id: item.submission_id,
    project_title: item.project_title,
    participant_type: item.participant_type || "individual",
    team_name: item.team_name,
    team_members: item.team_members || item.team_name,
    category: item.category,
    total_score: item.total_score,
    number_of_scores: scoreCount,
    likes: 0,
    is_scored: scoreCount > 0
  };
}

function normalizeSubmission(item) {
  return {
    submission_id: item.id,
    project_title: item.project_title,
    participant_type: item.participant_type || "individual",
    team_name: item.team_name,
    team_members: item.team_members || item.team_name,
    category: item.category,
    total_score: null,
    number_of_scores: 0,
    likes: 0,
    is_scored: false
  };
}

async function addLikeCounts(items) {
  const itemsWithLikes = await Promise.all(
    items.map(async function (item) {
      try {
        const response = await fetch(`${API_BASE_URL}/submissions/${encodeURIComponent(item.submission_id)}/likes`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Could not load likes.");
        }

        return {
          ...item,
          likes: data.likes ?? 0
        };
      } catch (error) {
        console.error(`Could not load likes for submission ${item.submission_id}:`, error);
        return {
          ...item,
          likes: 0
        };
      }
    })
  );

  return itemsWithLikes;
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
    sorted.sort((a, b) => {
      const scoreDifference = (b.total_score ?? -1) - (a.total_score ?? -1);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return a.project_title.localeCompare(b.project_title);
    });
  }

  return sorted;
}

function getTopThreeItems() {
  return leaderboardItems
    .filter(function (item) {
      return item.is_scored && typeof item.total_score === "number";
    })
    .sort(function (a, b) {
      const scoreDifference = b.total_score - a.total_score;

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return (b.likes ?? 0) - (a.likes ?? 0);
    })
    .slice(0, 3);
}

function getCommunityFavorite() {
  const likedItems = leaderboardItems
    .filter(function (item) {
      return (item.likes ?? 0) > 0;
    })
    .sort(function (a, b) {
      const likeDifference = (b.likes ?? 0) - (a.likes ?? 0);

      if (likeDifference !== 0) {
        return likeDifference;
      }

      return (b.total_score ?? -1) - (a.total_score ?? -1);
    });

  return likedItems[0] || null;
}

function makeHighlightCard(item, label, statText) {
  return `
    <a class="spotlight-card" href="project-page.html?submission_id=${encodeURIComponent(item.submission_id)}">
      <div class="spotlight-label">${escapeHtml(label)}</div>
      <h3>${escapeHtml(item.project_title || "Untitled Project")}</h3>
      <p>${escapeHtml(getParticipantLabel(item))}: ${escapeHtml(item.team_name || "Unknown")}</p>
      <strong>${escapeHtml(statText)}</strong>
    </a>
  `;
}

function renderHighlights() {
  const topThreeList = document.getElementById("top-three-list");
  const communityFavoriteCard = document.getElementById("community-favorite-card");

  if (!topThreeList || !communityFavoriteCard) {
    return;
  }

  const topThreeItems = getTopThreeItems();

  if (topThreeItems.length === 0) {
    topThreeList.innerHTML = `<p class="spotlight-empty">Top 3 will appear after projects receive judge scores.</p>`;
  } else {
    topThreeList.innerHTML = topThreeItems
      .map(function (item, index) {
        return makeHighlightCard(
          item,
          `#${index + 1}`,
          `${item.total_score}/70 • ${item.number_of_scores} judge score${item.number_of_scores === 1 ? "" : "s"}`
        );
      })
      .join("");
  }

  const communityFavorite = getCommunityFavorite();

  if (!communityFavorite) {
    communityFavoriteCard.innerHTML = `<p class="spotlight-empty">Community favorite will appear once projects receive likes.</p>`;
  } else {
    communityFavoriteCard.innerHTML = makeHighlightCard(
      communityFavorite,
      "Community Favorite",
      `♥ ${communityFavorite.likes} like${communityFavorite.likes === 1 ? "" : "s"}`
    );
  }
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  const count = document.getElementById("leaderboard-count");
  const status = document.getElementById("leaderboard-status");

  const sortedItems = sortItems(leaderboardItems);

  renderHighlights();

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
    const likeText = `${item.likes ?? 0} like${(item.likes ?? 0) === 1 ? "" : "s"}`;

    const card = document.createElement("article");
    card.className = "leaderboard-card";

    card.innerHTML = `
      <div class="leaderboard-rank">#${rank}</div>

      <div class="leaderboard-main-info">
        <div class="leaderboard-card-topline">
          <span class="leaderboard-participant-type">${escapeHtml(getParticipantLabel(item))}</span>
          <span class="leaderboard-pill">${escapeHtml(item.category || "General")}</span>
          <span class="leaderboard-team">${escapeHtml(item.team_name || "Unknown")}</span>
          <span class="leaderboard-likes">♥ ${escapeHtml(likeText)}</span>
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
    const [leaderboardResponse, submissionsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/leaderboard`),
      fetch(`${API_BASE_URL}/submissions`)
    ]);

    const leaderboardData = await leaderboardResponse.json();
    const submissionsData = await submissionsResponse.json();

    if (!submissionsResponse.ok) {
      throw new Error(submissionsData.detail || "Could not load submissions.");
    }

    if (!leaderboardResponse.ok) {
      throw new Error(leaderboardData.detail || "Could not load leaderboard scores.");
    }

    const submissionsById = new Map(
      submissionsData.map(function (submission) {
        return [Number(submission.id), submission];
      })
    );

    const scoredItems = leaderboardData.map(function (item) {
      const sourceSubmission = submissionsById.get(Number(item.submission_id));
      return normalizeScoredItem({
        ...sourceSubmission,
        ...item,
        participant_type: item.participant_type || sourceSubmission?.participant_type || "individual",
        team_members: item.team_members || sourceSubmission?.team_members || item.team_name
      });
    });

    const scoredSubmissionIds = new Set(
      scoredItems.map(function (item) {
        return Number(item.submission_id);
      })
    );

    const unscoredItems = submissionsData
      .filter(function (submission) {
        return !scoredSubmissionIds.has(Number(submission.id));
      })
      .map(normalizeSubmission);

    leaderboardItems = await addLikeCounts(scoredItems.concat(unscoredItems));
    renderLeaderboard();
  } catch (error) {
    console.error(error);
    status.textContent = error.message || "Could not load leaderboard.";
    status.style.display = "block";
  }
}

document.getElementById("sort-by").addEventListener("change", renderLeaderboard);
loadLeaderboard();
