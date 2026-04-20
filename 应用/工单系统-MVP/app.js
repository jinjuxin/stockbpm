const STORAGE_KEY = "ticket-system-mvp-data-v1";

const roles = {
  submitter: {
    label: "提交人",
    hint: "只看自己提交的工单，可创建工单和查看详情。"
  },
  assignee: {
    label: "处理人",
    hint: "只看分派给自己的工单，可按顺序推进状态。"
  },
  admin: {
    label: "管理员",
    hint: "可看全部工单、分派处理人，也可直接推进状态。"
  }
};

const statuses = [
  { value: "pending", label: "待处理" },
  { value: "processing", label: "处理中" },
  { value: "done", label: "已完成" },
  { value: "closed", label: "已关闭" }
];

const priorities = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
  { value: "urgent", label: "紧急" }
];

const users = {
  submitter: ["张提交", "李业务", "赵运营"],
  assignee: ["王处理", "李跟进", "赵支持"],
  admin: ["系统管理员"]
};

const pageMeta = {
  dashboard: {
    title: "工单系统总览",
    subtitle: "用一个可演示系统跑通完整流程。"
  },
  tickets: {
    title: "工单列表",
    subtitle: "按角色范围查看工单，并执行对应操作。"
  },
  create: {
    title: "新建工单",
    subtitle: "提交人录入标题、内容和优先级即可创建。"
  },
  detail: {
    title: "工单详情",
    subtitle: "查看完整字段、分派处理人并推进状态。"
  }
};

const state = {
  view: "dashboard",
  role: "admin",
  currentUser: "系统管理员",
  filters: {
    search: "",
    status: "",
    priority: "",
    assignee: ""
  },
  selectedTicketId: null,
  flashTimer: null,
  data: loadData()
};

const els = {
  navButtons: [...document.querySelectorAll(".nav-btn")],
  jumpButtons: [...document.querySelectorAll(".jump-view")],
  views: [...document.querySelectorAll(".view")],
  roleSelect: document.getElementById("roleSelect"),
  roleHint: document.getElementById("roleHint"),
  userSelect: document.getElementById("userSelect"),
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  flash: document.getElementById("flash"),
  statsGrid: document.getElementById("statsGrid"),
  myQueue: document.getElementById("myQueue"),
  activityList: document.getElementById("activityList"),
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  priorityFilter: document.getElementById("priorityFilter"),
  assigneeFilter: document.getElementById("assigneeFilter"),
  clearFiltersBtn: document.getElementById("clearFiltersBtn"),
  ticketsTableWrap: document.getElementById("ticketsTableWrap"),
  ticketCount: document.getElementById("ticketCount"),
  ticketForm: document.getElementById("ticketForm"),
  titleInput: document.getElementById("titleInput"),
  contentInput: document.getElementById("contentInput"),
  priorityInput: document.getElementById("priorityInput"),
  submitterDisplay: document.getElementById("submitterDisplay"),
  fillDemoBtn: document.getElementById("fillDemoBtn"),
  detailWrap: document.getElementById("detailWrap"),
  resetBtn: document.getElementById("resetBtn"),
  newTicketBtn: document.getElementById("newTicketBtn"),
  emptyStateTpl: document.getElementById("emptyStateTpl")
};

init();

function init() {
  fillSelect(els.statusFilter, statuses, true);
  fillSelect(els.priorityFilter, priorities, true);
  fillSelect(els.priorityInput, priorities, false, "medium");
  fillAssigneeFilter();
  bindEvents();
  syncRole();
  render();
}

