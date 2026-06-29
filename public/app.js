const state = {
  repo: "",
  cwd: "",
  commands: [],
  catalog: [],
  setup: null,
  activity: [],
  preview: null,
  authBusy: false
};

const tabButtons = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];
const repoInput = document.querySelector("#repoInput");
const cwdInput = document.querySelector("#cwdInput");
const toast = document.querySelector("#toast");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

async function api(path, options = {}) {
  if (!window.githubCliManager) {
    throw new Error("Desktop bridge is unavailable. Start the app with npm start.");
  }
  const body = options.body ? JSON.parse(options.body) : {};
  let result;
  if (path === "/api/setup/status") {
    result = await window.githubCliManager.getSetupStatus();
  } else if (path === "/api/setup/auth/start") {
    result = await window.githubCliManager.startAuthFlow();
  } else if (path === "/api/commands") {
    result = await window.githubCliManager.listCommands();
  } else if (path === "/api/activity") {
    result = await window.githubCliManager.listActivity();
  } else if (path === "/api/commands/preview") {
    result = await window.githubCliManager.previewCommand(body);
  } else if (path === "/api/commands/run") {
    result = await window.githubCliManager.runCommand(body);
  } else {
    throw new Error("Unknown desktop API route.");
  }
  if (result?.ok === false && result?.validation?.errors?.length) {
    throw new Error(result.validation.errors[0]);
  }
  if (result?.ok === false && result?.message) {
    throw new Error(result.message);
  }
  return result;
}

function switchTab(tabId) {
  tabButtons.forEach((button) => {
    const active = button.dataset.tab === tabId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  panels.forEach((panel) => {
    const active = panel.id === tabId;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
}

function setupTabs() {
  tabButtons.forEach((button, index) => {
    button.tabIndex = button.classList.contains("active") ? 0 : -1;
    button.addEventListener("click", () => switchTab(button.dataset.tab));
    button.addEventListener("keydown", (event) => {
      const keys = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabButtons.length - 1;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % tabButtons.length;
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      tabButtons[nextIndex].focus();
      switchTab(tabButtons[nextIndex].dataset.tab);
    });
  });
  document.querySelector("#homeAnchor").addEventListener("click", () => switchTab("home"));
  document.querySelector("#homeActivityLink").addEventListener("click", () => switchTab("activity"));
}

function setupSegments() {
  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      const { segmentGroup, segmentTarget } = button.dataset;
      document.querySelectorAll(`[data-segment-group="${segmentGroup}"]`).forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      document.querySelectorAll(`[data-segment-panel="${segmentGroup}"]`).forEach((panel) => {
        const active = panel.id === segmentTarget;
        panel.classList.toggle("active", active);
        panel.hidden = !active;
      });
    });
  });
}

function renderContext() {
  const contextBadge = document.querySelector("#contextBadge");
  const contextPanel = document.querySelector("#contextPanel");
  const repoReady = /^[\w.-]+\/[\w.-]+$/.test(state.repo);
  const cwdReady = state.cwd.length > 0;
  contextBadge.textContent = repoReady ? "Repo set" : "Needs repo";
  contextBadge.classList.toggle("warn", !repoReady);
  contextPanel.innerHTML = `
    <div class="context-item">
      <strong>Repository</strong>
      <p>${repoReady ? escapeHtml(state.repo) : "Add an OWNER/REPO value for repository-scoped commands."}</p>
    </div>
    <div class="context-item">
      <strong>Working Directory</strong>
      <p>${cwdReady ? escapeHtml(state.cwd) : "Optional for gh commands. Required when running approved git commands."}</p>
    </div>
    <div class="context-item">
      <strong>Execution</strong>
      <p>Commands run silently through the local desktop process with shell interpolation disabled.</p>
    </div>
  `;
}

function setupRepoInput() {
  state.repo = localStorage.getItem("repo") || "";
  state.cwd = localStorage.getItem("cwd") || "";
  repoInput.value = state.repo;
  cwdInput.value = state.cwd;
  renderContext();
  repoInput.addEventListener("input", () => {
    state.repo = repoInput.value.trim();
    localStorage.setItem("repo", state.repo);
    renderContext();
  });
  cwdInput.addEventListener("input", () => {
    state.cwd = cwdInput.value.trim();
    localStorage.setItem("cwd", state.cwd);
    renderContext();
  });
}

