/* NetLab — sân khấu isometric 3D cho hành trình gói tin */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const PANEL_W = 170;
  const PANEL_H = 50;
  const GAP_X = 124;
  const GAP_Y = 62;
  const BASE_RX = 40;
  const BASE_RY = 20;
  const LIFT = 56;

  const ICONS = {
    client: '<circle cx="10" cy="6.5" r="3.2"/><path d="M4 17c.6-3.2 3-5 6-5s5.4 1.8 6 5"/>',
    dns: '<circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3c2.2 2 3.4 4.4 3.4 7s-1.2 5-3.4 7c-2.2-2-3.4-4.4-3.4-7S7.8 5 10 3Z"/>',
    lb: '<rect x="3" y="3.5" width="14" height="4" rx="1.3"/><rect x="3" y="12.5" width="5.5" height="4" rx="1"/><rect x="11.5" y="12.5" width="5.5" height="4" rx="1"/><path d="M10 7.5v2.5M6 12.5v-2.5h8v2.5"/>',
    server: '<rect x="3" y="3" width="14" height="5.5" rx="1.5"/><rect x="3" y="11.5" width="14" height="5.5" rx="1.5"/><path d="M6 5.8h.01M6 14.2h.01M9 5.8h5M9 14.2h5"/>',
    cache: '<path d="m11 2-6 9h4l-1 7 7-10h-4l1-6Z"/>',
    db: '<ellipse cx="10" cy="4.8" rx="6.5" ry="2.6"/><path d="M3.5 4.8v10.4c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6V4.8M3.5 10c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6"/>',
    queue: '<path d="M3 5h14M3 10h14M3 15h9"/><circle cx="16" cy="15" r="1.2"/>',
    worker: '<circle cx="10" cy="10" r="3"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4"/>',
    cdn: '<path d="M5.5 15.5h9a3.2 3.2 0 0 0 .5-6.4 5 5 0 0 0-9.7-1.2A3.8 3.8 0 0 0 5.5 15.5Z"/>',
    gateway: '<rect x="3" y="3" width="14" height="14" rx="2.5"/><path d="M7 10h6M10 7v6"/>',
    router: '<circle cx="5" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="10" cy="15" r="2"/><path d="M6.5 6.5 9 13M13.5 6.5 11 13M7 5h6"/>',
    store: '<path d="M3 7.5V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7.5M2.5 7.5h15l-1.2-4H3.7l-1.2 4Z"/><path d="M8 9v5h4V9"/>',
    presence: '<path d="M3 10a7 7 0 0 1 14 0M6 10a4 4 0 0 1 8 0M9 10a1 1 0 1 0 2 0"/>',
    book: '<path d="M3 4.5h5.5A2.5 2.5 0 0 1 11 7v9a2.5 2.5 0 0 0-2.5-2H3zM17 4.5h-3.5A2.5 2.5 0 0 0 11 7v9a2.5 2.5 0 0 1 2.5-2H17z"/>',
    star: '<path d="m10 2 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L2.2 7.7l5.4-.8z"/>',
    road: '<path d="M6 3 4 17M14 3l2 14M10 4v3M10 10v3M10 16v1"/>',
    home: '<path d="m3 9 7-6 7 6M5 8v9h10V8M8.5 17v-4.5h3V17"/>',
    shield: '<path d="M10 2.5 16.5 5v5c0 3.6-2.6 6.4-6.5 7.5C6.1 16.4 3.5 13.6 3.5 10V5z"/><path d="m7.2 9.8 2 2 3.6-3.8"/>',
    key: '<circle cx="7" cy="12.5" r="3"/><path d="m9.2 10.3 7-7M14 4.5l2 2M12 6.5l2 2"/>'
  };

  const TONES = {
    client: "blue", dns: "violet", lb: "coral", server: "blue", cache: "yellow",
    db: "green", queue: "violet", worker: "coral", cdn: "green", gateway: "coral",
    router: "violet", store: "green", presence: "violet", book: "amber", star: "amber",
    road: "amber", home: "amber", shield: "green", key: "amber"
  };

  const esc = (v) => String(v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const cut = (text, max) => {
    const s = String(text || "");
    return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
  };

  function computeLayout(lesson) {
    const nodes = lesson.nodes.map((n) => ({ ...n }));
    if (!nodes.length) return null;
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const adj = new Map(nodes.map((n) => [n.id, []]));
    lesson.edges.forEach((e) => {
      if (!byId.has(e.from) || !byId.has(e.to)) return;
      adj.get(e.from).push(e.to);
      adj.get(e.to).push(e.from);
    });
    const leftmost = nodes.reduce((a, b) => (a.x <= b.x ? a : b));
    const level = new Map([[leftmost.id, 0]]);
    const queue = [leftmost.id];
    while (queue.length) {
      const id = queue.shift();
      adj.get(id).forEach((next) => {
        if (!level.has(next)) {
          level.set(next, level.get(id) + 1);
          queue.push(next);
        }
      });
    }
    const xs = nodes.map((n) => n.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const maxLvl = Math.max(0, ...Array.from(level.values()));
    nodes.forEach((n) => {
      if (level.has(n.id)) return;
      const ratio = maxX > minX ? (n.x - minX) / (maxX - minX) : 0;
      level.set(n.id, Math.round(ratio * maxLvl));
    });
    const used = Array.from(new Set(level.values())).sort((a, b) => a - b);
    const compress = new Map(used.map((v, i) => [v, i]));
    const levels = [];
    nodes.forEach((n) => {
      const lv = compress.get(level.get(n.id)) || 0;
      if (!levels[lv]) levels[lv] = [];
      levels[lv].push(n);
    });
    levels.forEach((group) => group.sort((a, b) => (a.y - b.y) || (a.x - b.x)));
    const placed = [];
    levels.forEach((group, lv) => {
      group.forEach((n, i) => {
        const row = i - (group.length - 1) / 2;
        const x = (lv - row) * GAP_X;
        const y = (lv + row) * GAP_Y;
        const pillar = LIFT;
        placed.push({ ...n, lv, row, ux: x, uy: y, pillar, tone: TONES[n.type] || "blue" });
      });
    });
    const nodeAt = new Map(placed.map((n) => [n.id, n]));
    const edgeGeo = lesson.edges.map((edge) => {
      const a = nodeAt.get(edge.from);
      const b = nodeAt.get(edge.to);
      if (!a || !b) return null;
      const dx = b.ux - a.ux;
      const dy = b.uy - a.uy;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const x1 = a.ux + ux * (BASE_RX * 0.8);
      const y1 = a.uy + uy * (BASE_RY * 0.8);
      const x2 = b.ux - ux * (BASE_RX * 0.9);
      const y2 = b.uy - uy * (BASE_RY * 0.9);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const nx = -uy;
      const ny = ux;
      let bow = (edge.bow || 0) * 0.45 + 14;
      if (my + ny * bow < my) bow = -bow;
      const cx = mx + nx * bow;
      const cy = my + ny * bow;
      const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      const lx = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
      const ly = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
      return { ...edge, d, lx, ly, kind: edge.kind || "request" };
    }).filter(Boolean);
    const minU = Math.min(...placed.map((n) => n.lv)) - 2.2;
    const maxU = Math.max(...placed.map((n) => n.lv)) + 2.2;
    const minV = Math.min(...placed.map((n) => n.row)) - 2.2;
    const maxV = Math.max(...placed.map((n) => n.row)) + 2.2;
    let minXp = Math.min(...placed.map((n) => n.ux)) - PANEL_W / 2 - 22;
    let maxXp = Math.max(...placed.map((n) => n.ux)) + PANEL_W / 2 + 22;
    let minYp = Math.min(...placed.map((n) => n.uy - n.pillar - PANEL_H)) - 20;
    let maxYp = Math.max(...placed.map((n) => n.uy)) + BASE_RY + 26;
    const targetRatio = 1.68;
    if ((maxXp - minXp) / (maxYp - minYp) < targetRatio) {
      const extra = (maxYp - minYp) * targetRatio - (maxXp - minXp);
      minXp -= extra / 2;
      maxXp += extra / 2;
    }
    return {
      nodes: placed, nodeAt, edges: edgeGeo,
      box: { x: minXp, y: minYp, w: maxXp - minXp, h: maxYp - minYp },
      uRange: [minU, maxU], vRange: [minV, maxV]
    };
  }

  function gridMarkup(layout) {
    const [u0, u1] = layout.uRange;
    const [v0, v1] = layout.vRange;
    const lines = [];
    for (let u = Math.ceil(u0 * 2) / 2; u <= u1; u += 0.5) {
      const a = [(u - v0) * GAP_X, (u + v0) * GAP_Y];
      const b = [(u - v1) * GAP_X, (u + v1) * GAP_Y];
      lines.push(`<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}"/>`);
    }
    for (let v = Math.ceil(v0 * 2) / 2; v <= v1; v += 0.5) {
      const a = [(u0 - v) * GAP_X, (u0 + v) * GAP_Y];
      const b = [(u1 - v) * GAP_X, (u1 + v) * GAP_Y];
      lines.push(`<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}"/>`);
    }
    return lines.join("");
  }

  function nodeMarkup(node) {
    const label = cut(node.label, 19);
    const sub = cut(node.sub, 22);
    const labelSize = label.length > 15 ? 10.4 : label.length > 11 ? 11.4 : 12.5;
    const subSize = sub.length > 17 ? 7.8 : 8.5;
    const icon = ICONS[node.type] || ICONS.server;
    const top = -node.pillar - PANEL_H;
    const toneKey = node.tone === "amber" ? "yellow" : node.tone;
    const toneStyle = `--tone:var(--${toneKey});--tone-soft:var(--${toneKey}-soft)`;
    return `<g class="iso-node" data-node="${esc(node.id)}" style="${toneStyle}" transform="translate(${node.ux.toFixed(1)},${node.uy.toFixed(1)})">
      <g class="iso-rig">
        <ellipse class="iso-base" cx="0" cy="0" rx="${BASE_RX}" ry="${BASE_RY}"/>
        <ellipse class="iso-base-ring" cx="0" cy="0" rx="${BASE_RX + 5}" ry="${BASE_RY + 3}"/>
        <path class="iso-stem" d="M0 -1 V${top + PANEL_H}"/>
        <circle class="iso-foot" cx="0" cy="0" r="3"/>
        <g class="iso-panel" transform="translate(${-PANEL_W / 2},${top})">
          <rect class="iso-panel-bg" width="${PANEL_W}" height="${PANEL_H}" rx="12"/>
          <rect class="iso-icon-bg" x="9" y="9" width="32" height="32" rx="9"/>
          <g class="iso-icon" transform="translate(16,16) scale(.9)" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
          <text class="iso-label" x="49" y="22" style="font-size:${labelSize}px">${esc(label)}</text>
          <text class="iso-sub" x="49" y="37" style="font-size:${subSize}px">${esc(sub)}</text>
        </g>
      </g>
      <title>${esc(node.label)} — ${esc(node.sub)}</title>
    </g>`;
  }

  function edgeMarkup(edge) {
    const kind = edge.kind === "response" ? "response" : edge.kind === "data" ? "data" : "request";
    return `<g class="iso-edge-group kind-${kind}" data-edge="${esc(edge.id)}">
      <path class="iso-edge" d="${edge.d}" marker-end="url(#iso-arrow-${kind})"/>
    </g>`;
  }

  function edgeLabelsMarkup(layout) {
    const items = layout.edges.filter((edge) => edge.label)
      .map((edge) => ({ lx: edge.lx, ly: edge.ly, label: edge.label, w: Math.max(44, edge.label.length * 6.8 + 20) }))
      .sort((a, b) => (a.ly - b.ly) || (a.lx - b.lx));
    const placed = [];
    items.forEach((it) => {
      let y = it.ly;
      for (let guard = 0; guard < 8; guard += 1) {
        const clash = placed.some((p) => Math.abs(p.lx - it.lx) < (p.w + it.w) / 2 + 4 && Math.abs(p.ly - y) < 20);
        if (!clash) break;
        y += 22;
      }
      placed.push({ ...it, ly: y });
    });
    return placed.map((it) => `<g class="iso-elabel"><rect class="iso-edge-chip-bg" x="${(it.lx - it.w / 2).toFixed(1)}" y="${(it.ly - 19).toFixed(1)}" width="${it.w.toFixed(1)}" height="18" rx="9"/><text class="iso-edge-chip" x="${it.lx.toFixed(1)}" y="${(it.ly - 6).toFixed(1)}" text-anchor="middle">${esc(it.label)}</text></g>`).join("");
  }

  function create(host, lesson) {
    const layout = computeLayout(lesson);
    if (!layout) return null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const grid = gridMarkup(layout);
    const nodes = [...layout.nodes].sort((a, b) => (a.lv + a.row) - (b.lv + b.row) || a.uy - b.uy);

    host.innerHTML = `<svg class="iso-svg" role="img" aria-label="Sơ đồ isometric cho bài ${esc(lesson.title)}">
      <defs>
        <clipPath id="iso-platform-clip"><rect x="-4000" y="-4000" width="8000" height="8000"/></clipPath>
        <linearGradient id="iso-floor-grad" x1="0" y1="0" x2="0" y2="1">
          <stop class="iso-stop-a" offset="0"/><stop class="iso-stop-b" offset="1"/>
        </linearGradient>
        <marker id="iso-arrow-request" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 9 5 1 9Z" class="iso-arrow request"/></marker>
        <marker id="iso-arrow-response" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 9 5 1 9Z" class="iso-arrow response"/></marker>
        <marker id="iso-arrow-data" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 9 5 1 9Z" class="iso-arrow data"/></marker>
        <marker id="iso-arrow-request-on" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M1 1 9 5 1 9Z" class="iso-arrow request on"/></marker>
        <marker id="iso-arrow-response-on" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M1 1 9 5 1 9Z" class="iso-arrow response on"/></marker>
        <marker id="iso-arrow-data-on" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M1 1 9 5 1 9Z" class="iso-arrow data on"/></marker>
      </defs>
      <g class="iso-cam">
        <rect class="iso-platform" x="-4000" y="-4000" width="8000" height="8000" fill="url(#iso-floor-grad)"/>
        <g class="iso-grid" clip-path="url(#iso-platform-clip)">${grid}</g>
        <g class="iso-edges">${layout.edges.map(edgeMarkup).join("")}</g>
        <g class="iso-packets"></g>
        <g class="iso-edge-labels">${edgeLabelsMarkup(layout)}</g>
        <g class="iso-nodes">${nodes.map(nodeMarkup).join("")}</g>
      </g>
    </svg>`;
    const svg = host.querySelector("svg");
    const packets = host.querySelector(".iso-packets");
    const nodeEls = new Map();
    const edgeEls = new Map();
    host.querySelectorAll(".iso-node").forEach((el) => nodeEls.set(el.dataset.node, el));
    host.querySelectorAll(".iso-edge-group").forEach((el) => edgeEls.set(el.dataset.edge, el));
    const edgeKind = new Map(layout.edges.map((e) => [e.id, e.kind]));
    const natural = layout.box;
    const vb = { ...natural };

    function applyView() {
      svg.setAttribute("viewBox", `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`);
    }
    function fit() {
      vb.x = natural.x; vb.y = natural.y; vb.w = natural.w; vb.h = natural.h;
      const rect = svg.getBoundingClientRect();
      const ratio = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : natural.w / natural.h;
      if (natural.w / natural.h < ratio) {
        const extra = natural.h * ratio - natural.w;
        vb.x -= extra / 2; vb.w += extra;
      } else if (natural.w / natural.h > ratio) {
        const extra = natural.w / ratio - natural.h;
        vb.y -= extra / 2; vb.h += extra;
      }
      applyView();
    }
    fit();

    function paintPackets(ids) {
      packets.textContent = "";
      if (reduced) return;
      layout.edges.forEach((edge, ei) => {
        if (!ids.includes(edge.id)) return;
        for (let k = 0; k < 2; k += 1) {
          const circle = document.createElementNS(NS, "circle");
          circle.setAttribute("r", "3.4");
          circle.setAttribute("class", "iso-packet kind-" + edge.kind);
          const anim = document.createElementNS(NS, "animateMotion");
          anim.setAttribute("dur", (1.9 + ((ei + k) % 3) * 0.35).toFixed(2) + "s");
          anim.setAttribute("repeatCount", "indefinite");
          anim.setAttribute("path", edge.d);
          anim.setAttribute("begin", (-(k * 0.85 + (ei % 3) * 0.3)).toFixed(2) + "s");
          circle.appendChild(anim);
          packets.appendChild(circle);
        }
      });
    }

    function applyStep(step) {
      const focus = !step || step.focus === "all" ? layout.nodes.map((n) => n.id) : (step.focus || []);
      const active = !step || step.edges === "all" ? layout.edges.map((e) => e.id) : ((step && step.edges) || []);
      const warn = (step && step.warn) || [];
      nodeEls.forEach((el, id) => {
        const isFocus = focus.includes(id);
        el.classList.toggle("is-active", isFocus);
        el.classList.toggle("is-warn", warn.includes(id));
        el.classList.toggle("is-dim", focus.length > 0 && !isFocus && !warn.includes(id));
      });
      edgeEls.forEach((el, id) => {
        const on = active.includes(id);
        el.classList.toggle("is-active", on);
        el.classList.toggle("is-dim", active.length > 0 && !on);
        const path = el.querySelector(".iso-edge");
        if (path) {
          const kind = edgeKind.get(id) || "request";
          path.setAttribute("marker-end", `url(#iso-arrow-${kind}${on ? "-on" : ""})`);
        }
      });
      paintPackets(active);
    }

    const pointers = new Map();
    let drag = null;
    function toView(clientX, clientY) {
      const rect = svg.getBoundingClientRect();
      return {
        x: vb.x + (clientX - rect.left) / rect.width * vb.w,
        y: vb.y + (clientY - rect.top) / rect.height * vb.h
      };
    }
    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      svg.setPointerCapture(e.pointerId);
      if (pointers.size === 1) drag = { x: e.clientX, y: e.clientY };
      svg.classList.add("is-grabbing");
    }
    function onPointerMove(e) {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const rect = svg.getBoundingClientRect();
      if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (drag && drag.dist) {
          const midX = (pts[0].x + pts[1].x) / 2;
          const midY = (pts[0].y + pts[1].y) / 2;
          const anchor = toView(midX, midY);
          const factor = clamp(drag.dist / Math.max(30, dist), 0.4, 2.5);
          const nw = clamp(vb.w * factor, natural.w * 0.32, natural.w * 2.8);
          const ratio = nw / vb.w;
          vb.w = nw;
          vb.h *= ratio;
          vb.x = anchor.x - (anchor.x - vb.x) * ratio;
          vb.y = anchor.y - (anchor.y - vb.y) * ratio;
          applyView();
        }
        drag = { dist };
        return;
      }
      if (!drag) return;
      const dx = (e.clientX - drag.x) / rect.width * vb.w;
      const dy = (e.clientY - drag.y) / rect.height * vb.h;
      vb.x -= dx; vb.y -= dy;
      drag = { x: e.clientX, y: e.clientY };
      applyView();
    }
    function onPointerUp(e) {
      pointers.delete(e.pointerId);
      if (!pointers.size) {
        drag = null;
        svg.classList.remove("is-grabbing");
      }
    }
    function onWheel(e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const anchor = toView(e.clientX, e.clientY);
      const factor = Math.exp(e.deltaY * 0.0015);
      const nw = clamp(vb.w * factor, natural.w * 0.32, natural.w * 2.8);
      const ratio = nw / vb.w;
      vb.w = nw; vb.h *= ratio;
      vb.x = anchor.x - (anchor.x - vb.x) * ratio;
      vb.y = anchor.y - (anchor.y - vb.y) * ratio;
      applyView();
    }
    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerup", onPointerUp);
    svg.addEventListener("pointercancel", onPointerUp);
    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("dblclick", fit);
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (ro) ro.observe(host);

    return {
      applyStep,
      fit,
      destroy() {
        svg.removeEventListener("pointerdown", onPointerDown);
        svg.removeEventListener("pointermove", onPointerMove);
        svg.removeEventListener("pointerup", onPointerUp);
        svg.removeEventListener("pointercancel", onPointerUp);
        svg.removeEventListener("wheel", onWheel);
        svg.removeEventListener("dblclick", fit);
        window.removeEventListener("resize", onResize);
        if (ro) ro.disconnect();
        host.innerHTML = "";
      }
    };
  }

  window.NetLabIso = { create };
})();