function bindEvents() {
  els.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  els.jumpButtons.forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  els.roleSelect.addEventListener("change", () => {
    state.role = els.roleSelect.value;
    syncRole();
    render();
  });

  els.userSelect.addEventListener("change", () => {
    state.currentUser = els.userSelect.value;
    render();
  });

  els.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim();
    renderTickets();
  });

  els.statusFilter.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    renderTickets();
  });

  els.priorityFilter.addEventListener("change", (event) => {
    state.filters.priority = event.target.value;
    renderTickets();
  });

  els.assigneeFilter.addEventListener("change", (event) => {
    state.filters.assignee = event.target.value;
    renderTickets();
  });

  els.clearFiltersBtn.addEventListener("click", () => {
    state.filters = { search: "", status: "", priority: "", assignee: "" };
    els.searchInput.value = "";
    els.statusFilter.value = "";
    els.priorityFilter.value = "";
    els.assigneeFilter.value = "";
    renderTickets();
  });

  els.ticketForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createTicket();
  });

  els.fillDemoBtn.addEventListener("click", () => {
    els.titleInput.value = "审批流节点超时未提醒";
    els.contentInput.value = "合同审批在财务确认节点停留超过 2 小时，页面未出现明显提醒，请检查超时判断与展示逻辑。";
    els.priorityInput.value = "high";
  });

  els.resetBtn.addEventListener("click", () => {
    state.data = createSeedData();
    saveData();
    state.selectedTicketId = null;
    showFlash("示例数据已重置。");
    render();
  });

  els.newTicketBtn.addEventListener("click", () => setView("create"));

  els.detailWrap.addEventListener("click", handleDetailActions);
  els.ticketsTableWrap.addEventListener("click", handleTableActions);
}

function syncRole() {
  els.roleSelect.value = state.role;
  els.roleHint.textContent = roles[state.role].hint;

  const availableUsers = users[state.role];
  els.userSelect.innerHTML = availableUsers
    .map((name) => `<option value="${name}">${name}</option>`)
    .join("");

  if (!availableUsers.includes(state.currentUser)) {
    state.currentUser = availableUsers[0];
  }
  els.userSelect.value = state.currentUser;
  els.submitterDisplay.value = state.role === "submitter" ? state.currentUser : "张提交（示例提交人）";
}

function setView(view) {
  state.view = view;
  renderView();
}

function render() {
  renderView();
  renderDashboard();
  renderTickets();
  renderDetail();
}

function renderView() {
  els.views.forEach((viewEl) => {
    viewEl.classList.toggle("hidden", viewEl.dataset.view !== state.view);
  });

  els.navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === state.view);
  });

  const meta = pageMeta[state.view];
  els.pageTitle.textContent = meta.title;
  els.pageSubtitle.textContent = meta.subtitle;
  renderDetail();
}

function renderDashboard() {
  const visibleTickets = getVisibleTickets();
  const stats = [
    {
      value: visibleTickets.length,
      label: state.role === "admin" ? "全部工单" : "当前可见工单"
    },
    {
      value: visibleTickets.filter((ticket) => ticket.status === "pending").length,
      label: "待处理"
    },
    {
      value: visibleTickets.filter((ticket) => ticket.status === "processing").length,
      label: "处理中"
    },
    {
      value: visibleTickets.filter((ticket) => ticket.priority === "urgent").length,
      label: "紧急优先级"
    }
  ];

  els.statsGrid.innerHTML = stats
    .map((item) => `<div class="stat-card"><strong>${item.value}</strong><span>${item.label}</span></div>`)
    .join("");

  const myQueue = visibleTickets
    .filter((ticket) => ticket.status === "pending" || ticket.status === "processing")
    .slice(0, 4);

  els.myQueue.innerHTML = myQueue.length
    ? myQueue.map(renderStackTicket).join("")
    : renderEmptyStateHtml();

  const activities = [...state.data.activities].slice(0, 5);
  els.activityList.innerHTML = activities.length
    ? activities.map((item) => `<div class="stack-item"><strong>${item.action}</strong><p>${item.message}</p><span class="caption">${item.time}</span></div>`).join("")
    : renderEmptyStateHtml();
}

