(function () {
  const FLOW_PATH = "../flows/user-flow.json";
  const screenId = document.body.dataset.screen;

  if (!screenId) return;

  let flow;

  function screenUrl(slug) {
    return `./${slug}.html`;
  }

  function renderNav(node) {
    const nav = document.createElement("nav");
    nav.className = "flow-nav";
    nav.innerHTML = `
      <div class="flow-nav__title">Flowchart Navigation</div>
      <div class="flow-nav__step">${node.title || screenId}</div>
      <div class="flow-nav__actions"></div>
    `;

    const actions = nav.querySelector(".flow-nav__actions");

    if (node.decision) {
      const prompt = document.createElement("span");
      prompt.textContent = node.decision.prompt + " ";
      prompt.style.marginRight = "8px";
      prompt.style.fontSize = "13px";
      actions.appendChild(prompt);

      node.decision.options.forEach((option) => {
        const btn = document.createElement("button");
        btn.className = "flow-nav__btn";
        btn.textContent = option.label;
        btn.addEventListener("click", () => {
          window.location.href = screenUrl(option.next);
        });
        actions.appendChild(btn);
      });
    } else if (node.next) {
      const btn = document.createElement("button");
      btn.className = "flow-nav__btn";
      btn.textContent = "Continue →";
      btn.addEventListener("click", () => {
        window.location.href = screenUrl(node.next);
      });
      actions.appendChild(btn);
    }

    const dash = document.createElement("button");
    dash.className = "flow-nav__btn flow-nav__btn--secondary";
    dash.textContent = "Dashboard";
    dash.addEventListener("click", () => {
      window.location.href = screenUrl(flow.dashboard);
    });
    actions.appendChild(dash);

    const index = document.createElement("button");
    index.className = "flow-nav__btn flow-nav__btn--secondary";
    index.textContent = "All Screens";
    index.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
    actions.appendChild(index);

    document.body.appendChild(nav);
    document.body.classList.add("has-flow-nav");
  }

  fetch(FLOW_PATH)
    .then((res) => res.json())
    .then((data) => {
      flow = data;
      const node = flow.nodes[screenId];
      if (node) renderNav(node);
    })
    .catch(() => {});
})();
