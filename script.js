/* MLB Center - datos en vivo desde la API oficial MLB Stats (statsapi.mlb.com) */

const API_BASE = "https://statsapi.mlb.com/api/v1";
const LOGO_BASE = "https://www.mlbstatic.com/team-logos";

const state = {
  currentTab: "hoy",
  currentDate: new Date(),
  standingsLeague: "103",
  teamsLoaded: false,
  standingsLoadedLeague: null,
  divisionsMap: null,
  refreshTimer: null,
};

function pad2(n) { return String(n).padStart(2, "0"); }

function toDateInputValue(date) {
  return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
}

function todayDate() {
  return new Date();
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* ---------- Tabs ---------- */

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tab-content").forEach((sec) => sec.classList.remove("active"));
      const tab = btn.dataset.tab;
      document.getElementById("tab-" + tab).classList.add("active");
      state.currentTab = tab;

      if (tab === "posiciones" && state.standingsLoadedLeague !== state.standingsLeague) {
        loadStandings(state.standingsLeague);
      }
      if (tab === "equipos" && !state.teamsLoaded) {
        loadTeams();
      }
    });
  });
}

/* ---------- Partidos ---------- */

function setupDateControls() {
  const picker = document.getElementById("date-picker");
  picker.value = toDateInputValue(state.currentDate);

  picker.addEventListener("change", () => {
    if (!picker.value) return;
    const parts = picker.value.split("-").map(Number);
    state.currentDate = new Date(parts[0], parts[1] - 1, parts[2]);
    loadGames();
  });

  document.getElementById("prev-day").addEventListener("click", () => {
    state.currentDate.setDate(state.currentDate.getDate() - 1);
    picker.value = toDateInputValue(state.currentDate);
    loadGames();
  });

  document.getElementById("next-day").addEventListener("click", () => {
    state.currentDate.setDate(state.currentDate.getDate() + 1);
    picker.value = toDateInputValue(state.currentDate);
    loadGames();
  });

  document.getElementById("today-btn").addEventListener("click", () => {
    state.currentDate = todayDate();
    picker.value = toDateInputValue(state.currentDate);
    loadGames();
  });
}

async function loadGames() {
  const list = document.getElementById("games-list");
  list.innerHTML = '<p class="loading">Cargando partidos...</p>';
  const dateStr = toDateInputValue(state.currentDate);

  try {
    const res = await fetch(API_BASE + "/schedule?sportId=1&date=" + dateStr + "&hydrate=team,linescore,decisions");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const games = (data.dates && data.dates[0] && data.dates[0].games) || [];
    renderGames(games);
  } catch (err) {
    list.innerHTML = '<p class="error">No se pudieron cargar los partidos. Intenta de nuevo mas tarde.</p>';
  }
}

function statusInfo(game) {
  const abstract = game.status.abstractGameState;
  if (abstract === "Live") return { cls: "live", label: game.status.detailedState || "En vivo" };
  if (abstract === "Final") return { cls: "final", label: "Final" };
  return { cls: "preview", label: formatGameTime(game.gameDate) };
}

function formatGameTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
}

function teamLogo(teamId) {
  return LOGO_BASE + "/" + teamId + ".svg";
}

