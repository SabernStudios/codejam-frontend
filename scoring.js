const scoringToken = localStorage.getItem("token");
const scoringParams = new URLSearchParams(window.location.search);
const scoringSubmissionId = scoringParams.get("submission_id");

if (!scoringToken) {
  window.location.href = "login.html";
}

const scoreInputs = [
  document.getElementById("creativity"),
  document.getElementById("functionality"),
  document.getElementById("technical-effort"),
  document.getElementById("presentation"),
  document.getElementById("user-experience")
];

function numberFromInput(input) {
  return Number(input.value || 0);
}

function updateTotalScore() {
  const total = scoreInputs.reduce(function (sum, input) {
    return sum + numberFromInput(input);
  }, 0);

  document.getElementById("total-score").textContent = total;
}

scoreInputs.forEach(function (input) {
  input.addEventListener("input", updateTotalScore);
});

function setExternalLink(elementId, label, url) {
  const link = document.getElementById(elementId);

  if (url) {
    link.textContent = label;
    link.href = url;
    link.classList.remove("is-disabled");
  } else {
    link.textContent = `${label}: N/A`;
    link.removeAttribute("href");
    link.classList.add("is-disabled");
  }
}

async function loadSubmissionForScoring() {
  const status = document.getElementById("scoring-status");

  if (!scoringSubmissionId) {
    status.textContent = "No submission was selected. Go back to the leaderboard and choose a project.";
    document.getElementById("project-title").textContent = "No submission selected";
    return;
  }

  const response = await fetch(`${API_BASE_URL}/submissions/${encodeURIComponent(scoringSubmissionId)}`);
  const data = await response.json();

  if (!response.ok) {
    status.textContent = data.detail || "Could not load this submission.";
    document.getElementById("project-title").textContent = "Could not load project";
    return;
  }

  document.getElementById("project-title").textContent = data.project_title || "Untitled project";
  document.getElementById("project-team").textContent = data.team_name || "Unknown team";
  document.getElementById("project-description").textContent = data.description || "No description provided.";
  document.getElementById("back-to-project").href = `project-page.html?submission_id=${encodeURIComponent(scoringSubmissionId)}`;

  setExternalLink("github-url", "Open GitHub", data.github_url);
  setExternalLink("project-url", "Open Project", data.project_url);

  status.textContent = "Review the project, enter scores, and submit your judging record.";
}

function scoreTotal(score) {
  return (
    Number(score.creativity || 0) +
    Number(score.functionality || 0) +
    Number(score.technical_effort || 0) +
    Number(score.presentation || 0) +
    Number(score.user_experience || 0)
  );
}

async function loadPreviousScores() {
  const count = document.getElementById("score-count");
  const average = document.getElementById("score-average");
  const list = document.getElementById("previous-scores-list");

  if (!scoringSubmissionId) {
    count.textContent = "No submission selected";
    average.textContent = "Average: --/70";
    return;
  }

  const response = await fetch(`${API_BASE_URL}/scores/submission/${encodeURIComponent(scoringSubmissionId)}`);
  const scores = await response.json();

  if (!response.ok) {
    count.textContent = "Could not load scores";
    average.textContent = "Average: --/70";
    return;
  }

  list.innerHTML = "";

  if (scores.length === 0) {
    count.textContent = "No scores yet";
    average.textContent = "Average: --/70";
    list.innerHTML = `<p class="scoring-status">This submission has not been scored yet.</p>`;
    return;
  }

  count.textContent = `${scores.length} score${scores.length === 1 ? "" : "s"}`;

  const totalAverage = scores.reduce(function (sum, score) {
    return sum + scoreTotal(score);
  }, 0) / scores.length;

  average.textContent = `Average: ${totalAverage.toFixed(2)}/70`;

  scores.forEach(function (score) {
    const card = document.createElement("article");
    card.className = "previous-score-card";

    card.innerHTML = `
      <div>
        <h3>${score.judge_name || "Judge"}</h3>
        <p>
          Creativity ${score.creativity}/10 · Functionality ${score.functionality}/10 ·
          Technical ${score.technical_effort}/10 · Presentation ${score.presentation}/10 ·
          UX ${score.user_experience}/30
        </p>
        ${score.comments ? `<p>${score.comments}</p>` : ""}
      </div>
      <div class="previous-score-total">${scoreTotal(score)}/70</div>
    `;

    list.appendChild(card);
  });
}

document.getElementById("score-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!scoringSubmissionId) {
    alert("No submission selected.");
    return;
  }

  const scoreData = {
    submission_id: Number(scoringSubmissionId),
    judge_name: localStorage.getItem("username") || "Judge",
    creativity: numberFromInput(document.getElementById("creativity")),
    functionality: numberFromInput(document.getElementById("functionality")),
    technical_effort: numberFromInput(document.getElementById("technical-effort")),
    presentation: numberFromInput(document.getElementById("presentation")),
    user_experience: numberFromInput(document.getElementById("user-experience")),
    comments: document.getElementById("comments").value.trim() || null
  };

  const response = await fetch(`${API_BASE_URL}/scores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${scoringToken}`
    },
    body: JSON.stringify(scoreData)
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.detail || "Could not submit score.");
    console.error("Score error:", data);
    return;
  }

  alert("Score submitted.");
  document.getElementById("score-form").reset();
  updateTotalScore();
  await loadPreviousScores();
});

updateTotalScore();
loadSubmissionForScoring();
loadPreviousScores();
