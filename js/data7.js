/* NetLab — mạng không dây, di động, mật mã và IPsec */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  /* ------------------------------------------------------------------
     Chương 7 — 4G/5G
     ------------------------------------------------------------------ */
  SL.lessons["cellular-4g5g"] = {
    id: "cellular-4g5g",
    module: "ch7-wireless",
    title: "Mạng di động 4G và 5G: từ SIM đến phiên dữ liệu",
    shortTitle: "4G & 5G",
    subtitle: "Một chiếc điện thoại vào mạng qua những bước nào, và 5G khác 4G ở đâu ngoài con số tốc độ?",
    blurb: "Attach, xác thực AKA, bearer, 5G NR, network slicing và handover — kiến trúc di động nhìn từ góc mạng.",
    duration: "17 phút",
    level: "Trung cấp",
    tags: ["LTE", "5G NR", "eNodeB", "gNB", "MME", "AMF", "S-GW", "UPF", "bearer", "network slicing", "handover"],
    metrics: [
      { key: "band", label: "Băng tần", tone: "blue" },
      { key: "lat", label: "Độ trễ", tone: "violet" },
      { key: "speed", label: "Tốc độ", tone: "green" },
      { key: "users", label: "Phiên", tone: "yellow" }
    ],
    nodes: [
      { id: "ue", type: "client", x: 30, y: 90, w: 160, h: 66, label: "UE · điện thoại", sub: "SIM / USIM" },
      { id: "enb", type: "presence", x: 230, y: 90, w: 175, h: 66, label: "eNodeB / gNB", sub: "trạm gốc" },
      { id: "mme", type: "server", x: 445, y: 90, w: 170, h: 66, label: "MME / AMF", sub: "quản lý phiên" },
      { id: "sgw", type: "router", x: 230, y: 300, w: 175, h: 66, label: "S-GW / UPF", sub: "mặt phẳng dữ liệu" },
      { id: "pgw", type: "gateway", x: 445, y: 300, w: 170, h: 66, label: "P-GW", sub: "cửa ra Internet" },
      { id: "net", type: "cdn", x: 660, y: 300, w: 170, h: 66, label: "Internet", sub: "server nội dung" }
    ],
    edges: [
      { id: "ue-enb", from: "ue", to: "enb", kind: "request", label: "RRC" },
      { id: "enb-mme", from: "enb", to: "mme", kind: "data", label: "S1-MME" },
      { id: "enb-sgw", from: "enb", to: "sgw", kind: "request", label: "S1-U" },
      { id: "sgw-pgw", from: "sgw", to: "pgw", kind: "data", label: "GTP" },
      { id: "pgw-net", from: "pgw", to: "net", kind: "request" }
    ],
    learn: [
      "Mô tả các bước attach và xác thực thuê bao.",
      "Phân biệt mặt phẳng điều khiển và dữ liệu trong 4G.",
      "Hiểu bearer và đường hầm GTP.",
      "Nêu khác biệt chính của 5G NR.",
      "Giải thích network slicing và handover."
    ],
    steps: [
      {
        short: "Bật sóng & attach",
        type: "Khởi đầu",
        title: "UE chọn cell và mở kết nối RRC",
        body: "Điện thoại quét băng tần, chọn cell mạnh nhất và đọc thông tin quảng bá. Nó mở kết nối <strong>RRC</strong> tới trạm gốc rồi gửi Attach Request kèm IMSI đọc từ SIM. Từ đây mạng biết có một thuê bao đang xin vào.",
        focus: ["ue", "enb"],
        edges: ["ue-enb"],
        metrics: { band: "B3 · 1,8 GHz", lat: "—", speed: "0", users: "1" },
        changes: ["UE đồng bộ với cell", "Yêu cầu attach được gửi"],
        note: "Cell quảng bá MIB/SIB để UE biết băng tần, mã vùng và tham số truy cập."
      },
      {
        short: "Xác thực AKA",
        type: "Bảo mật",
        title: "MME và HSS kiểm tra SIM",
        body: "MME lấy vector xác thực từ HSS (hoặc AUSF ở 5G) rồi thách thức UE bằng <strong>AKA</strong>: UE tính lại bằng khóa bí mật trong SIM. Thành công thì hai bên thống nhất khóa mã hóa và bảo vệ toàn vẹn cho các bản tin sau.",
        focus: ["ue", "enb", "mme"],
        edges: ["ue-enb", "enb-mme"],
        metrics: { band: "B3", lat: "45 ms", speed: "0", users: "1" },
        changes: ["Thuê bao được xác thực", "Kênh vô tuyến được mã hóa"],
        note: "SIM không bao giờ gửi khóa ra ngoài; chỉ gửi kết quả tính toán, nên bắt sóng cũng khó lấy khóa."
      },
      {
        short: "Bearer & IP",
        type: "Dữ liệu",
        title: "Dựng bearer xuyên S-GW tới P-GW",
        body: "Mạng tạo <strong>bearer</strong> mặc định: một đường hầm GTP từ trạm gốc qua S-GW tới P-GW, và cấp cho UE một địa chỉ IP. Mọi gói của điện thoại được đóng trong GTP để bảo toàn phiên khi di chuyển giữa các trạm.",
        focus: ["ue", "enb", "sgw", "pgw"],
        edges: ["enb-sgw", "sgw-pgw", "pgw-net"],
        metrics: { band: "B3", lat: "38 ms", speed: "80 Mbps", users: "1" },
        changes: ["UE có IP", "Đường hầm dữ liệu mở"],
        note: "Mặt phẳng điều khiển (MME) và dữ liệu (S-GW/P-GW) tách riêng — nền tảng cho SDN hóa 5G."
      },
      {
        short: "5G NR",
        type: "Vô tuyến",
        title: "Băng rộng hơn, MIMO lớn, búp sóng",
        body: "5G NR dùng kênh rộng hơn (100 MHz), <strong>massive MIMO</strong> hàng trăm anten và beamforming để hướng sóng tới người dùng. Sub-6 GHz phủ rộng; mmWave rất nhanh nhưng tầm ngắn và dễ bị vật cản. Độ trễ mục tiêu khoảng 1 ms ở vô tuyến.",
        focus: ["ue", "enb", "sgw"],
        edges: ["ue-enb", "enb-sgw"],
        metrics: { band: "n78 · 3,5 GHz", lat: "10 ms", speed: "600 Mbps", users: "1" },
        changes: ["Băng thông tăng mạnh", "Độ trễ vô tuyến giảm"],
        note: "Tốc độ cao chỉ đạt khi tín hiệu tốt và ít người dùng chung cell; mmWave gần như phải thấy trạm."
      },
      {
        short: "Network slicing",
        type: "Kiến trúc",
        title: "Một hạ tầng, nhiều mạng ảo",
        body: "5G cho phép chia hạ tầng thành nhiều <strong>slice</strong>: eMBB cho băng rộng, URLLC cho điều khiển thời gian thực, mMTC cho hàng triệu cảm biến. Mỗi slice có tham số chất lượng và chính sách riêng, chạy trên cùng phần cứng.",
        focus: ["ue", "mme", "sgw", "pgw"],
        edges: ["enb-mme", "enb-sgw", "sgw-pgw"],
        metrics: { band: "n78", lat: "5 ms", speed: "600 Mbps", users: "3 slice" },
        changes: ["Tách tài nguyên theo dịch vụ", "Chất lượng được cam kết"],
        note: "Slice không phải VLAN đơn thuần; nó gồm cả chức năng mạng ảo hóa (NFV) và chính sách."
      },
      {
        short: "Handover",
        type: "Tổng kết",
        title: "Chuyển trạm mà không rớt phiên",
        body: "Khi UE rời cell cũ, trạm cũ chuyển ngữ cảnh sang trạm mới qua giao diện <strong>X2</strong> (hoặc N2 ở 5G). UE thực hiện <strong>make-before-break</strong>: kết nối mới được thiết lập trước khi cắt kết nối cũ, nên phiên IP và TCP vẫn liền mạch.",
        focus: ["all"],
        edges: "all",
        metrics: { band: "n78", lat: "12 ms", speed: "520 Mbps", users: "1" },
        changes: ["Đổi trạm thành công", "Phiên dữ liệu được giữ"],
        note: "Handover trong cùng mạng khác roaming: roaming phải quay về home network để xác thực và tính cước."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 7 — Quản lý di động
     ------------------------------------------------------------------ */
  SL.lessons["mobility-management"] = {
    id: "mobility-management",
    module: "ch7-wireless",
    title: "Quản lý di động: giữ kết nối khi IP thay đổi",
    shortTitle: "Quản lý di động",
    subtitle: "Thiết bị đổi mạng thì địa chỉ IP đổi, vậy làm sao server vẫn gửi đúng gói tới nó?",
    blurb: "Home agent, care-of address, định tuyến gián tiếp và trực tiếp, ảnh hưởng lên TCP và các giải pháp hiện đại.",
    duration: "16 phút",
    level: "Nâng cao",
    tags: ["Mobile IP", "home agent", "care-of address", "triangle routing", "binding update", "handover", "MPTCP", "QUIC"],
    metrics: [
      { key: "handover", label: "Handover", tone: "blue" },
      { key: "anchor", label: "Anchor", tone: "violet" },
      { key: "rtt", label: "RTT", tone: "yellow" },
      { key: "loss", label: "Mất gói", tone: "coral" }
    ],
    nodes: [
      { id: "mobile", type: "client", x: 30, y: 90, w: 165, h: 66, label: "Thiết bị", sub: "đang di chuyển" },
      { id: "oldap", type: "presence", x: 235, y: 90, w: 160, h: 66, label: "Mạng cũ", sub: "10.0.1.0/24" },
      { id: "newap", type: "presence", x: 435, y: 90, w: 160, h: 66, label: "Mạng mới", sub: "10.0.2.0/24" },
      { id: "home", type: "home", x: 235, y: 300, w: 175, h: 66, label: "Home agent", sub: "giữ địa chỉ nhà" },
      { id: "corr", type: "server", x: 460, y: 300, w: 180, h: 66, label: "Server đối tác", sub: "correspondent" }
    ],
    edges: [
      { id: "mo-old", from: "mobile", to: "oldap", kind: "data", label: "phiên cũ" },
      { id: "mo-new", from: "mobile", to: "newap", kind: "request", label: "kết nối mới" },
      { id: "new-home", from: "newap", to: "home", kind: "data", label: "binding update" },
      { id: "home-corr", from: "home", to: "corr", kind: "data", label: "đăng ký" },
      { id: "corr-mobile", from: "corr", to: "newap", kind: "request", label: "gói tới CoA", bow: 26 }
    ],
    learn: [
      "Giải thích vì sao đổi IP làm đứt kết nối.",
      "Hiểu home agent và care-of address.",
      "So sánh định tuyến gián tiếp và trực tiếp.",
      "Biết handover lớp 2 khác lớp 3.",
      "Nêu ảnh hưởng lên TCP và giải pháp hiện đại."
    ],
    steps: [
      {
        short: "IP đổi, phiên đứt",
        type: "Vấn đề",
        title: "TCP gắn chặt với cặp địa chỉ",
        body: "Một kết nối TCP được xác định bởi bốn thành phần: IP nguồn, cổng nguồn, IP đích, cổng đích. Khi thiết bị chuyển mạng và nhận IP mới, gói gửi đi mang địa chỉ khác nên server coi là phiên lạ và hủy kết nối cũ.",
        focus: ["mobile", "oldap", "newap"],
        edges: ["mo-old", "mo-new"],
        metrics: { handover: "đang chuyển", anchor: "—", rtt: "30 ms", loss: "kết nối đứt" },
        changes: ["Địa chỉ IP thay đổi", "Kết nối TCP cũ không còn hợp lệ"],
        note: "Đây là lý do cần lớp quản lý di động: che giấu thay đổi địa chỉ khỏi tầng giao vận."
      },
      {
        short: "Home & CoA",
        type: "Cơ chế",
        title: "Giữ một địa chỉ nhà, đăng ký địa chỉ tạm",
        body: "Mobile IP cấp thiết bị một <strong>home address</strong> cố định và một <strong>care-of address (CoA)</strong> theo mạng đang ghé. Thiết bị đăng ký CoA với <strong>home agent</strong>; agent đóng gói gói tới home address vào đường hầm gửi tới CoA.",
        focus: ["mobile", "newap", "home"],
        edges: ["mo-new", "new-home"],
        metrics: { handover: "hoàn tất", anchor: "home agent", rtt: "35 ms", loss: "0" },
        changes: ["CoA được đăng ký", "Đường hầm về thiết bị được lập"],
        note: "Home agent là điểm neo (anchor); nếu nó ở xa, đường đi luôn vòng qua nó dù thiết bị ở gần server."
      },
      {
        short: "Định tuyến gián tiếp",
        type: "Đường đi",
        title: "Mọi gói phải qua home agent",
        body: "Server gửi gói tới home address; home agent bắt gói, đóng gói và chuyển tới CoA. Thiết bị trả lời trực tiếp cho server. Cách này đơn giản nhưng tạo <strong>tam giác định tuyến</strong>: đường đi dài hơn và tăng độ trễ.",
        focus: ["home", "corr", "newap"],
        edges: ["home-corr", "corr-mobile"],
        metrics: { handover: "—", anchor: "home agent", rtt: "70 ms", loss: "0" },
        changes: ["Gói đến được thiết bị", "Đường đi bị vòng"],
        note: "Tam giác càng lớn khi home agent và mạng đang ghé cách xa nhau về địa lý."
      },
      {
        short: "Định tuyến trực tiếp",
        type: "Tối ưu",
        title: "Server biết CoA và gửi thẳng",
        body: "Với <strong>binding update</strong>, thiết bị (hoặc home agent) báo cho server biết CoA hiện tại. Server gửi thẳng tới CoA, bỏ được vòng tam giác. Đổi lại, server phải lưu trạng thái và cập nhật khi thiết bị di chuyển tiếp.",
        focus: ["mobile", "newap", "corr"],
        edges: ["mo-new", "corr-mobile"],
        metrics: { handover: "—", anchor: "server cache", rtt: "38 ms", loss: "0" },
        changes: ["Đường đi ngắn hơn", "Server phải giữ binding"],
        note: "Binding cũ có thể khiến gói đi sai sau handover; cần cơ chế cập nhật và hết hạn."
      },
      {
        short: "Handover L2 / L3",
        type: "Thực tế",
        title: "Đổi AP khác đổi mạng",
        body: "Chuyển giữa hai AP cùng subnet chỉ là <strong>handover lớp 2</strong>: IP giữ nguyên, TCP không biết gì. Khi đổi sang subnet khác mới cần <strong>handover lớp 3</strong>. Trong 4G/5G, anchor S-GW/P-GW giữ IP ổn định qua nhiều trạm gốc.",
        focus: ["mobile", "oldap", "newap", "home"],
        edges: ["mo-old", "mo-new", "new-home"],
        metrics: { handover: "80 ms", anchor: "S-GW", rtt: "40 ms", loss: "0,3%" },
        changes: ["Phân biệt hai mức handover", "Anchor giữ phiên"],
        note: "Handover cùng subnet rẻ hơn nhiều; thiết kế Wi-Fi lớn cố gắng giữ một subnet rộng khi có thể."
      },
      {
        short: "TCP & giải pháp mới",
        type: "Tổng kết",
        title: "MPTCP và QUIC sống sót qua đổi IP",
        body: "TCP thuần không chịu được đổi địa chỉ. <strong>MPTCP</strong> dùng nhiều đường con và chuyển lưu lượng khi một đường hỏng. <strong>QUIC</strong> gắn phiên với connection ID thay vì cặp IP/cổng, nên chuyển Wi-Fi sang 4G mà không phải bắt tay lại.",
        focus: ["all"],
        edges: "all",
        metrics: { handover: "liền mạch", anchor: "connection ID", rtt: "36 ms", loss: "0,1%" },
        changes: ["Phiên không đứt", "Không cần bắt tay lại"],
        note: "Đổi mạng vẫn có thể mất gói ngắn; QUIC giảm nhờ migration và có thể dùng 0-RTT an toàn hơn."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 8 — Mật mã và chữ ký số
     ------------------------------------------------------------------ */
  SL.lessons["crypto-signatures"] = {
    id: "crypto-signatures",
    module: "ch8-security",
    title: "Mật mã, hàm băm và chữ ký số",
    shortTitle: "Mật mã & chữ ký",
    subtitle: "Khóa đối xứng nhanh nhưng khó chia sẻ; khóa công khai giải quyết chia sẻ nhưng chậm — thực tế dùng cả hai.",
    blurb: "AES, RSA/ECDH, SHA-256, HMAC, chữ ký số và chuỗi chứng chỉ — nền tảng của mọi kết nối an toàn.",
    duration: "18 phút",
    level: "Nâng cao",
    tags: ["AES", "RSA", "ECDH", "SHA-256", "HMAC", "digital signature", "certificate", "CA", "OCSP"],
    metrics: [
      { key: "keylen", label: "Khóa", tone: "blue" },
      { key: "rtt", label: "Chi phí", tone: "violet" },
      { key: "integrity", label: "Toàn vẹn", tone: "green" },
      { key: "trust", label: "Tin cậy", tone: "coral" }
    ],
    nodes: [
      { id: "alice", type: "client", x: 30, y: 90, w: 160, h: 66, label: "Alice", sub: "người gửi" },
      { id: "ca", type: "key", x: 330, y: 90, w: 180, h: 66, label: "CA / KDC", sub: "phát khóa & chứng chỉ" },
      { id: "bob", type: "client", x: 640, y: 90, w: 160, h: 66, label: "Bob", sub: "người nhận" },
      { id: "attacker", type: "shield", x: 330, y: 300, w: 180, h: 66, label: "Kẻ tấn công", sub: "nghe lén · sửa gói" }
    ],
    edges: [
      { id: "a-ca", from: "alice", to: "ca", kind: "data", label: "khóa công khai" },
      { id: "b-ca", from: "bob", to: "ca", kind: "data", label: "chứng chỉ" },
      { id: "a-b", from: "alice", to: "bob", kind: "request", label: "bản mã" },
      { id: "b-a", from: "bob", to: "alice", kind: "response", label: "ACK", bow: 24 },
      { id: "att-a", from: "attacker", to: "alice", kind: "data", label: "chặn" }
    ],
    learn: [
      "Phân biệt mật mã đối xứng và bất đối xứng.",
      "Hiểu hàm băm một chiều và tính chất.",
      "Phân biệt MAC và chữ ký số.",
      "Giải thích chữ ký đảm bảo toàn vẹn và không chối bỏ.",
      "Đọc chuỗi chứng chỉ và kiểm tra thu hồi."
    ],
    steps: [
      {
        short: "Đối xứng AES",
        type: "Khởi đầu",
        title: "Một khóa cho cả mã hóa và giải mã",
        body: "<strong>AES</strong> mã hóa khối 128 bit với khóa 128/192/256 bit, rất nhanh trên CPU hiện đại. Vấn đề là chia khóa: Alice và Bob phải có cùng khóa mà không để kẻ nghe lén biết. Với n người, cần n(n−1)/2 khóa — không mở rộng được.",
        focus: ["alice", "bob"],
        edges: ["a-b"],
        metrics: { keylen: "256 bit", rtt: "µs", integrity: "chưa có", trust: "chia sẻ thủ công" },
        changes: ["Dữ liệu được mã hóa", "Bài toán chia khóa xuất hiện"],
        note: "AES-GCM còn cung cấp kiểm tra toàn vẹn; đây là chế độ phổ biến trong TLS 1.3."
      },
      {
        short: "Khóa công khai",
        type: "Bất đối xứng",
        title: "Khóa công khai mã hóa, khóa riêng giải mã",
        body: "<strong>RSA</strong> và <strong>ECDH</strong> cho phép trao đổi khóa mà không cần bí mật chung trước. Alice mã hóa bằng khóa công khai của Bob, chỉ khóa riêng của Bob giải được. Thực tế TLS dùng khóa công khai để thỏa thuận khóa phiên, sau đó chuyển sang AES vì nhanh hơn nhiều.",
        focus: ["alice", "bob", "ca"],
        edges: ["a-ca", "b-ca", "a-b"],
        metrics: { keylen: "ECDH P-256", rtt: "1 ms", integrity: "chưa có", trust: "cần xác thực khóa" },
        changes: ["Trao đổi khóa an toàn", "Vẫn cần chống giả mạo khóa"],
        note: "Khóa công khai không tự chứng minh danh tính; kẻ tấn công có thể gửi khóa của mình (MITM)."
      },
      {
        short: "Hàm băm",
        type: "Toàn vẹn",
        title: "SHA-256 nén dữ liệu thành vân tay",
        body: "<strong>SHA-256</strong> biến dữ liệu bất kỳ thành 256 bit cố định. Đổi một bit đầu vào làm đầu ra khác hoàn toàn; không thể tìm nghịch ảnh. Nhờ vậy có thể so sánh vân tay thay vì cả tệp, và chữ ký chỉ cần ký 32 byte thay vì toàn bộ dữ liệu.",
        focus: ["alice", "bob"],
        edges: ["a-b"],
        metrics: { keylen: "256 bit", rtt: "µs", integrity: "vân tay", trust: "—" },
        changes: ["Có cách kiểm tra toàn vẹn", "Chữ ký trở nên gọn"],
        note: "MD5 và SHA-1 đã bị phá; không dùng cho chữ ký mới. Va chạm băm là lỗi nghiêm trọng."
      },
      {
        short: "MAC & chữ ký",
        type: "So sánh",
        title: "HMAC cần khóa chung, chữ ký cần khóa riêng",
        body: "<strong>HMAC</strong> là mã xác thực dùng khóa đối xứng: người có khóa mới kiểm tra được. <strong>Chữ ký số</strong> dùng khóa riêng để ký và khóa công khai để ai cũng kiểm tra được — nên dùng được cho chứng chỉ và phần mềm phân phối rộng.",
        focus: ["alice", "bob", "ca"],
        edges: ["a-ca", "a-b"],
        metrics: { keylen: "chung / riêng", rtt: "µs / ms", integrity: "có khóa", trust: "HMAC: hai bên" },
        changes: ["Phân biệt hai mục đích", "Chữ ký kiểm tra công khai"],
        note: "HMAC nhanh hơn nhiều; dùng HMAC khi đã có khóa phiên, dùng chữ ký khi cần bên thứ ba kiểm tra."
      },
      {
        short: "Chữ ký số",
        type: "Không chối bỏ",
        title: "Ký vân tay bằng khóa riêng",
        body: "Alice băm thông điệp rồi ký hash bằng khóa riêng. Bob dùng khóa công khai kiểm tra: đúng thì dữ liệu không đổi và chắc chắn do Alice ký. Vì chỉ Alice có khóa riêng, cô không thể phủ nhận đã ký — đây là <strong>không chối bỏ</strong>.",
        focus: ["alice", "bob"],
        edges: ["a-b", "b-a"],
        metrics: { keylen: "RSA 3072", rtt: "2 ms", integrity: "đảm bảo", trust: "không chối bỏ" },
        changes: ["Thông điệp có chữ ký", "Danh tính được ràng buộc"],
        note: "Chữ ký bảo vệ toàn vẹn và nguồn gốc, không bảo mật nội dung; muốn bí mật vẫn phải mã hóa."
      },
      {
        short: "Chứng chỉ & CA",
        type: "Tổng kết",
        title: "CA ký chứng chỉ, trình duyệt tin theo chuỗi",
        body: "<strong>CA</strong> ký chứng chỉ gắn tên miền với khóa công khai. Trình duyệt có sẵn root CA tin cậy, kiểm tra chuỗi chữ ký và tên miền, rồi hỏi <strong>OCSP</strong> hoặc CRL xem chứng chỉ còn hiệu lực. Kẻ tấn công không thể giả chứng chỉ nếu không có khóa riêng của CA.",
        focus: ["all"],
        edges: "all",
        metrics: { keylen: "chuỗi tin cậy", rtt: "10–50 ms", integrity: "kiểm tra", trust: "root store" },
        changes: ["Danh tính được xác thực", "MITM bị phát hiện"],
        note: "Nếu CA bị xâm phạm hoặc cấp sai, toàn bộ tin cậy sụp; Certificate Transparency giúp phát hiện cấp lạ."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 8 — IPsec & VPN
     ------------------------------------------------------------------ */
  SL.lessons["ipsec-vpn"] = {
    id: "ipsec-vpn",
    module: "ch8-security",
    title: "IPsec và VPN: bảo vệ ở tầng mạng",
    shortTitle: "IPsec & VPN",
    subtitle: "Khác TLS ở chỗ IPsec bảo vệ mọi gói IP, không cần ứng dụng biết — nhưng cấu hình và MTU phức tạp hơn.",
    blurb: "ESP tunnel, AH, security association, IKE, NAT-T, MTU/MSS và so sánh với VPN TLS hiện đại.",
    duration: "17 phút",
    level: "Nâng cao",
    tags: ["IPsec", "ESP", "AH", "SA", "SPI", "IKE", "NAT-T", "site-to-site", "remote access"],
    metrics: [
      { key: "over", label: "Overhead", tone: "blue" },
      { key: "mtu", label: "MTU", tone: "violet" },
      { key: "rtt", label: "RTT", tone: "yellow" },
      { key: "tunnels", label: "Đường hầm", tone: "coral" }
    ],
    nodes: [
      { id: "remote", type: "client", x: 30, y: 90, w: 160, h: 66, label: "Nhân viên từ xa", sub: "laptop" },
      { id: "branch", type: "router", x: 220, y: 90, w: 160, h: 66, label: "Chi nhánh", sub: "gateway IPsec" },
      { id: "isp", type: "gateway", x: 420, y: 90, w: 150, h: 66, label: "Internet", sub: "ISP" },
      { id: "hq", type: "gateway", x: 620, y: 90, w: 170, h: 66, label: "Gateway HQ", sub: "đầu cuối IPsec" },
      { id: "srv", type: "server", x: 470, y: 300, w: 170, h: 66, label: "Server nội bộ", sub: "10.10.0.5" }
    ],
    edges: [
      { id: "rem-isp", from: "remote", to: "isp", kind: "request", label: "từ xa" },
      { id: "br-isp", from: "branch", to: "isp", kind: "request" },
      { id: "isp-hq", from: "isp", to: "hq", kind: "data", label: "ESP tunnel" },
      { id: "hq-srv", from: "hq", to: "srv", kind: "request" },
      { id: "rem-hq", from: "remote", to: "hq", kind: "data", label: "IKE", bow: 30 }
    ],
    learn: [
      "Phân biệt site-to-site và remote-access VPN.",
      "Hiểu ESP tunnel khác AH transport.",
      "Đọc security association và SPI.",
      "Mô tả hai pha IKE.",
      "Xử lý NAT-T và vấn đề MTU."
    ],
    steps: [
      {
        short: "Site-to-site",
        type: "Khởi đầu",
        title: "Hai gateway dựng đường hầm",
        body: "Hai văn phòng nối qua Internet công cộng bằng <strong>VPN site-to-site</strong>: gateway hai đầu dựng đường hầm IPsec, mọi gói giữa hai mạng nội bộ được bảo vệ. Máy trạm không cần cài gì và không biết mình đang đi qua VPN.",
        focus: ["branch", "isp", "hq"],
        edges: ["br-isp", "isp-hq"],
        metrics: { over: "50–70 byte", mtu: "1500", rtt: "20 ms", tunnels: "1" },
        changes: ["Đường hầm được thiết lập", "Hai mạng riêng thông nhau an toàn"],
        note: "Tunnel mode đóng gói cả gói IP gốc, nên địa chỉ nội bộ 10.x được giữ nguyên qua Internet."
      },
      {
        short: "ESP vs AH",
        type: "Giao thức",
        title: "ESP mã hóa, AH chỉ xác thực",
        body: "<strong>ESP</strong> mã hóa và xác thực phần dữ liệu, che cả header gốc khi dùng tunnel mode. <strong>AH</strong> xác thực cả header IP nên không đi qua NAT được và không mã hóa. Ngày nay hầu như chỉ dùng ESP; AH còn trong tài liệu và một số yêu cầu cũ.",
        focus: ["branch", "hq"],
        edges: ["br-isp", "isp-hq"],
        metrics: { over: "ESP ~50 B", mtu: "1500", rtt: "20 ms", tunnels: "1" },
        changes: ["Chọn giao thức bảo vệ", "Dữ liệu được mã hóa"],
        note: "ESP có thể chỉ xác thực (null encryption) khi cần kiểm tra toàn vẹn mà không mã hóa."
      },
      {
        short: "SA & SPI",
        type: "Trạng thái",
        title: "Mỗi chiều một hiệp ước bảo mật",
        body: "<strong>Security Association</strong> là thỏa thuận một chiều: thuật toán, khóa, thời hạn. Mỗi SA được đánh chỉ số <strong>SPI</strong> để gói tin biết dùng SA nào. Bảng SAD lưu SA, bảng SPD quyết định lưu lượng nào phải đi IPsec.",
        focus: ["branch", "hq"],
        edges: ["isp-hq", "hq-srv"],
        metrics: { over: "~60 B", mtu: "1500", rtt: "20 ms", tunnels: "2 SA / tunnel" },
        changes: ["Hai SA cho hai chiều", "Chính sách được áp dụng"],
        note: "Một tunnel cần hai SA (mỗi chiều một SA); SPD khớp theo địa chỉ, giao thức và cổng."
      },
      {
        short: "IKE",
        type: "Thỏa thuận",
        title: "Hai pha: kênh an toàn rồi SA dữ liệu",
        body: "<strong>IKE</strong> chạy trên UDP 500. Pha 1 xác thực hai đầu và tạo kênh an toàn (IKE SA) bằng Diffie-Hellman. Pha 2 thương lượng ESP SA cho dữ liệu thật. Khóa được làm mới định kỳ để giảm thiệt hại nếu bị lộ.",
        focus: ["branch", "hq", "remote"],
        edges: ["rem-hq", "isp-hq"],
        metrics: { over: "IKE ~200 B", mtu: "1500", rtt: "45 ms", tunnels: "1" },
        changes: ["Khóa được thỏa thuận", "SA dữ liệu sẵn sàng"],
        note: "IKEv2 hỗ trợ MOBIKE để đổi địa chỉ khi thiết bị chuyển mạng, hữu ích cho remote access."
      },
      {
        short: "NAT-T & MTU",
        type: "Thực chiến",
        title: "Xuyên NAT và tránh phân mảnh",
        body: "NAT thay địa chỉ/port nên ESP thô bị chặn; <strong>NAT-T</strong> bọc ESP trong UDP 4500. Đóng gói làm gói vượt MTU 1500, gây phân mảnh hoặc mất gói khi cờ DF bật. Router thường <strong>clamp MSS</strong> để TCP không gửi gói quá lớn.",
        focus: ["remote", "isp", "hq"],
        edges: ["rem-isp", "rem-hq"],
        metrics: { over: "ESP+UDP ~80 B", mtu: "1420", rtt: "22 ms", tunnels: "1" },
        changes: ["Đi qua NAT được", "TCP điều chỉnh kích thước"],
        note: "Hiện tượng 'VPN kết nối nhưng tải trang treo' thường do MTU/MSS, không phải do mã hóa."
      },
      {
        short: "Remote access & zero trust",
        type: "Tổng kết",
        title: "IPsec client hay VPN TLS?",
        body: "IPsec remote-access cần client cấu hình sẵn và quyền cao. VPN TLS (như OpenVPN, WireGuard dùng mô hình khác) dễ xuyên NAT hơn và chạy trên cổng 443. Xu hướng <strong>zero trust</strong> bỏ mô hình 'vào mạng là tin' để xác thực từng phiên và từng ứng dụng.",
        focus: ["all"],
        edges: "all",
        metrics: { over: "tùy giao thức", mtu: "1280+", rtt: "18 ms", tunnels: "n phiên" },
        changes: ["Chọn mô hình phù hợp", "Truy cập theo danh tính"],
        note: "Zero trust không loại bỏ mã hóa; nó thu hẹp quyền sau khi đã xác thực, giảm thiệt hại khi bị chiếm tài khoản."
      }
    ]
  };
})();