function renderGames(games) {
  const list = document.getElementById("games-list");
  if (!games.length) {
    list.innerHTML = '<p class="empty">No hay partidos programados para esta fecha.</p>';
    return;
  }

  list.innerHTML = games.map((game) => {
    const away = game.teams.away;
    const home = game.teams.home;
    const info = statusInfo(game);
    const scoreAway = typeof away.score === "number" ? away.score : "-";
    const scoreHome = typeof home.score === "number" ? home.score : "-";

    let meta = "";
    if (info.cls === "live" && game.linescore) {
      const inningState = game.linescore.inningState || "";
      const inningOrd = game.linescore.currentInningOrdinal || "";
      meta = (inningState + " " + inningOrd).trim();
    } else if (info.cls === "final") {
      meta = game.venue && game.venue.name ? game.venue.name : "";
    } else {
      meta = game.venue && game.venue.name ? game.venue.name : "";
    }

    return (
      '<div class="game-card">' +
        '<div class="game-status"><span class="status-dot ' + info.cls + '"></span><span>' + info.label + '</span></div>' +
        '<div class="matchup-row">' +
          '<div class="team-info"><img src="' + teamLogo(away.team.id) + '" alt="" onerror="this.style.display=\'none\'"><span class="team-name">' + away.team.name + '</span></div>' +
          '<span class="team-score">' + scoreAway + '</span>' +
        '</div>' +
        '<div class="matchup-row">' +
          '<div class="team-info"><img src="' + teamLogo(home.team.id) + '" alt="" onerror="this.style.display=\'none\'"><span class="team-name">' + home.team.name + '</span></div>' +
          '<span class="team-score">' + scoreHome + '</span>' +
        '</div>' +
        (meta ? '<div class="game-meta">' + meta + '</div>' : "") +
      '</div>'
    );
  }).join("");
}

/* ---------- Posiciones ---------- */

function setupLeagueToggle() {
  const buttons = document.querySelectorAll(".league-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.standingsLeague = btn.dataset.league;
      loadStandings(state.standingsLeague);
    });
  });
}

async function getDivisionsMap() {
  if (state.divisionsMap) return state.divisionsMap;
  try {
    const res = await fetch(API_BASE + "/divisions");
    const data = await res.json();
    const map = {};
    (data.divisions || []).forEach((d) => { map[d.id] = d.name; });
    state.divisionsMap = map;
    return map;
  } catch (e) {
    return {};
  }
}

async function loadStandings(leagueId) {
  const container = document.getElementById("standings-container");
  container.innerHTML = '<p class="loading">Cargando posiciones...</p>';
  const season = new Date().getFullYear();

  try {
    const [divisionsMap, res] = await Promise.all([
      getDivisionsMap(),
      fetch(API_BASE + "/standings?leagueId=" + leagueId + "&season=" + season + "&standingsTypes=regularSeason"),
    ]);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    renderStandings(data.records || [], divisionsMap);
    state.standingsLoadedLeague = leagueId;
  } catch (err) {
    container.innerHTML = '<p class="error">No se pudieron cargar las posiciones.</p>';
  }
}

function renderStandings(records, divisionsMap) {
  const container = document.getElementById("standings-container");
  if (!records.length) {
    container.innerHTML = '<p class="empty">Sin datos de posiciones disponibles.</p>';
    return;
  }

  container.innerHTML = records.map((record) => {
    const divisionName = divisionsMap[record.division.id] || "Division";
    const rows = (record.teamRecords || []).map((tr) => {
      const streak = tr.streak && tr.streak.streakCode ? tr.streak.streakCode : "-";
      const gb = tr.gamesBack === "0.0" || tr.gamesBack === "-" ? "-" : tr.gamesBack;
      return (
        "<tr>" +
          '<td class="team-cell"><img src="' + teamLogo(tr.team.id) + '" alt="" onerror="this.style.display=\'none\'">' + tr.team.name + "</td>" +
          "<td>" + tr.wins + "</td>" +
          "<td>" + tr.losses + "</td>" +
          "<td>" + tr.winningPercentage + "</td>" +
          "<td>" + gb + "</td>" +
          "<td>" + streak + "</td>" +
        "</tr>"
      );
    }).join("");

    return (
      '<div class="division-block">' +
        '<h3 class="division-title">' + divisionName + "</h3>" +
        '<table class="standings">' +
          "<thead><tr><th>Equipo</th><th>G</th><th>P</th><th>PCT</th><th>DIF</th><th>Racha</th></tr></thead>" +
          "<tbody>" + rows + "</tbody>" +
        "</table>" +
      "</div>"
    );
  }).join("");
}