function renderSetupCard(key, check) {
  const card = document.createElement("article");
  card.className = `setup-card ${check.ready ? "ready" : ""}`;
  const status = check.ready ? "Ready" : "Needs setup";
  const detail = check.ready
    ? "Verified and available to the local app."
    : `<strong>${escapeHtml(check.install?.primary || "Recheck")}</strong><br>${escapeHtml(check.install?.command || "")}`;
  card.innerHTML = `
    <div class="section-title">
      <h2>${escapeHtml(check.label || key)}</h2>
      <span class="badge ${check.ready ? "" : "warn"}">${status}</span>
    </div>
    <p>${escapeHtml(check.summary || "Not detected yet.")}</p>
    <p>${detail}</p>
  `;
  return card;
}

function renderAuthFlow() {
  const panel = document.querySelector("#authFlowPanel");
  if (!state.setup?.checks) {
    panel.innerHTML = "";
    return;
  }
  const ghReady = Boolean(state.setup.checks.gh?.ready);
  const authReady = Boolean(state.setup.checks.auth?.ready);
  const disabled = state.authBusy || !ghReady || authReady;
  const actionLabel = state.authBusy ? "Waiting for sign in..." : authReady ? "Signed in" : "Sign in with GitHub";
  panel.innerHTML = `
    <article class="auth-card">
      <div class="auth-heading">
        <div>
          <h2>GitHub Sign In</h2>
          <p>${authReady ? "Your local GitHub CLI session is authenticated." : "Use the browser-based GitHub CLI sign-in flow. The app rechecks automatically when it finishes."}</p>
        </div>
        <div class="auth-actions">
          <span class="badge ${authReady ? "" : "warn"}">${authReady ? "Ready" : "Needed"}</span>
          <button id="startAuthFlow" type="button" ${disabled ? "disabled" : ""}>${actionLabel}</button>
        </div>
      </div>
      <ol class="auth-steps">
        <li><span class="step-dot">1</span><span>Confirm GitHub CLI is installed.</span></li>
        <li><span class="step-dot">2</span><span>Open the secure browser sign-in flow.</span></li>
        <li><span class="step-dot">3</span><span>Return here after GitHub confirms access.</span></li>
      </ol>
      ${!ghReady ? `<p>Install GitHub CLI first, then recheck setup.</p>` : ""}
    </article>
  `;
  const button = panel.querySelector("#startAuthFlow");
  if (button && !disabled) {
    button.addEventListener("click", startAuthFlow);
  }
}

async function loadSetup() {
  const container = document.querySelector("#setupCards");
  const summary = document.querySelector("#setupSummary");
  container.textContent = "";
  summary.textContent = "Checking";
  try {
    state.setup = await api("/api/setup/status");
    const checks = Object.entries(state.setup.checks);
    checks.forEach(([key, check]) => container.appendChild(renderSetupCard(key, check)));
    const readyCount = checks.filter(([, check]) => check.ready).length;
    summary.textContent = `${readyCount}/${checks.length} ready`;
    summary.classList.toggle("warn", readyCount !== checks.length);
    renderAuthFlow();
  } catch (error) {
    summary.textContent = "Check failed";
    summary.classList.add("warn");
    container.textContent = error.message;
    document.querySelector("#authFlowPanel").innerHTML = "";
  }
}

async function startAuthFlow() {
  state.authBusy = true;
  renderAuthFlow();
  showToast("Opening GitHub sign in.");
  try {
    const result = await api("/api/setup/auth/start", { method: "POST" });
    state.setup = result.status;
    renderAuthFlow();
    showToast(result.message || "Setup rechecked.");
    await loadActivity();
  } catch (error) {
    showToast(error.message);
    await loadSetup();
  } finally {
    state.authBusy = false;
    renderAuthFlow();
  }
}

