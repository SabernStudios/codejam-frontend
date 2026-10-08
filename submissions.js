const submissionToken = localStorage.getItem("token");

if (!submissionToken) {
  window.location.href = "login.html";
}

const projectForm = document.getElementById("project-form");
const username = localStorage.getItem("username") || "Unknown";
const teamNameInput = document.getElementById("team-name");
const teamMembersInput = document.getElementById("team-members");
const teamNameLabel = document.getElementById("team-name-label");
const teamNameHelp = document.getElementById("team-name-help");
const teamMembersLabel = document.getElementById("team-members-label");
const teamMembersHelp = document.getElementById("team-members-help");
const participantTypeInputs = document.querySelectorAll('input[name="participant_type"]');

function getParticipantType() {
  const checkedInput = document.querySelector('input[name="participant_type"]:checked');
  return checkedInput ? checkedInput.value : "individual";
}

function splitMembers(value) {
  return value
    .replaceAll("\r", "\n")
    .replaceAll(",", "\n")
    .split("\n")
    .map(function (member) {
      return member.trim();
    })
    .filter(Boolean);
}

function updateParticipantFields() {
  const participantType = getParticipantType();
  const isTeam = participantType === "team";

  teamNameLabel.textContent = isTeam ? "Team name" : "Creator display name";
  teamNameHelp.textContent = isTeam
    ? "This team name appears on the leaderboard."
    : "This is what appears on the leaderboard.";
  teamMembersLabel.textContent = isTeam ? "Team members" : "Participant name";
  teamMembersHelp.textContent = isTeam
    ? "List 2–4 members, one per line."
    : "List only yourself for an individual submission.";
  teamNameInput.placeholder = isTeam ? "Team Rocket" : "Your name or username";
  teamMembersInput.placeholder = isTeam ? "Member One\nMember Two" : "Your name";

  if (!teamNameInput.value.trim()) {
    teamNameInput.value = username;
  }

  if (!teamMembersInput.value.trim()) {
    teamMembersInput.value = username;
  }
}

participantTypeInputs.forEach(function (input) {
  input.addEventListener("change", updateParticipantFields);
});

updateParticipantFields();

projectForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const participantType = getParticipantType();
  const teamName = teamNameInput.value.trim();
  const teamMembersRaw = teamMembersInput.value.trim();
  const teamMembers = splitMembers(teamMembersRaw);
  const projectTitle = document.getElementById("project-title").value.trim();
  const description = document.getElementById("description").value.trim();
  const contactEmail = document.getElementById("contact-email").value.trim();
  const projectUrlInput = document.getElementById("project-url").value.trim();
  const githubUrl = document.getElementById("github-url").value.trim();

  if (!teamName || !teamMembersRaw || !projectTitle || !description || !contactEmail || !githubUrl) {
    alert("Please fill out the submitter/team info, project title, description, contact email, and GitHub link.");
    return;
  }

  if (participantType === "individual" && teamMembers.length !== 1) {
    alert("Individual submissions should list exactly one participant. Choose Team if more than one person worked on it.");
    return;
  }

  if (participantType === "team" && (teamMembers.length < 2 || teamMembers.length > 4)) {
    alert("Team submissions need 2–4 members. List one member per line.");
    return;
  }

  const submissionData = {
    participant_type: participantType,
    team_name: teamName,
    team_members: teamMembers.join("\n"),
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
