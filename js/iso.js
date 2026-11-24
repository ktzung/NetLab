/* NetLab — sân khấu isometric 3D cho hành trình gói tin */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const GAP_X = 138;
  const GAP_Y = 72;
  const BASE_RX = 42;
  const BASE_RY = 18;

  const p = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;

  /* Khối hộp isometric: mặt trái, mặt phải, mặt trên. */
  function prism(cx, cy, w, d, h, cls) {
    const lx = cx - w / 2;
    const rx = cx + w / 2;
    const t = cy - h;
    const extra = cls ? ` ${cls}` : "";
    return `<path class="iso-face iso-face-l${extra}" d="M${p(lx, t)} L${p(cx, t + d / 2)} L${p(cx, cy + d / 2)} L${p(lx, cy)}Z"/>`
      + `<path class="iso-face iso-face-r${extra}" d="M${p(cx, t + d / 2)} L${p(rx, t)} L${p(rx, cy)} L${p(cx, cy + d / 2)}Z"/>`
      + `<path class="iso-face iso-face-t${extra}" d="M${p(lx, t)} L${p(cx, t - d / 2)} L${p(rx, t)} L${p(cx, t + d / 2)}Z"/>`;
  }

  /* Các dải ngang bám mặt trước, dùng cho khe server, gạch tường lửa. */
  function slats(cx, cy, w, d, h, ys) {
    return ys.map((y) => `<path class="iso-detail" d="M${p(cx - w / 2, cy - h + y)} L${p(cx, cy - h + y + d / 2)} L${p(cx + w / 2, cy - h + y)}"/>`).join("");
  }

  const ART = {
    client: { h: 64, draw: () => `
      ${prism(0, 0, 62, 36, 6)}
      <path class="iso-detail" d="M-20 -8 L-3 -18M-14 -3 L3 -13"/>
      <path class="iso-face iso-face-r iso-glass" d="M-27 -9 L1 -23 L1 -59 L-27 -45Z"/>
      <path class="iso-detail" d="M-22 -15 L-4 -26 L-4 -52 L-22 -41Z"/>
    ` },
    phone: { h: 58, draw: () => `
      <path class="iso-face iso-face-l" d="M-12 -46 L8 -53 L16 -9 L-4 -2 Z"/>
      <path class="iso-face iso-face-r" d="M8 -53 L12 -50 L20 -6 L16 -9 Z"/>
      <path class="iso-face iso-face-t" d="M-12 -46 L-8 -48 L12 -55 L8 -53 Z"/>
      <path class="iso-glass" d="M-6 -42 L6 -46 L11 -14 L-1 -9 Z"/>
      <path class="iso-detail" d="M-3 -37 L4 -40"/>
      <circle class="iso-detail" cx="7" cy="-7" r="1.7"/>
    ` },
    server: { h: 90, draw: () => `
      ${prism(0, 0, 52, 34, 72)}
      ${slats(0, 0, 52, 34, 72, [16, 38, 60])}
      <circle class="iso-led" cx="-19" cy="-54" r="1.7"/>
      <circle class="iso-led" cx="-19" cy="-32" r="1.7"/>
      <circle class="iso-led" cx="-19" cy="-10" r="1.7"/>
      <path class="iso-detail" d="M8 -78 L20 -84M8 -72 L26 -80"/>
    ` },
    dns: { h: 92, draw: () => `
      ${prism(0, 0, 44, 30, 58)}
      ${slats(0, 0, 44, 30, 58, [14, 34])}
      <circle class="iso-face iso-face-t" cx="0" cy="-74" r="12"/>
      <ellipse class="iso-detail" cx="0" cy="-74" rx="12" ry="4.5"/>
      <path class="iso-detail" d="M0 -86 V-62M-12 -74 H12"/>
    ` },
    db: { h: 64, draw: () => `
      <path class="iso-face iso-face-l" d="M-26 -50 V0 A26 10 0 0 0 26 0 V-50 Z"/>
      <path class="iso-face iso-face-r" d="M0 -50 V0 A26 10 0 0 0 26 0 V-50 Z"/>
      <ellipse class="iso-face iso-face-t" cx="0" cy="-50" rx="26" ry="10"/>
      <path class="iso-detail" d="M-25 -34 A25 9 0 0 0 25 -34"/>
      <path class="iso-detail" d="M-25 -17 A25 9 0 0 0 25 -17"/>
    ` },
    router: { h: 50, draw: () => `
      ${prism(0, 0, 56, 32, 12)}
      <path class="iso-detail" d="M-12 -22 V-44M12 -16 V-38"/>
      <circle class="iso-signal" cx="-12" cy="-44" r="1.8" fill="currentColor"/>
      <circle class="iso-signal" cx="12" cy="-38" r="1.8" fill="currentColor"/>
      <circle class="iso-led" cx="-16" cy="-7" r="1.6"/>
      <circle class="iso-led" cx="-9" cy="-4" r="1.6"/>
      <circle class="iso-led" cx="-2" cy="-1" r="1.6"/>
      <circle class="iso-led" cx="5" cy="2" r="1.6"/>
    ` },
    switch: { h: 38, draw: () => `
      ${prism(0, 0, 62, 34, 16)}
      <circle class="iso-led" cx="-20" cy="-10" r="1.5"/>
      <circle class="iso-led" cx="-12" cy="-6" r="1.5"/>
      <circle class="iso-led" cx="-4" cy="-2" r="1.5"/>
      <circle class="iso-led" cx="4" cy="2" r="1.5"/>
      <circle class="iso-led" cx="12" cy="6" r="1.5"/>
      <path class="iso-detail" d="M-10 -24 L6 -32M6 -32 L1 -32M6 -32 L5 -27"/>
    ` },
    lb: { h: 50, draw: () => `
      ${prism(0, 0, 50, 30, 24)}
      <path class="iso-signal" d="M0 -44 V-34M0 -34 L-11 -26M0 -34 L11 -26"/>
      <circle class="iso-signal" cx="-11" cy="-26" r="2.2" fill="currentColor"/>
      <circle class="iso-signal" cx="11" cy="-26" r="2.2" fill="currentColor"/>
    ` },
    firewall: { h: 52, draw: () => `
      ${prism(0, 0, 54, 34, 30)}
      ${slats(0, 0, 54, 34, 30, [8, 16, 24])}
      <path class="iso-face iso-face-t" d="M10 -40 L18 -36 V-26 C18 -20 14 -15 10 -12 C6 -15 2 -20 2 -26 V-36 Z"/>
      <path class="iso-detail" d="M5 -27 L9 -23 L15 -30"/>
    ` },
    gateway: { h: 46, draw: () => `
      ${prism(0, 0, 50, 30, 26)}
      <path class="iso-detail" d="M-14 -22 L-14 -10 L2 -2 L2 -14Z"/>
      <circle class="iso-signal" cx="18" cy="-33" r="3"/>
      <path class="iso-detail" d="M14 -37 L22 -29M22 -37 L14 -29"/>
    ` },
    cloud: { h: 68, draw: () => `
      <path class="iso-face iso-face-t iso-cloud" d="M-42 -20c-9 0-16-6-16-14 0-7 5-13 12-14 2-9 10-16 19-16 7 0 13 4 16 10 2-1 4-2 7-2 9 0 16 7 16 16 9 0 16 6 16 15 0 9-7 15-16 15Z"/>
      <path class="iso-detail" d="M-30 -34c2-6 8-10 14-10M22 -28c5 0 9 3 10 8"/>
    ` },
    cache: { h: 54, draw: () => `
      ${prism(0, 0, 42, 28, 36)}
      <path class="iso-face iso-face-t iso-bolt" d="M4 -8 L-6 -8 L-1 -19 L-9 -19 L4 -36 L0 -24 L8 -24Z"/>
    ` },
    ap: { h: 52, draw: () => `
      <path class="iso-face iso-face-l" d="M-24 -6 V0 A24 9 0 0 0 24 0 V-6 Z"/>
      <ellipse class="iso-face iso-face-t" cx="0" cy="-6" rx="24" ry="9"/>
      <circle class="iso-led" cx="0" cy="-6" r="1.8"/>
      <path class="iso-signal" d="M-12 -20 Q0 -30 12 -20M-20 -27 Q0 -43 20 -27M-28 -34 Q0 -56 28 -34"/>
    ` },
    person: { h: 54, draw: () => `
      ${prism(0, 0, 26, 16, 5)}
      <path class="iso-face iso-face-l" d="M-16 -10 C-16 -26 -7 -32 0 -32 C7 -32 16 -26 16 -10 Z"/>
      <circle class="iso-face iso-face-t" cx="0" cy="-42" r="7"/>
    ` },
    stack: { h: 64, draw: () => [0, 1, 2, 3].map((k) => `<g transform="translate(0,${-k * 13})">${prism(0, 0, 56 - k * 3, 34, 5)}</g>`).join("") },
    gear: { h: 54, draw: () => {
      const teeth = Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return `<path class="iso-detail" d="M${p(Math.cos(a) * 15, -28 + Math.sin(a) * 15)} L${p(Math.cos(a) * 21, -28 + Math.sin(a) * 21)}"/>`;
      }).join("");
      return `${prism(0, 0, 26, 16, 6)}<circle class="iso-face iso-face-t" cx="0" cy="-28" r="15"/>${teeth}<circle class="iso-detail" cx="0" cy="-28" r="5"/>`;
    } },
    home: { h: 56, draw: () => {
      const w = 46; const d = 30; const h = 22;
      const lx = -w / 2; const rx = w / 2; const t = -h; const apex = -h - 26;
      return `${prism(0, 0, w, d, h)}
        <path class="iso-face iso-face-r" d="M${p(0, t - d / 2)} L${p(rx, t)} L${p(0, apex)}Z"/>
        <path class="iso-face iso-face-l" d="M${p(lx, t)} L${p(0, t - d / 2)} L${p(0, apex)}Z"/>
        <path class="iso-face iso-face-r" d="M${p(rx, t)} L${p(0, t + d / 2)} L${p(0, apex)}Z"/>
        <path class="iso-face iso-face-l" d="M${p(0, t + d / 2)} L${p(lx, t)} L${p(0, apex)}Z"/>
        <path class="iso-face iso-face-t" d="M8 -2 L18 -7 L18 -19 L8 -14Z"/>`;
    } },
    shield: { h: 56, draw: () => `
      ${prism(0, 0, 24, 14, 4)}
      <path class="iso-face iso-face-t" d="M0 -52 L18 -45 V-29 C18 -15 9 -6 0 -2 C-9 -6 -18 -15 -18 -29 V-45Z"/>
      <path class="iso-detail" d="M-7 -29 L-1 -23 L8 -33"/>
    ` },
    star: { h: 54, draw: () => `
      ${prism(0, 0, 24, 14, 4)}
      <path class="iso-face iso-face-t" d="M0 -50 L5 -39 L17 -38 L8 -30 L11 -18 L0 -25 L-11 -18 L-8 -30 L-17 -38 L-5 -39Z"/>
    ` },
    key: { h: 54, draw: () => `
      ${prism(0, 0, 24, 14, 4)}
      <circle class="iso-face iso-face-t" cx="0" cy="-40" r="10"/>
      <circle class="iso-detail" cx="0" cy="-40" r="4"/>
      <path class="iso-signal" d="M0 -30 V-10M0 -16 H8M0 -11 H6"/>
    ` },
    cert: { h: 70, draw: () => `
      ${prism(0, 0, 22, 14, 4)}
      <path class="iso-face iso-face-t" d="M-20 -8 L16 -24 L16 -66 L-20 -50Z"/>
      <path class="iso-detail" d="M-13 -20 L9 -29M-13 -28 L9 -37M-13 -36 L2 -43"/>
      <circle class="iso-signal" cx="8" cy="-20" r="5"/>
      <path class="iso-signal" d="M6 -16 L4 -9M10 -16 L12 -9"/>
    ` },
    camera: { h: 46, draw: () => `
      ${prism(0, 0, 40, 24, 20)}
      <circle class="iso-face iso-face-t" cx="10" cy="-10" r="8"/>
      <circle class="iso-detail" cx="10" cy="-10" r="3.5"/>
      <path class="iso-signal" d="M-6 -32 V-44M-9 -44 H-3"/>
    ` },
    link: { h: 44, draw: () => `
      <ellipse class="iso-face iso-face-t" cx="-38" cy="0" rx="8" ry="3.5"/>
      <ellipse class="iso-face iso-face-t" cx="38" cy="0" rx="8" ry="3.5"/>
      <path class="iso-signal iso-dash" d="M-34 -5 Q0 -38 34 -5"/>
      <path class="iso-signal" d="M26 -14 L34 -5 L24 -4"/>
    ` }
  };

  const TONES = {
    client: "blue", dns: "violet", lb: "coral", server: "blue", cache: "yellow",
    db: "green", queue: "violet", worker: "coral", cdn: "green", gateway: "coral",
    router: "violet", store: "green", presence: "violet", book: "amber", star: "amber",
    road: "amber", home: "amber", shield: "green", key: "amber"
  };

  /* Chọn hình theo loại node, ưu tiên nhãn khi nhãn nói rõ thiết bị. */
  function artKind(node) {
    const type = node.type;
    const text = String(node.label || "").toLowerCase();
    if (/^l[1-7]\s*·/.test(text)) return "stack";
    if (/kẻ tấn công|attacker/.test(text)) return "star";
    if (/điện thoại|smartphone|\bphone\b|mobile/.test(text)) return "phone";
    if (/wi-?fi|access point|\bap\b|enodeb|gnb|trạm gốc/.test(text)) return "ap";
    if (/firewall|ips|tường lửa/.test(text)) return "firewall";
    if (/camera/.test(text)) return "camera";
    if (type === "cdn") return /internet|isp|ixp|upstream|mạng/.test(text) ? "cloud" : "server";
    if (type === "lb") return /switch|ixp|liên kết|l2|ethernet/.test(text) ? "switch" : "lb";
    if (type === "router" && /đường truyền|kênh|liên kết|vật lý|l1|l2|sóng/.test(text)) return "link";
    if (type === "presence") return "person";
    if (type === "book" || type === "queue") return "stack";
    if (type === "road") return "link";
    if (type === "store") return "cert";
    return ART[type] ? type : "server";
  }

  const esc = (v) => String(v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const CAM_KEY = "netlab:iso-cam";
  const LAYER_KEY = "netlab:iso-layers";
  const Z_MIN = 0.72;
  const Z_MAX = 2.4;

  function loadView() {
    try {
      const raw = JSON.parse(localStorage.getItem(CAM_KEY) || "{}");
      return { zoom: clamp(Number(raw.zoom) || 1, Z_MIN, Z_MAX) };
    } catch (err) { return { zoom: 1 }; }
  }
  function saveView(view) {
    try { localStorage.setItem(CAM_KEY, JSON.stringify(view)); } catch (err) { /* ignore */ }
  }
  function loadLayers() {
    try {
      const raw = JSON.parse(localStorage.getItem(LAYER_KEY) || "{}");
      return { labels: raw.labels !== false, grid: raw.grid !== false };
    } catch (err) { return { labels: true, grid: true }; }
  }
  function saveLayers(layers) {
    try { localStorage.setItem(LAYER_KEY, JSON.stringify(layers)); } catch (err) { /* ignore */ }
  }
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
    nodes.forEach((n) => { n.deg = (adj.get(n.id) || []).length; });
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
        placed.push({ ...n, lv, row, ux: x, uy: y, art: artKind(n), tone: TONES[n.type] || "blue" });
      });
    });
    const nodeAt = new Map(placed.map((n) => [n.id, n]));
    /* Nhãn đặt phía xa hàng xóm để không nằm trên đường nối: hàng xóm ở dưới thì nhãn ở trên. */
    const dySum = new Map();
    lesson.edges.forEach((edge) => {
      const a = nodeAt.get(edge.from);
      const b = nodeAt.get(edge.to);
      if (!a || !b) return;
      dySum.set(a.id, (dySum.get(a.id) || 0) + (b.uy - a.uy));
      dySum.set(b.id, (dySum.get(b.id) || 0) + (a.uy - b.uy));
    });
    placed.forEach((n) => { n.labelAbove = dySum.has(n.id) ? dySum.get(n.id) >= 0 : false; });

    /* Dời nhãn sang bên trái/phải hoặc đổi trên/dưới khi hai nhãn chạm nhau. */
    function labelSize(n) {
      return Math.max(44, String(n.label || "").length * 6.6, String(n.sub || "").length * 5.5);
    }
    function labelRect(n, above, dx) {
      const w = labelSize(n);
      const top = above ? n.uy - ART[n.art].h - 44 : n.uy + 14;
      return { x: n.ux + dx - w / 2, y: top, w, h: 34 };
    }
    function artRect(n) {
      return { x: n.ux - 32, y: n.uy - ART[n.art].h, w: 64, h: ART[n.art].h + 12 };
    }
    function share(a, b) {
      const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      return w > 2 && h > 2 ? w * h : 0;
    }
    const taken = [];
    [...placed].sort((a, b) => (a.uy - b.uy) || (a.ux - b.ux)).forEach((n) => {
      const own = artRect(n);
      const others = placed.filter((o) => o !== n).map(artRect);
      let best = null;
      [n.labelAbove, !n.labelAbove].forEach((above, sideRank) => {
        [-36, -18, 0, 18, 36].forEach((dx) => {
          const rect = labelRect(n, above, dx);
          let cost = sideRank * 6 + Math.abs(dx) * 0.6;
          taken.forEach((t) => { cost += share(rect, t) * 3; });
          others.forEach((o) => { cost += share(rect, o) * 1.2; });
          cost += share(rect, own) * 0.2;
          if (!best || cost < best.cost) best = { above, dx, cost };
        });
      });
      n.labelAbove = best.above;
      n.labelDx = best.dx;
      taken.push(labelRect(n, n.labelAbove, n.labelDx));
    });
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
    const halfLabel = (n) => Math.min(84, Math.max(40, String(n.label || "").length * 3.4)) + Math.abs(n.labelDx || 0);
    let minXp = Math.min(...placed.map((n) => n.ux + (n.labelDx || 0) - halfLabel(n) - 14));
    let maxXp = Math.max(...placed.map((n) => n.ux + (n.labelDx || 0) + halfLabel(n) + 14));
    let minYp = Math.min(...placed.map((n) => n.uy - ART[n.art].h - (n.labelAbove ? 54 : 16)));
    let maxYp = Math.max(...placed.map((n) => n.uy + (n.labelAbove ? 28 : 52)));
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

  function nodeMarkup(node, index) {
    const label = cut(node.label, 22);
    const sub = cut(node.sub, 26);
    const art = ART[node.art] || ART.server;
    const toneKey = node.tone === "amber" ? "yellow" : node.tone;
    const toneStyle = `--tone:var(--${toneKey});--tone-soft:var(--${toneKey}-soft)`;
    const labelY = node.labelAbove ? -(art.h + 34) : 25;
    const subY = node.labelAbove ? -(art.h + 20) : 39;
    const lines = [node.sub, `${node.deg || 0} liên kết`].filter(Boolean);
    const tipData = { title: node.label, lines };
    return `<g class="iso-node" data-node="${esc(node.id)}" style="${toneStyle};--i:${index}" transform="translate(${node.ux.toFixed(1)},${node.uy.toFixed(1)})" tabindex="0" role="button" data-tip="${esc(JSON.stringify(tipData))}" aria-label="${esc(`${node.label}. ${lines.join(". ")}`)}">
      <ellipse class="iso-shadow" cx="0" cy="6" rx="40" ry="12"/>
      <ellipse class="iso-base-ring" cx="0" cy="6" rx="47" ry="15"/>
      <g class="iso-rig">
        <g class="iso-art">${art.draw()}</g>
        <text class="iso-label" x="${(node.labelDx || 0).toFixed(1)}" y="${labelY}" text-anchor="middle">${esc(label)}</text>
        <text class="iso-sub" x="${(node.labelDx || 0).toFixed(1)}" y="${subY}" text-anchor="middle">${esc(sub)}</text>
      </g>
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
    const layers = loadLayers();
    host.classList.add("is-fresh");
    host.classList.toggle("hide-labels", !layers.labels);
    host.classList.toggle("hide-grid", !layers.grid);

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
        <g class="iso-nodes">${nodes.map((n, i) => nodeMarkup(n, i)).join("")}</g>
        <g class="iso-edge-labels">${edgeLabelsMarkup(layout)}</g>
      </g>
    </svg>
    <div class="iso-tools" role="group" aria-label="Camera sân khấu">
      <button type="button" data-iso-zoom="in" title="Phóng to" aria-label="Phóng to">+</button>
      <button type="button" data-iso-zoom="out" title="Thu nhỏ" aria-label="Thu nhỏ">−</button>
      <button type="button" data-iso-zoom="fit" title="Vừa khung (nhấp đúp)" aria-label="Thu vừa khung">⤢</button>
      <button type="button" data-iso-layer="labels" class="${layers.labels ? "is-on" : ""}" aria-pressed="${layers.labels}" title="Ẩn/hiện nhãn thiết bị" aria-label="Ẩn hoặc hiện nhãn thiết bị">A</button>
      <button type="button" data-iso-layer="grid" class="${layers.grid ? "is-on" : ""}" aria-pressed="${layers.grid}" title="Ẩn/hiện lưới nền" aria-label="Ẩn hoặc hiện lưới nền">▦</button>
    </div>
    <div class="iso-callout" role="tooltip" hidden></div>`;
    const svg = host.querySelector("svg");
    const packets = host.querySelector(".iso-packets");
    const nodeEls = new Map();
    const edgeEls = new Map();
    host.querySelectorAll(".iso-node").forEach((el) => nodeEls.set(el.dataset.node, el));
    host.querySelectorAll(".iso-edge-group").forEach((el) => edgeEls.set(el.dataset.edge, el));
    const edgeKind = new Map(layout.edges.map((e) => [e.id, e.kind]));
    const natural = layout.box;
    const vb = { ...natural };
    const fitBox = { ...natural };
    let zoom = loadView().zoom;
    let saveTimer = 0;

    function applyView() {
      svg.setAttribute("viewBox", `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`);
    }
    function baseFit() {
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
      fitBox.x = vb.x; fitBox.y = vb.y; fitBox.w = vb.w; fitBox.h = vb.h;
    }
    function applyZoom(z, anchor) {
      zoom = clamp(z, Z_MIN, Z_MAX);
      const fx = anchor ? clamp((anchor.x - vb.x) / vb.w, 0, 1) : 0.5;
      const fy = anchor ? clamp((anchor.y - vb.y) / vb.h, 0, 1) : 0.5;
      const cx = vb.x + vb.w * fx;
      const cy = vb.y + vb.h * fy;
      vb.w = fitBox.w / zoom;
      vb.h = fitBox.h / zoom;
      vb.x = cx - vb.w * fx;
      vb.y = cy - vb.h * fy;
      applyView();
    }
    function applyFit() {
      baseFit();
      if (zoom !== 1) applyZoom(zoom);
      else applyView();
    }
    function resetFit() {
      zoom = 1;
      saveView({ zoom });
      baseFit();
      applyView();
    }
    function saveSoon() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => saveView({ zoom }), 250);
    }
    function clampPan() {
      const m = Math.min(vb.w, vb.h) * 0.45;
      vb.x = clamp(vb.x, fitBox.x - vb.w + m, fitBox.x + fitBox.w - m);
      vb.y = clamp(vb.y, fitBox.y - vb.h + m, fitBox.y + fitBox.h - m);
    }
    applyFit();

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
    let panMoved = false;
    let downNode = null;
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
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* pointer already released */ }
      if (pointers.size === 1) {
        drag = { x: e.clientX, y: e.clientY };
        panMoved = false;
        downNode = e.target.closest ? e.target.closest(".iso-node") : null;
      } else if (pointers.size === 2) {
        panMoved = true;
        downNode = null;
      }
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
          applyZoom((fitBox.w / vb.w) * (dist / Math.max(30, drag.dist)), anchor);
          saveSoon();
        }
        drag = { dist };
        return;
      }
      if (!drag) return;
      if (!panMoved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 4) panMoved = true;
      const dx = (e.clientX - drag.x) / rect.width * vb.w;
      const dy = (e.clientY - drag.y) / rect.height * vb.h;
      vb.x -= dx; vb.y -= dy;
      clampPan();
      drag = { x: e.clientX, y: e.clientY };
      applyView();
    }
    function onPointerUp(e) {
      pointers.delete(e.pointerId);
      if (!pointers.size) {
        if (!panMoved) {
          if (downNode) pinNode(downNode);
          else if (pinned) clearPin();
        }
        downNode = null;
        drag = null;
        svg.classList.remove("is-grabbing");
      }
    }
    function onWheel(e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const anchor = toView(e.clientX, e.clientY);
      const factor = Math.exp(e.deltaY * 0.0015);
      applyZoom((fitBox.w / vb.w) / factor, anchor);
      saveSoon();
    }
    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerup", onPointerUp);
    svg.addEventListener("pointercancel", onPointerUp);
    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("dblclick", resetFit);
    const onResize = () => applyFit();
    window.addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (ro) ro.observe(host);

    /* ---------- chú thích ghim, lớp nhãn và nút camera ---------- */
    let hovered = null;
    let pinned = null;
    const callout = host.querySelector(".iso-callout");

    function hideCallout() {
      if (!callout) return;
      callout.hidden = true;
      callout.textContent = "";
    }
    function placeCallout(node) {
      if (!callout) return;
      let data = null;
      try { data = JSON.parse(node.getAttribute("data-tip") || "null"); } catch (err) { data = null; }
      if (!data) return;
      callout.textContent = "";
      const head = document.createElement("b");
      head.textContent = data.title;
      callout.appendChild(head);
      (data.lines || []).forEach((line) => {
        const row = document.createElement("span");
        row.textContent = line;
        callout.appendChild(row);
      });
      const foot = document.createElement("i");
      foot.textContent = pinned === node ? "Esc để bỏ ghim" : "Nhấp để ghim chú thích";
      callout.appendChild(foot);
      callout.hidden = false;
      const hr = host.getBoundingClientRect();
      const nr = node.getBoundingClientRect();
      const cw = callout.offsetWidth;
      const chh = callout.offsetHeight;
      let left = nr.left - hr.left + nr.width / 2 - cw / 2;
      let top = nr.top - hr.top - chh - 8;
      if (top < 4) top = nr.bottom - hr.top + 8;
      left = clamp(left, 6, Math.max(6, hr.width - cw - 6));
      top = clamp(top, 4, Math.max(4, hr.height - chh - 4));
      callout.style.left = `${left}px`;
      callout.style.top = `${top}px`;
    }
    function refresh() {
      if (pinned && !pinned.isConnected) pinned = null;
      if (hovered && !hovered.isConnected) hovered = null;
      const target = hovered || pinned;
      if (target && host.contains(target)) placeCallout(target);
      else hideCallout();
    }
    function pinNode(node) {
      if (pinned && !pinned.isConnected) pinned = null;
      if (pinned === node) {
        pinned.classList.remove("is-pinned");
        pinned = null;
        hideCallout();
        return;
      }
      if (pinned) pinned.classList.remove("is-pinned");
      pinned = node;
      node.classList.add("is-pinned");
      hovered = null;
      placeCallout(node);
    }
    function clearPin() {
      if (!pinned) return;
      pinned.classList.remove("is-pinned");
      pinned = null;
      refresh();
    }
    function syncLayerButtons() {
      host.querySelectorAll("[data-iso-layer]").forEach((btn) => {
        const on = !!layers[btn.dataset.isoLayer];
        btn.classList.toggle("is-on", on);
        btn.setAttribute("aria-pressed", String(on));
      });
    }
    function toggleLayer(key) {
      layers[key] = !layers[key];
      saveLayers(layers);
      host.classList.toggle("hide-labels", !layers.labels);
      host.classList.toggle("hide-grid", !layers.grid);
      syncLayerButtons();
    }
    function onDocKey(event) {
      if (event.key === "Escape" && pinned) clearPin();
    }
    document.addEventListener("keydown", onDocKey);
    syncLayerButtons();

    host.addEventListener("click", (event) => {
      const zoomBtn = event.target.closest ? event.target.closest("[data-iso-zoom]") : null;
      if (zoomBtn) {
        const act = zoomBtn.dataset.isoZoom;
        if (act === "fit") resetFit();
        else applyZoom(zoom * (act === "in" ? 1.2 : 1 / 1.2));
        saveSoon();
        return;
      }
      const layerBtn = event.target.closest ? event.target.closest("[data-iso-layer]") : null;
      if (layerBtn) { toggleLayer(layerBtn.dataset.isoLayer); return; }
    });
    host.addEventListener("pointerover", (event) => {
      const node = event.target.closest ? event.target.closest(".iso-node") : null;
      if (!node) return;
      hovered = node;
      refresh();
    });
    host.addEventListener("pointerout", (event) => {
      const node = event.target.closest ? event.target.closest(".iso-node") : null;
      if (!node) return;
      if (event.relatedTarget && node.contains(event.relatedTarget)) return;
      if (hovered === node) hovered = null;
      refresh();
    });
    host.addEventListener("focusin", (event) => {
      const node = event.target.closest ? event.target.closest(".iso-node") : null;
      if (!node) return;
      hovered = node;
      placeCallout(node);
    });
    host.addEventListener("focusout", (event) => {
      const node = event.target.closest ? event.target.closest(".iso-node") : null;
      if (!node) return;
      if (hovered === node) hovered = null;
      refresh();
    });
    host.addEventListener("keydown", (event) => {
      const node = event.target.closest ? event.target.closest(".iso-node") : null;
      if (!node) return;
      if (event.key === "Enter" || event.code === "Space") {
        event.preventDefault();
        event.stopPropagation();
        pinNode(node);
      } else if (event.key === "Escape") {
        clearPin();
      }
    });

    return {
      applyStep,
      fit: resetFit,
      destroy() {
        svg.removeEventListener("pointerdown", onPointerDown);
        svg.removeEventListener("pointermove", onPointerMove);
        svg.removeEventListener("pointerup", onPointerUp);
        svg.removeEventListener("pointercancel", onPointerUp);
        svg.removeEventListener("wheel", onWheel);
        svg.removeEventListener("dblclick", resetFit);
        window.removeEventListener("resize", onResize);
        if (ro) ro.disconnect();
        document.removeEventListener("keydown", onDocKey);
        clearTimeout(saveTimer);
        host.innerHTML = "";
      }
    };
  }

  window.NetLabIso = { create };
})();