function renderTickets() {
  const filteredTickets = getFilteredTickets();
  els.ticketCount.textContent = `共 ${filteredTickets.length} 条`;

  if (!filteredTickets.length) {
    els.ticketsTableWrap.innerHTML = renderEmptyStateHtml();
    return;
  }

  const rows = filteredTickets
    .map((ticket) => {
      const canAssign = state.role === "admin";
      const nextStatus = getNextStatus(ticket.status);
      const canAdvance = canAdvanceStatus(ticket);
      return `
        <tr>
          <td>${ticket.code}</td>
          <td class="ticket-title">${ticket.title}</td>
          <td>${renderTag(ticket.priority, "priority")}</td>
          <td>${ticket.submitter}</td>
          <td>${ticket.assignee || "-"}</td>
          <td>${renderTag(ticket.status, "status")}</td>
          <td>${ticket.createdAt}</td>
          <td>
            <div class="inline-actions">
              <button class="link-btn" data-action="detail" data-id="${ticket.id}" type="button">详情</button>
              ${canAssign ? `<button class="link-btn" data-action="assign" data-id="${ticket.id}" type="button">分派</button>` : ""}
              ${canAdvance && nextStatus ? `<button class="link-btn" data-action="advance" data-id="${ticket.id}" type="button">转为${statusLabel(nextStatus)}</button>` : ""}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  els.ticketsTableWrap.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>工单编号</th>
            <th>标题</th>
            <th>优先级</th>
            <th>提交人</th>
            <th>处理人</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderDetail() {
  if (state.view !== "detail") {
    return;
  }

  const ticket = state.data.tickets.find((item) => item.id === state.selectedTicketId);
  if (!ticket) {
    els.detailWrap.innerHTML = renderEmptyStateHtml("还没有选择工单", "请先从工单列表进入详情。");
    return;
  }

  const nextStatus = getNextStatus(ticket.status);
  const canAssign = state.role === "admin";
  const canAdvance = canAdvanceStatus(ticket);

  els.detailWrap.innerHTML = `
    <div class="detail-layout">
      <section class="detail-main">
        <span class="eyebrow">${ticket.code}</span>
        <h2 class="detail-title">${ticket.title}</h2>
        <div class="info-grid">
          ${renderInfoField("优先级", renderTag(ticket.priority, "priority"), true)}
          ${renderInfoField("当前状态", renderTag(ticket.status, "status"), true)}
          ${renderInfoField("提交人", ticket.submitter)}
          ${renderInfoField("处理人", ticket.assignee || "未分派")}
          ${renderInfoField("创建时间", ticket.createdAt)}
          ${renderInfoField("允许流转", nextStatus ? `${statusLabel(ticket.status)} -> ${statusLabel(nextStatus)}` : "已到最终状态")}
          <div class="full">
            <span class="field-label">工单内容</span>
            <div class="detail-content">${escapeHtml(ticket.content)}</div>
          </div>
        </div>
      </section>

      <aside class="detail-side">
        <section>
          <div class="card-header">
            <h3>角色操作区</h3>
          </div>
          <div class="action-card">
            <strong>${roles[state.role].label}</strong>
            <p class="table-meta">${roles[state.role].hint}</p>
            <div class="detail-actions">
              <button class="btn btn-soft" data-detail-action="back" type="button">返回列表</button>
              ${canAssign ? `<button class="btn btn-soft" data-detail-action="toggle-assign" type="button">分派处理人</button>` : ""}
              ${canAdvance && nextStatus ? `<button class="btn btn-primary" data-detail-action="advance" type="button">推进到${statusLabel(nextStatus)}</button>` : ""}
            </div>
          </div>

          ${canAssign ? renderAssignPanel(ticket) : ""}
        </section>

        <section>
          <div class="card-header">
            <h3>最近处理记录</h3>
          </div>
          <div class="list-stack">
            ${ticket.logs.map((log) => `<div class="stack-item"><strong>${log.action}</strong><p>${log.message}</p><span class="caption">${log.time}</span></div>`).join("")}
          </div>
        </section>
      </aside>
    </div>
  `;
}

function renderAssignPanel(ticket) {
  const assigneeOptions = users.assignee
    .map((name) => `<option value="${name}" ${ticket.assignee === name ? "selected" : ""}>${name}</option>`)
    .join("");

  return `
    <div class="action-card hidden" id="assignPanel">
      <strong>分派处理人</strong>
      <p class="table-meta">管理员可首次分派或重新指定处理人。</p>
      <label for="assignSelect">处理人</label>
      <select id="assignSelect">${assigneeOptions}</select>
      <label for="assignNote">分派备注</label>
      <textarea id="assignNote" rows="4" placeholder="补充分派说明"></textarea>
      <div class="detail-actions">
        <button class="btn btn-primary" data-detail-action="confirm-assign" type="button">确认分派</button>
        <button class="btn btn-soft" data-detail-action="cancel-assign" type="button">取消</button>
      </div>
    </div>
  `;
}

function renderStackTicket(ticket) {
  return `
    <div class="stack-item">
      <strong>${ticket.code} · ${ticket.title}</strong>
      <p>${ticket.submitter} 提交，当前处理人：${ticket.assignee || "未分派"}，状态：${statusLabel(ticket.status)}</p>
      <div class="inline-actions">
        <button class="link-btn" data-action="detail" data-id="${ticket.id}" type="button">查看详情</button>
      </div>
    </div>
  `;
}

function renderInfoField(label, value, raw = false) {
  return `
    <div>
      <span class="field-label">${label}</span>
      <div>${raw ? value : escapeHtml(value)}</div>
    </div>
  `;
}

function renderTag(value, type) {
  const label = type === "priority" ? priorityLabel(value) : statusLabel(value);
  return `<span class="tag ${type}-${value}">${label}</span>`;
}

function renderEmptyStateHtml(title = "当前没有符合条件的工单", message = "你可以调整筛选条件，或者先新建一张工单。") {
  return `
    <div class="empty-state">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;
}

function createTicket() {
  const title = els.titleInput.value.trim();
  const content = els.contentInput.value.trim();
  const priority = els.priorityInput.value;

  if (!title || !content) {
    showFlash("标题和内容不能为空。", true);
    return;
  }

  const createdAt = formatDateTime(new Date());
  const ticket = {
    id: cryptoRandomId(),
    code: generateTicketCode(state.data.tickets),
    title,
    content,
    submitter: state.role === "submitter" ? state.currentUser : "张提交",
    assignee: "",
    priority,
    createdAt,
    status: "pending",
    logs: [
      {
        action: "创建工单",
        message: `${state.role === "submitter" ? state.currentUser : "张提交"} 创建了工单`,
        time: createdAt
      }
    ]
  };

  state.data.tickets.unshift(ticket);
  pushActivity("创建工单", `${ticket.code} 已创建：${ticket.title}`, createdAt);
  saveData();

  state.selectedTicketId = ticket.id;
  els.ticketForm.reset();
  els.priorityInput.value = "medium";
  showFlash(`工单 ${ticket.code} 创建成功。`);
  render();
  setView("detail");
}

function handleTableActions(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const ticketId = button.dataset.id;
  const action = button.dataset.action;

  if (action === "detail") {
    state.selectedTicketId = ticketId;
    setView("detail");
    return;
  }

  if (action === "assign") {
    state.selectedTicketId = ticketId;
    setView("detail");
    setTimeout(() => toggleAssignPanel(true), 0);
    return;
  }

  if (action === "advance") {
    advanceTicket(ticketId);
  }
}

function handleDetailActions(event) {
  const button = event.target.closest("button[data-detail-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.detailAction;
  if (action === "back") {
    setView("tickets");
    return;
  }

  if (action === "toggle-assign") {
    toggleAssignPanel(true);
    return;
  }

  if (action === "cancel-assign") {
    toggleAssignPanel(false);
    return;
  }

  if (action === "confirm-assign") {
    assignTicket();
    return;
  }

  if (action === "advance") {
    advanceTicket(state.selectedTicketId);
  }
}

function toggleAssignPanel(show) {
  const panel = document.getElementById("assignPanel");
  if (panel) {
    panel.classList.toggle("hidden", !show);
  }
}

function assignTicket() {
  const ticket = state.data.tickets.find((item) => item.id === state.selectedTicketId);
  const select = document.getElementById("assignSelect");
  const note = document.getElementById("assignNote");
  if (!ticket || !select || !select.value) {
    showFlash("请选择处理人后再提交。", true);
    return;
  }

  ticket.assignee = select.value;
  const time = formatDateTime(new Date());
  const noteText = note.value.trim();
  const message = noteText ? `管理员分派给 ${select.value}：${noteText}` : `管理员分派给 ${select.value}`;
  ticket.logs.unshift({
    action: "分派处理人",
    message,
    time
  });
  pushActivity("分派处理人", `${ticket.code} 已分派给 ${select.value}`, time);
  saveData();
  showFlash("处理人分派成功。");
  render();
}

function advanceTicket(ticketId) {
  const ticket = state.data.tickets.find((item) => item.id === ticketId);
  if (!ticket) {
    return;
  }

  if (!canAdvanceStatus(ticket)) {
    showFlash("当前角色或工单状态不允许执行此操作。", true);
    return;
  }

  const nextStatus = getNextStatus(ticket.status);
  if (!nextStatus) {
    showFlash("当前工单已经到达最终状态。", true);
    return;
  }

  ticket.status = nextStatus;
  const operator = state.currentUser;
  const time = formatDateTime(new Date());
  ticket.logs.unshift({
    action: "更新状态",
    message: `${operator} 将状态更新为 ${statusLabel(nextStatus)}`,
    time
  });
  pushActivity("状态更新", `${ticket.code} 更新为 ${statusLabel(nextStatus)}`, time);
  saveData();
  showFlash(`工单已更新为${statusLabel(nextStatus)}。`);
  render();
}

function canAdvanceStatus(ticket) {
  if (ticket.status === "closed") {
    return false;
  }

  if (state.role === "admin") {
    return true;
  }

  if (state.role === "assignee") {
    return ticket.assignee === state.currentUser && Boolean(ticket.assignee);
  }

  return false;
}

function getVisibleTickets() {
  if (state.role === "admin") {
    return [...state.data.tickets];
  }

  if (state.role === "submitter") {
    return state.data.tickets.filter((ticket) => ticket.submitter === state.currentUser);
  }

  return state.data.tickets.filter((ticket) => ticket.assignee === state.currentUser);
}

function getFilteredTickets() {
  return getVisibleTickets().filter((ticket) => {
    const matchesSearch = !state.filters.search
      || `${ticket.code} ${ticket.title}`.toLowerCase().includes(state.filters.search.toLowerCase());
    const matchesStatus = !state.filters.status || ticket.status === state.filters.status;
    const matchesPriority = !state.filters.priority || ticket.priority === state.filters.priority;
    const matchesAssignee = !state.filters.assignee || ticket.assignee === state.filters.assignee;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });
}

function fillSelect(select, items, includeAll, defaultValue = "") {
  const options = [];
  if (includeAll) {
    options.push(`<option value="">全部</option>`);
  }
  options.push(
    ...items.map((item) => `<option value="${item.value}" ${defaultValue === item.value ? "selected" : ""}>${item.label}</option>`)
  );
  select.innerHTML = options.join("");
}

function fillAssigneeFilter() {
  els.assigneeFilter.innerHTML = `<option value="">全部</option>${users.assignee.map((name) => `<option value="${name}">${name}</option>`).join("")}`;
}

function showFlash(message, isError = false) {
  clearTimeout(state.flashTimer);
  els.flash.classList.remove("hidden");
  els.flash.textContent = message;
  els.flash.style.background = isError
    ? "linear-gradient(135deg, #dc2626, #b91c1c)"
    : "linear-gradient(135deg, #2563eb, #1d4ed8)";
  state.flashTimer = setTimeout(() => els.flash.classList.add("hidden"), 2200);
}

function loadData() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createSeedData();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.tickets) || !Array.isArray(parsed.activities)) {
      return createSeedData();
    }
    return parsed;
  } catch {
    return createSeedData();
  }
}

