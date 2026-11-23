/* NetLab — Dòng gói tin: bảng sự kiện và sơ đồ chuỗi cho từng bài học. */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  const esc = (value) => String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const cut = (text, max) => {
    const value = String(text == null ? "" : text);
    return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
  };

  const PROTO = {
    dhcp: { name: "DHCP", layer: "Ứng dụng (L7)", transport: "UDP", port: "67/68", rfc: "RFC 2131", sizes: [342, 342], tone: "yellow" },
    arp: { name: "ARP", layer: "Liên kết (L2)", transport: "—", port: "—", rfc: "RFC 826", sizes: [42, 42], tone: "mint", decode: "arp" },
    dns: { name: "DNS", layer: "Ứng dụng (L7)", transport: "UDP/TCP", port: "53", rfc: "RFC 1035", sizes: [75, 91], tone: "violet", decode: "dns-udp" },
    icmp: { name: "ICMP", layer: "Mạng (L3)", transport: "—", port: "—", rfc: "RFC 792", sizes: [98, 98], tone: "green", decode: "icmp" },
    tcp: { name: "TCP", layer: "Giao vận (L4)", transport: "TCP", port: "—", rfc: "RFC 9293", sizes: [66, 60], tone: "blue", decode: "tcp-syn" },
    udp: { name: "UDP", layer: "Giao vận (L4)", transport: "UDP", port: "—", rfc: "RFC 768", sizes: [72, 72], tone: "blue" },
    tls: { name: "TLS 1.3", layer: "Phiên (L5–6)", transport: "TCP", port: "443", rfc: "RFC 8446", sizes: [517, 1434], tone: "coral", decode: "tls" },
    http: { name: "HTTP", layer: "Ứng dụng (L7)", transport: "TCP", port: "80 / 443", rfc: "RFC 9110", sizes: [484, 12800], tone: "coral", decode: "http" },
    quic: { name: "QUIC", layer: "Giao vận (L4)", transport: "UDP", port: "443", rfc: "RFC 9000", sizes: [1252, 1252], tone: "violet", decode: "quic" },
    smtp: { name: "SMTP/IMAP", layer: "Ứng dụng (L7)", transport: "TCP", port: "25 / 143", rfc: "RFC 5321", sizes: [610, 820], tone: "yellow" },
    bgp: { name: "BGP-4", layer: "Ứng dụng (L7)", transport: "TCP", port: "179", rfc: "RFC 4271", sizes: [79, 79], tone: "violet" },
    ospf: { name: "OSPF", layer: "Mạng (L3)", transport: "IP 89", port: "—", rfc: "RFC 2328", sizes: [90, 90], tone: "green" },
    stp: { name: "STP/RSTP", layer: "Liên kết (L2)", transport: "—", port: "—", rfc: "IEEE 802.1D", sizes: [39, 39], tone: "mint" },
    vlan: { name: "802.1Q", layer: "Liên kết (L2)", transport: "—", port: "—", rfc: "IEEE 802.1Q", sizes: [46, 46], tone: "coral", decode: "vlan-dns" },
    wifi: { name: "802.11", layer: "Liên kết (L2)", transport: "—", port: "—", rfc: "IEEE 802.11", sizes: [120, 120], tone: "coral", decode: "wifi" },
    ipv6: { name: "IPv6", layer: "Mạng (L3)", transport: "—", port: "—", rfc: "RFC 8200", sizes: [128, 1400], tone: "green", decode: "ipv6-http" },
    ipsec: { name: "IPsec/ESP", layer: "Mạng (L3)", transport: "IP 50", port: "—", rfc: "RFC 4303", sizes: [150, 150], tone: "violet" },
    mip: { name: "Mobile IP", layer: "Mạng (L3)", transport: "IP 4/6", port: "—", rfc: "RFC 6275", sizes: [96, 96], tone: "green" },
    ipv4: { name: "IPv4", layer: "Mạng (L3)", transport: "—", port: "—", rfc: "RFC 791", sizes: [84, 84], tone: "green" }
  };

  /* Thứ tự có chủ đích: giao thức đặc thù trước, giao thức chung sau. */
  const RULES = [
    ["dhcp", /\bDHCP\b|\bDORA\b|lease|địa chỉ tự động/i],
    ["arp", /\bARP\b/i],
    ["dns", /\bDNS\b|DNSSEC|\bresolver\b|tên miền|bản ghi|NXDOMAIN/i],
    ["mip", /\bMobile IP\b|care-of|home agent|binding update|MPTCP/i],
    ["quic", /\bQUIC\b|HTTP\/3/i],
    ["tls", /\bTLS\b|\bHTTPS\b|chứng chỉ|\bcertificate\b|\bSNI\b|\bHSTS\b/i],
    ["http", /\bHTTP\b|\bcookie\b|Cache-Control|\bETag\b|mã trạng thái/i],
    ["smtp", /\bSMTP\b|\bIMAP\b|\bPOP3\b|\bMX\b|hộp thư/i],
    ["bgp", /\bBGP\b|AS-PATH|eBGP|iBGP/i],
    ["ospf", /\bOSPF\b|Dijkstra|vector khoảng cách|Bellman/i],
    ["stp", /\bSTP\b|RSTP|spanning/i],
    ["vlan", /\bVLAN\b|802\.1Q|trunk/i],
    ["wifi", /\bWi-?Fi\b|802\.11|CSMA\/CA/i],
    ["ipv6", /\bIPv6\b|\bSLAAC\b|\bNDP\b|ICMPv6/i],
    ["ipsec", /\bIPsec\b|\bESP\b|\bIKE\b|\bVPN\b/i],
    ["icmp", /\bICMP\b|\bping\b|traceroute/i],
    ["tcp", /\bTCP\b|\bSYN\b|\bACK\b|cửa sổ trượt|truyền lại|bắt tay ba bước/i],
    ["udp", /\bUDP\b|thời gian thực/i]
  ];

  function matchCount(text, rx) {
    const matches = String(text || "").match(new RegExp(rx.source, "gi"));
    return matches ? matches.length : 0;
  }

  function bestProto(text, allowed) {
    const probe = String(text || "");
    let best = null;
    let bestScore = 0;
    RULES.forEach(([key, rx]) => {
      if (allowed && !allowed.has(key)) return;
      const score = matchCount(probe, rx);
      if (score > bestScore) { best = key; bestScore = score; }
    });
    return best;
  }

  function lessonText(lesson) {
    /* Chỉ nhãn và phụ đề: tiêu đề hay nhắc tên công nghệ chỉ để dẫn dắt. */
    return `${(lesson.tags || []).join(" ")} ${lesson.subtitle || ""}`;
  }

  function lessonProtocols(lesson) {
    const text = lessonText(lesson);
    const allowed = new Set();
    RULES.forEach(([key, rx]) => { if (matchCount(text, rx) > 0) allowed.add(key); });
    return allowed;
  }

  function fmtSize(bytes) {
    return bytes >= 1024 ? `${(bytes / 1024).toFixed(1).replace(".", ",")} KB` : `${bytes} B`;
  }

  function fmtTime(seconds) {
    return `${seconds.toFixed(3)}s`;
  }

  function build(lesson) {
    const nodeMap = {};
    lesson.nodes.forEach((node) => { nodeMap[node.id] = node; });
    const edgeMap = {};
    lesson.edges.forEach((edge) => { edgeMap[edge.id] = edge; });
    const allowed = lessonProtocols(lesson);
    const primary = bestProto(lessonText(lesson), allowed) || "ipv4";
    const perStep = allowed.size >= 2;
    const steps = [];
    const events = [];
    let clock = 0;

    lesson.steps.forEach((step, stepIdx) => {
      const ids = step.edges === "all"
        ? lesson.edges.map((edge) => edge.id)
        : (step.edges || []);
      /* Thân bước chỉ giải thích, hay nhắc giao thức đối chứng: không dùng để đoán. */
      const stepText = `${step.short || ""} ${step.title || ""}`;
      const stepProto = perStep ? bestProto(stepText, allowed) : null;
      const list = [];

      ids.forEach((id) => {
        const edge = edgeMap[id];
        if (!edge) return;
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return;
        let key = stepProto || (perStep ? bestProto(edge.label, allowed) : null);
        if (!key) {
          const subs = `${from.sub || ""} ${to.sub || ""}`;
          const fromSub = /UDP/i.test(subs) ? "udp"
            : /\bTCP\b/i.test(subs) ? "tcp"
              : /\b53\b/.test(subs) ? "dns"
                : /\b80\b|\b443\b/.test(subs) ? "http" : null;
          if (fromSub && allowed.has(fromSub)) key = fromSub;
        }
        if (!key) key = primary;
        const proto = PROTO[key] || PROTO.ipv4;
        const response = edge.kind === "response";
        const size = response ? proto.sizes[1] : proto.sizes[0];
        clock += 0.012 + (events.length % 4) * 0.004;
        const event = {
          n: events.length + 1,
          step: stepIdx + 1,
          t: clock,
          fromId: edge.from,
          toId: edge.to,
          from: from.label,
          to: to.label,
          kind: edge.kind || "request",
          proto: key,
          protoName: proto.name,
          labelShort: edge.label || proto.name,
          info: `${edge.label ? `${edge.label} · ` : ""}${step.short || step.title || ""}`,
          size
        };
        events.push(event);
        list.push(event);
      });

      steps.push({
        index: stepIdx + 1,
        short: step.short || `Bước ${stepIdx + 1}`,
        title: step.title || "",
        events: list
      });
    });

    const protoOrder = [];
    const protoCount = {};
    events.forEach((event) => {
      if (!protoCount[event.proto]) { protoCount[event.proto] = 0; protoOrder.push(event.proto); }
      protoCount[event.proto] += 1;
    });

    return { lesson, steps, events, protoOrder, protoCount };
  }

  function chipsHTML(built) {
    return built.protoOrder.map((key) => {
      const proto = PROTO[key] || PROTO.ipv4;
      return `<span class="trace-chip" style="--tone:var(--${proto.tone})">${esc(proto.name)}<b>×${built.protoCount[key]}</b></span>`;
    }).join("");
  }

  function factsHTML(built) {
    if (built.protoOrder.length !== 1) return "";
    const proto = PROTO[built.protoOrder[0]] || PROTO.ipv4;
    return `<span class="trace-fact">${esc(proto.layer)} · cổng ${esc(proto.port)} · ${esc(proto.rfc)}</span>`;
  }

  function decodeHref(key) {
    const proto = PROTO[key];
    if (!proto || !proto.decode) return null;
    const scenario = SL.packets && SL.packets.byId ? SL.packets.byId[proto.decode] : null;
    if (!scenario) return null;
    return { id: proto.decode, title: scenario.title };
  }

  function tableHTML(built, stepIndex) {
    if (!built || !built.events.length) return "";
    const rows = built.events.map((event) => {
      const proto = PROTO[event.proto] || PROTO.ipv4;
      const link = decodeHref(event.proto);
      const current = event.step === stepIndex;
      const past = event.step < stepIndex;
      return `<tr class="trace-row${current ? " is-current" : ""}${past ? " is-past" : ""}" data-step="${event.step}" title="Bước ${event.step}: ${esc(built.steps[event.step - 1].title)}">
        <td class="trace-num">${event.n}</td>
        <td class="trace-time">${fmtTime(event.t)}</td>
        <td class="trace-node">${esc(cut(event.from, 18))}</td>
        <td class="trace-node">${esc(cut(event.to, 18))}</td>
        <td class="trace-proto" style="--tone:var(--${proto.tone})">${esc(proto.name)}</td>
        <td class="trace-info"><span class="trace-route">${esc(cut(event.from, 16))} → ${esc(cut(event.to, 16))}</span>${esc(cut(event.info, 52))}</td>
        <td class="trace-size">${fmtSize(event.size)}</td>
        <td class="trace-decode-col">${link ? `<a class="trace-decode" href="#/packet/${esc(link.id)}" data-action="decode-link" title="Mở bản giải mã byte mẫu: ${esc(link.title)}">byte</a>` : ""}</td>
      </tr>`;
    }).join("");

    return `<section class="trace-card" aria-label="Dòng gói tin mô phỏng">
      <div class="trace-head">
        <div class="trace-title">Dòng gói tin
          <span>${built.events.length} sự kiện · ${built.steps.length} bước · thời gian và kích thước là mô phỏng</span>
        </div>
        <div class="trace-protos">${chipsHTML(built)}${factsHTML(built)}</div>
      </div>
      <div class="trace-scroll" id="traceTable">
        <table class="trace-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Thời gian</th>
              <th scope="col">Nguồn</th>
              <th scope="col">Đích</th>
              <th scope="col">Giao thức</th>
              <th scope="col">Thông tin</th>
              <th scope="col">Kích thước</th>
              <th scope="col"><span class="sr-only">Giải mã byte</span></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="trace-foot">Nhấn một dòng để mở bước tương ứng · “byte” mở bản giải mã mẫu của giao thức</div>
    </section>`;
  }

  const SEQ = {
    top: 16,
    head: 48,
    band: 30,
    row: 46,
    gap: 10,
    padBottom: 18
  };

  function sequenceHTML(lesson, built, stepIndex, widthHint) {
    if (!built || !built.events.length) return "";
    const nodeMap = {};
    lesson.nodes.forEach((node) => { nodeMap[node.id] = node; });
    const ids = [];
    built.steps.forEach((group) => {
      group.events.forEach((event) => {
        if (nodeMap[event.fromId] && !ids.includes(event.fromId)) ids.push(event.fromId);
        if (nodeMap[event.toId] && !ids.includes(event.toId)) ids.push(event.toId);
      });
    });
    if (!ids.length) return "";
    ids.sort((a, b) => (nodeMap[a].x || 0) - (nodeMap[b].x || 0));
    const lane = {};
    ids.forEach((id, i) => { lane[id] = i; });

    const avail = Math.max(360, Number(widthHint) || 0);
    /* Màn hẹp mà ít luồng: thu nhỏ để cả chuỗi nằm gọn, khỏi cuộn ngang. */
    const compact = avail < 520 && ids.length <= 4;
    const minStep = compact ? 112 : 126;
    const step = ids.length > 1
      ? Math.min(176, Math.max(minStep, (avail - 156) / (ids.length - 1)))
      : 176;
    const x0 = ids.length > 1
      ? Math.max(compact ? 56 : 78, Math.round((avail - (ids.length - 1) * step) / 2))
      : 98;
    const lx = (i) => Math.round(x0 + i * step);
    const width = Math.max(compact ? 0 : 620, Math.round(x0 * 2 + (ids.length - 1) * step));
    const headY = SEQ.top;
    const bodyTop = headY + SEQ.head + 16;

    let height = bodyTop;
    built.steps.forEach((group) => {
      height += SEQ.band + group.events.length * SEQ.row + SEQ.gap;
    });
    height += SEQ.padBottom;

    const lifelines = ids.map((id, i) => `<line class="seq-lifeline" x1="${lx(i)}" y1="${headY + SEQ.head}" x2="${lx(i)}" y2="${height - SEQ.padBottom}" />`).join("");

    const cardW = Math.max(104, Math.min(156, Math.round(step - 10)));
    const labelChars = Math.max(6, Math.floor((cardW - 34) / 6.3));
    const subChars = Math.max(6, Math.floor((cardW - 22) / 5.4));
    const heads = ids.map((id, i) => {
      const node = nodeMap[id];
      const x = lx(i) - cardW / 2;
      return `<g class="seq-head">
        <rect class="seq-head-bg" x="${x}" y="${headY}" width="${cardW}" height="${SEQ.head}" rx="12" />
        <circle class="seq-head-dot" cx="${x + 14}" cy="${headY + 16}" r="4" />
        <text class="seq-head-label" x="${x + 24}" y="${headY + 20}">${esc(cut(node.label, labelChars))}</text>
        <text class="seq-head-sub" x="${x + 10}" y="${headY + 37}">${esc(cut(node.sub || "", subChars))}</text>
      </g>`;
    }).join("");

    let y = bodyTop;
    const bands = [];
    built.steps.forEach((group) => {
      const gy = y;
      const current = group.index === stepIndex;
      const muted = !current;
      const events = group.events.map((event, i) => {
        const cy = gy + SEQ.band + i * SEQ.row + SEQ.row / 2;
        const i1 = lane[event.fromId];
        const i2 = lane[event.toId];
        if (i1 == null || i2 == null) return "";
        const x1 = lx(i1);
        const x2 = lx(i2);
        const kindClass = ` kind-${event.kind}`;
        const time = fmtTime(event.t);
        const label = cut(event.labelShort, 18);
        const labelW = Math.round(label.length * 6.1 + time.length * 5 + 18);
        let shape = "";
        let cx = (x1 + x2) / 2;
        let ly = cy - 9;
        if (i1 === i2) {
          shape = `<path class="seq-line" d="M${x1 - 6} ${cy - 8} C ${x1 - 46} ${cy - 30}, ${x1 - 46} ${cy - 58}, ${x1 - 2} ${cy - 24}" marker-end="url(#seq-arrow-${event.kind})" />`;
          cx = x1 - 34;
          ly = cy - 44;
        } else {
          const dir = x2 > x1 ? 1 : -1;
          shape = `<line class="seq-line" x1="${x1 + dir * 10}" y1="${cy}" x2="${x2 - dir * 10}" y2="${cy}" marker-end="url(#seq-arrow-${event.kind})" />`;
        }
        return `<g class="seq-event${kindClass}${muted ? " is-muted" : ""}" data-seq-step="${group.index}" data-step="${group.index}" role="presentation">
          <title>Bước ${group.index} · ${esc(event.from)} → ${esc(event.to)} · ${esc(event.info)} · ${fmtSize(event.size)}</title>
          ${shape}
          <rect class="seq-label-bg" x="${cx - labelW / 2}" y="${ly - 12}" width="${labelW}" height="16" rx="5" />
          <text class="seq-label" x="${cx}" y="${ly}" text-anchor="middle"><tspan>${esc(label)}</tspan><tspan class="seq-time" dx="5">${time}</tspan></text>
        </g>`;
      }).join("");

      bands.push(`<g class="seq-band-group${current ? " is-current" : ""}${muted ? " is-muted" : ""}" data-seq-step="${group.index}" data-step="${group.index}" data-y="${gy}">
        <rect class="seq-band" x="10" y="${gy}" width="${width - 20}" height="${SEQ.band}" rx="8" />
        <circle class="seq-band-dot" cx="34" cy="${gy + SEQ.band / 2}" r="9" />
        <text class="seq-band-num" x="34" y="${gy + SEQ.band / 2 + 3.4}" text-anchor="middle">${group.index}</text>
        <text class="seq-band-label" x="52" y="${gy + SEQ.band / 2 + 3.6}">BƯỚC ${group.index} · ${esc(cut(group.short.toUpperCase(), 34))}</text>
        <text class="seq-band-count" x="${width - 22}" y="${gy + SEQ.band / 2 + 3.6}" text-anchor="end">${group.events.length} gói</text>
        ${events}
      </g>`);
      y = gy + SEQ.band + group.events.length * SEQ.row + SEQ.gap;
    });

    return `<svg class="seq-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Sơ đồ chuỗi gói tin của bài học">
      <defs>
        <marker id="seq-arrow-request" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0 0 7 3 0 6Z" fill="var(--blue)" /></marker>
        <marker id="seq-arrow-response" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0 0 7 3 0 6Z" fill="var(--coral)" /></marker>
        <marker id="seq-arrow-data" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0 0 7 3 0 6Z" fill="var(--mint)" /></marker>
      </defs>
      <g class="seq-lifelines">${lifelines}</g>
      <g class="seq-heads">${heads}</g>
      ${bands.join("")}
    </svg>`;
  }

  function focusSequence(host, stepIndex) {
    if (!host) return;
    host.querySelectorAll("[data-seq-step]").forEach((el) => {
      const current = Number(el.dataset.seqStep) === stepIndex;
      el.classList.toggle("is-current", current);
      el.classList.toggle("is-muted", !current);
    });
    const band = host.querySelector(`.seq-band-group[data-seq-step="${stepIndex}"]`);
    if (!band) return;
    const top = Number(band.dataset.y || 0);
    const viewTop = host.scrollTop;
    const viewBottom = viewTop + host.clientHeight;
    if (top < viewTop + 6 || top + SEQ.band + 24 > viewBottom) {
      host.scrollTo({ top: Math.max(0, top - 40), behavior: "smooth" });
    }
  }

  function focusTable(host, stepIndex) {
    if (!host) return;
    host.querySelectorAll("tr[data-step]").forEach((row) => {
      const index = Number(row.dataset.step);
      row.classList.toggle("is-current", index === stepIndex);
      row.classList.toggle("is-past", index < stepIndex);
    });
    const row = host.querySelector(`tr[data-step="${stepIndex}"]`);
    if (!row) return;
    const box = row.getBoundingClientRect();
    const view = host.getBoundingClientRect();
    if (box.top < view.top + 30 || box.bottom > view.bottom - 4) {
      host.scrollTop += box.top - view.top - 30;
    }
  }

  SL.trace = { build, tableHTML, sequenceHTML, focusSequence, focusTable };
})();
