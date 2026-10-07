async function loadLeaderboard() {
  const response = await fetch(`${API_BASE_URL}/leaderboard`);
  const leaderboard = await response.json();

  const container = document.getElementById("leaderboard-container");
  container.innerHTML = "";

  if (!response.ok) {
    container.textContent = "Could not load leaderboard.";
    return;
  }

  leaderboard.forEach(function (item, index) {
    const card = document.createElement("div");
    card.className = "leaderboard-card";

    card.innerHTML = `
      <h2>#${index + 1} ${item.project_title}</h2>
      <p><strong>Team:</strong> ${item.team_name}</p>
      <p><strong>Category:</strong> ${item.category}</p>
      <p><strong>Total Score:</strong> ${item.total_score}</p>
      <p><strong>Scores:</strong> ${item.number_of_scores}</p>
      <a href="project-page.html?submission_id=${item.submission_id}">View Project</a>
    `;

    container.appendChild(card);
  });
}

loadLeaderboard();