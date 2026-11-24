/* NetLab — lộ trình theo Kurose & Ross, 8th edition: 8 chương + phụ lục vận hành */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  /* ------------------------------------------------------------------
     Lộ trình 8 chương bám mục lục sách (bản 8)
     ------------------------------------------------------------------ */
  SL.modules = [
    {
      id: "ch1-internet",
      num: "01",
      title: "Chương 1 · Mạng Internet",
      tone: "blue",
      blurb: "Internet là gì, biên và lõi mạng, chuyển mạch gói, độ trễ và mô hình phân lớp.",
      lessons: ["network-edge-core", "signals-latency", "osi-encapsulation"]
    },
    {
      id: "ch2-application",
      num: "02",
      title: "Chương 2 · Tầng ứng dụng",
      tone: "violet",
      blurb: "HTTP, DNS, email, P2P, socket, CDN — ứng dụng nói chuyện với mạng qua giao thức nào.",
      lessons: ["http-lifecycle", "dns-resolution", "dns-http-https", "email-p2p", "socket-programming", "qos-cloud"]
    },
    {
      id: "ch3-transport",
      num: "03",
      title: "Chương 3 · Tầng giao vận",
      tone: "green",
      blurb: "UDP, truyền tin cậy, cửa sổ trượt, TCP và điều khiển tắc nghẽn.",
      lessons: ["udp-realtime", "reliable-transfer", "tcp-window", "congestion-control"]
    },
    {
      id: "ch4-data-plane",
      num: "04",
      title: "Chương 4 · Tầng mạng: mặt phẳng dữ liệu",
      tone: "yellow",
      blurb: "Địa chỉ IPv4, NAT, IPv6, bên trong router và chuyển tiếp match-plus-action.",
      lessons: ["ip-subnet", "nat-firewall", "ipv6", "router-internals"]
    },
    {
      id: "ch5-control-plane",
      num: "05",
      title: "Chương 5 · Tầng mạng: mặt phẳng điều khiển",
      tone: "coral",
      blurb: "Thuật toán định tuyến, OSPF, BGP, SDN, ICMP và DHCP.",
      lessons: ["routing-ttl", "dhcp-icmp", "routing-algorithms", "ospf-bgp", "sdn-control"]
    },
    {
      id: "ch6-link",
      num: "06",
      title: "Chương 6 · Tầng liên kết & LAN",
      tone: "blue",
      blurb: "Ethernet, ARP, VLAN, CRC, đa truy cập, MPLS, datacenter và một ngày của yêu cầu web.",
      lessons: ["ethernet-arp", "vlan-stp", "error-detection-mac", "datacenter-mpls", "day-in-life", "troubleshooting"]
    },
    {
      id: "ch7-wireless",
      num: "07",
      title: "Chương 7 · Không dây & di động",
      tone: "green",
      blurb: "Wi-Fi, 4G/5G và quản lý di động khi thiết bị đổi mạng liên tục.",
      lessons: ["wifi-csma", "cellular-4g5g", "mobility-management"]
    },
    {
      id: "ch8-security",
      num: "08",
      title: "Chương 8 · Bảo mật mạng",
      tone: "coral",
      blurb: "Mật mã, toàn vẹn, chữ ký số, TLS, IPsec/VPN và các lớp phòng thủ.",
      lessons: ["network-security", "crypto-signatures", "tls-https", "ipsec-vpn"]
    }
  ];

  /* ------------------------------------------------------------------
     Chương 1 — Biên và lõi mạng
     ------------------------------------------------------------------ */
  SL.lessons["network-edge-core"] = {
    id: "network-edge-core",
    module: "ch1-internet",
    title: "Biên và lõi mạng: từ Wi-Fi đến IXP",
    shortTitle: "Biên & lõi mạng",
    subtitle: "Một gói tin rời laptop qua access network, băng qua nhiều ISP và điểm trung chuyển trước khi chạm server ở nước ngoài.",
    blurb: "Access network, phương tiện vật lý, chuyển mạch gói so với chuyển mạch kênh, và cấu trúc mạng của các mạng.",
    duration: "15 phút",
    level: "Nhập môn",
    tags: ["access network", "FTTH", "DOCSIS", "packet switching", "circuit switching", "IXP", "ISP", "statistical multiplexing"],
    metrics: [
      { key: "rate", label: "Tốc độ access", tone: "blue" },
      { key: "rtt", label: "RTT", tone: "violet" },
      { key: "util", label: "Tải lõi", tone: "yellow" },
      { key: "loss", label: "Mất gói", tone: "coral" }
    ],
    nodes: [
      { id: "home", type: "home", x: 40, y: 80, w: 160, h: 66, label: "Nhà bạn", sub: "FTTH 300 Mbps" },
      { id: "access", type: "router", x: 250, y: 80, w: 175, h: 66, label: "ISP access", sub: "OLT · CMTS" },
      { id: "ixp", type: "lb", x: 470, y: 80, w: 175, h: 66, label: "IXP", sub: "peering · 10 Tbps" },
      { id: "tier", type: "router", x: 690, y: 80, w: 170, h: 66, label: "Transit ISP", sub: "Tier 1" },
      { id: "server", type: "server", x: 690, y: 300, w: 170, h: 66, label: "Server đích", sub: "trung tâm dữ liệu" }
    ],
    edges: [
      { id: "h-a", from: "home", to: "access", kind: "request", label: "gói tin" },
      { id: "a-i", from: "access", to: "ixp", kind: "request" },
      { id: "i-t", from: "ixp", to: "tier", kind: "request" },
      { id: "t-s", from: "tier", to: "server", kind: "request", label: "tới đích" },
      { id: "s-t", from: "server", to: "tier", kind: "response", bow: 22, label: "response" }
    ],
    learn: [
      "Phân biệt access network với lõi mạng và trung tâm dữ liệu.",
      "So sánh cáp quang, cáp đồng trục, xDSL và mạng di động.",
      "Hiểu lợi ích của chuyển mạch gói nhờ ghép thống kê.",
      "Nhận ra vì sao đường đi qua nhiều ISP lại phức tạp.",
      "Đọc hành trình end-to-end bằng RTT, tải lõi và mất gói."
    ],
    steps: [
      {
        short: "Vào access network",
        type: "Khởi đầu",
        title: "Chặng đầu tiên: từ nhà ra ISP",
        body: "Máy bạn nối với router gia đình, rồi qua <strong>access network</strong> để tới ISP. Cáp quang FTTH dùng PON chia sợi cho nhiều hộ; mạng cáp truyền hình dùng DOCSIS chung một đường trục; 4G/5G dùng sóng vô tuyến. Access là nơi tốc độ thường thấp hơn lõi.",
        focus: ["home", "access"],
        edges: ["h-a"],
        metrics: { rate: "300 Mbps", rtt: "4 ms", util: "8%", loss: "0%" },
        changes: ["Gói tin được đóng khung tại nhà", "Access network là chặng đầu"],
        note: "Tốc độ quảng cáo là tốc độ access lý thuyết; chia sẻ với hàng xóm có thể làm giảm throughput giờ cao điểm."
      },
      {
        short: "Phương tiện vật lý",
        type: "Khái niệm",
        title: "Quang, đồng, và sóng vô tuyến",
        body: "Mỗi phương tiện đánh đổi tốc độ, khoảng cách và chi phí. Cáp quang đi xa, nhiễu thấp, dung lượng lớn; cáp đồng xoắn rẻ nhưng suy hao nhanh; đồng trục dùng chung cho truyền hình và Internet; sóng vô tuyến tiện di động nhưng chịu nhiễu và chia sẻ.",
        focus: ["access"],
        edges: ["h-a", "a-i"],
        metrics: { rate: "300 Mbps", rtt: "6 ms", util: "12%", loss: "0%" },
        changes: ["Chọn phương tiện theo khoảng cách", "Quang thắng ở tuyến trục"],
        note: "Tốc độ ánh sáng trong sợi quang khoảng 2/3 tốc độ trong chân không — vẫn là yếu tố quyết định độ trễ lan truyền đường dài."
      },
      {
        short: "Store-and-forward",
        type: "Cơ chế",
        title: "Router nhận trọn gói rồi mới chuyển",
        body: "Router trong lõi làm việc theo <strong>store-and-forward</strong>: nhận hết gói, kiểm tra header, tra bảng rồi mới gửi tiếp. Mỗi chặng cộng thêm thời gian truyền và hàng đợi. Nhiều chặng nhỏ thường tốt hơn một chặng rất chậm.",
        focus: ["access", "ixp", "tier"],
        edges: ["h-a", "a-i", "i-t"],
        metrics: { rate: "300 Mbps", rtt: "18 ms", util: "35%", loss: "0%" },
        changes: ["Mỗi router thêm một chặng", "Hàng đợi xuất hiện khi tải tăng"],
        note: "Độ trễ end-to-end là tổng truyền, lan truyền, hàng đợi và xử lý tại từng chặng."
      },
      {
        short: "Gói so với kênh",
        type: "So sánh",
        title: "Ghép thống kê thắng phân bổ cố định",
        body: "Chuyển mạch kênh giữ trước một khe tài nguyên suốt phiên như cuộc gọi điện thoại. Chuyển mạch gói chia dữ liệu thành gói và dùng chung đường khi rảnh. Với 10 người, mỗi người hoạt động 10% thời gian, đường 1 Mbps đủ phục vụ tất cả nếu dùng chuyển mạch gói, còn chuyển mạch kênh cần giữ 10 khe.",
        focus: ["ixp"],
        edges: ["a-i", "i-t"],
        metrics: { rate: "1 Mbps", rtt: "22 ms", util: "62%", loss: "0,2%" },
        changes: ["Tài nguyên chia sẻ theo nhu cầu", "Hiệu quả cao hơn khi lưu lượng bùng nổ"],
        note: "Ghép thống kê hiệu quả nhưng có thể gây hàng đợi và mất gói khi nhiều luồng cùng dồn về một lúc."
      },
      {
        short: "Mạng của các mạng",
        type: "Cấu trúc",
        title: "ISP nhỏ mua transit, ISP lớn peering",
        body: "Internet là <strong>mạng của các mạng</strong>. ISP truy cập nối với ISP khu vực, rồi tới ISP tier-1. Các ISP gặp nhau tại <strong>IXP</strong> để trao đổi lưu lượng trực tiếp (peering) hoặc mua transit. Chính sách thương mại quyết định đường đi, không chỉ khoảng cách địa lý.",
        focus: ["access", "ixp", "tier"],
        edges: ["i-t", "t-s"],
        metrics: { rate: "300 Mbps", rtt: "48 ms", util: "55%", loss: "0,3%" },
        changes: ["Đường đi theo chính sách ISP", "IXP rút ngắn nhiều chặng"],
        note: "Traceroute cho thấy tên miền của từng ISP trên đường đi; đường ngắn về địa lý chưa chắc ngắn về số chặng."
      },
      {
        short: "Tổng kết hành trình",
        type: "Tổng kết",
        title: "Nút thắt nằm ở chặng yếu nhất",
        body: "Trải nghiệm cuối phụ thuộc chặng chậm nhất, không phải chặng nhanh nhất. Access 300 Mbps nhưng lõi tắc nghẽn thì video vẫn giật. Đo từ phía người dùng, tách thời gian access, lõi và server để biết tối ưu ở đâu.",
        focus: ["all"],
        edges: "all",
        metrics: { rate: "290 Mbps", rtt: "42 ms", util: "40%", loss: "0,1%" },
        changes: ["Trải nghiệm ổn định trở lại", "Xác định đúng nút thắt"],
        note: "Bốn câu hỏi: access bao nhiêu, lõi tải bao nhiêu, RTT bao nhiêu, mất gói ở đâu."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 2 — Email và P2P
     ------------------------------------------------------------------ */
  SL.lessons["email-p2p"] = {
    id: "email-p2p",
    module: "ch2-application",
    title: "Email và P2P: đẩy thư, kéo thư, chia sẻ ngang hàng",
    shortTitle: "Email & P2P",
    subtitle: "SMTP đẩy thư giữa các máy chủ, IMAP kéo thư về máy, còn BitTorrent chia tệp giữa những người ngang hàng.",
    blurb: "Hai mô hình ứng dụng đối lập: client-server cho email và peer-to-peer cho chia sẻ tệp — mỗi mô hình có điểm mạnh riêng.",
    duration: "14 phút",
    level: "Nhập môn",
    tags: ["SMTP", "IMAP", "POP3", "MX", "P2P", "BitTorrent", "tracker", "DHT", "tit-for-tat"],
    metrics: [
      { key: "delay", label: "Độ trễ thư", tone: "blue" },
      { key: "servers", label: "Máy chủ", tone: "violet" },
      { key: "peers", label: "Peer", tone: "yellow" },
      { key: "ratio", label: "Tỉ lệ chia sẻ", tone: "coral" }
    ],
    nodes: [
      { id: "alice", type: "client", x: 30, y: 80, w: 160, h: 66, label: "Alice", sub: "mail client" },
      { id: "maila", type: "server", x: 230, y: 80, w: 170, h: 66, label: "SMTP A", sub: "hộp thư alice" },
      { id: "dns", type: "dns", x: 440, y: 80, w: 160, h: 66, label: "DNS", sub: "bản ghi MX" },
      { id: "mailb", type: "server", x: 650, y: 80, w: 170, h: 66, label: "SMTP B", sub: "hộp thư bob" },
      { id: "bob", type: "client", x: 650, y: 300, w: 170, h: 66, label: "Bob", sub: "IMAP · POP3" },
      { id: "tracker", type: "lb", x: 230, y: 300, w: 170, h: 66, label: "Tracker / DHT", sub: "tìm peer" },
      { id: "peers", type: "presence", x: 440, y: 300, w: 160, h: 66, label: "Nhóm peer", sub: "chia sẻ chunk" }
    ],
    edges: [
      { id: "al-ma", from: "alice", to: "maila", kind: "request", label: "SMTP" },
      { id: "ma-dn", from: "maila", to: "dns", kind: "request", label: "MX?" },
      { id: "dn-ma", from: "dns", to: "maila", kind: "response", bow: 22, label: "MX" },
      { id: "ma-mb", from: "maila", to: "mailb", kind: "request", label: "SMTP relay" },
      { id: "mb-bo", from: "mailb", to: "bob", kind: "response", bow: 22, label: "IMAP" },
      { id: "tr-pe", from: "tracker", to: "peers", kind: "data", label: "peer list" },
      { id: "bo-pe", from: "peers", to: "bob", kind: "data", label: "chunk" }
    ],
    learn: [
      "Phân biệt SMTP (đẩy) với IMAP/POP3 (kéo).",
      "Hiểu vai trò bản ghi MX trong định tuyến thư.",
      "Giải thích vì sao email vẫn hoạt động khi người nhận offline.",
      "Mô tả cách tracker/DHT giúp peer tìm nhau.",
      "Hiểu cơ chế tit-for-tat của BitTorrent."
    ],
    steps: [
      {
        short: "Alice gửi thư",
        type: "Khởi đầu",
        title: "SMTP đẩy thư lên máy chủ gửi",
        body: "Khi bấm Gửi, mail client của Alice mở kết nối TCP tới máy chủ SMTP của cô ấy (thường cổng 587 có TLS) và <strong>đẩy</strong> thư lên. Máy chủ nhận trách nhiệm chuyển tiếp, kể cả khi Alice tắt máy ngay sau đó.",
        focus: ["alice", "maila"],
        edges: ["al-ma"],
        metrics: { delay: "0,4 s", servers: "1", peers: "0", ratio: "—" },
        changes: ["Thư nằm trên máy chủ gửi", "Client không cần chờ người nhận online"],
        note: "SMTP là giao thức đẩy (push); người dùng không tải thư trực tiếp sang máy người nhận."
      },
      {
        short: "Tìm máy chủ đích",
        type: "DNS",
        title: "Bản ghi MX chỉ ra máy chủ thư",
        body: "Máy chủ gửi tra DNS bản ghi <strong>MX</strong> của tên miền người nhận để biết chuyển thư tới đâu. MX có thứ tự ưu tiên: máy chủ số nhỏ được thử trước, máy chủ dự phòng đỡ khi máy chính hỏng.",
        focus: ["maila", "dns"],
        edges: ["ma-dn", "dn-ma"],
        metrics: { delay: "0,5 s", servers: "2", peers: "0", ratio: "—" },
        changes: ["Biết địa chỉ máy chủ đích", "Có danh sách dự phòng"],
        note: "Tên miền có thể có nhiều bản ghi MX cùng ưu tiên; thứ tự thử là ngẫu nhiên để chia tải."
      },
      {
        short: "Chuyển tiếp giữa máy chủ",
        type: "Cơ chế",
        title: "Thư nằm trong hàng đợi nếu đích chưa sẵn sàng",
        body: "Máy chủ gửi mở kết nối SMTP tới máy chủ đích, gửi lệnh MAIL FROM, RCPT TO và DATA. Nếu máy đích tắt, thư vào <strong>hàng đợi</strong> và được thử lại theo lịch. Sau vài ngày thất bại, máy chủ gửi trả thư lỗi (bounce).",
        focus: ["maila", "mailb"],
        edges: ["ma-mb"],
        metrics: { delay: "1,2 s", servers: "2", peers: "0", ratio: "—" },
        changes: ["Thư đến hộp thư đích", "Có cơ chế thử lại khi lỗi"],
        note: "SMTP không đảm bảo thư đến ngay; nó đảm bảo nỗ lực chuyển và báo lỗi nếu thất bại."
      },
      {
        short: "Bob kéo thư",
        type: "Truy cập",
        title: "IMAP giữ thư trên máy chủ, POP3 tải về",
        body: "Bob dùng <strong>IMAP</strong> để đồng bộ thư giữa nhiều thiết bị, thư vẫn nằm trên máy chủ; <strong>POP3</strong> thường tải về máy và có thể xóa khỏi máy chủ. Đây là giao thức kéo (pull), tách biệt hoàn toàn với SMTP.",
        focus: ["mailb", "bob"],
        edges: ["mb-bo"],
        metrics: { delay: "1,5 s", servers: "2", peers: "0", ratio: "—" },
        changes: ["Bob đọc được thư", "Nhiều thiết bị đồng bộ nhờ IMAP"],
        note: "Đừng nhầm: SMTP gửi thư; IMAP/POP3 chỉ là cách người dùng lấy thư."
      },
      {
        short: "P2P: tìm peer",
        type: "Mô hình",
        title: "Tracker hoặc DHT giúp peer gặp nhau",
        body: "Trong BitTorrent, tệp được chia thành nhiều <strong>chunk</strong>. Tracker trả danh sách peer đang giữ tệp; mạng DHT phân tán lưu thông tin này mà không cần máy chủ trung tâm. Mỗi peer vừa tải vừa chia sẻ, nên càng đông càng nhanh.",
        focus: ["tracker", "peers"],
        edges: ["tr-pe", "bo-pe"],
        metrics: { delay: "2 s", servers: "0", peers: "24", ratio: "1,0" },
        changes: ["Peer nhận danh sách đối tác", "Không phụ thuộc băng thông một máy chủ"],
        note: "P2P giảm chi phí hạ tầng nhưng khó kiểm soát bản quyền và chất lượng nội dung."
      },
      {
        short: "Tit-for-tat",
        type: "Khuyến khích",
        title: "Chia sẻ để được chia sẻ",
        body: "BitTorrent dùng cơ chế <strong>tit-for-tat</strong>: peer ưu tiên gửi cho ai đang gửi lại mình. Peer chỉ tải mà không chia sẻ bị hạn chế tốc độ. Cơ chế này không cần tin tưởng tập trung mà vẫn giữ mạng hoạt động.",
        focus: ["peers", "bob"],
        edges: ["bo-pe"],
        metrics: { delay: "3 s", servers: "0", peers: "24", ratio: "1,8" },
        changes: ["Peer chia sẻ nhiều được ưu tiên", "Mạng tự cân bằng"],
        note: "Tỉ lệ chia sẻ (ratio) thấp làm giảm tốc độ tải trong nhiều client BitTorrent."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 2 — Lập trình socket
     ------------------------------------------------------------------ */
  SL.lessons["socket-programming"] = {
    id: "socket-programming",
    module: "ch2-application",
    title: "Lập trình socket: ứng dụng nói chuyện với tầng giao vận",
    shortTitle: "Socket UDP/TCP",
    subtitle: "Một ứng dụng mạng chỉ cần vài lời gọi hệ thống: socket, bind, listen, accept, connect, send, recv.",
    blurb: "Socket là cánh cửa giữa tiến trình và mạng; hiểu TCP và UDP ở mức API giúp debug ứng dụng nhanh hơn.",
    duration: "16 phút",
    level: "Trung cấp",
    tags: ["socket", "TCP", "UDP", "bind", "listen", "accept", "connect", "framing", "TIME_WAIT"],
    metrics: [
      { key: "state", label: "Trạng thái", tone: "blue" },
      { key: "calls", label: "Lời gọi", tone: "violet" },
      { key: "rtt", label: "RTT", tone: "yellow" },
      { key: "rate", label: "Thông lượng", tone: "coral" }
    ],
    nodes: [
      { id: "app", type: "client", x: 30, y: 90, w: 155, h: 66, label: "Ứng dụng", sub: "client" },
      { id: "csock", type: "gateway", x: 235, y: 90, w: 165, h: 66, label: "Socket client", sub: "fd · ephemeral port" },
      { id: "ssock", type: "gateway", x: 450, y: 90, w: 165, h: 66, label: "Socket server", sub: "listen :8080" },
      { id: "srv", type: "server", x: 660, y: 90, w: 165, h: 66, label: "Tiến trình server", sub: "accept · xử lý" }
    ],
    edges: [
      { id: "ap-cs", from: "app", to: "csock", kind: "request", label: "socket()" },
      { id: "cs-ss", from: "csock", to: "ssock", kind: "request", label: "TCP segment" },
      { id: "ss-sv", from: "ssock", to: "srv", kind: "request", label: "accept()" },
      { id: "sv-ss", from: "srv", to: "ssock", kind: "response", bow: 22, label: "response" }
    ],
    learn: [
      "Phân biệt socket TCP và UDP qua chuỗi lời gọi.",
      "Hiểu vai trò bind, listen, accept, connect.",
      "Nhận ra TCP là luồng byte, không phải gói có ranh giới.",
      "Biết vì sao cần framing khi tự thiết kế giao thức.",
      "Hiểu TIME_WAIT và lỗi cổng đang bận."
    ],
    steps: [
      {
        short: "Server mở cổng",
        type: "Khởi đầu",
        title: "bind và listen: đăng ký địa chỉ nhận",
        body: "Server tạo socket, <strong>bind</strong> vào địa chỉ IP và cổng (ví dụ 0.0.0.0:8080), rồi gọi <strong>listen</strong> để đánh dấu sẵn sàng nhận kết nối. Kết nối chưa xử lý nằm trong hàng đợi accept.",
        focus: ["srv", "ssock"],
        edges: ["ss-sv"],
        metrics: { state: "LISTEN", calls: "3", rtt: "—", rate: "0" },
        changes: ["Server sẵn sàng nhận kết nối", "Chưa có dữ liệu ứng dụng"],
        note: "Cổng dưới 1024 thường cần quyền quản trị; container và systemd có thể cấp quyền riêng."
      },
      {
        short: "Client kết nối",
        type: "Bắt tay",
        title: "connect gửi SYN và chờ bắt tay xong",
        body: "Client tạo socket rồi gọi <strong>connect</strong> tới IP:port của server. Hệ điều hành thực hiện bắt tay ba bước TCP; connect trả về khi kết nối đã thiết lập. Cổng nguồn được cấp tự động (ephemeral) để phân biệt các kết nối.",
        focus: ["csock", "ssock"],
        edges: ["cs-ss"],
        metrics: { state: "ESTABLISHED", calls: "4", rtt: "24 ms", rate: "0" },
        changes: ["Có kết nối logic hai chiều", "Mỗi kết nối có bộ 4 giá trị"],
        note: "TCP được xác định bởi bộ 4: IP nguồn, cổng nguồn, IP đích, cổng đích."
      },
      {
        short: "accept tạo kết nối",
        type: "Cơ chế",
        title: "Server nhận một socket mới cho mỗi client",
        body: "Khi gọi <strong>accept</strong>, server nhận một socket mới đại diện cho kết nối cụ thể, tách khỏi socket đang listen. Nhờ vậy server phục vụ nhiều client song song, mỗi kết nối có trạng thái riêng.",
        focus: ["ssock", "srv"],
        edges: ["ss-sv", "sv-ss"],
        metrics: { state: "ESTABLISHED", calls: "5", rtt: "25 ms", rate: "1 KB" },
        changes: ["Có socket riêng cho client", "Server có thể xử lý song song"],
        note: "Quên accept trong vòng lặp khiến hàng đợi đầy và client bị timeout dù server còn sống."
      },
      {
        short: "Luồng byte",
        type: "Cảnh báo",
        title: "TCP không giữ ranh giới tin nhắn",
        body: "send/recv làm việc trên <strong>luồng byte</strong>. Một lần recv có thể nhận nửa tin nhắn hoặc hai tin nhắn gộp lại. Giao thức ứng dụng phải tự đóng khung: gửi độ dài trước, hoặc dùng dấu phân cách rõ ràng.",
        focus: ["app", "csock", "ssock"],
        edges: ["cs-ss"],
        metrics: { state: "STREAM", calls: "12", rtt: "26 ms", rate: "94 Mbps" },
        changes: ["Dữ liệu đến đúng thứ tự", "Biên tin nhắn do ứng dụng tự quy định"],
        note: "Đây là lỗi kinh điển của ứng dụng tự viết giao thức: giả định một send bằng một recv."
      },
      {
        short: "Biến thể UDP",
        type: "So sánh",
        title: "UDP: sendto và recvfrom, không bắt tay",
        body: "Với UDP, server bind rồi <strong>recvfrom</strong>; client <strong>sendto</strong> thẳng tới địa chỉ đích. Không có kết nối, không truyền lại, nhưng mỗi datagram giữ nguyên ranh giới. DNS, game và media thời gian thực thường chọn UDP.",
        focus: ["csock", "ssock"],
        edges: ["cs-ss"],
        metrics: { state: "DATAGRAM", calls: "2", rtt: "26 ms", rate: "1 gói" },
        changes: ["Không cần bắt tay", "Có thể mất gói mà ứng dụng không biết"],
        note: "Datagram lớn hơn MTU có thể bị phân mảnh IP; mất một mảnh là mất cả datagram."
      },
      {
        short: "Đóng kết nối",
        type: "Tổng kết",
        title: "FIN, TIME_WAIT và lỗi cổng bận",
        body: "Đóng TCP gửi FIN và chờ ACK; bên chủ động đóng vào <strong>TIME_WAIT</strong> khoảng 2×MSL để bắt gói cũ còn sót. Khởi động lại server quá nhanh có thể gặp EADDRINUSE; SO_REUSEADDR giúp tái sử dụng cổng an toàn trong nhiều trường hợp.",
        focus: ["all"],
        edges: "all",
        metrics: { state: "CLOSED", calls: "18", rtt: "—", rate: "0" },
        changes: ["Tài nguyên được giải phóng", "Kết nối cũ không lẫn với kết nối mới"],
        note: "TIME_WAIT không phải rò rỉ; nó bảo vệ khỏi việc nhầm gói của kết nối cũ sang kết nối mới."
      }
    ]
  };
})();