function commandRow(command) {
  const row = document.createElement("article");
  row.className = "command-row";
  row.innerHTML = `
    <div class="command-row-main">
      <h2>${escapeHtml(command.label)}</h2>
      <p>${escapeHtml(command.description)}</p>
      <div class="command-meta">
        <span class="badge ${command.riskLevel === "sensitive" ? "warn" : ""}">${escapeHtml(command.riskLevel)}</span>
        <span class="badge">${escapeHtml(command.domain)}</span>
      </div>
    </div>
    <button type="button">Run</button>
  `;
  row.querySelector("button").addEventListener("click", async () => {
    try {
      const result = await api("/api/commands/run", {
        method: "POST",
        body: JSON.stringify({ commandId: command.id, repo: state.repo, cwd: state.cwd })
      });
      showToast(result.ok ? "Command completed." : "Command failed.");
      await loadActivity();
    } catch (error) {
      showToast(error.message);
    }
  });
  return row;
}

function catalogRow(command) {
  const row = document.createElement("article");
  row.className = "command-row";
  row.innerHTML = `
    <div class="command-row-main">
      <h2><code>${escapeHtml(command.command)}</code></h2>
      <p>${escapeHtml(command.notes)}</p>
      <div class="command-meta">
        <span class="badge ${command.pathType === "Advanced runner" ? "warn" : ""}">${escapeHtml(command.pathType)}</span>
        <span class="badge">${escapeHtml(command.surface)}</span>
      </div>
    </div>
    <button class="secondary" type="button">Stage</button>
  `;
  row.querySelector("button").addEventListener("click", () => {
    document.querySelector("#advancedArgs").value = command.argsText;
    switchTab("advanced");
    previewAdvanced();
  });
  return row;
}