/* ---------- Equipos ---------- */

async function loadTeams() {
  const grid = document.getElementById("teams-grid");
  grid.innerHTML = '<p class="loading">Cargando equipos...</p>';

  try {
    const res = await fetch(API_BASE + "/teams?sportId=1&activeStatus=Y");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const teams = (data.teams || []).slice().sort((a, b) => a.name.localeCompare(b.name));
    renderTeamsGrid(teams);
    state.teamsLoaded = true;
  } catch (err) {
    grid.innerHTML = '<p class="error">No se pudieron cargar los equipos.</p>';
  }
}

function renderTeamsGrid(teams) {
  const grid = document.getElementById("teams-grid");
  if (!teams.length) {
    grid.innerHTML = '<p class="empty">No hay equipos disponibles.</p>';
    return;
  }

  grid.innerHTML = teams.map((team) => {
    return (
      '<div class="team-card" data-team-id="' + team.id + '" data-team-name="' + team.name + '">' +
        '<img src="' + teamLogo(team.id) + '" alt="" onerror="this.style.display=\'none\'">' +
        '<div class="team-card-name">' + team.name + "</div>" +
      "</div>"
    );
  }).join("");

  grid.querySelectorAll(".team-card").forEach((card) => {
    card.addEventListener("click", () => {
      openTeamModal(card.dataset.teamId, card.dataset.teamName);
    });
  });
}

async function openTeamModal(teamId, teamName) {
  const modal = document.getElementById("team-modal");
  const body = document.getElementById("modal-body");
  modal.classList.remove("hidden");
  body.innerHTML = '<p class="loading">Cargando informacion del equipo...</p>';

  try {
    const [teamRes, rosterRes] = await Promise.all([
      fetch(API_BASE + "/teams/" + teamId),
      fetch(API_BASE + "/teams/" + teamId + "/roster?rosterType=active"),
    ]);
    const teamData = await teamRes.json();
    const rosterData = await rosterRes.json();
    const team = teamData.teams && teamData.teams[0];
    const roster = rosterData.roster || [];

    const venue = team && team.venue && team.venue.name ? team.venue.name : "";
    const firstYear = team && team.firstYearOfPlay ? team.firstYearOfPlay : "";

    const rosterItems = roster
      .sort((a, b) => (a.jerseyNumber || "99").localeCompare(b.jerseyNumber || "99", undefined, { numeric: true }))
      .map((p) => {
        return (
          "<li><span>#" + (p.jerseyNumber || "-") + " " + p.person.fullName + '</span><span class="pos">' + p.position.abbreviation + "</span></li>"
        );
      }).join("");

    body.innerHTML =
      '<div class="modal-team-header">' +
        '<img src="' + teamLogo(teamId) + '" alt="" onerror="this.style.display=\'none\'">' +
        "<div><h2>" + teamName + "</h2><p>" + venue + (firstYear ? " · Desde " + firstYear : "") + "</p></div>" +
      "</div>" +
      '<ul class="roster-list">' + (rosterItems || "<li>Roster no disponible.</li>") + "</ul>";
  } catch (err) {
    body.innerHTML = '<p class="error">No se pudo cargar la informacion del equipo.</p>';
  }
}

function setupModal() {
  const modal = document.getElementById("team-modal");
  document.getElementById("modal-close").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}

/* ---------- Auto refresh ---------- */

function setupAutoRefresh() {
  state.refreshTimer = setInterval(() => {
    if (state.currentTab === "hoy" && isSameDay(state.currentDate, todayDate())) {
      loadGames();
    }
  }, 30000);
}

/* ---------- Init ---------- */

function init() {
  setupTabs();
  setupDateControls();
  setupLeagueToggle();
  setupModal();
  setupAutoRefresh();
  loadGames();
}

document.addEventListener("DOMContentLoaded", init);
