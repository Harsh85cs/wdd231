// Directory page: load members from JSON and toggle grid / list views

const membersURL = "data/members.json";
const container = document.querySelector("#members");
const gridButton = document.querySelector("#grid");
const listButton = document.querySelector("#list");

const levels = { 1: "Member", 2: "Silver", 3: "Gold" };

async function getMembers() {
  try {
    const response = await fetch(membersURL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const members = await response.json();
    displayMembers(members);
  } catch (error) {
    container.innerHTML = `<p class="status">Unable to load the member directory right now.</p>`;
    console.error("Error loading members:", error);
  }
}

function displayMembers(members) {
  container.innerHTML = "";
  members.forEach((member) => {
    const card = document.createElement("section");
    card.className = "member";
    card.innerHTML = `
      <img src="images/${member.image}" alt="${member.name} logo" width="100" height="100" loading="lazy">
      <h2>${member.name}</h2>
      <p class="industry">${member.industry}</p>
      <p>${member.address}</p>
      <p><a href="tel:${member.phone.replace(/\s/g, "")}">${member.phone}</a></p>
      <p><a href="${member.website}" target="_blank" rel="noopener">${member.website.replace("https://", "")}</a></p>
      <p><span class="level level-${member.membershipLevel}">${levels[member.membershipLevel]}</span></p>
    `;
    container.appendChild(card);
  });
}

function setView(view) {
  container.classList.toggle("grid", view === "grid");
  container.classList.toggle("list", view === "list");
  gridButton.setAttribute("aria-pressed", view === "grid");
  listButton.setAttribute("aria-pressed", view === "list");
}

gridButton.addEventListener("click", () => setView("grid"));
listButton.addEventListener("click", () => setView("list"));

getMembers();
