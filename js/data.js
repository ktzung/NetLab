/* NetLab — dữ liệu chương 1–2 */
window.NETLAB = (function () {
  "use strict";

  const modules = [
    {
      id: "foundation",
      num: "01",
      title: "Nền tảng truyền thông",
      tone: "blue",
      blurb: "Tín hiệu, băng thông, độ trễ và cách dữ liệu được đóng gói trước khi rời máy.",
      lessons: ["signals-latency", "osi-encapsulation"]
    },
    {
      id: "layer2-3",
      num: "02",
      title: "Lớp liên kết & mạng",
      tone: "coral",
      blurb: "Ethernet, switch, ARP, địa chỉ IP, subnet, gateway và đường đi của gói tin.",
      lessons: ["ethernet-arp", "ip-subnet", "routing-ttl"]
    },
    {
      id: "transport-app",
      num: "03",
      title: "Giao vận & ứng dụng",
      tone: "green",
      blurb: "TCP, UDP, DNS, HTTP và HTTPS — từ kết nối tin cậy đến trang web hiện ra.",
      lessons: ["tcp-window", "udp-realtime", "dns-http-https"]
    },
    {
      id: "operations",
      num: "04",
      title: "Kết nối & vận hành",
      tone: "violet",
      blurb: "NAT, firewall, port forwarding và quy trình chẩn đoán sự cố theo từng lớp.",
      lessons: ["nat-firewall", "troubleshooting"]
    }
  ];

  const lessons = {};

  /* ------------------------------------------------------------------
     Bài 1 — Tín hiệu, băng thông và độ trễ
     ------------------------------------------------------------------ */
  lessons["signals-latency"] = {
    id: "signals-latency",
    module: "foundation",
    title: "Tín hiệu, băng thông và độ trễ",
    shortTitle: "Băng thông & độ trễ",
    subtitle: "Vì sao mạng 1 Gbps vẫn có thể chậm? Phân biệt băng thông, throughput, độ trễ lan truyền và hàng đợi.",
    blurb: "Bốn đại lượng quyết định trải nghiệm mạng, và lý do “mua thêm băng thông” không phải lúc nào cũng nhanh hơn.",
    duration: "12 phút",
    level: "Nhập môn",
    tags: ["bandwidth", "latency", "throughput", "jitter", "queue", "băng thông", "độ trễ"],
    metrics: [
      { key: "goodput", label: "Throughput", tone: "blue" },
      { key: "rtt", label: "RTT", tone: "violet" },
      { key: "queue", label: "Độ trễ hàng đợi", tone: "yellow" },
      { key: "loss", label: "Mất gói", tone: "coral" }
    ],
    nodes: [
      { id: "sender", type: "client", x: 50, y: 210, w: 165, h: 64, label: "Máy gửi", sub: "ứng dụng tạo dữ liệu" },
      { id: "link", type: "router", x: 360, y: 210, w: 180, h: 64, label: "Đường truyền", sub: "100 Mbps · 20 ms" },
      { id: "receiver", type: "server", x: 680, y: 210, w: 170, h: 64, label: "Máy nhận", sub: "nhận và xử lý" }
    ],
    edges: [
      { id: "s-l", from: "sender", to: "link", kind: "request", label: "gửi" },
      { id: "l-r", from: "link", to: "receiver", kind: "request" },
      { id: "r-l", from: "receiver", to: "link", kind: "response", bow: 24 },
      { id: "l-s", from: "link", to: "sender", kind: "response", bow: 24, label: "ACK" }
    ],
    learn: [
      "Phân biệt băng thông (độ rộng ống) với throughput thực tế.",
      "Tính độ trễ gồm truyền, lan truyền, hàng đợi và xử lý.",
      "Nhận ra nút thắt do hàng đợi khi tải vượt năng lực.",
      "Hiểu vì sao mất gói làm throughput giảm mạnh."
    ],
    steps: [
      {
        short: "Dữ liệu rời máy gửi",
        type: "Khởi đầu",
        title: "Một tệp bắt đầu rời máy gửi",
        body: "Ứng dụng chia dữ liệu thành các gói. Mỗi gói cần thời gian để đưa lên đường truyền, đi qua mạng và được xác nhận. Trước khi đo bất cứ thứ gì, hãy xác định rõ đang đo <strong>bao nhiêu dữ liệu trong bao lâu</strong>.",
        focus: ["sender"],
        edges: ["s-l"],
        metrics: { goodput: "0 Mbps", rtt: "—", queue: "0 ms", loss: "0%" },
        changes: ["Dữ liệu được chia thành gói", "Chưa có gói nào được xác nhận"],
        note: "Đơn vị cẩn thận: Mbps là megabit/giây, MB/s là megabyte/giây. 100 Mbps ≈ 12,5 MB/s."
      },
      {
        short: "Băng thông là gì",
        type: "Khái niệm",
        title: "Băng thông chỉ là năng lực tối đa",
        body: "Đường truyền 100 Mbps không có nghĩa tệp luôn chạy 100 Mbps. Đó là <strong>trần lý thuyết</strong> khi đường truyền rảnh và chỉ có một luồng. Throughput thực còn phụ thuộc giao thức, mất gói, độ trễ và ứng dụng đầu cuối.",
        focus: ["sender", "link", "receiver"],
        edges: ["s-l", "l-r"],
        metrics: { goodput: "92 Mbps", rtt: "40 ms", queue: "0 ms", loss: "0%" },
        changes: ["Đường truyền rảnh", "Gói đi liên tục"],
        note: "Băng thông giống số làn đường; throughput giống số xe thực tế qua được mỗi giây."
      },
      {
        short: "Độ trễ lan truyền",
        type: "Thành phần",
        title: "Tín hiệu vẫn cần thời gian để đi",
        body: "Độ trễ lan truyền phụ thuộc khoảng cách và tốc độ tín hiệu, không phụ thuộc băng thông. Gói nhỏ đi 10.000 km vẫn mất hàng chục mili-giây. Đây là lý do tăng băng thông không làm một yêu cầu DNS - HTTP ngắn nhanh hơn.",
        focus: ["link"],
        edges: ["s-l", "l-r"],
        metrics: { goodput: "91 Mbps", rtt: "42 ms", queue: "0 ms", loss: "0%" },
        changes: ["RTT ổn định theo khoảng cách", "Băng thông không đổi"],
        note: "RTT = thời gian khứ hồi. Một yêu cầu TCP thường cần ít nhất một RTT trước khi gửi dữ liệu."
      },
      {
        short: "Hàng đợi hình thành",
        type: "Cảnh báo",
        title: "Khi lưu lượng đến nhanh hơn khả năng phục vụ",
        body: "Nếu nhiều luồng cùng đổ vào một nút, gói phải xếp hàng. Hàng đợi làm RTT tăng vọt dù băng thông danh nghĩa vẫn đủ. Đây là <strong>bufferbloat</strong> — độ trễ tăng trong khi tốc độ đo vẫn đẹp.",
        focus: ["link"],
        edges: ["s-l", "l-r", "r-l"],
        metrics: { goodput: "88 Mbps", rtt: "96 ms", queue: "54 ms", loss: "0%" },
        warn: ["link"],
        changes: ["Hàng đợi tại nút tăng", "RTT tăng mạnh"],
        note: "Đo cả RTT dưới tải, không chỉ tốc độ tải xuống. Một đường 1 Gbps có thể vẫn gọi video bị lag."
      },
      {
        short: "Tràn hàng đợi",
        type: "Sự cố",
        title: "Hàng đợi đầy thì gói bị bỏ",
        body: "Khi bộ đệm đầy, nút mạng phải loại gói. Với TCP, mất gói bị hiểu là tín hiệu tắc nghẽn: cửa sổ gửi giảm, tốc độ tụt rồi mới tăng lại. Vì vậy mất gói ảnh hưởng throughput mạnh hơn nhiều so với con số phần trăm nhỏ.",
        focus: ["link"],
        edges: ["s-l", "l-r"],
        metrics: { goodput: "61 Mbps", rtt: "148 ms", queue: "102 ms", loss: "1,8%" },
        warn: ["link"],
        changes: ["Gói bị loại tại bộ đệm", "TCP giảm tốc độ gửi"],
        note: "Mất gói và độ trễ cao thường đi cùng nhau. Đừng chỉ nhìn một chỉ số."
      },
      {
        short: "Throughput thực",
        type: "Tổng kết",
        title: "Throughput là kết quả cuối cùng",
        body: "Sau khi bỏ overhead, xác nhận, retransmission và hàng đợi, dữ liệu hữu ích đến đích mới là <strong>goodput</strong>. Tối ưu mạng là tối ưu trải nghiệm đầu cuối, không phải chạy theo con số trên hợp đồng.",
        focus: ["all"],
        edges: "all",
        metrics: { goodput: "86 Mbps", rtt: "44 ms", queue: "6 ms", loss: "0,2%" },
        changes: ["Tải ổn định trở lại", "Goodput gần băng thông thực"],
        note: "Bốn câu hỏi chẩn đoán: nút thắt ở đâu, hàng đợi bao lâu, mất gói bao nhiêu, ứng dụng có chờ RTT không?"
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 2 — OSI và đóng gói
     ------------------------------------------------------------------ */
  lessons["osi-encapsulation"] = {
    id: "osi-encapsulation",
    module: "foundation",
    title: "Mô hình OSI và đóng gói dữ liệu",
    shortTitle: "OSI & đóng gói",
    subtitle: "Theo dấu một thông điệp từ ứng dụng xuống dây cáp: mỗi lớp thêm header gì và địa chỉ nào được dùng?",
    blurb: "Mô hình 7 lớp không phải để học thuộc; nó là bản đồ chẩn đoán để biết lỗi đang nằm ở đâu.",
    duration: "14 phút",
    level: "Nhập môn",
    tags: ["OSI", "TCP/IP", "encapsulation", "PDU", "header", "đóng gói", "mô hình"],
    metrics: [
      { key: "pdu", label: "Đơn vị dữ liệu", tone: "blue" },
      { key: "header", label: "Header cộng thêm", tone: "yellow" },
      { key: "address", label: "Địa chỉ đang dùng", tone: "violet" },
      { key: "scope", label: "Phạm vi", tone: "green" }
    ],
    nodes: [
      { id: "app", type: "book", x: 40, y: 38, w: 185, h: 66, label: "L7 · Ứng dụng", sub: "HTTP / DNS" },
      { id: "transport", type: "queue", x: 40, y: 148, w: 185, h: 66, label: "L4 · Giao vận", sub: "TCP / UDP + port" },
      { id: "network", type: "router", x: 40, y: 258, w: 185, h: 66, label: "L3 · Mạng", sub: "IP + địa chỉ IP" },
      { id: "link", type: "lb", x: 40, y: 368, w: 185, h: 66, label: "L2 · Liên kết", sub: "Ethernet + MAC" },
      { id: "wire", type: "cdn", x: 370, y: 368, w: 175, h: 66, label: "L1 · Vật lý", sub: "bit trên dây / sóng" },
      { id: "receiver", type: "server", x: 675, y: 368, w: 185, h: 66, label: "Máy nhận", sub: "bóc header ngược lại" }
    ],
    edges: [
      { id: "a-t", from: "app", to: "transport", kind: "request", label: "segment" },
      { id: "t-n", from: "transport", to: "network", kind: "request", label: "packet" },
      { id: "n-l", from: "network", to: "link", kind: "request", label: "frame" },
      { id: "l-w", from: "link", to: "wire", kind: "data", label: "bit" },
      { id: "w-r", from: "wire", to: "receiver", kind: "request", label: "nhận" }
    ],
    learn: [
      "Gọi đúng tên PDU ở từng lớp: data, segment, packet, frame, bit.",
      "Biết header nào do lớp nào thêm vào và địa chỉ nào được dùng.",
      "Hiểu đóng gói và bóc gói đối xứng ở hai đầu.",
      "Dùng mô hình phân lớp để khoanh vùng sự cố."
    ],
    steps: [
      {
        short: "Dữ liệu ứng dụng",
        type: "Khởi đầu",
        title: "Lớp ứng dụng tạo thông điệp",
        body: "Trình duyệt tạo yêu cầu HTTP. Ở lớp này chưa có địa chỉ IP hay MAC; chỉ có nội dung và giao thức ứng dụng. Đây là PDU gốc trước khi bất kỳ header nào được thêm vào.",
        focus: ["app"],
        edges: [],
        metrics: { pdu: "Data", header: "0 B", address: "Tên miền / URL", scope: "Đầu cuối" },
        changes: ["Thông điệp HTTP được tạo", "Chưa có header mạng"],
        note: "Lớp 5–7 thường được gộp thành “lớp ứng dụng” trong mô hình TCP/IP."
      },
      {
        short: "Lớp giao vận",
        type: "Đóng gói",
        title: "TCP thêm port và số thứ tự",
        body: "Lớp giao vận bọc dữ liệu thành <strong>segment</strong>, thêm port nguồn/đích, số thứ tự và checksum. Port giúp máy nhận biết ứng dụng nào cần nhận dữ liệu. TCP còn chịu trách nhiệm tin cậy và kiểm soát luồng.",
        focus: ["app", "transport"],
        edges: ["a-t"],
        metrics: { pdu: "Segment", header: "20–60 B", address: "Port 443 → 51000", scope: "Đầu cuối" },
        changes: ["Thêm TCP header", "Xác định tiến trình nhận"],
        note: "Segment của TCP; datagram của UDP. Cả hai đều dùng port."
      },
      {
        short: "Lớp mạng",
        type: "Đóng gói",
        title: "IP thêm địa chỉ logic",
        body: "IP bọc segment thành <strong>packet</strong>, thêm địa chỉ nguồn/đích và trường TTL. Địa chỉ IP cho phép gói đi qua nhiều mạng khác nhau. Router chỉ cần đọc header IP, không cần quan tâm nội dung TCP bên trong.",
        focus: ["transport", "network"],
        edges: ["t-n"],
        metrics: { pdu: "Packet", header: "+20 B IP", address: "IP nguồn → đích", scope: "Toàn mạng" },
        changes: ["Thêm IP header", "TTL bắt đầu giảm tại router"],
        note: "Địa chỉ IP là địa chỉ logic, có thể thay đổi khi máy di chuyển mạng."
      },
      {
        short: "Lớp liên kết",
        type: "Đóng gói",
        title: "Ethernet thêm MAC và FCS",
        body: "Packet được đóng thành <strong>frame</strong> Ethernet với MAC nguồn/đích và mã kiểm tra FCS. MAC chỉ có ý nghĩa trong một miền liên kết; khi qua router, frame bị bóc và tạo frame mới cho chặng tiếp theo.",
        focus: ["network", "link"],
        edges: ["n-l"],
        metrics: { pdu: "Frame", header: "+14 B MAC", address: "MAC nguồn → đích", scope: "Một chặng" },
        changes: ["Thêm Ethernet header", "MAC chỉ dùng trong LAN"],
        note: "Đừng nhầm địa chỉ IP đích của gói với MAC đích của frame. MAC đích có thể là gateway, không phải server cuối."
      },
      {
        short: "Bit trên đường truyền",
        type: "Vật lý",
        title: "Frame biến thành tín hiệu",
        body: "Lớp vật lý mã hóa frame thành bit và tín hiệu điện/quang/sóng. Tại đây băng thông, suy hao, nhiễu và khoảng cách trở thành các giới hạn thực tế. Lỗi vật lý thường biểu hiện thành mất frame hoặc CRC lỗi.",
        focus: ["link", "wire"],
        edges: ["l-w"],
        metrics: { pdu: "Bit", header: "—", address: "Không", scope: "Một chặng" },
        changes: ["Frame được mã hóa", "Tín hiệu đi qua môi trường"],
        note: "Wi-Fi chia sẻ môi trường; cáp đồng chịu nhiễu điện từ; cáp quang ít nhiễu hơn nhưng vẫn có suy hao."
      },
      {
        short: "Bóc gói tại đích",
        type: "Tổng kết",
        title: "Máy nhận bóc header theo thứ tự ngược",
        body: "Máy nhận kiểm tra FCS, bỏ Ethernet header, kiểm tra IP, bỏ IP header, kiểm tra TCP và chuyển dữ liệu đến đúng ứng dụng theo port. Quá trình này đối xứng với lúc đóng gói — mỗi lớp mở đúng “phong bì” của mình.",
        focus: ["wire", "receiver"],
        edges: ["w-r"],
        metrics: { pdu: "Data", header: "0 B còn lại", address: "Port 443", scope: "Ứng dụng" },
        changes: ["Header bị bóc lần lượt", "Dữ liệu đến đúng tiến trình"],
        note: "Khi chẩn đoán, hỏi: lỗi này thuộc lớp nào? Cáp (L1), MAC (L2), IP (L3), port (L4) hay ứng dụng (L7)?"
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 3 — Ethernet, switch và ARP
     ------------------------------------------------------------------ */
  lessons["ethernet-arp"] = {
    id: "ethernet-arp",
    module: "layer2-3",
    title: "Ethernet, switch và ARP",
    shortTitle: "Ethernet & ARP",
    subtitle: "Làm sao switch biết chuyển frame đến đúng cổng? Và vì sao ARP phải quảng bá trước khi gửi unicast?",
    blurb: "Một LAN nhìn có vẻ đơn giản, nhưng MAC table và ARP quyết định gói tin có đến đúng máy hay không.",
    duration: "15 phút",
    level: "Cơ bản",
    tags: ["Ethernet", "switch", "ARP", "MAC", "broadcast", "LAN", "unicast"],
    metrics: [
      { key: "arp", label: "ARP cache", tone: "yellow" },
      { key: "table", label: "MAC table", tone: "blue" },
      { key: "scope", label: "Phạm vi gửi", tone: "violet" },
      { key: "frame", label: "Khung hiện tại", tone: "green" }
    ],
    nodes: [
      { id: "pcA", type: "client", x: 45, y: 72, w: 175, h: 66, label: "PC-A", sub: "192.168.1.10" },
      { id: "pcB", type: "client", x: 45, y: 350, w: 175, h: 66, label: "PC-B", sub: "192.168.1.11" },
      { id: "switch", type: "lb", x: 360, y: 205, w: 180, h: 70, label: "Switch", sub: "4 cổng · L2" },
      { id: "router", type: "router", x: 690, y: 205, w: 170, h: 70, label: "Gateway", sub: "192.168.1.1" }
    ],
    edges: [
      { id: "a-sw", from: "pcA", to: "switch", kind: "request", label: "frame" },
      { id: "sw-a", from: "switch", to: "pcA", kind: "response", bow: 28 },
      { id: "b-sw", from: "pcB", to: "switch", kind: "request" },
      { id: "sw-b", from: "switch", to: "pcB", kind: "response", bow: 28, label: "unicast" },
      { id: "sw-r", from: "switch", to: "router", kind: "data", label: "ra ngoài LAN" },
      { id: "r-sw", from: "router", to: "switch", kind: "response", bow: 28 }
    ],
    learn: [
      "Switch học MAC nguồn và chuyển frame theo MAC đích.",
      "ARP ánh xạ IP sang MAC trong cùng subnet.",
      "Broadcast chỉ lan trong một miền quảng bá.",
      "Khi đích ngoài subnet, MAC đích là gateway chứ không phải server."
    ],
    steps: [
      {
        short: "PC-A cần gửi",
        type: "Khởi đầu",
        title: "PC-A có IP đích nhưng chưa có MAC",
        body: "PC-A muốn gửi đến 192.168.1.11. Nó so sánh network/subnet mask và thấy đích cùng LAN. Để đóng frame Ethernet, PC-A cần <strong>MAC đích</strong> — nhưng bảng ARP đang trống.",
        focus: ["pcA"],
        edges: [],
        metrics: { arp: "Trống", table: "Trống", scope: "Chưa gửi", frame: "Chưa tạo" },
        changes: ["Xác định đích cùng subnet", "Thiếu MAC đích"],
        note: "IP đích đã biết; MAC đích chưa biết. ARP giải quyết khoảng trống này."
      },
      {
        short: "ARP broadcast",
        type: "Quảng bá",
        title: "“Ai có 192.168.1.11?”",
        body: "PC-A gửi ARP request dạng broadcast đến FF:FF:FF:FF:FF:FF. Switch chuyển frame ra mọi cổng trừ cổng nhận. Chỉ máy có IP được hỏi mới trả lời; các máy khác bỏ qua.",
        focus: ["pcA", "switch", "pcB"],
        edges: ["a-sw", "b-sw"],
        metrics: { arp: "Đang hỏi", table: "Học MAC-A", scope: "Broadcast", frame: "ARP request" },
        changes: ["Frame đi đến mọi cổng", "Switch học vị trí MAC-A"],
        note: "Broadcast domain càng lớn thì ARP càng nhiều. VLAN chia nhỏ miền quảng bá."
      },
      {
        short: "ARP reply",
        type: "Unicast",
        title: "PC-B trả lời trực tiếp",
        body: "PC-B gửi ARP reply unicast về PC-A kèm MAC của mình. PC-A lưu cặp IP–MAC vào ARP cache. Từ giờ frame có thể được gửi trực tiếp, không cần hỏi lại cho đến khi cache hết hạn.",
        focus: ["pcA", "pcB"],
        edges: ["b-sw", "sw-a"],
        metrics: { arp: "Đã có MAC-B", table: "MAC-A, MAC-B", scope: "Unicast", frame: "ARP reply" },
        changes: ["ARP cache được cập nhật", "Switch học thêm MAC-B"],
        note: "ARP cache có thời gian sống. Khi đổi card mạng hoặc IP, cache cũ có thể gây lỗi tạm thời."
      },
      {
        short: "Switch chuyển frame",
        type: "Chuyển mạch",
        title: "Switch chỉ gửi ra đúng cổng",
        body: "PC-A gửi frame unicast đến MAC-B. Switch tra MAC table và chuyển frame chỉ ra cổng của PC-B. Đây là điểm khác biệt cốt lõi so với hub: hub phát mọi frame ra mọi cổng, switch học và lọc.",
        focus: ["pcA", "switch", "pcB"],
        edges: ["a-sw", "sw-b"],
        metrics: { arp: "Đã có MAC-B", table: "Đủ 2 thiết bị", scope: "Unicast", frame: "Ethernet data" },
        changes: ["Frame chỉ đi ra một cổng", "Không làm phiền máy khác"],
        note: "Nếu switch chưa biết MAC đích, nó tạm thời flood frame ra mọi cổng — gọi là unknown unicast."
      },
      {
        short: "Đích ngoài subnet",
        type: "Gateway",
        title: "Ra ngoài LAN thì MAC đích là gateway",
        body: "Khi PC-A gửi đến 203.0.113.10, địa chỉ này khác subnet. PC-A vẫn đặt <strong>IP đích là server</strong>, nhưng MAC đích là gateway 192.168.1.1. Gateway nhận frame, bóc ra và định tuyến packet tiếp.",
        focus: ["pcA", "switch", "router"],
        edges: ["a-sw", "sw-r"],
        metrics: { arp: "MAC gateway", table: "Đã học gateway", scope: "Unicast", frame: "MAC đích = gateway" },
        changes: ["IP đích giữ nguyên", "MAC đích đổi thành gateway"],
        note: "Đây là câu hỏi kinh điển: IP đích và MAC đích không nhất thiết giống nhau."
      },
      {
        short: "Tổng kết LAN",
        type: "Tổng kết",
        title: "Hai địa chỉ, hai phạm vi",
        body: "IP đưa gói đi xuyên mạng; MAC đưa frame đi trong một chặng. ARP nối hai thế giới đó bằng cách hỏi MAC từ IP. Hiểu hai lớp này giúp phân biệt lỗi “không ping được gateway” với lỗi “không phân giải được tên”.",
        focus: ["all"],
        edges: "all",
        metrics: { arp: "Ổn định", table: "Đầy đủ", scope: "LAN + gateway", frame: "Đúng đích" },
        changes: ["Frame và packet phối hợp", "Broadcast chỉ trong LAN"],
        note: "Miền quảng bá kết thúc ở router. Router không chuyển tiếp broadcast ARP."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 4 — IP, subnet và default gateway
     ------------------------------------------------------------------ */
  lessons["ip-subnet"] = {
    id: "ip-subnet",
    module: "layer2-3",
    title: "IP, subnet và default gateway",
    shortTitle: "IP & subnet",
    subtitle: "Đọc một địa chỉ IP kèm prefix, xác định network, broadcast, số host và khi nào phải đi qua gateway.",
    blurb: "Subnet mask không phải mẹo thi; nó là cách máy quyết định “đích này ở gần hay ở xa”.",
    duration: "16 phút",
    level: "Cơ bản",
    tags: ["IP", "subnet", "CIDR", "netmask", "gateway", "IPv4", "broadcast", "host"],
    metrics: [
      { key: "network", label: "Network", tone: "blue" },
      { key: "hosts", label: "Host khả dụng", tone: "green" },
      { key: "decide", label: "Quyết định", tone: "violet" },
      { key: "path", label: "Đường đi", tone: "coral" }
    ],
    nodes: [
      { id: "lan", type: "gateway", x: 45, y: 70, w: 190, h: 72, label: "LAN", sub: "192.168.1.0/24" },
      { id: "switch", type: "lb", x: 355, y: 70, w: 170, h: 72, label: "Switch", sub: "kết nối các host" },
      { id: "router", type: "router", x: 355, y: 315, w: 170, h: 72, label: "Default gateway", sub: "192.168.1.1" },
      { id: "web", type: "server", x: 675, y: 315, w: 180, h: 72, label: "Web server", sub: "203.0.113.10" }
    ],
    edges: [
      { id: "lan-sw", from: "lan", to: "switch", kind: "request", label: "host → host" },
      { id: "sw-r", from: "switch", to: "router", kind: "request", label: "đích xa" },
      { id: "r-web", from: "router", to: "web", kind: "data", label: "Internet" },
      { id: "web-r", from: "web", to: "router", kind: "response", bow: 28 },
      { id: "r-sw", from: "router", to: "switch", kind: "response", bow: 28 },
      { id: "sw-lan", from: "switch", to: "lan", kind: "response", bow: 28 }
    ],
    learn: [
      "Tách một IPv4 thành phần network và phần host.",
      "Tính network, broadcast và số host khả dụng từ prefix.",
      "So sánh đích với subnet để quyết định gửi trực tiếp hay qua gateway.",
      "Hiểu vai trò của default gateway và NAT ở rìa mạng."
    ],
    steps: [
      {
        short: "Cấu trúc IPv4",
        type: "Khái niệm",
        title: "32 bit chia thành network và host",
        body: "IPv4 có 32 bit, thường viết thành bốn octet. Subnet mask cho biết bao nhiêu bit đầu là <strong>network</strong>, phần còn lại là <strong>host</strong>. Cùng network thì gửi trực tiếp; khác network thì cần gateway.",
        focus: ["lan"],
        edges: [],
        metrics: { network: "192.168.1.0/24", hosts: "254", decide: "—", path: "—" },
        changes: ["Xác định prefix /24", "Phần host còn 8 bit"],
        note: "/24 tương đương mask 255.255.255.0. 24 bit network, 8 bit host."
      },
      {
        short: "Đếm host",
        type: "Tính toán",
        title: "2^8 địa chỉ, trừ network và broadcast",
        body: "Với /24 có 256 địa chỉ. Địa chỉ đầu là network, địa chỉ cuối là broadcast, nên còn 254 host dùng được. Với /25 thì mỗi nửa chỉ còn 126 host — chia subnet là đánh đổi địa chỉ lấy khả năng quản lý.",
        focus: ["lan"],
        edges: [],
        metrics: { network: "192.168.1.0", hosts: "254", decide: "Cùng subnet", path: "Trực tiếp" },
        changes: ["Network = .0", "Broadcast = .255"],
        note: "Công thức host khả dụng: 2^(32−prefix) − 2. Với /31 và /32 có ngoại lệ cho point-to-point."
      },
      {
        short: "Cùng hay khác subnet",
        type: "Quyết định",
        title: "Máy so sánh network của đích",
        body: "Máy lấy IP đích AND subnet mask rồi so với network của mình. Nếu giống, gửi trực tiếp trong LAN. Nếu khác, gửi đến default gateway. Đây là quyết định xảy ra trước khi ARP cho đích cuối.",
        focus: ["lan", "router"],
        edges: ["lan-sw"],
        metrics: { network: "192.168.1.0/24", hosts: "254", decide: "10.0.0.5 → khác", path: "Qua gateway" },
        changes: ["So sánh network", "Phát hiện đích ngoài LAN"],
        note: "Sai subnet mask khiến máy tưởng hàng xóm là ở xa, hoặc ngược lại — lỗi rất khó đoán."
      },
      {
        short: "Đóng frame cho gateway",
        type: "Đóng gói",
        title: "IP đích giữ nguyên, MAC đích là gateway",
        body: "Khi gửi ra ngoài, packet vẫn ghi IP đích là server. Nhưng frame Ethernet ghi MAC đích là gateway. Gateway nhận frame, bóc Ethernet, tra bảng định tuyến rồi tạo frame mới cho chặng tiếp theo.",
        focus: ["lan", "switch", "router"],
        edges: ["lan-sw", "sw-r"],
        metrics: { network: "192.168.1.0/24", hosts: "254", decide: "Ngoài subnet", path: "Host → gateway" },
        changes: ["MAC đích = MAC gateway", "IP đích không đổi"],
        note: "Nếu gateway sai hoặc không tồn tại, máy vẫn có IP nhưng không ra được ngoài LAN."
      },
      {
        short: "Định tuyến và NAT",
        type: "Ra Internet",
        title: "Router chọn đường, NAT đổi địa chỉ",
        body: "Router dùng bảng định tuyến để chọn chặng tiếp theo. Ở mạng gia đình, NAT thường đổi IP nguồn riêng thành IP công cộng để nhiều thiết bị dùng chung một đường Internet. IP đích công cộng được giữ nguyên.",
        focus: ["router", "web"],
        edges: ["r-web"],
        metrics: { network: "192.168.1.0/24", hosts: "254", decide: "Ngoài subnet", path: "Gateway → Internet" },
        changes: ["Packet rời LAN", "NAT đổi IP nguồn"],
        note: "NAT che giấu địa chỉ riêng, nhưng không thay thế firewall và không phải lớp bảo mật tuyệt đối."
      },
      {
        short: "Phản hồi quay về",
        type: "Tổng kết",
        title: "Chiều về cũng phải có đường",
        body: "Server trả lời về IP công cộng; router dùng bảng NAT để chuyển tiếp về đúng máy trong LAN. Nếu ping ra ngoài được nhưng không nhận được phản hồi, hãy nghi ngờ NAT, firewall hoặc route chiều về.",
        focus: ["all"],
        edges: "all",
        metrics: { network: "192.168.1.0/24", hosts: "254", decide: "Đúng gateway", path: "Khứ hồi đủ" },
        changes: ["Phản hồi về đúng host", "Kết nối hoàn tất"],
        note: "Kiểm tra cả hai chiều. Một chiều đi được không chứng minh chiều về được."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 5 — Định tuyến và TTL
     ------------------------------------------------------------------ */
  lessons["routing-ttl"] = {
    id: "routing-ttl",
    module: "layer2-3",
    title: "Định tuyến và TTL",
    shortTitle: "Định tuyến & TTL",
    subtitle: "Router chọn đường thế nào, TTL ngăn vòng lặp ra sao, và traceroute dùng TTL để vẽ đường đi bằng cách nào?",
    blurb: "Mỗi router chỉ cần biết chặng kế tiếp. TTL là lưới an toàn biến vòng lặp vô hạn thành một thông báo lỗi có thể chẩn đoán.",
    duration: "15 phút",
    level: "Cơ bản",
    tags: ["routing", "TTL", "traceroute", "ICMP", "hop", "bảng định tuyến", "vòng lặp"],
    metrics: [
      { key: "ttl", label: "TTL còn lại", tone: "blue" },
      { key: "hops", label: "Số hop", tone: "violet" },
      { key: "route", label: "Chặng kế tiếp", tone: "green" },
      { key: "rtt", label: "RTT chặng", tone: "coral" }
    ],
    nodes: [
      { id: "pc", type: "client", x: 35, y: 210, w: 155, h: 66, label: "PC", sub: "10.0.0.5" },
      { id: "r1", type: "router", x: 220, y: 210, w: 155, h: 66, label: "R1", sub: "cổng vào" },
      { id: "r2", type: "router", x: 410, y: 68, w: 155, h: 66, label: "R2", sub: "đường chính" },
      { id: "r3", type: "router", x: 410, y: 352, w: 155, h: 66, label: "R3", sub: "đường dự phòng" },
      { id: "server", type: "server", x: 700, y: 210, w: 165, h: 66, label: "Server", sub: "10.0.3.9" }
    ],
    edges: [
      { id: "pc-r1", from: "pc", to: "r1", kind: "request" },
      { id: "r1-r2", from: "r1", to: "r2", kind: "request", label: "next hop" },
      { id: "r2-r3", from: "r2", to: "r3", kind: "request", label: "chặng 3" },
      { id: "r3-s", from: "r3", to: "server", kind: "request" },
      { id: "s-r3", from: "server", to: "r3", kind: "response", bow: -26 },
      { id: "r3-r2", from: "r3", to: "r2", kind: "data", bow: 120, label: "nếu bảng sai" },
      { id: "r2-r1", from: "r2", to: "r1", kind: "response", bow: 24 },
      { id: "r1-pc", from: "r1", to: "pc", kind: "response", bow: 24 }
    ],
    learn: [
      "Đọc bảng định tuyến theo nguyên tắc longest prefix match.",
      "Hiểu TTL giảm mỗi hop và bị hủy khi về 0.",
      "Dùng traceroute để thấy đường đi và phát hiện vòng lặp.",
      "Phân biệt đường chính, đường dự phòng và ảnh hưởng của chúng."
    ],
    steps: [
      {
        short: "Tra bảng định tuyến",
        type: "Khởi đầu",
        title: "Máy gửi chọn gateway",
        body: "PC muốn đến 10.0.3.9. Đích không cùng subnet, nên PC gửi đến default gateway R1. PC không cần biết toàn bộ đường đi; nó chỉ cần biết chặng kế tiếp.",
        focus: ["pc", "r1"],
        edges: ["pc-r1"],
        metrics: { ttl: "64", hops: "0", route: "R1", rtt: "2 ms" },
        changes: ["PC chọn default gateway", "Packet bắt đầu hành trình"],
        note: "Định tuyến là quyết định cục bộ tại từng thiết bị, không phải một bản đồ toàn cầu được tính sẵn."
      },
      {
        short: "Longest prefix match",
        type: "Quy tắc",
        title: "Router chọn route cụ thể nhất",
        body: "R1 có nhiều route: 0.0.0.0/0, 10.0.0.0/8 và 10.0.3.0/24. Nó chọn route khớp dài nhất là /24 nếu có. Nếu không, /8; cuối cùng mới dùng default route. Càng cụ thể càng được ưu tiên.",
        focus: ["r1"],
        edges: ["pc-r1", "r1-r2"],
        metrics: { ttl: "64", hops: "1", route: "10.0.3.0/24", rtt: "3 ms" },
        changes: ["Chọn route cụ thể nhất", "Chuyển packet đến R2"],
        note: "Default route 0.0.0.0/0 là “nếu không biết thì đi cửa này”. Không phải route chính xác."
      },
      {
        short: "TTL giảm mỗi hop",
        type: "Bảo vệ",
        title: "Mỗi router trừ TTL một đơn vị",
        body: "Khi packet đi qua router, TTL giảm 1. Nếu TTL về 0, router hủy packet và gửi ICMP Time Exceeded về nguồn. Cơ chế này ngăn packet quay vòng mãi khi bảng định tuyến bị lỗi.",
        focus: ["r1", "r2"],
        edges: ["r1-r2"],
        metrics: { ttl: "62", hops: "2", route: "R2 → R3", rtt: "8 ms" },
        changes: ["TTL giảm sau mỗi router", "Packet được chuyển tiếp"],
        note: "TTL ban đầu thường 64 hoặc 128. Số hop thực tế = TTL ban đầu − TTL nhận được (nếu biết giá trị ban đầu)."
      },
      {
        short: "Vòng lặp bị chặn",
        type: "Sự cố",
        title: "Bảng sai tạo vòng lặp, TTL cứu mạng",
        body: "Nếu R2 trỏ về R3 và R3 lại trỏ về R2, packet quay vòng. TTL giảm dần đến 0, router gửi ICMP Time Exceeded. Không có TTL, packet có thể lưu thông mãi và làm cạn tài nguyên mạng.",
        focus: ["r2", "r3"],
        edges: ["r2-r3", "r3-r2"],
        metrics: { ttl: "0", hops: "quá nhiều", route: "R2 ↔ R3", rtt: "timeout" },
        warn: ["r2", "r3"],
        changes: ["Phát hiện vòng lặp", "Packet bị hủy khi TTL = 0"],
        note: "Triệu chứng vòng lặp: traceroute lặp cùng vài IP, RTT tăng dần, kết nối timeout."
      },
      {
        short: "Đường dự phòng",
        type: "Định tuyến",
        title: "Khi đường chính hỏng, route đổi",
        body: "Nếu R2 mất kết nối, giao thức định tuyến hoặc route tĩnh dự phòng có thể đưa traffic qua R3. Hội tụ định tuyến không tức thời; trong vài giây có thể có mất gói hoặc chọn đường tạm.",
        focus: ["r1", "r3", "server"],
        edges: ["pc-r1", "r3-s"],
        metrics: { ttl: "63", hops: "3", route: "R1 → R3", rtt: "14 ms" },
        changes: ["Đường chính bị loại", "Đường dự phòng được chọn"],
        note: "Đường dự phòng chỉ hữu ích nếu đã được cấu hình và kiểm thử trước sự cố."
      },
      {
        short: "Traceroute",
        type: "Tổng kết",
        title: "Traceroute dùng TTL để lộ từng chặng",
        body: "Traceroute gửi các gói với TTL tăng dần: 1, 2, 3… Mỗi router trả ICMP Time Exceeded, nhờ đó ta thấy từng chặng. Đây là ứng dụng trực tiếp của TTL, không phải một giao thức riêng.",
        focus: ["all"],
        edges: "all",
        metrics: { ttl: "64 → 1", hops: "đo được", route: "Hiện từng chặng", rtt: "Theo chặng" },
        changes: ["Từng router lộ diện", "Xác định điểm chậm"],
        note: "Một số router chặn ICMP nên traceroute hiện dấu *. Điều đó không chắc chắn có nghĩa là chặng đó hỏng."
      }
    ]
  };

  return { modules, lessons };
})();
