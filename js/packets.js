/* NetLab — Packet Inspector: cấu trúc byte của gói tin theo OSI */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  const TE = new TextEncoder();
  const TONE_VAR = {
    violet: "var(--violet)",
    blue: "var(--blue)",
    green: "var(--green)",
    coral: "var(--coral)",
    yellow: "var(--yellow)",
    mint: "var(--mint)"
  };

  const esc = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const hex2 = (n) => (n & 255).toString(16).toUpperCase().padStart(2, "0");
  const hexBytes = (bytes) => bytes.map(hex2).join(" ");
  const u8 = (n) => [n & 255];
  const u16 = (n) => [(n >> 8) & 255, n & 255];
  const u16le = (n) => [n & 255, (n >> 8) & 255];
  const u32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const u32le = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
  const ascii = (text) => Array.from(TE.encode(text));
  const zeros = (n) => new Array(n).fill(0);
  const macBytes = (text) => text.split(":").map((part) => parseInt(part, 16));
  const ip4Bytes = (text) => text.split(".").map(Number);

  function ip6Bytes(text) {
    const [head, tail] = text.split("::");
    let groups;
    if (tail !== undefined) {
      const left = head ? head.split(":") : [];
      const right = tail ? tail.split(":") : [];
      groups = left.concat(new Array(8 - left.length - right.length).fill("0"), right);
    } else {
      groups = text.split(":");
    }
    const out = [];
    groups.forEach((group) => {
      const value = parseInt(group || "0", 16);
      out.push((value >> 8) & 255, value & 255);
    });
    return out;
  }

  function checksum16(bytes) {
    let sum = 0;
    for (let i = 0; i < bytes.length; i += 2) {
      sum += ((bytes[i] || 0) << 8) | (bytes[i + 1] || 0);
      while (sum > 0xffff) sum = (sum & 0xffff) + (sum >> 16);
    }
    return (~sum) & 0xffff;
  }

  function pseudoV4(src, dst, protocol, length) {
    return ip4Bytes(src)
      .concat(ip4Bytes(dst), [0, protocol], u16(length));
  }

  function pseudoV6(src, dst, nextHeader, length) {
    return ip6Bytes(src)
      .concat(ip6Bytes(dst), u32(length), [0, 0, 0, nextHeader]);
  }

  const CRC_TABLE = (() => {
    const table = new Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    bytes.forEach((byte) => {
      crc = CRC_TABLE[(crc ^ byte) & 255] ^ (crc >>> 8);
    });
    return (crc ^ 0xffffffff) >>> 0;
  }

  /* ------------------------------------------------------------------
     Field helpers
     ------------------------------------------------------------------ */
  function field(name, off, len, bits, value, note, extra) {
    return Object.assign({ name, off, len, bits, value, note }, extra || {});
  }

  function macFields(dst, src, typeValue, typeLabel) {
    return [
      field("MAC đích", 0, 6, "48 bit", dst.toUpperCase(), "Địa chỉ phần cứng của thiết bị nhận trong cùng miền L2. Frame broadcast dùng FF:FF:FF:FF:FF:FF."),
      field("MAC nguồn", 6, 6, "48 bit", src.toUpperCase(), "MAC của cổng phát. Switch học địa chỉ này để xây bảng chuyển mạch."),
      field("EtherType", 12, 2, "16 bit", `0x${hex2(typeValue >> 8)}${hex2(typeValue)} · ${typeLabel}`, "Cho biết payload là IPv4 (0x0800), IPv6 (0x86DD), ARP (0x0806) hay VLAN (0x8100).")
    ];
  }

  function ipv4Header(cfg) {
    const totalLength = 20 + cfg.payloadLength;
    const header = [
      0x45, cfg.tos || 0,
      ...u16(totalLength),
      ...u16(cfg.id || 0x1c46),
      ...u16(cfg.flagsFrag === undefined ? 0x4000 : cfg.flagsFrag),
      cfg.ttl || 64, cfg.protocol,
      0, 0,
      ...ip4Bytes(cfg.src), ...ip4Bytes(cfg.dst)
    ];
    const sum = checksum16(header);
    header[10] = (sum >> 8) & 255;
    header[11] = sum & 255;
    const fields = [
      field("Version", 0, 1, "4 bit", "4", "Phiên bản giao thức IP. IPv4 luôn là 4.", { bitNote: "0100" }),
      field("IHL", 0, 1, "4 bit", "5", "Độ dài header tính theo đơn vị 32 bit. 5 × 4 = 20 byte, nghĩa là không có option.", { bitNote: "0101" }),
      field("DSCP", 1, 1, "6 bit", "0", "Đánh dấu QoS (ví dụ EF cho voice). 0 là best effort.", { bitNote: "000000" }),
      field("ECN", 1, 1, "2 bit", "00", "Explicit Congestion Notification: router có thể báo tắc nghẽn mà không cần bỏ gói.", { bitNote: "00" }),
      field("Tổng độ dài", 2, 2, "16 bit", `${totalLength} byte`, "Bao gồm IPv4 header + toàn bộ payload (TCP/UDP/ICMP)."),
      field("Identification", 4, 2, "16 bit", `0x${hex2((cfg.id || 0x1c46) >> 8)}${hex2(cfg.id || 0x1c46)}`, "Dùng để ghép các mảnh khi gói bị phân mảnh."),
      field("Flags + Fragment offset", 6, 2, "3 + 13 bit", cfg.flagsFrag === 0x4000 ? "DF=1, offset=0" : "MF/DF, offset", "DF=1 cấm phân mảnh; MF=1 còn mảnh phía sau; offset định vị mảnh trong datagram gốc."),
      field("TTL", 8, 1, "8 bit", String(cfg.ttl || 64), "Giảm 1 mỗi router. Về 0 thì gói bị hủy và router gửi ICMP Time Exceeded — cơ chế của traceroute."),
      field("Protocol", 9, 1, "8 bit", `${cfg.protocol} · ${cfg.protocolLabel}`, "Cho biết payload là TCP (6), UDP (17), ICMP (1) hay giao thức khác."),
      field("Header checksum", 10, 2, "16 bit", `0x${hex2(header[10])}${hex2(header[11])}`, "Chỉ kiểm tra phần IPv4 header, không kiểm tra payload. Được tính lại tại mỗi router vì TTL thay đổi."),
      field("IP nguồn", 12, 4, "32 bit", cfg.src, "Địa chỉ logic của máy gửi. Không đổi qua các hop (trừ NAT)."),
      field("IP đích", 16, 4, "32 bit", cfg.dst, "Địa chỉ logic của đích cuối. Router dùng longest-prefix match để chọn next hop.")
    ];
    return { header, fields, totalLength };
  }

  function ipv6Header(cfg) {
    const payloadLength = cfg.payloadLength;
    const flow = cfg.flowLabel || 0x12345;
    const traffic = cfg.trafficClass || 0;
    const header = new Array(40).fill(0);
    header[0] = 0x60 | (traffic >> 4);
    header[1] = ((traffic & 15) << 4) | ((flow >> 16) & 15);
    header[2] = (flow >> 8) & 255;
    header[3] = flow & 255;
    header.splice(4, 2, ...u16(payloadLength));
    header[6] = cfg.nextHeader;
    header[7] = cfg.hopLimit || 64;
    header.splice(8, 16, ...ip6Bytes(cfg.src));
    header.splice(24, 16, ...ip6Bytes(cfg.dst));
    const fields = [
      field("Version", 0, 1, "4 bit", "6", "IPv6 cố định 6 ở 4 bit đầu.", { bitNote: "0110" }),
      field("Traffic Class", 0, 2, "8 bit", `0x${hex2(traffic)}`, "Tương tự DSCP/ECN của IPv4, dùng cho QoS và ECN."),
      field("Flow Label", 1, 3, "20 bit", `0x${flow.toString(16).toUpperCase().padStart(5, "0")}`, "Gợi ý router giữ các gói cùng luồng đi cùng đường để giảm jitter."),
      field("Payload Length", 4, 2, "16 bit", `${payloadLength} byte`, "Chỉ tính phần sau header IPv6 40 byte, khác với Total Length của IPv4."),
      field("Next Header", 6, 1, "8 bit", `${cfg.nextHeader} · ${cfg.nextHeaderLabel}`, "Tương tự Protocol của IPv4; có thể trỏ tới TCP, UDP hoặc một extension header."),
      field("Hop Limit", 7, 1, "8 bit", String(cfg.hopLimit || 64), "Tương đương TTL của IPv4. Giảm mỗi router, về 0 thì gói bị hủy."),
      field("IPv6 nguồn", 8, 16, "128 bit", cfg.src, "Địa chỉ 128 bit, thường là GUA hoặc ULA."),
      field("IPv6 đích", 24, 16, "128 bit", cfg.dst, "Đích cuối. IPv6 không dùng NAT như IPv4 nhưng vẫn cần firewall.")
    ];
    return { header, fields, totalLength: 40 + payloadLength };
  }

  function tcpHeader(cfg) {
    const options = cfg.options || [];
    const headerLen = 20 + options.length;
    const dataOffset = headerLen / 4;
    const segmentLength = headerLen + cfg.payloadLength;
    const header = [];
    header.push(...u16(cfg.sport), ...u16(cfg.dport), ...u32(cfg.seq || 0), ...u32(cfg.ack || 0));
    header.push((dataOffset << 4) | 0);
    header.push(cfg.flags);
    header.push(...u16(cfg.window || 64240), 0, 0, 0, 0);
    header.push(...options);
    const pseudo = cfg.version === 6
      ? pseudoV6(cfg.src, cfg.dst, 6, segmentLength)
      : pseudoV4(cfg.src, cfg.dst, 6, segmentLength);
    const payload = cfg.payload || [];
    const sum = checksum16(pseudo.concat(header, payload));
    header[16] = (sum >> 8) & 255;
    header[17] = sum & 255;
    const flagsText = [
      cfg.flags & 0x02 ? "SYN" : "",
      cfg.flags & 0x10 ? "ACK" : "",
      cfg.flags & 0x08 ? "PSH" : "",
      cfg.flags & 0x01 ? "FIN" : "",
      cfg.flags & 0x04 ? "RST" : ""
    ].filter(Boolean).join(", ");
    const fields = [
      field("Cổng nguồn", 0, 2, "16 bit", `${cfg.sport} · 0x${hex2(cfg.sport >> 8)}${hex2(cfg.sport)}`, "Port của tiến trình gửi. Client thường dùng ephemeral port 49152–65535."),
      field("Cổng đích", 2, 2, "16 bit", `${cfg.dport} · 0x${hex2(cfg.dport >> 8)}${hex2(cfg.dport)}`, "Port của dịch vụ đích: HTTP 80, HTTPS 443, DNS 53."),
      field("Sequence number", 4, 4, "32 bit", String(cfg.seq || 0), "Số thứ tự byte đầu tiên trong segment. Giúp receiver sắp xếp lại và phát hiện thiếu dữ liệu."),
      field("Acknowledgment number", 8, 4, "32 bit", String(cfg.ack || 0), "Byte tiếp theo mà sender đã nhận. Chỉ có ý nghĩa khi cờ ACK bật."),
      field("Data offset", 12, 1, "4 bit", `${dataOffset} × 4 = ${headerLen} B`, "Độ dài TCP header. 5 là 20 byte; có option thì lớn hơn.", { bitNote: dataOffset.toString(2).padStart(4, "0") }),
      field("Flags", 13, 1, "8 bit", `0x${hex2(cfg.flags)} · ${flagsText}`, "SYN mở kết nối, ACK xác nhận, FIN đóng, RST hủy, PSH đẩy dữ liệu lên ứng dụng."),
      field("Window", 14, 2, "16 bit", `${cfg.window || 64240} byte`, "Receive window: lượng dữ liệu receiver còn nhận được. Cửa sổ hiệu dụng = min(cwnd, rwnd)."),
      field("Checksum", 16, 2, "16 bit", `0x${hex2(header[16])}${hex2(header[17])}`, "Bảo vệ header + payload + pseudo-header IP. Được tính thật trong mô hình này."),
      field("Urgent pointer", 18, 2, "16 bit", "0", "Chỉ dùng khi cờ URG bật; hiếm gặp trong thực tế.")
    ];
    if (headerLen > 20) {
      fields.push(field("TCP options", 20, headerLen - 20, `${(headerLen - 20) * 8} bit`, cfg.optionText || "MSS", cfg.optionNote || "Option chỉ xuất hiện trong một số gói, thường là SYN."));
    }
    return { header, fields, headerLen, segmentLength };
  }

  function udpHeader(cfg) {
    const length = 8 + cfg.payloadLength;
    const header = [...u16(cfg.sport), ...u16(cfg.dport), ...u16(length), 0, 0];
    const pseudo = cfg.version === 6
      ? pseudoV6(cfg.src, cfg.dst, 17, length)
      : pseudoV4(cfg.src, cfg.dst, 17, length);
    const sum = checksum16(pseudo.concat(header, cfg.payload || []));
    header[6] = (sum >> 8) & 255;
    header[7] = sum & 255;
    return {
      header,
      fields: [
        field("Cổng nguồn", 0, 2, "16 bit", String(cfg.sport), "Port nguồn. Với DNS query thường là ephemeral port."),
        field("Cổng đích", 2, 2, "16 bit", `${cfg.dport} · ${cfg.service || "DNS"}`, "Port dịch vụ đích: 53 DNS, 123 NTP, 443 QUIC."),
        field("UDP Length", 4, 2, "16 bit", `${length} byte`, "Bao gồm 8 byte UDP header + payload. Không có trường Total Length riêng."),
        field("UDP Checksum", 6, 2, "16 bit", `0x${hex2(header[6])}${hex2(header[7])}`, "Kiểm tra header + payload + pseudo-header IP. IPv4 cho phép checksum 0 (không dùng), IPv6 thì bắt buộc.")
      ]
    };
  }

  function icmpEchoHeader(cfg) {
    const header = [8, 0, 0, 0, ...u16(cfg.id), ...u16(cfg.seq)];
    const sum = checksum16(header.concat(cfg.payload || []));
    header[2] = (sum >> 8) & 255;
    header[3] = sum & 255;
    return {
      header,
      fields: [
        field("Type", 0, 1, "8 bit", "8 · Echo Request", "8 là Echo Request, 0 là Echo Reply. Các type khác báo lỗi như Destination Unreachable (3) hay Time Exceeded (11)."),
        field("Code", 1, 1, "8 bit", "0", "Mã phụ trong từng type. Echo Request/Reply dùng code 0."),
        field("Checksum", 2, 2, "16 bit", `0x${hex2(header[2])}${hex2(header[3])}`, "Bảo vệ toàn bộ ICMP message, được tính thật."),
        field("Identifier", 4, 2, "16 bit", `0x${hex2(cfg.id >> 8)}${hex2(cfg.id)}`, "Ghép reply với request tương ứng. Ping thường dùng PID hoặc số ngẫu nhiên."),
        field("Sequence", 6, 2, "16 bit", String(cfg.seq), "Tăng mỗi gói ping để đo mất gói và thứ tự.")
      ]
    };
  }

  function arpHeader(cfg) {
    const header = [
      ...u16(1), ...u16(0x0800), 6, 4, ...u16(1),
      ...macBytes(cfg.senderMac), ...ip4Bytes(cfg.senderIp),
      ...zeros(6), ...ip4Bytes(cfg.targetIp)
    ];
    return {
      header,
      fields: [
        field("Hardware type", 0, 2, "16 bit", "1 · Ethernet", "Loại mạng L2. 1 là Ethernet."),
        field("Protocol type", 2, 2, "16 bit", "0x0800 · IPv4", "Giao thức L3 mà ARP đang ánh xạ."),
        field("HLEN", 4, 1, "8 bit", "6", "Độ dài địa chỉ phần cứng (MAC = 6 byte)."),
        field("PLEN", 5, 1, "8 bit", "4", "Độ dài địa chỉ giao thức (IPv4 = 4 byte)."),
        field("Opcode", 6, 2, "16 bit", "1 · Request", "1 là request, 2 là reply. ARP request hỏi “ai có IP này?”."),
        field("Sender MAC", 8, 6, "48 bit", cfg.senderMac.toUpperCase(), "MAC của máy hỏi. Máy đích dùng địa chỉ này để trả lời unicast."),
        field("Sender IP", 14, 4, "32 bit", cfg.senderIp, "IP của máy hỏi."),
        field("Target MAC", 18, 6, "48 bit", "00:00:00:00:00:00", "Chưa biết nên để 0 trong request."),
        field("Target IP", 24, 4, "32 bit", cfg.targetIp, "IP cần phân giải thành MAC.")
      ]
    };
  }

  function dnsQueryHeader(cfg) {
    const labels = ["www", "example", "com"];
    const qname = [];
    labels.forEach((label) => {
      qname.push(label.length, ...ascii(label));
    });
    qname.push(0);
    const header = [
      ...u16(cfg.id), ...u16(0x0100),
      ...u16(1), ...u16(0), ...u16(0), ...u16(0),
      ...qname, ...u16(1), ...u16(1)
    ];
    return {
      header,
      fields: [
        field("Transaction ID", 0, 2, "16 bit", `0x${hex2(cfg.id >> 8)}${hex2(cfg.id)}`, "Ghép query với response. Client chọn ngẫu nhiên để giảm rủi ro giả mạo."),
        field("Flags", 2, 2, "16 bit", "0x0100 · RD=1", "QR=0 query, Opcode=0 standard, RD=1 yêu cầu đệ quy, RA cho biết server hỗ trợ đệ quy."),
        field("QDCOUNT", 4, 2, "16 bit", "1", "Số câu hỏi trong section Question."),
        field("ANCOUNT", 6, 2, "16 bit", "0", "Số bản ghi trả lời. Query chưa có answer nên bằng 0."),
        field("NSCOUNT", 8, 2, "16 bit", "0", "Số bản ghi authority (NS)."),
        field("ARCOUNT", 10, 2, "16 bit", "0", "Số bản ghi additional (ví dụ glue record)."),
        field("QNAME", 12, qname.length, `${qname.length * 8} bit`, "www.example.com", "Tên miền mã hóa thành các label: độ dài + ký tự, kết thúc bằng 0."),
        field("QTYPE", 12 + qname.length, 2, "16 bit", "1 · A", "Loại bản ghi cần hỏi: A, AAAA, MX, TXT, CNAME…"),
        field("QCLASS", 14 + qname.length, 2, "16 bit", "1 · IN", "Lớp dữ liệu; IN là Internet.")
      ]
    };
  }

  function httpRequest() {
    const lines = [
      "GET /index.html HTTP/1.1",
      "Host: netlab.local",
      "User-Agent: NetLab/1.0",
      "Accept: text/html",
      "Connection: keep-alive",
      "",
      ""
    ];
    const text = lines.join("\r\n");
    const bytes = ascii(text);
    const fields = [];
    let offset = 0;
    const addLine = (name, textLine, note) => {
      const lineBytes = ascii(textLine + "\r\n");
      fields.push(field(name, offset, lineBytes.length, `${lineBytes.length * 8} bit`, `<span class="pkt-text">${esc(textLine)}</span>`, note, { kind: "text" }));
      offset += lineBytes.length;
    };
    addLine("Request line", lines[0], "Method + path + phiên bản HTTP. GET thường an toàn và idempotent.");
    addLine("Host", lines[1], "Bắt buộc với HTTP/1.1. Một IP có thể phục vụ nhiều website dựa vào Host (virtual hosting).");
    addLine("User-Agent", lines[2], "Cho server biết client. Không phải cơ chế xác thực và có thể bị giả mạo.");
    addLine("Accept", lines[3], "Client chấp nhận nội dung gì. Server dùng để thương lượng representation.");
    addLine("Connection", lines[4], "keep-alive cho phép tái sử dụng kết nối TCP cho request tiếp theo.");
    fields.push(field("CRLF kết thúc", offset, 2, "16 bit", "\\r\\n", "Dòng trống đánh dấu hết header; body (nếu có) nằm sau đó.", { kind: "text" }));
    return { bytes, fields };
  }

  function tlsRecord(ciphertext) {
    const header = [0x17, 0x03, 0x03, ...u16(ciphertext.length)];
    return {
      header,
      fields: [
        field("Content Type", 0, 1, "8 bit", "23 · Application Data", "23 là application_data; 22 handshake, 21 alert, 20 change_cipher_spec."),
        field("Legacy Version", 1, 2, "16 bit", "0x0303 · TLS 1.2", "TLS 1.3 giữ 0x0303 ở record ngoài để tương thích; phiên bản thật nằm trong handshake."),
        field("Length", 3, 2, "16 bit", `${ciphertext.length} byte`, "Độ dài ciphertext trong record, tối đa 2^14 byte cho mỗi record.")
      ]
    };
  }

  function wifiHeader() {
    const header = [
      0x08, 0x01,
      0x00, 0x00,
      ...macBytes("02:11:22:33:44:55"),
      ...macBytes("02:aa:bb:cc:dd:ee"),
      ...macBytes("02:11:22:33:44:55"),
      0x10, 0x00,
      0xaa, 0xaa, 0x03, 0x00, 0x00, 0x00, 0x08, 0x00
    ];
    return {
      header,
      fields: [
        field("Frame Control", 0, 2, "16 bit", "0x0108 · Data, ToDS=1", "Gồm protocol version, type/subtype và các cờ. 0x08 = data, bit ToDS báo frame đi lên AP."),
        field("Duration", 2, 2, "16 bit", "0", "Thời gian giữ medium (NAV) để tránh va chạm."),
        field("Addr1 (BSSID/đích)", 4, 6, "48 bit", "02:11:22:33:44:55", "Địa chỉ AP/BSSID hoặc đích tùy bit ToDS/FromDS."),
        field("Addr2 (nguồn)", 10, 6, "48 bit", "02:AA:BB:CC:DD:EE", "MAC của thiết bị gửi frame."),
        field("Addr3", 16, 6, "48 bit", "02:11:22:33:44:55", "Thường là BSSID hoặc địa chỉ cầu nối tùy chế độ."),
        field("Sequence Control", 22, 2, "16 bit", "0x0010", "Sequence number và fragment number; giúp phát hiện trùng/lặp."),
        field("LLC / SNAP", 24, 8, "64 bit", "AA AA 03 · OUI 00:00:00 · 0x0800", "802.11 không mang trực tiếp EtherType; LLC/SNAP bọc để tương thích Ethernet/IPv4.")
      ]
    };
  }

  function vlanEthHeader() {
    const header = [
      ...macBytes("02:aa:00:00:00:10"),
      ...macBytes("02:11:00:00:00:01"),
      0x81, 0x00,
      0xa0, 0x0a,
      0x08, 0x00
    ];
    return {
      header,
      fields: [
        field("MAC đích", 0, 6, "48 bit", "02:AA:00:00:00:10", "MAC đích trong VLAN."),
        field("MAC nguồn", 6, 6, "48 bit", "02:11:00:00:00:01", "MAC gateway/router."),
        field("TPID", 12, 2, "16 bit", "0x8100 · 802.1Q", "Tag Protocol Identifier báo frame có VLAN tag."),
        field("PCP", 14, 1, "3 bit", "5 · Voice", "Priority Code Point: 0 best effort, 5 voice, 6 network control."),
        field("DEI", 14, 1, "1 bit", "0", "Drop Eligible Indicator: gói có thể bị bỏ trước khi tắc nghẽn."),
        field("VLAN ID", 14, 2, "12 bit", "10", "ID miền quảng bá logic. 0 và 4095 dành riêng."),
        field("EtherType trong", 16, 2, "16 bit", "0x0800 · IPv4", "EtherType của payload bên trong tag.")
      ]
    };
  }

  /* ------------------------------------------------------------------
     Assemble a frame from layers inner → outer
     ------------------------------------------------------------------ */
  function makeScenario(cfg) {
    const chain = cfg.chain;
    const headers = chain.map((layer) => layer.header || []);
    const dataLayer = chain[0];
    const data = dataLayer.payload || [];
    const headerSum = headers.reduce((sum, header) => sum + header.length, 0);
    const fcsLen = cfg.fcs ? 4 : 0;
    let padLen = 0;
    if (cfg.minFrame) {
      padLen = Math.max(0, cfg.minFrame - (headerSum + data.length + fcsLen));
    }
    const frame = [];
    for (let i = chain.length - 1; i >= 0; i -= 1) frame.push(...headers[i]);
    frame.push(...data);
    const padStart = frame.length;
    if (padLen) frame.push(...zeros(padLen));
    const fcsStart = frame.length;
    if (cfg.fcs) frame.push(...u32le(crc32(frame)));

    const starts = {};
    let cursor = 0;
    for (let i = chain.length - 1; i >= 0; i -= 1) {
      starts[chain[i].id] = cursor;
      cursor += headers[i].length;
    }
    const payloadStart = cursor;
    const prefix = new Array(chain.length);
    let running = 0;
    for (let i = 0; i < chain.length; i += 1) {
      running += headers[i].length;
      prefix[i] = running;
    }

    const layers = chain.map((spec, index) => {
      const base = starts[spec.id];
      const fields = (spec.fields || []).map((item, fieldIndex) => Object.assign({}, item, {
        key: `${spec.id}:${fieldIndex}`,
        layerId: spec.id,
        start: base + item.off
      }));
      const totalLen = prefix[index] + data.length + (index === chain.length - 1 ? padLen + fcsLen : 0);
      return {
        id: spec.id,
        name: spec.name,
        short: spec.short || spec.name,
        osi: spec.osi,
        tone: spec.tone || "blue",
        note: spec.note || "",
        headerLen: headers[index].length,
        totalLen,
        start: base,
        fields,
        inStack: spec.inStack !== false
      };
    });

    if (padLen) {
      const outer = layers[layers.length - 1];
      outer.fields.push({
        name: "Padding",
        off: padStart - outer.start,
        len: padLen,
        bits: `${padLen * 8} bit`,
        value: `${padLen} byte 0x00`,
        note: "Đệm để frame Ethernet đạt kích thước tối thiểu 64 byte (không tính preamble).",
        key: `${outer.id}:pad`,
        layerId: outer.id,
        start: padStart
      });
    }
    if (fcsLen) {
      const outer = layers[layers.length - 1];
      outer.fields.push({
        name: "FCS",
        off: fcsStart - outer.start,
        len: 4,
        bits: "32 bit",
        value: `0x${frame.slice(fcsStart).map(hex2).join("")}`,
        note: "Frame Check Sequence: CRC32 kiểm tra lỗi bit trên toàn frame. Được tính thật trong mô hình này.",
        key: `${outer.id}:fcs`,
        layerId: outer.id,
        start: fcsStart
      });
    }

    const segments = [];
    chain.forEach((spec, index) => {
      if (headers[index].length) {
        segments.push({ layerId: spec.id, kind: "header", start: starts[spec.id], len: headers[index].length });
      }
    });
    if (data.length) segments.push({ layerId: dataLayer.id, kind: "payload", start: payloadStart, len: data.length });
    if (padLen) segments.push({ layerId: chain[chain.length - 1].id, kind: "pad", start: padStart, len: padLen });
    if (fcsLen) segments.push({ layerId: chain[chain.length - 1].id, kind: "trailer", start: fcsStart, len: fcsLen });
    segments.sort((a, b) => a.start - b.start);

    const stack = layers.filter((layer) => layer.inStack).map((layer) => layer.id);
    const layerById = {};
    layers.forEach((layer) => { layerById[layer.id] = layer; });

    return {
      id: cfg.id,
      title: cfg.title,
      subtitle: cfg.subtitle,
      group: cfg.group || "Cơ bản",
      description: cfg.description,
      path: cfg.path,
      tags: cfg.tags || [],
      notes: cfg.notes || [],
      frame,
      segments,
      layers,
      layerById,
      stack,
      totalBytes: frame.length,
      headerBytes: headerSum,
      padBytes: padLen,
      fcsBytes: fcsLen
    };
  }

  /* ------------------------------------------------------------------
     Scenarios
     ------------------------------------------------------------------ */
  const scenarios = [];

  // 1. HTTP/1.1 over TCP/IPv4/Ethernet
  {
    const http = httpRequest();
    const tcp = tcpHeader({
      sport: 49152, dport: 80, seq: 1000, ack: 1, flags: 0x18, window: 64240,
      payloadLength: http.bytes.length, payload: http.bytes,
      version: 4, src: "192.168.1.10", dst: "93.184.216.34"
    });
    const ip = ipv4Header({
      payloadLength: tcp.segmentLength, protocol: 6, protocolLabel: "TCP",
      src: "192.168.1.10", dst: "93.184.216.34", id: 0x1c46
    });
    const eth = {
      header: [...macBytes("02:11:00:00:00:01"), ...macBytes("02:aa:00:00:00:10"), 0x08, 0x00],
      fields: macFields("02:11:00:00:00:01", "02:aa:00:00:00:10", 0x0800, "IPv4")
    };
    scenarios.push(makeScenario({
      id: "http",
      title: "HTTP GET trên TCP/IPv4",
      subtitle: "Web request đầy đủ 4 lớp",
      group: "Web",
      path: "HTTP › TCP › IPv4 › Ethernet",
      description: "Một request HTTP/1.1 thật đi qua stack TCP/IP: dòng request, các header, TCP segment, IPv4 datagram rồi đóng vào Ethernet frame. Đây là cấu trúc bạn thấy khi bắt gói bằng Wireshark trên máy client.",
      tags: ["L7", "TCP", "IPv4", "Ethernet", "checksum"],
      notes: [
        "HTTP không có header nhị phân cố định: phần “header” là văn bản ASCII kết thúc bằng một dòng trống CRLF.",
        "TCP checksum được tính trên pseudo-header IP + TCP header + payload, nên nó phụ thuộc cả địa chỉ IP.",
        "Ethernet FCS chỉ kiểm tra lỗi trên đường truyền; nếu FCS sai, frame bị bỏ trước khi tới IP."
      ],
      minFrame: 64,
      fcs: true,
      chain: [
        {
          id: "http", name: "HTTP/1.1 request", short: "HTTP", osi: "L7", tone: "violet",
          note: "Thông điệp ứng dụng: request line + header + CRLF. Chưa có địa chỉ, chưa có port.",
          payload: http.bytes, fields: http.fields
        },
        {
          id: "tcp", name: "TCP segment", short: "TCP", osi: "L4", tone: "blue",
          note: "TCP chia dữ liệu thành segment, thêm port, sequence/ack, cờ và checksum để truyền tin cậy.",
          header: tcp.header, fields: tcp.fields
        },
        {
          id: "ipv4", name: "IPv4 datagram", short: "IPv4", osi: "L3", tone: "green",
          note: "IPv4 thêm địa chỉ logic nguồn/đích, TTL và checksum header để router chuyển tiếp.",
          header: ip.header, fields: ip.fields
        },
        {
          id: "eth", name: "Ethernet II frame", short: "Ethernet", osi: "L2", tone: "coral",
          note: "Ethernet thêm MAC nguồn/đích và EtherType, rồi FCS ở cuối frame.",
          header: eth.header, fields: eth.fields
        }
      ]
    }));
  }

  // 2. DNS query over UDP/IPv4/Ethernet
  {
    const dns = dnsQueryHeader({ id: 0x7a3f });
    const udp = udpHeader({
      sport: 53000, dport: 53, service: "DNS", payloadLength: dns.header.length, payload: dns.header,
      version: 4, src: "192.168.1.10", dst: "8.8.8.8"
    });
    const ip = ipv4Header({
      payloadLength: udp.header.length + dns.header.length, protocol: 17, protocolLabel: "UDP",
      src: "192.168.1.10", dst: "8.8.8.8", id: 0x2b17, ttl: 64
    });
    const eth = {
      header: [...macBytes("02:11:00:00:00:01"), ...macBytes("02:aa:00:00:00:10"), 0x08, 0x00],
      fields: macFields("02:11:00:00:00:01", "02:aa:00:00:00:10", 0x0800, "IPv4")
    };
    scenarios.push(makeScenario({
      id: "dns-udp",
      title: "DNS query trên UDP/IPv4",
      subtitle: "Phân giải www.example.com",
      group: "Tên miền",
      path: "DNS › UDP › IPv4 › Ethernet",
      description: "Máy client hỏi DNS resolver công cộng 8.8.8.8 “www.example.com là IP nào?”. DNS dùng UDP vì query nhỏ, cần nhanh và tự retry nếu mất gói.",
      tags: ["DNS", "UDP", "L7", "port 53"],
      notes: [
        "QNAME không phải chuỗi có dấu chấm: mỗi label được viết thành 1 byte độ dài + ký tự, kết thúc bằng 0.",
        "UDP chỉ có 8 byte header, không có sequence, không bảo đảm thứ tự hay truyền lại.",
        "DNS response có cùng Transaction ID; nếu ID không khớp, client bỏ qua để chống giả mạo."
      ],
      minFrame: 64,
      fcs: true,
      chain: [
        {
          id: "dns", name: "DNS query", short: "DNS", osi: "L7", tone: "violet",
          note: "DNS message: header 12 byte, question QNAME/QTYPE/QCLASS. Không có checksum riêng — UDP lo phần đó.",
          payload: dns.header, fields: dns.fields
        },
        {
          id: "udp", name: "UDP datagram", short: "UDP", osi: "L4", tone: "blue",
          note: "UDP chỉ thêm 4 trường: port nguồn, port đích, length, checksum. Gửi đi không chờ xác nhận.",
          header: udp.header, fields: udp.fields
        },
        {
          id: "ipv4", name: "IPv4 datagram", short: "IPv4", osi: "L3", tone: "green",
          note: "IPv4 chịu trách nhiệm định tuyến tới 8.8.8.8. TTL 64 đủ cho vài chục hop.",
          header: ip.header, fields: ip.fields
        },
        {
          id: "eth", name: "Ethernet II frame", short: "Ethernet", osi: "L2", tone: "coral",
          note: "MAC đích là gateway 02:11:..., không phải MAC của 8.8.8.8. Đây là next-hop L2, không phải đích cuối.",
          header: eth.header, fields: eth.fields
        }
      ]
    }));
  }

  // 3. ARP request
  {
    const arp = arpHeader({
      senderMac: "02:aa:00:00:00:10",
      senderIp: "192.168.1.10",
      targetIp: "192.168.1.1"
    });
    const eth = {
      header: [...macBytes("ff:ff:ff:ff:ff:ff"), ...macBytes("02:aa:00:00:00:10"), 0x08, 0x06],
      fields: macFields("ff:ff:ff:ff:ff:ff", "02:aa:00:00:00:10", 0x0806, "ARP")
    };
    scenarios.push(makeScenario({
      id: "arp",
      title: "ARP request (broadcast)",
      subtitle: "“Ai có 192.168.1.1?”",
      group: "Địa chỉ L2",
      path: "ARP › Ethernet",
      description: "Máy 192.168.1.10 cần gửi IP tới gateway nhưng chưa biết MAC. Nó broadcast ARP request tới FF:FF:FF:FF:FF:FF. Không có IP header, không có TCP/UDP.",
      tags: ["ARP", "broadcast", "L2/L3", "padding"],
      notes: [
        "ARP là giao thức “lai”: nội dung mang thông tin L3 nhưng được đóng trực tiếp trong Ethernet, không nằm trong IPv4.",
        "Target MAC trong request là 00:00:00:00:00:00 vì đó chính là thứ cần tìm.",
        "Frame ARP chỉ 46 byte (14 + 28 + 4 FCS), thiếu 18 byte so với mức tối thiểu 64 nên phải padding."
      ],
      minFrame: 64,
      fcs: true,
      chain: [
        {
          id: "arp", name: "ARP message", short: "ARP", osi: "L2.5", tone: "yellow",
          note: "ARP ánh xạ IPv4 ↔ MAC trong cùng miền quảng bá. Request opcode=1, reply opcode=2.",
          header: arp.header, fields: arp.fields
        },
        {
          id: "eth-arp", name: "Ethernet broadcast", short: "Ethernet", osi: "L2", tone: "coral",
          note: "MAC đích là broadcast, nên mọi thiết bị trong VLAN đều nhận frame; chỉ máy có IP 192.168.1.1 trả lời.",
          header: eth.header, fields: eth.fields
        }
      ]
    }));
  }

  // 4. ICMP echo
  {
    const text = "NetLab-ICMP-echo-payload-0123456789";
    const echo = ascii(text).slice(0, 32);
    while (echo.length < 32) echo.push(0x2e);
    const icmp = icmpEchoHeader({ id: 0x1234, seq: 1, payload: echo });
    icmp.fields.push(field("Dữ liệu Echo", 8, echo.length, `${echo.length * 8} bit`, "NetLab-ICMP-echo-payload-…", "Payload tùy ý. Ping thường ghi timestamp vào đây để tính RTT."));
    const ip = ipv4Header({
      payloadLength: icmp.header.length + echo.length, protocol: 1, protocolLabel: "ICMP",
      src: "192.168.1.10", dst: "1.1.1.1", id: 0x3d08, ttl: 64
    });
    const eth = {
      header: [...macBytes("02:11:00:00:00:01"), ...macBytes("02:aa:00:00:00:10"), 0x08, 0x00],
      fields: macFields("02:11:00:00:00:01", "02:aa:00:00:00:10", 0x0800, "IPv4")
    };
    scenarios.push(makeScenario({
      id: "icmp",
      title: "ICMP Echo Request",
      subtitle: "Gói ping 32 byte dữ liệu",
      group: "Chẩn đoán",
      path: "ICMP › IPv4 › Ethernet",
      description: "Ping gửi ICMP Echo Request type 8. Đích trả Echo Reply type 0 với cùng Identifier và Sequence. ICMP không có port, nằm trực tiếp trong IP protocol 1.",
      tags: ["ICMP", "ping", "RTT"],
      notes: [
        "ICMP checksum phủ toàn bộ ICMP message (header + payload), khác IPv4 checksum chỉ phủ header.",
        "Identifier ghép request với reply; Sequence giúp phát hiện mất gói và đo RTT.",
        "Traceroute lợi dụng TTL: gửi TTL=1,2,3… và nhận ICMP Time Exceeded từ từng router."
      ],
      minFrame: 64,
      fcs: true,
      chain: [
        {
          id: "echo", name: "Echo data", short: "Data", osi: "—", tone: "mint", inStack: false,
          note: "Dữ liệu thử nghiệm trong ICMP message.", payload: echo, fields: []
        },
        {
          id: "icmp", name: "ICMP Echo", short: "ICMP", osi: "L3", tone: "yellow",
          note: "ICMP là giao thức điều khiển của IP, không phải giao thức vận chuyển. Nó không có port.",
          header: icmp.header, fields: icmp.fields
        },
        {
          id: "ipv4-icmp", name: "IPv4 datagram", short: "IPv4", osi: "L3", tone: "green",
          note: "Protocol=1 báo payload là ICMP. IPv4 header có checksum riêng.",
          header: ip.header, fields: ip.fields
        },
        {
          id: "eth-icmp", name: "Ethernet II frame", short: "Ethernet", osi: "L2", tone: "coral",
          note: "Ethernet chỉ quan tâm next-hop MAC; nó không biết bên trong là ping.",
          header: eth.header, fields: eth.fields
        }
      ]
    }));
  }

  // 5. TCP SYN with MSS option
  {
    const tcp = tcpHeader({
      sport: 51000, dport: 443, seq: 0, ack: 0, flags: 0x02, window: 65535,
      payloadLength: 0, payload: [], version: 4, src: "192.168.1.10", dst: "93.184.216.34",
      options: [2, 4, 0x05, 0xb4],
      optionText: "MSS = 1460 byte",
      optionNote: "Maximum Segment Size: client báo segment TCP lớn nhất mình nhận được. Option 4 byte gồm kind=2, length=4, MSS=1460."
    });
    const ip = ipv4Header({
      payloadLength: tcp.segmentLength, protocol: 6, protocolLabel: "TCP",
      src: "192.168.1.10", dst: "93.184.216.34", id: 0x51a2
    });
    const eth = {
      header: [...macBytes("02:11:00:00:00:01"), ...macBytes("02:aa:00:00:00:10"), 0x08, 0x00],
      fields: macFields("02:11:00:00:00:01", "02:aa:00:00:00:10", 0x0800, "IPv4")
    };
    scenarios.push(makeScenario({
      id: "tcp-syn",
      title: "TCP SYN mở kết nối",
      subtitle: "Bắt tay ba bước, bước 1",
      group: "Kết nối",
      path: "TCP › IPv4 › Ethernet",
      description: "Client gửi SYN, seq=0, kèm option MSS=1460. Server trả SYN-ACK, client trả ACK. Gói SYN không có payload nhưng vẫn mang đầy đủ header TCP 24 byte vì có option.",
      tags: ["TCP", "SYN", "MSS", "3-way handshake"],
      notes: [
        "Cờ SYN chiếm 1 bit trong trường Flags 8 bit; cùng byte còn ACK, FIN, RST, PSH, URG, ECE, CWR.",
        "Data offset = 6 vì header dài 24 byte (20 byte cơ bản + option MSS 4 byte).",
        "Window 65535 quảng cáo khả năng nhận; TCP thực tế còn scaling option để vượt 65535."
      ],
      minFrame: 64,
      fcs: true,
      chain: [
        {
          id: "empty-syn", name: "Không có payload", short: "—", osi: "—", tone: "mint", inStack: false,
          note: "SYN không mang dữ liệu ứng dụng.", payload: [], fields: []
        },
        {
          id: "tcp-syn-layer", name: "TCP SYN segment", short: "TCP", osi: "L4", tone: "blue",
          note: "SYN đánh số thứ tự khởi tạo (ISN). Option MSS thương lượng kích thước segment.",
          header: tcp.header, fields: tcp.fields
        },
        {
          id: "ipv4-syn", name: "IPv4 datagram", short: "IPv4", osi: "L3", tone: "green",
          note: "IPv4 vận chuyển TCP segment. TTL 64, protocol 6.",
          header: ip.header, fields: ip.fields
        },
        {
          id: "eth-syn", name: "Ethernet II frame", short: "Ethernet", osi: "L2", tone: "coral",
          note: "Frame TCP SYN rất nhỏ nên Ethernet phải padding 2 byte để đủ 64 byte.",
          header: eth.header, fields: eth.fields
        }
      ]
    }));
  }

  // 6. HTTP over TCP/IPv6/Ethernet
  {
    const http = httpRequest();
    const src6 = "2001:db8:1::10";
    const dst6 = "2606:2800:220:1:248:1893:25c8:1946";
    const tcp = tcpHeader({
      sport: 49153, dport: 80, seq: 3000, ack: 900, flags: 0x18, window: 64240,
      payloadLength: http.bytes.length, payload: http.bytes,
      version: 6, src: src6, dst: dst6
    });
    const ip = ipv6Header({
      payloadLength: tcp.segmentLength, nextHeader: 6, nextHeaderLabel: "TCP",
      src: src6, dst: dst6, hopLimit: 64
    });
    const eth = {
      header: [...macBytes("02:11:00:00:00:01"), ...macBytes("02:aa:00:00:00:10"), 0x86, 0xdd],
      fields: macFields("02:11:00:00:00:01", "02:aa:00:00:00:10", 0x86dd, "IPv6")
    };
    scenarios.push(makeScenario({
      id: "ipv6-http",
      title: "HTTP trên TCP/IPv6",
      subtitle: "Header IPv6 40 byte, không checksum",
      group: "IPv6",
      path: "HTTP › TCP › IPv6 › Ethernet",
      description: "Cùng một HTTP request nhưng chạy trên IPv6. Header IPv6 cố định 40 byte, không có checksum, địa chỉ 128 bit và trường Next Header thay cho Protocol.",
      tags: ["IPv6", "TCP", "HTTP", "128-bit"],
      notes: [
        "IPv6 bỏ checksum header vì L2/L4 đã có kiểm tra; router không phải tính lại mỗi hop.",
        "Không còn IHL, Flags, Fragment offset trong header cơ bản; phân mảnh chuyển sang extension header.",
        "EtherType 0x86DD báo cho NIC biết payload là IPv6, không phải 0x0800."
      ],
      minFrame: 64,
      fcs: true,
      chain: [
        {
          id: "http6", name: "HTTP/1.1 request", short: "HTTP", osi: "L7", tone: "violet",
          note: "Nội dung HTTP không đổi khi chuyển từ IPv4 sang IPv6.",
          payload: http.bytes, fields: http.fields
        },
        {
          id: "tcp6", name: "TCP segment", short: "TCP", osi: "L4", tone: "blue",
          note: "TCP checksum dùng pseudo-header IPv6 16+16 byte địa chỉ, nên bắt buộc phải tính.",
          header: tcp.header, fields: tcp.fields
        },
        {
          id: "ipv6", name: "IPv6 datagram", short: "IPv6", osi: "L3", tone: "green",
          note: "Header 40 byte cố định. Địa chỉ nguồn/đích chiếm 32 byte — một nửa header.",
          header: ip.header, fields: ip.fields
        },
        {
          id: "eth6", name: "Ethernet II frame", short: "Ethernet", osi: "L2", tone: "coral",
          note: "MAC vẫn 48 bit; EtherType đổi thành 0x86DD.",
          header: eth.header, fields: eth.fields
        }
      ]
    }));
  }

  // 7. DNS over VLAN-tagged Ethernet
  {
    const dns = dnsQueryHeader({ id: 0x44c1 });
    const udp = udpHeader({
      sport: 53001, dport: 53, service: "DNS", payloadLength: dns.header.length, payload: dns.header,
      version: 4, src: "10.10.10.20", dst: "10.10.10.53"
    });
    const ip = ipv4Header({
      payloadLength: udp.header.length + dns.header.length, protocol: 17, protocolLabel: "UDP",
      src: "10.10.10.20", dst: "10.10.10.53", id: 0x77c2
    });
    const vlan = vlanEthHeader();
    scenarios.push(makeScenario({
      id: "vlan-dns",
      title: "DNS trong VLAN 10",
      subtitle: "802.1Q chèn thêm 4 byte",
      group: "VLAN",
      path: "DNS › UDP › IPv4 › 802.1Q › Ethernet",
      description: "Một DNS query trong VLAN 10. Switch chèn tag 802.1Q 4 byte vào giữa MAC nguồn và EtherType gốc, tạo thành “Q-in-Q” ở mức khái niệm: Ethernet bên ngoài, tag, rồi IPv4.",
      tags: ["VLAN", "802.1Q", "DNS", "trunk"],
      notes: [
        "Tag 802.1Q dài 4 byte: TPID 0x8100 + TCI chứa PCP 3 bit, DEI 1 bit, VID 12 bit.",
        "VLAN ID 10 giới hạn miền quảng bá; broadcast ARP của VLAN 10 không sang VLAN 20.",
        "Frame trunk vẫn giữ MAC đích/nguồn; tag chỉ là metadata chèn thêm, không thay đổi IP."
      ],
      minFrame: 64,
      fcs: true,
      chain: [
        {
          id: "dns-vlan", name: "DNS query", short: "DNS", osi: "L7", tone: "violet",
          note: "DNS query giống hệt trường hợp không VLAN; VLAN chỉ là lớp đóng gói bên dưới.",
          payload: dns.header, fields: dns.fields
        },
        {
          id: "udp-vlan", name: "UDP datagram", short: "UDP", osi: "L4", tone: "blue",
          note: "UDP port 53. Không biết gì về VLAN.",
          header: udp.header, fields: udp.fields
        },
        {
          id: "ipv4-vlan", name: "IPv4 datagram", short: "IPv4", osi: "L3", tone: "green",
          note: "IPv4 trong subnet 10.10.10.0/24 của VLAN 10.",
          header: ip.header, fields: ip.fields
        },
        {
          id: "vlan", name: "Ethernet 802.1Q", short: "802.1Q", osi: "L2", tone: "coral",
          note: "Tag 4 byte nằm giữa MAC nguồn và EtherType. PCP=5 ưu tiên voice, VLAN ID=10.",
          header: vlan.header, fields: vlan.fields
        }
      ]
    }));
  }

  // 8. TLS application data
  {
    const cipher = Array.from({ length: 64 }, (_, i) => (i * 37 + 11) & 255);
    const tls = tlsRecord(cipher);
    const tcp = tcpHeader({
      sport: 49154, dport: 443, seq: 5000, ack: 1200, flags: 0x18, window: 64240,
      payloadLength: tls.header.length + cipher.length, payload: tls.header.concat(cipher),
      version: 4, src: "192.168.1.10", dst: "151.101.1.140"
    });
    const ip = ipv4Header({
      payloadLength: tcp.segmentLength, protocol: 6, protocolLabel: "TCP",
      src: "192.168.1.10", dst: "151.101.1.140", id: 0x6d10
    });
    const eth = {
      header: [...macBytes("02:11:00:00:00:01"), ...macBytes("02:aa:00:00:00:10"), 0x08, 0x00],
      fields: macFields("02:11:00:00:00:01", "02:aa:00:00:00:10", 0x0800, "IPv4")
    };
    scenarios.push(makeScenario({
      id: "tls",
      title: "TLS 1.3 Application Data",
      subtitle: "HTTP bên trong đã bị mã hóa",
      group: "Bảo mật",
      path: "TLS › TCP › IPv4 › Ethernet",
      description: "Một record TLS application_data. Sau handshake, toàn bộ HTTP (request/response) nằm trong ciphertext. Người bắt gói chỉ thấy content type, version, length — không thấy URL hay cookie.",
      tags: ["TLS", "HTTPS", "mã hóa", "record"],
      notes: [
        "TLS là lớp phiên giữa HTTP và TCP, không phải lớp 4 hay lớp 7 thuần túy; trong mô hình OSI thường xếp chồng L5–L6.",
        "Length 64 chỉ là độ dài ciphertext của record này; một HTTP response lớn bị chia thành nhiều record.",
        "Record ngoài ghi version 0x0303 để tương thích thiết bị cũ; TLS 1.3 thật sự thương lượng trong ClientHello/ServerHello."
      ],
      minFrame: 64,
      fcs: true,
      chain: [
        {
          id: "tls-cipher", name: "Ciphertext (HTTP)", short: "Encrypted", osi: "L7", tone: "mint", inStack: false,
          note: "Nội dung thật đã mã hóa; không thể đọc nếu không có key phiên.",
          payload: cipher, fields: []
        },
        {
          id: "tls", name: "TLS record", short: "TLS", osi: "L5–6", tone: "violet",
          note: "Record header 5 byte bọc ciphertext. AEAD còn thêm tag xác thực (trong ciphertext ở đây).",
          header: tls.header, fields: tls.fields
        },
        {
          id: "tcp-tls", name: "TCP segment", short: "TCP", osi: "L4", tone: "blue",
          note: "TCP chỉ thấy một dãy byte mã hóa; nó không biết bên trong là HTTP.",
          header: tcp.header, fields: tcp.fields
        },
        {
          id: "ipv4-tls", name: "IPv4 datagram", short: "IPv4", osi: "L3", tone: "green",
          note: "IP chỉ định tuyến tới server HTTPS ở port 443.",
          header: ip.header, fields: ip.fields
        },
        {
          id: "eth-tls", name: "Ethernet II frame", short: "Ethernet", osi: "L2", tone: "coral",
          note: "L2 chỉ thấy frame tới gateway; TLS không bảo vệ địa chỉ MAC hay IP header.",
          header: eth.header, fields: eth.fields
        }
      ]
    }));
  }

  // 9. QUIC / HTTP3
  {
    const cipher = Array.from({ length: 48 }, (_, i) => (i * 53 + 23) & 255);
    const dcid = [0x83, 0x94, 0xc8, 0xf0, 0x3e, 0x51, 0x57, 0x08];
    const scid = [0x11, 0x22, 0x33, 0x44];
    const quicCore = [
      0xc0, ...u32(1),
      dcid.length, ...dcid,
      scid.length, ...scid,
      0x00,
      0x40, 0x34,
      ...u32(1)
    ];
    const udp = udpHeader({
      sport: 53002, dport: 443, service: "QUIC", payloadLength: quicCore.length + cipher.length,
      payload: quicCore.concat(cipher), version: 4,
      src: "192.168.1.10", dst: "142.250.66.46"
    });
    const header = udp.header.concat(quicCore);
    const fields = udp.fields.concat([
      field("QUIC First Byte", 8, 1, "8 bit", "0xC0 · Long header", "Bit 7=1 là long header, bit 6=1 là fixed bit; các bit còn lại là packet type."),
      field("Version", 9, 4, "32 bit", "0x00000001 · QUIC v1", "Phiên bản giao thức QUIC."),
      field("DCID Length", 13, 1, "8 bit", "8", "Độ dài Destination Connection ID."),
      field("Destination CID", 14, 8, "64 bit", "83 94 C8 F0 3E 51 57 08", "ID kết nối phía nhận, giúp server định tuyến không cần đọc IP/port."),
      field("SCID Length", 22, 1, "8 bit", "4", "Độ dài Source Connection ID."),
      field("Source CID", 23, 4, "32 bit", "11 22 33 44", "ID kết nối phía gửi."),
      field("Token Length", 27, 1, "8 bit", "0", "Token dùng cho retry/address validation; 0 nghĩa là không có."),
      field("Length", 28, 2, "16 bit", "52 byte", "Độ dài phần packet number + payload được bảo vệ."),
      field("Packet Number", 30, 4, "32 bit", "1", "Số thứ tự gói QUIC. Được mã hóa cùng payload."),
      field("Protected payload", 34, cipher.length, `${cipher.length * 8} bit`, "Ciphertext · HTTP/3", "HTTP/3 và TLS 1.3 nằm bên trong; giao diện chỉ thấy ciphertext.")
    ]);
    const ip = ipv4Header({
      payloadLength: udp.header.length + quicCore.length + cipher.length,
      protocol: 17, protocolLabel: "UDP",
      src: "192.168.1.10", dst: "142.250.66.46", id: 0x0f6e
    });
    const eth = {
      header: [...macBytes("02:11:00:00:00:01"), ...macBytes("02:aa:00:00:00:10"), 0x08, 0x00],
      fields: macFields("02:11:00:00:00:01", "02:aa:00:00:00:10", 0x0800, "IPv4")
    };
    scenarios.push(makeScenario({
      id: "quic",
      title: "QUIC / HTTP/3 trên UDP",
      subtitle: "TLS tích hợp trong transport",
      group: "Web nhanh",
      path: "QUIC (HTTP/3 + TLS) › UDP › IPv4 › Ethernet",
      description: "HTTP/3 không chạy trên TCP. QUIC gộp transport + TLS 1.3 + stream vào một giao thức trên UDP. Header QUIC có Connection ID để giữ phiên khi IP thay đổi (ví dụ chuyển Wi-Fi sang 4G).",
      tags: ["QUIC", "HTTP/3", "UDP", "TLS 1.3"],
      notes: [
        "QUIC tránh HOL blocking của TCP vì mỗi stream có thứ tự riêng; mất một gói không chặn mọi stream.",
        "Connection ID cho phép connection migration: đổi IP/port mà không phải bắt tay lại.",
        "UDP header chỉ 8 byte nhưng QUIC tự bù reliability, congestion control và mã hóa ở tầng trên."
      ],
      minFrame: 64,
      fcs: true,
      chain: [
        {
          id: "quic-cipher", name: "HTTP/3 + TLS ciphertext", short: "Encrypted", osi: "L7", tone: "mint", inStack: false,
          note: "Dữ liệu HTTP/3 đã được TLS 1.3 bảo vệ.",
          payload: cipher, fields: []
        },
        {
          id: "quic", name: "QUIC packet", short: "QUIC", osi: "L4–5", tone: "violet",
          note: "QUIC packet gồm UDP header 8 byte + long header + packet number + ciphertext. TLS nằm trong QUIC, không nằm trên TCP.",
          header, fields
        },
        {
          id: "ipv4-quic", name: "IPv4 datagram", short: "IPv4", osi: "L3", tone: "green",
          note: "IPv4 chỉ biết protocol UDP 17. Nó không phân biệt DNS với QUIC.",
          header: ip.header, fields: ip.fields
        },
        {
          id: "eth-quic", name: "Ethernet II frame", short: "Ethernet", osi: "L2", tone: "coral",
          note: "Frame Ethernet bình thường; QUIC không thay đổi L2.",
          header: eth.header, fields: eth.fields
        }
      ]
    }));
  }

  // 10. Wi-Fi 802.11 + LLC/SNAP
  {
    const dns = dnsQueryHeader({ id: 0x18e2 });
    const udp = udpHeader({
      sport: 53003, dport: 53, service: "DNS", payloadLength: dns.header.length, payload: dns.header,
      version: 4, src: "192.168.1.44", dst: "192.168.1.1"
    });
    const ip = ipv4Header({
      payloadLength: udp.header.length + dns.header.length, protocol: 17, protocolLabel: "UDP",
      src: "192.168.1.44", dst: "192.168.1.1", id: 0x6a90
    });
    const wifi = wifiHeader();
    scenarios.push(makeScenario({
      id: "wifi",
      title: "DNS query qua Wi-Fi 802.11",
      subtitle: "Không có Ethernet header",
      group: "Không dây",
      path: "DNS › UDP › IPv4 › 802.11 + LLC/SNAP",
      description: "Laptop gửi DNS query qua Wi-Fi. Không có MAC Ethernet 14 byte; thay vào đó là 802.11 MAC header 24 byte + LLC/SNAP 8 byte để mang EtherType 0x0800. Cuối frame vẫn có FCS.",
      tags: ["Wi-Fi", "802.11", "LLC/SNAP", "CSMA/CA"],
      notes: [
        "802.11 dùng 3 địa chỉ MAC trong frame data: đích, nguồn, BSSID/Addr3 — vì frame có thể đi qua AP.",
        "LLC/SNAP 8 byte đóng vai trò “EtherType adapter” để IP không cần biết mình đang chạy trên Wi-Fi.",
        "Wi-Fi dùng CSMA/CA và ACK ở L2; FCS sai thì frame bị bỏ và có thể phải truyền lại."
      ],
      fcs: true,
      chain: [
        {
          id: "dns-wifi", name: "DNS query", short: "DNS", osi: "L7", tone: "violet",
          note: "DNS query giống hệt bản Ethernet; Wi-Fi chỉ thay lớp link.",
          payload: dns.header, fields: dns.fields
        },
        {
          id: "udp-wifi", name: "UDP datagram", short: "UDP", osi: "L4", tone: "blue",
          note: "UDP port 53, checksum có pseudo-header IPv4.",
          header: udp.header, fields: udp.fields
        },
        {
          id: "ipv4-wifi", name: "IPv4 datagram", short: "IPv4", osi: "L3", tone: "green",
          note: "IPv4 gửi tới gateway trong cùng subnet Wi-Fi.",
          header: ip.header, fields: ip.fields
        },
        {
          id: "wifi", name: "802.11 data frame", short: "802.11", osi: "L2", tone: "coral",
          note: "MAC header 24 byte + LLC/SNAP 8 byte. ToDS=1 vì frame đi từ client lên AP.",
          header: wifi.header, fields: wifi.fields
        }
      ]
    }));
  }

  SL.packets = {
    scenarios,
    byId: scenarios.reduce((map, item) => { map[item.id] = item; return map; }, {})
  };

  /* ------------------------------------------------------------------
     UI
     ------------------------------------------------------------------ */
  const UI = {
    root: null,
    scenarioId: null,
    layerId: null,
    fieldKey: null,
    reveal: null,
    playing: false,
    timer: null
  };

  const toneVar = (tone) => TONE_VAR[tone] || "var(--blue)";
  const rangeText = (item) => item.len === 1
    ? `byte ${item.start}`
    : `byte ${item.start}–${item.start + item.len - 1}`;

  function stop() {
    if (UI.timer) {
      clearInterval(UI.timer);
      UI.timer = null;
    }
    UI.playing = false;
  }

  function findField(scenario, key) {
    for (const layer of scenario.layers) {
      const found = layer.fields.find((item) => item.key === key);
      if (found) return found;
    }
    return null;
  }

  function currentScenario() {
    return SL.packets.byId[UI.scenarioId] || SL.packets.scenarios[0];
  }

  function layerIndex(scenario, id) {
    return scenario.stack.indexOf(id);
  }

  function isLayerVisible(scenario, id) {
    const index = layerIndex(scenario, id);
    return index < 0 ? true : index < UI.reveal;
  }

  function syncHash() {
    try {
      history.replaceState(null, "", `#/packet/${UI.scenarioId}`);
    } catch (err) {
      /* ignore */
    }
  }

  function fieldAtByte(scenario, offset) {
    for (const layer of scenario.layers) {
      for (const item of layer.fields) {
        if (offset >= item.start && offset < item.start + item.len) return item;
      }
    }
    return null;
  }

  function layerAtByte(scenario, offset) {
    const segment = scenario.segments.find((item) => offset >= item.start && offset < item.start + item.len);
    return segment ? segment.layerId : scenario.layers[0].id;
  }

  function stackCard(scenario, id, index) {
    const layer = scenario.layerById[id];
    const future = index >= UI.reveal;
    const active = UI.layerId === id;
    const size = layer.headerLen
      ? `${layer.headerLen} B header`
      : `${layer.totalLen} B dữ liệu`;
    return `
      <button class="pkt-chain-card${future ? " is-future" : ""}${active ? " is-active" : ""}"
        data-pkt-layer="${layer.id}" style="--tone:${toneVar(layer.tone)}" title="${esc(layer.note)}">
        <span class="pkt-chain-osi">${esc(layer.osi)}</span>
        <span class="pkt-chain-name">${esc(layer.name)}</span>
        <span class="pkt-chain-size">${size}</span>
        <span class="pkt-chain-total">PDU ${layer.totalLen} B</span>
      </button>`;
  }

  function renderChain(scenario) {
    const cards = [];
    scenario.stack.forEach((id, index) => {
      if (index) cards.push('<span class="pkt-chain-plus" aria-hidden="true">+</span>');
      cards.push(stackCard(scenario, id, index));
    });
    return cards.join("");
  }

  function renderMap(scenario) {
    return scenario.segments.map((segment) => {
      const layer = scenario.layerById[segment.layerId];
      const visible = isLayerVisible(scenario, segment.layerId);
      const active = UI.layerId === segment.layerId;
      const label = segment.kind === "pad"
        ? "PAD"
        : segment.kind === "trailer"
          ? "FCS"
          : segment.kind === "payload"
            ? layer.short
            : layer.short;
      return `
        <button class="pkt-map-seg${visible ? "" : " is-future"}${active ? " is-active" : ""}"
          data-pkt-layer="${layer.id}" data-pkt-seg="${segment.kind}"
          style="flex:${segment.len} 1 0;--tone:${toneVar(layer.tone)}"
          title="${esc(layer.name)} · ${segment.len} byte (byte ${segment.start}–${segment.start + segment.len - 1})">
          <span>${esc(label)}</span>
          ${segment.len >= 8 ? `<small>${segment.len} B</small>` : ""}
        </button>`;
    }).join("");
  }

  function renderHex(scenario, selectedField) {
    const rows = [];
    for (let offset = 0; offset < scenario.frame.length; offset += 16) {
      const cells = [];
      const chars = [];
      for (let i = offset; i < Math.min(offset + 16, scenario.frame.length); i += 1) {
        const byte = scenario.frame[i];
        const layerId = layerAtByte(scenario, i);
        const layer = scenario.layerById[layerId];
        const item = fieldAtByte(scenario, i);
        const visible = isLayerVisible(scenario, layerId);
        const selected = selectedField && item && item.key === selectedField.key;
        const layerActive = UI.layerId === layerId;
        const title = `${i} · ${layer.name}${item ? ` · ${item.name}` : ""} · 0x${hex2(byte)}`;
        cells.push(`<span class="pkt-hex-byte${visible ? "" : " is-future"}${selected ? " is-selected" : ""}${layerActive ? " is-layer" : ""}"
          data-pkt-byte="${i}"${item ? ` data-pkt-field="${item.key}"` : ""} data-pkt-byte-layer="${layerId}"
          style="--tone:${toneVar(layer.tone)}" title="${esc(title)}">${hex2(byte)}</span>`);
        chars.push(byte >= 32 && byte < 127 ? String.fromCharCode(byte) : ".");
      }
      rows.push(`
        <div class="pkt-hex-row">
          <span class="pkt-hex-off">${offset.toString(16).toUpperCase().padStart(4, "0")}</span>
          <span class="pkt-hex-cells">${cells.join("")}</span>
          <span class="pkt-hex-ascii">${esc(chars.join(""))}</span>
        </div>`);
    }
    return rows.join("");
  }

  function renderFieldRows(scenario, layer) {
    if (!layer.fields.length) {
      return `<div class="pkt-empty">Lớp này chỉ chứa dữ liệu đã mã hóa hoặc payload thô, không có trường header để chọn.</div>`;
    }
    return layer.fields.map((item) => {
      const selected = UI.fieldKey === item.key;
      return `
        <button class="pkt-field-row${selected ? " is-selected" : ""}" data-pkt-field="${item.key}">
          <span class="pkt-field-id">
            <strong>${esc(item.name)}</strong>
            <span>${esc(item.bits)}</span>
          </span>
          <span class="pkt-field-value">${item.value}</span>
          <span class="pkt-field-note">${item.note}</span>
          <span class="pkt-field-range">${rangeText(item)}</span>
        </button>`;
    }).join("");
  }

  function renderBits(scenario, item) {
    const slice = scenario.frame.slice(item.start, item.start + item.len);
    const shown = slice.slice(0, 16);
    const bits = shown.map((byte, index) => `
      <span class="pkt-bit" style="--i:${index}">
        <b>${hex2(byte)}</b>
        <small>${byte.toString(2).padStart(8, "0")}</small>
      </span>`).join("");
    const more = slice.length > shown.length
      ? `<span class="pkt-bit-more">+${slice.length - shown.length} byte</span>`
      : "";
    return `<div class="pkt-bits">${bits}${more}</div>`;
  }

  function renderDetail(scenario) {
    const layer = scenario.layerById[UI.layerId] || scenario.layers[0];
    const item = UI.fieldKey ? findField(scenario, UI.fieldKey) : null;
    if (item) {
      return `
        <div class="pkt-detail-head">
          <span class="pkt-detail-kicker" style="--tone:${toneVar(layer.tone)}">${esc(layer.osi)} · ${esc(layer.short)}</span>
          <h3>${esc(item.name)}</h3>
        </div>
        <div class="pkt-detail-value">${item.value}</div>
        <div class="pkt-detail-grid">
          <div><span>Vị trí</span><b>${rangeText(item)}</b></div>
          <div><span>Kích thước</span><b>${item.len} B · ${esc(item.bits)}</b></div>
          <div><span>Thuộc lớp</span><b>${esc(layer.name)}</b></div>
        </div>
        ${renderBits(scenario, item)}
        <p class="pkt-detail-note">${item.note}</p>
        <button class="pkt-detail-back" data-pkt-action="back-layer">← Về tổng quan ${esc(layer.short)}</button>`;
    }
    return `
      <div class="pkt-detail-head">
        <span class="pkt-detail-kicker" style="--tone:${toneVar(layer.tone)}">${esc(layer.osi)} · ${esc(layer.short)}</span>
        <h3>${esc(layer.name)}</h3>
      </div>
      <p class="pkt-detail-note">${layer.note}</p>
      <div class="pkt-detail-grid">
        <div><span>Header</span><b>${layer.headerLen ? `${layer.headerLen} B` : "không có"}</b></div>
        <div><span>Toàn bộ PDU</span><b>${layer.totalLen} B</b></div>
        <div><span>Vị trí trong frame</span><b>byte ${layer.start}–${layer.start + Math.max(layer.headerLen || layer.totalLen, 1) - 1}</b></div>
      </div>
      <div class="pkt-detail-hint">Chọn một trường trong bảng bên trái hoặc bấm trực tiếp vào byte để xem chi tiết từng bit.</div>`;
  }

  function statsFor(scenario) {
    let l2 = 0;
    let l3 = 0;
    let upper = 0;
    scenario.layers.forEach((layer) => {
      if (layer.osi === "L2") l2 += layer.headerLen;
      else if (layer.osi === "L3") l3 += layer.headerLen;
      else upper += layer.headerLen;
    });
    return {
      l2,
      l3,
      upper,
      data: scenario.totalBytes - scenario.headerBytes - scenario.padBytes - scenario.fcsBytes,
      trailer: scenario.padBytes + scenario.fcsBytes,
      hasPad: scenario.padBytes > 0,
      hasFcs: scenario.fcsBytes > 0
    };
  }

  function simCaption(scenario) {
    if (UI.reveal >= scenario.stack.length) {
      return `<strong>Đã bọc đủ ${scenario.stack.length} lớp.</strong> Frame hoàn chỉnh ${scenario.totalBytes} byte, sẵn sàng truyền xuống NIC.`;
    }
    const next = scenario.layerById[scenario.stack[UI.reveal]];
    if (!next) return `<strong>Bước ${UI.reveal}/${scenario.stack.length}</strong>`;
    const nextText = next.headerLen ? `${next.headerLen} byte header` : `${next.totalLen} byte dữ liệu`;
    return `<strong>Bước ${UI.reveal}/${scenario.stack.length}:</strong> đang có ${UI.reveal} lớp. Bọc thêm <b>${esc(next.name)}</b> (${nextText}).`;
  }

  function render() {
    const scenario = currentScenario();
    if (!UI.layerId || !scenario.layerById[UI.layerId]) UI.layerId = scenario.stack[0];
    if (!Number.isFinite(UI.reveal) || UI.reveal < 1 || UI.reveal > scenario.stack.length) {
      UI.reveal = scenario.stack.length;
    }
    const layer = scenario.layerById[UI.layerId];
    const item = UI.fieldKey ? findField(scenario, UI.fieldKey) : null;
    const stats = statsFor(scenario);
    const maxReveal = scenario.stack.length;
    const canPrev = UI.reveal > 1;
    const canNext = UI.reveal < maxReveal;
    const hasPad = scenario.padBytes > 0;

    UI.root.innerHTML = `
      <div class="packet-page">
        <div class="mode-head packet-head">
          <div>
            <span class="mode-eyebrow">Packet Inspector · byte-level</span>
            <h1>Giải phẫu gói tin</h1>
            <p>Chọn một kịch bản, xem từng lớp OSI được bọc như thế nào, đọc mọi trường theo byte/bit, kiểm tra checksum thật và chạy mô phỏng đóng gói — rồi bấm vào bất kỳ byte nào để truy ngược về trường của nó.</p>
          </div>
          <div class="packet-head-badge">
            <span class="packet-badge-dot"></span>
            <b>${SL.packets.scenarios.length} kịch bản</b>
            <small>Checksum · FCS · hex dump</small>
          </div>
        </div>

        <div class="pkt-scenarios" role="tablist" aria-label="Kịch bản gói tin">
          ${SL.packets.scenarios.map((entry) => `
            <button class="pkt-scenario${entry.id === scenario.id ? " is-active" : ""}" data-pkt-scenario="${entry.id}" role="tab" aria-selected="${entry.id === scenario.id}">
              <span class="pkt-scenario-group">${esc(entry.group)}</span>
              <strong>${esc(entry.title)}</strong>
              <span class="pkt-scenario-path">${esc(entry.path)}</span>
              <span class="pkt-scenario-meta">${entry.totalBytes} B · ${entry.stack.length} lớp</span>
            </button>`).join("")}
        </div>

        <section class="packet-hero" aria-label="Tổng quan gói tin">
          <div class="packet-hero-copy">
            <span class="pkt-eyebrow">${esc(scenario.group)} · ${scenario.totalBytes} byte</span>
            <h2>${esc(scenario.title)}</h2>
            <p class="pkt-subtitle">${esc(scenario.subtitle)}</p>
            <p>${esc(scenario.description)}</p>
          </div>
          <div class="pkt-stats">
            <div><span>Frame</span><b>${scenario.totalBytes} B</b></div>
            <div><span>L2 header</span><b>${stats.l2} B</b></div>
            <div><span>L3 header</span><b>${stats.l3} B</b></div>
            <div title="Header từ L4 trở lên: TCP/UDP, TLS, DNS, ARP…"><span>Header trên</span><b>${stats.upper} B</b></div>
            <div><span>Dữ liệu</span><b>${stats.data} B</b></div>
            <div title="Đệm Ethernet và FCS 4 byte"><span>${stats.hasPad ? "Đệm + FCS" : "FCS"}</span><b>${stats.trailer} B</b></div>
          </div>
        </section>

        <section class="packet-chain-wrap" aria-label="Các lớp đóng gói">
          <div class="pkt-section-head">
            <div><span class="pkt-eyebrow">Encapsulation stack</span><h2>Bọc từ trong ra ngoài</h2></div>
            <span class="pkt-hint">Bấm một lớp để xem trường · nút ▶ chạy mô phỏng</span>
          </div>
          <div class="packet-chain">${renderChain(scenario)}</div>
          <div class="pkt-sim">
            <div class="pkt-sim-caption">${simCaption(scenario)}</div>
            <div class="pkt-sim-actions">
              <button class="pkt-btn" data-pkt-action="prev" ${canPrev ? "" : "disabled"}>← Bóc lớp ngoài</button>
              <button class="pkt-btn pkt-btn-play" data-pkt-action="play">${UI.playing ? "❚❚ Tạm dừng" : "▶ Chạy mô phỏng"}</button>
              <button class="pkt-btn" data-pkt-action="next" ${canNext ? "" : "disabled"}>Bọc lớp ngoài →</button>
              <button class="pkt-btn pkt-btn-ghost" data-pkt-action="all" ${canNext ? "" : "disabled"}>Xem đủ</button>
            </div>
            <div class="pkt-progress"><span style="width:${(UI.reveal / maxReveal) * 100}%"></span></div>
          </div>
        </section>

        <div class="packet-layout">
          <div class="packet-main">
            <section class="packet-card">
              <div class="pkt-card-head">
                <div><span class="pkt-eyebrow">Byte map</span><h2>Bản đồ byte &amp; hex dump</h2></div>
                <span class="pkt-hint">${scenario.totalBytes} byte · offset hex · ASCII bên phải</span>
              </div>
              <div class="pkt-map">${renderMap(scenario)}</div>
              <div class="pkt-legend">
                ${scenario.layers.filter((entry) => entry.inStack).map((entry) => `
                  <span style="--tone:${toneVar(entry.tone)}"><i></i>${esc(entry.short)}</span>`).join("")}
                ${hasPad ? '<span class="pkt-legend-pad"><i></i>Padding</span>' : ""}
                ${scenario.fcsBytes ? '<span class="pkt-legend-fcs"><i></i>FCS</span>' : ""}
              </div>
              <div class="pkt-hex-wrap">
                <div class="pkt-hex-head"><span>Offset</span><span>00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</span><span>ASCII</span></div>
                ${renderHex(scenario, item)}
              </div>
              <p class="pkt-hex-note">Byte mờ = lớp chưa được bọc ở bước mô phỏng hiện tại. Bấm một byte để chọn trường tương ứng; bấm “Xem đủ” để hiện toàn bộ. Checksum IPv4/TCP/UDP/ICMP và FCS đều được tính thật từ chính các byte đang hiển thị.</p>
            </section>

            <section class="packet-card">
              <div class="pkt-card-head">
                <div><span class="pkt-eyebrow">Field anatomy</span><h2>${esc(layer.name)}</h2></div>
                <span class="pkt-hint">${layer.fields.length} trường · ${layer.headerLen ? `${layer.headerLen} byte header` : `${layer.totalLen} byte dữ liệu`}</span>
              </div>
              <div class="pkt-layer-tabs" role="tablist" aria-label="Chọn lớp">
                ${scenario.stack.map((id) => {
                  const entry = scenario.layerById[id];
                  return `<button class="pkt-layer-tab${id === layer.id ? " is-active" : ""}${isLayerVisible(scenario, id) ? "" : " is-future"}" data-pkt-layer="${id}" style="--tone:${toneVar(entry.tone)}">${esc(entry.osi)} · ${esc(entry.short)}</button>`;
                }).join("")}
              </div>
              <div class="pkt-field-list">${renderFieldRows(scenario, layer)}</div>
            </section>
          </div>

          <aside class="packet-side">
            <section class="packet-card pkt-detail-card">
              <div class="pkt-card-head pkt-card-head-tight">
                <div><span class="pkt-eyebrow">${item ? "Field detail" : "Layer overview"}</span><h2>${item ? "Từng bit nghĩa là gì?" : "Vai trò của lớp"}</h2></div>
              </div>
              <div class="pkt-detail">${renderDetail(scenario)}</div>
            </section>

            <section class="packet-card pkt-notes-card">
              <div class="pkt-card-head pkt-card-head-tight">
                <div><span class="pkt-eyebrow">Ghi nhớ nhanh</span><h2>Ba điểm cần thấy</h2></div>
              </div>
              <ol class="pkt-notes">
                ${scenario.notes.map((note) => `<li>${note}</li>`).join("")}
              </ol>
              <div class="pkt-tags">${scenario.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>
            </section>
          </aside>
        </div>
      </div>`;
  }

  function selectLayer(id, reveal) {
    const scenario = currentScenario();
    if (!scenario.layerById[id]) return;
    UI.layerId = id;
    if (UI.fieldKey) {
      const item = findField(scenario, UI.fieldKey);
      if (!item || item.layerId !== id) UI.fieldKey = null;
    }
    if (reveal !== false) {
      const index = layerIndex(scenario, id);
      if (index >= 0 && index >= UI.reveal) UI.reveal = index + 1;
    }
    render();
  }

  function openScenario(id) {
    if (!SL.packets.byId[id]) return;
    stop();
    UI.scenarioId = id;
    const scenario = currentScenario();
    UI.layerId = scenario.stack[0];
    UI.fieldKey = null;
    UI.reveal = scenario.stack.length;
    render();
    syncHash();
  }

  function selectField(key) {
    const scenario = currentScenario();
    const item = findField(scenario, key);
    if (!item) return;
    UI.layerId = item.layerId;
    UI.fieldKey = key;
    const index = layerIndex(scenario, item.layerId);
    if (index >= 0 && index >= UI.reveal) UI.reveal = index + 1;
    render();
  }

  function bind() {
    document.addEventListener("click", (event) => {
      if (!UI.root || !UI.root.contains(event.target)) return;
      const action = event.target.closest("[data-pkt-action]");
      if (action) {
        const scenario = currentScenario();
        const kind = action.dataset.pktAction;
        if (kind === "next" && UI.reveal < scenario.stack.length) UI.reveal += 1;
        if (kind === "prev" && UI.reveal > 1) UI.reveal -= 1;
        if (kind === "all") UI.reveal = scenario.stack.length;
        if (kind === "back-layer") UI.fieldKey = null;
        if (kind === "play") {
          if (UI.playing) {
            stop();
            render();
          } else {
            stop();
            UI.reveal = 1;
            UI.playing = true;
            render();
            UI.timer = setInterval(() => {
              const live = currentScenario();
              if (!UI.root || !document.body.contains(UI.root)) {
                stop();
                return;
              }
              if (UI.reveal < live.stack.length) {
                UI.reveal += 1;
                if (UI.reveal >= live.stack.length) stop();
                render();
              } else {
                stop();
                render();
              }
            }, 1150);
          }
        } else {
          if (UI.playing) stop();
          render();
        }
        return;
      }

      const scenarioButton = event.target.closest("[data-pkt-scenario]");
      if (scenarioButton) {
        openScenario(scenarioButton.dataset.pktScenario);
        return;
      }

      const byte = event.target.closest("[data-pkt-byte]");
      if (byte) {
        if (byte.dataset.pktField) {
          selectField(byte.dataset.pktField);
        } else {
          selectLayer(byte.dataset.pktByteLayer, true);
        }
        return;
      }

      const fieldButton = event.target.closest("[data-pkt-field]");
      if (fieldButton) {
        selectField(fieldButton.dataset.pktField);
        return;
      }

      const layerButton = event.target.closest("[data-pkt-layer]");
      if (layerButton) {
        selectLayer(layerButton.dataset.pktLayer, true);
      }
    });

    document.addEventListener("mouseover", (event) => {
      if (!UI.root || !UI.root.contains(event.target)) return;
      const target = event.target.closest("[data-pkt-field]");
      if (!target || !target.dataset.pktField) return;
      const key = target.dataset.pktField;
      UI.root.querySelectorAll("[data-pkt-field]").forEach((node) => {
        if (node.dataset.pktField === key) node.classList.add("is-hover");
      });
    });

    document.addEventListener("mouseout", (event) => {
      if (!UI.root || !UI.root.contains(event.target)) return;
      const target = event.target.closest("[data-pkt-field]");
      if (!target || !target.dataset.pktField) return;
      UI.root.querySelectorAll("[data-pkt-field].is-hover").forEach((node) => node.classList.remove("is-hover"));
    });
  }

  bind();

  SL.packetUI = {
    render(view, scenarioId) {
      UI.root = view;
      const requested = scenarioId && SL.packets.byId[scenarioId] ? scenarioId : null;
      const fallback = UI.scenarioId && SL.packets.byId[UI.scenarioId] ? UI.scenarioId : SL.packets.scenarios[0].id;
      const nextId = requested || fallback;
      if (nextId !== UI.scenarioId) {
        UI.scenarioId = nextId;
        UI.layerId = null;
        UI.fieldKey = null;
        UI.reveal = null;
      }
      const scenario = currentScenario();
      if (!UI.layerId || !scenario.layerById[UI.layerId]) UI.layerId = scenario.stack[0];
      if (!Number.isFinite(UI.reveal) || UI.reveal < 1 || UI.reveal > scenario.stack.length) {
        UI.reveal = scenario.stack.length;
      }
      render();
      syncHash();
    },
    stop
  };
})();