function saveData() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function pushActivity(action, message, time) {
  state.data.activities.unshift({ action, message, time });
  state.data.activities = state.data.activities.slice(0, 12);
}

function createSeedData() {
  return {
    tickets: [
      {
        id: "ticket-1",
        code: "TK20260418-001",
        title: "库存同步失败导致数据延迟",
        content: "凌晨库存同步后前台仍显示旧数据，影响订单审核，请排查同步任务、缓存刷新和查询接口。",
        submitter: "张提交",
        assignee: "王处理",
        priority: "urgent",
        createdAt: "2026-04-18 09:12",
        status: "processing",
        logs: [
          {
            action: "更新状态",
            message: "王处理 将状态更新为 处理中",
            time: "2026-04-18 09:26"
          },
          {
            action: "分派处理人",
            message: "管理员分派给 王处理",
            time: "2026-04-18 09:20"
          },
          {
            action: "创建工单",
            message: "张提交 创建了工单",
            time: "2026-04-18 09:12"
          }
        ]
      },
      {
        id: "ticket-2",
        code: "TK20260418-002",
        title: "采购审批页面加载过慢",
        content: "采购审批页首次打开超过 8 秒，影响业务处理效率，怀疑接口聚合过多。",
        submitter: "李业务",
        assignee: "李跟进",
        priority: "high",
        createdAt: "2026-04-18 10:06",
        status: "pending",
        logs: [
          {
            action: "分派处理人",
            message: "管理员分派给 李跟进",
            time: "2026-04-18 10:18"
          },
          {
            action: "创建工单",
            message: "李业务 创建了工单",
            time: "2026-04-18 10:06"
          }
        ]
      },
      {
        id: "ticket-3",
        code: "TK20260418-003",
        title: "客户导入已完成但未自动关闭",
        content: "客户导入任务已处理完毕，但状态仍停留在已完成，未自动关闭，需确认关闭动作由谁触发。",
        submitter: "赵运营",
        assignee: "赵支持",
        priority: "medium",
        createdAt: "2026-04-18 11:24",
        status: "done",
        logs: [
          {
            action: "更新状态",
            message: "赵支持 将状态更新为 已完成",
            time: "2026-04-18 11:50"
          },
          {
            action: "分派处理人",
            message: "管理员分派给 赵支持",
            time: "2026-04-18 11:30"
          },
          {
            action: "创建工单",
            message: "赵运营 创建了工单",
            time: "2026-04-18 11:24"
          }
        ]
      }
    ],
    activities: [
      {
        action: "状态更新",
        message: "TK20260418-003 更新为 已完成",
        time: "2026-04-18 11:50"
      },
      {
        action: "分派处理人",
        message: "TK20260418-002 已分派给 李跟进",
        time: "2026-04-18 10:18"
      },
      {
        action: "创建工单",
        message: "TK20260418-001 已创建：库存同步失败导致数据延迟",
        time: "2026-04-18 09:12"
      }
    ]
  };
}

function getNextStatus(currentStatus) {
  const currentIndex = statuses.findIndex((item) => item.value === currentStatus);
  if (currentIndex === -1 || currentIndex === statuses.length - 1) {
    return "";
  }
  return statuses[currentIndex + 1].value;
}

function statusLabel(value) {
  return statuses.find((item) => item.value === value)?.label || value;
}

function priorityLabel(value) {
  return priorities.find((item) => item.value === value)?.label || value;
}

function generateTicketCode(tickets) {
  const date = new Date();
  const datePart = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const sameDayCount = tickets.filter((ticket) => ticket.code.includes(`TK${datePart}`)).length + 1;
  return `TK${datePart}-${String(sameDayCount).padStart(3, "0")}`;
}

function cryptoRandomId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `ticket-${Date.now()}`;
}

function formatDateTime(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