function renderCommandSearch() {
  const input = document.querySelector("#commandSearch");
  const container = document.querySelector("#commandSearchResults");
  const query = input.value.trim().toLowerCase();
  const commands = state.catalog
    .filter((command) => {
      if (!query) return command.pathType === "Guided workflow";
      return [command.command, command.argsText, command.notes, command.surface, command.pathType]
        .some((value) => String(value).toLowerCase().includes(query));
    })
    .slice(0, 8);
  if (commands.length === 0) {
    container.innerHTML = `<p class="empty-state">No matching commands.</p>`;
    return;
  }
  container.replaceChildren(...commands.map((command) => {
    const row = document.createElement("article");
    row.className = "compact-row";
    row.innerHTML = `
      <div>
        <h2><code>${escapeHtml(command.command)}</code></h2>
        <p>${escapeHtml(command.notes)}</p>
      </div>
      <button class="secondary" type="button">Stage</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      document.querySelector("#advancedArgs").value = command.argsText;
      previewAdvanced();
    });
    return row;
  }));
}

async function loadCommands() {
  const data = await api("/api/commands");
  state.commands = data.guided;
  state.catalog = data.catalog || [];
  document.querySelector("#quickActions").replaceChildren(...state.commands.slice(0, 6).map(commandRow));
  document.querySelectorAll("[data-domain]").forEach((container) => {
    const domain = container.dataset.domain;
    const guidedRows = state.commands.filter((command) => command.domain === domain).map(commandRow);
    const catalogRows = state.catalog
      .filter((command) => command.surface === domain)
      .map(catalogRow);
    const rows = [...guidedRows, ...catalogRows];
    container.replaceChildren(...rows);
    if (rows.length === 0) {
      container.innerHTML = `<p class="empty-state">This domain is available through command search and the Advanced runner.</p>`;
    }
  });
  const catalogCount = document.querySelector("#catalogCount");
  if (catalogCount) {
    catalogCount.textContent = `${state.catalog.length} gh commands loaded from the coverage catalog.`;
  }
  renderCommandSearch();
}

function renderPreview(result) {
  const preview = document.querySelector("#advancedPreview");
  state.preview = result;
  if (!result?.validation?.ok) {
    const errors = result?.validation?.errors || ["Command did not pass validation."];
    preview.innerHTML = `
      <span class="badge warn">Blocked</span>
      <div class="review-grid">${errors.map((error) => `<p>${escapeHtml(error)}</p>`).join("")}</div>
    `;
    return;
  }
  const commandText = result.redactedPreview?.join(" ") || [result.executable, ...(result.args || [])].filter(Boolean).join(" ");
  const warnings = result.warnings?.length
    ? result.warnings.map((warning) => `<p>${escapeHtml(warning)}</p>`).join("")
    : "<p>Allowed by local command policy.</p>";
  preview.innerHTML = `
    <span class="badge ${result.riskLevel === "sensitive" ? "warn" : ""}">${escapeHtml(result.riskLevel || "review")}</span>
    <div class="review-grid">
      <div class="review-item"><span>Executable</span><strong>${escapeHtml(result.executable || "gh")}</strong></div>
      <div class="review-item"><span>Command</span><code>${escapeHtml(commandText)}</code></div>
      <div class="review-item"><span>Directory</span><code>${escapeHtml(state.cwd || "App process directory")}</code></div>
      <div class="review-item"><span>Policy</span><div>${warnings}</div></div>
    </div>
  `;
}

async function previewAdvanced() {
  const output = document.querySelector("#advancedOutput");
  try {
    const result = await api("/api/commands/preview", {
      method: "POST",
      body: JSON.stringify({
        argsText: document.querySelector("#advancedArgs").value,
        confirmed: document.querySelector("#confirmRun").checked,
        cwd: state.cwd
      })
    });
    renderPreview(result);
    output.textContent = "";
  } catch (error) {
    renderPreview({ validation: { ok: false, errors: [error.message] } });
    output.textContent = "";
  }
}

async function runAdvanced() {
  const output = document.querySelector("#advancedOutput");
  try {
    const result = await api("/api/commands/run", {
      method: "POST",
      body: JSON.stringify({
        argsText: document.querySelector("#advancedArgs").value,
        confirmed: document.querySelector("#confirmRun").checked,
        cwd: state.cwd
      })
    });
    output.textContent = JSON.stringify(result, null, 2);
    showToast(result.ok ? "Command completed." : "Command failed.");
    await loadActivity();
  } catch (error) {
    output.textContent = error.message;
    showToast(error.message);
  }
}

function renderActivitySummary() {
  const container = document.querySelector("#activitySummary");
  const recent = state.activity.slice(0, 3);
  if (recent.length === 0) {
    container.innerHTML = `<p class="empty-state">No commands have run in this session.</p>`;
    return;
  }
  container.replaceChildren(...recent.map((item) => {
    const row = document.createElement("article");
    row.className = "activity-mini";
    row.innerHTML = `
      <strong>${item.ok ? "Succeeded" : "Failed"} · ${escapeHtml(item.domain)} · ${escapeHtml(item.riskLevel)}</strong>
      <p>${escapeHtml(item.command.join(" "))}</p>
    `;
    return row;
  }));
}

async function loadActivity() {
  const container = document.querySelector("#activityList");
  const data = await api("/api/activity");
  state.activity = data.activity || [];
  renderActivitySummary();
  if (state.activity.length === 0) {
    container.textContent = "No commands have run in this session.";
    return;
  }
  container.innerHTML = state.activity.map((item) => `
    <div class="activity-item">
      <strong>${item.ok ? "Succeeded" : "Failed"} · ${escapeHtml(item.domain)} · ${escapeHtml(item.riskLevel)}</strong>
      <div>${escapeHtml(item.command.join(" "))}</div>
      <div>${escapeHtml(item.createdAt)}</div>
      <pre>${escapeHtml((item.result?.stdout || item.result?.stderr || "").slice(0, 3000))}</pre>
    </div>
  `).join("");
}

function bindActions() {
  document.querySelector("#refreshSetup").addEventListener("click", loadSetup);
  document.querySelector("#settingsRecheck").addEventListener("click", loadSetup);
  document.querySelector("#previewAdvanced").addEventListener("click", previewAdvanced);
  document.querySelector("#runAdvanced").addEventListener("click", runAdvanced);
  document.querySelector("#refreshActivity").addEventListener("click", loadActivity);
  document.querySelector("#commandSearch").addEventListener("input", renderCommandSearch);
}

async function init() {
  setupTabs();
  setupSegments();
  setupRepoInput();
  bindActions();
  await Promise.all([loadSetup(), loadCommands(), loadActivity()]);
}

init().catch((error) => showToast(error.message));
