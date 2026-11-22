/* NetLab — mở rộng: 10 bài chuyên sâu, 6 module, luyện tập và cheatsheet */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  /* ------------------------------------------------------------------
     Lộ trình 20 bài / 6 module
     ------------------------------------------------------------------ */
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
      id: "link",
      num: "02",
      title: "Liên kết, chuyển mạch & không dây",
      tone: "coral",
      blurb: "Ethernet, VLAN, STP, Wi-Fi và những quyết định ở lớp 2 quyết định một mạng LAN có ổn định hay không.",
      lessons: ["ethernet-arp", "vlan-stp", "wifi-csma"]
    },
    {
      id: "network",
      num: "03",
      title: "Mạng & định tuyến",
      tone: "yellow",
      blurb: "IPv4, subnet, gateway, IPv6, DHCP, ICMP và đường đi của gói tin giữa các mạng.",
      lessons: ["ip-subnet", "routing-ttl", "ipv6", "dhcp-icmp"]
    },
    {
      id: "transport",
      num: "04",
      title: "Giao vận & tắc nghẽn",
      tone: "green",
      blurb: "TCP, UDP, cửa sổ, truyền lại và cách TCP học dung lượng thật của mạng.",
      lessons: ["tcp-window", "udp-realtime", "congestion-control"]
    },
    {
      id: "application",
      num: "05",
      title: "Ứng dụng & web",
      tone: "violet",
      blurb: "Từ DNS, HTTP đến TLS: một trang web hiện ra sau những bước nào và mỗi bước tối ưu ra sao.",
      lessons: ["dns-http-https", "dns-resolution", "http-lifecycle", "tls-https"]
    },
    {
      id: "security-ops",
      num: "06",
      title: "Bảo mật & vận hành",
      tone: "blue",
      blurb: "NAT, firewall, tấn công mạng, VPN, QoS, CDN và cloud — bảo vệ và vận hành hệ thống thật.",
      lessons: ["nat-firewall", "network-security", "troubleshooting", "qos-cloud"]
    }
  ];
  SL.modules = modules;

  /* ------------------------------------------------------------------
     Bài 11 — VLAN, trunk và STP
     ------------------------------------------------------------------ */
  SL.lessons["vlan-stp"] = {
    id: "vlan-stp",
    module: "link",
    title: "VLAN, trunk và STP",
    shortTitle: "VLAN & STP",
    subtitle: "Một switch vật lý có thể chứa nhiều mạng logic; trunk mang nhiều VLAN, còn STP ngăn vòng lặp lớp 2 làm sập cả LAN.",
    blurb: "VLAN chia broadcast domain mà không cần thêm switch; STP là lý do một sợi cáp dự phòng không biến mạng thành cơn bão broadcast.",
    duration: "17 phút",
    level: "Trung cấp",
    tags: ["VLAN", "802.1Q", "trunk", "access port", "STP", "RSTP", "broadcast storm", "MAC flapping"],
    metrics: [
      { key: "vlan", label: "VLAN", tone: "blue" },
      { key: "trunk", label: "Trunk", tone: "violet" },
      { key: "loop", label: "Vòng lặp", tone: "coral" },
      { key: "mac", label: "Bảng MAC", tone: "green" }
    ],
    nodes: [
      { id: "pcA", type: "client", x: 40, y: 80, w: 175, h: 64, label: "Máy A", sub: "VLAN 10 · host .10" },
      { id: "pcB", type: "client", x: 40, y: 340, w: 175, h: 64, label: "Máy B", sub: "VLAN 20 · host .20" },
      { id: "sw1", type: "lb", x: 285, y: 80, w: 180, h: 64, label: "Switch 1", sub: "access + trunk" },
      { id: "sw2", type: "lb", x: 285, y: 340, w: 180, h: 64, label: "Switch 2", sub: "access + trunk" },
      { id: "gw", type: "gateway", x: 640, y: 210, w: 180, h: 64, label: "Router / L3 switch", sub: "SVI · gateway .1" }
    ],
    edges: [
      { id: "a-s1", from: "pcA", to: "sw1", kind: "request", label: "access 10" },
      { id: "b-s2", from: "pcB", to: "sw2", kind: "request", label: "access 20" },
      { id: "s1-s2", from: "sw1", to: "sw2", kind: "data", label: "trunk 802.1Q" },
      { id: "s2-s1", from: "sw2", to: "sw1", kind: "data", bow: 48 },
      { id: "s1-gw", from: "sw1", to: "gw", kind: "request" },
      { id: "s2-gw", from: "sw2", to: "gw", kind: "request", bow: -24 }
    ],
    learn: [
      "Phân biệt access port và trunk port; đọc tag 802.1Q.",
      "Giải thích vì sao VLAN tách broadcast domain.",
      "Nhận ra vòng lặp lớp 2 và tác hại broadcast storm.",
      "Hiểu STP/RSTP bầu root bridge và chặn cổng dư thừa.",
      "Biết inter-VLAN routing cần router hoặc SVI."
    ],
    steps: [
      {
        short: "VLAN là mạng logic",
        type: "Khởi đầu",
        title: "Mỗi VLAN là một broadcast domain",
        body: "Máy A cắm vào access port VLAN 10, máy B vào VLAN 20. Dù cùng một switch, broadcast của VLAN 10 không đi sang VLAN 20. Mỗi VLAN thường gắn với một subnet và một default gateway riêng.",
        focus: ["pcA", "pcB", "sw1"],
        edges: ["a-s1", "b-s2"],
        metrics: { vlan: "10 | 20", trunk: "chưa dùng", loop: "—", mac: "2 bảng logic" },
        changes: ["Tách broadcast domain", "Gán access port theo VLAN"],
        note: "VLAN không phải mạng riêng bảo mật tuyệt đối; thiết bị vẫn có thể bị tấn công qua trunk hoặc cấu hình sai."
      },
      {
        short: "Trunk 802.1Q",
        type: "Đóng gói",
        title: "Một sợi cáp mang nhiều VLAN",
        body: "Trunk thêm tag 802.1Q 4 byte vào frame để đánh dấu VLAN. Switch nhận tag, biết frame thuộc VLAN nào rồi bỏ tag khi ra access port. Native VLAN thường không gắn tag, nên phải khớp hai đầu.",
        focus: ["sw1", "sw2"],
        edges: ["s1-s2"],
        metrics: { vlan: "10 + 20", trunk: "802.1Q tagged", loop: "—", mac: "học theo VLAN" },
        changes: ["Frame được gắn VLAN ID", "Cho phép danh sách VLAN trên trunk"],
        note: "Kẻ tấn công có thể khai thác native VLAN hoặc VLAN hopping nếu trunk cấu hình lỏng. Tắt trunk ở cổng người dùng."
      },
      {
        short: "Cùng VLAN khác switch",
        type: "Chuyển mạch",
        title: "Frame VLAN 10 băng qua trunk",
        body: "Máy A gửi frame không tag vào access port. Switch 1 gắn tag VLAN 10, đẩy qua trunk sang switch 2. Switch 2 thấy tag, chuyển ra access port VLAN 10 và bỏ tag trước khi giao cho máy đích. Miền quảng bá vẫn chỉ là VLAN 10.",
        focus: ["sw1", "sw2"],
        edges: ["s1-s2", "a-s1"],
        metrics: { vlan: "10 → 10", trunk: "tagged", loop: "—", mac: "học MAC nguồn" },
        changes: ["Tag đi qua trunk", "Bỏ tag ở access port đích"],
        note: "Cùng VLAN nhưng khác switch vẫn là cùng broadcast domain. Khác VLAN thì cần thiết bị lớp 3."
      },
      {
        short: "Vòng lặp lớp 2",
        type: "Sự cố",
        title: "Hai link dư thừa tạo bão broadcast",
        body: "Nếu hai switch nối nhau bằng hai link mà không có STP, frame broadcast quay vòng và nhân bản liên tục. CPU switch tăng vọt, bảng MAC liên tục đổi cổng (MAC flapping), cả LAN chậm hoặc sập.",
        focus: ["sw1", "sw2"],
        edges: ["s1-s2", "s2-s1"],
        metrics: { vlan: "10 + 20", trunk: "2 link", loop: "Broadcast storm", mac: "Flapping" },
        warn: ["sw1", "sw2"],
        changes: ["Broadcast quay vòng", "Bảng MAC không ổn định"],
        note: "Không có TTL ở lớp 2. Một frame lỗi có thể lặp vô hạn cho đến khi vòng bị cắt hoặc thiết bị quá tải."
      },
      {
        short: "STP chặn vòng",
        type: "Bảo vệ",
        title: "STP bầu root bridge và chặn một cổng",
        body: "STP trao đổi BPDU để bầu root bridge, tính đường ngắn nhất rồi đưa các cổng dư thừa vào trạng thái blocking. Khi link chính hỏng, cổng dự phòng chuyển sang forwarding. RSTP hội tụ nhanh hơn STP cổ điển.",
        focus: ["sw1", "sw2"],
        edges: ["s1-s2"],
        metrics: { vlan: "10 + 20", trunk: "1 active", loop: "Blocked", mac: "Ổn định" },
        changes: ["Chọn root bridge", "Chặn cổng dư thừa"],
        note: "Kiểm tra root bridge bằng lệnh show spanning-tree. Đặt root bridge ở vị trí trung tâm để đường đi hợp lý."
      },
      {
        short: "Định tuyến giữa VLAN",
        type: "Tổng kết",
        title: "Inter-VLAN cần một gateway lớp 3",
        body: "Máy A muốn đến máy B khác VLAN: gói phải đi qua router-on-a-stick hoặc SVI của switch lớp 3. Mỗi VLAN có gateway .1; router định tuyến giữa các subnet và có thể áp ACL để giới hạn luồng.",
        focus: ["gw", "sw1", "sw2"],
        edges: ["s1-gw", "s2-gw", "s1-s2"],
        metrics: { vlan: "10 ↔ 20", trunk: "SVI", loop: "Blocked", mac: "Gateway MAC" },
        changes: ["Bật định tuyến giữa VLAN", "Áp ACL nếu cần"],
        note: "VLAN chia miền quảng bá, không tự động chia bảo mật. Cần ACL/firewall giữa các VLAN nhạy cảm."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 12 — Wi-Fi: CSMA/CA, nhiễu và roaming
     ------------------------------------------------------------------ */
  SL.lessons["wifi-csma"] = {
    id: "wifi-csma",
    module: "link",
    title: "Wi-Fi: CSMA/CA, nhiễu và roaming",
    shortTitle: "Wi-Fi & CSMA/CA",
    subtitle: "Wi-Fi dùng chung một môi trường truyền, không thể vừa nghe vừa nói. Hiểu backoff, ACK, hidden node và roaming để chẩn đoán mạng không dây.",
    blurb: "Wi-Fi không phải Ethernet không dây. Nó là một giao thức tranh chấp nửa song công, nơi khoảng cách, nhiễu và chuyển vùng quyết định trải nghiệm.",
    duration: "16 phút",
    level: "Trung cấp",
    tags: ["Wi-Fi", "802.11", "CSMA/CA", "hidden node", "RTS/CTS", "roaming", "WPA3", "kênh"],
    metrics: [
      { key: "medium", label: "Môi trường", tone: "blue" },
      { key: "retry", label: "Truyền lại", tone: "coral" },
      { key: "rate", label: "Tốc độ", tone: "green" },
      { key: "channel", label: "Kênh / nhiễu", tone: "violet" }
    ],
    nodes: [
      { id: "laptop", type: "client", x: 45, y: 90, w: 175, h: 64, label: "Laptop", sub: "cách AP 8 m" },
      { id: "phone", type: "client", x: 45, y: 340, w: 175, h: 64, label: "Điện thoại", sub: "khuất sau tường" },
      { id: "ap", type: "presence", x: 330, y: 215, w: 180, h: 64, label: "Wi-Fi AP", sub: "kênh 36 · 5 GHz" },
      { id: "gw", type: "gateway", x: 650, y: 215, w: 165, h: 64, label: "Gateway", sub: "mạng có dây" },
      { id: "ap2", type: "presence", x: 650, y: 60, w: 165, h: 64, label: "AP tầng 2", sub: "cùng SSID" }
    ],
    edges: [
      { id: "l-ap", from: "laptop", to: "ap", kind: "request", label: "data" },
      { id: "p-ap", from: "phone", to: "ap", kind: "request", label: "data" },
      { id: "ap-gw", from: "ap", to: "gw", kind: "request", label: "trunk" },
      { id: "l-ap2", from: "laptop", to: "ap2", kind: "response", bow: 26, label: "roam" },
      { id: "ap-ap2", from: "ap", to: "ap2", kind: "response", label: "cùng kênh" }
    ],
    learn: [
      "Giải thích CSMA/CA, DIFS và random backoff.",
      "Phân biệt hidden node với nhiễu cùng kênh.",
      "Hiểu ACK lớp 2 và retry ảnh hưởng tốc độ thực tế.",
      "Chọn kênh 2.4/5 GHz và nhận ra triệu chứng roaming."
    ],
    steps: [
      {
        short: "Nghe trước khi nói",
        type: "Khởi đầu",
        title: "CSMA/CA: tránh va chạm vì không nghe được khi đang phát",
        body: "Thiết bị Wi-Fi nghe môi trường. Nếu kênh rảnh trong khoảng DIFS, nó chờ thêm một khoảng backoff ngẫu nhiên rồi mới phát. Cách này giảm xác suất hai máy phát cùng lúc, nhưng không loại bỏ hoàn toàn va chạm.",
        focus: ["laptop", "phone", "ap"],
        edges: ["l-ap", "p-ap"],
        metrics: { medium: "Busy", retry: "0", rate: "300 Mbps", channel: "36 · rảnh sau backoff" },
        changes: ["Nghe kênh", "Chờ DIFS + backoff"],
        note: "Wi-Fi là half-duplex: mỗi thiết bị chỉ phát hoặc nghe tại một thời điểm. Băng thông chia sẻ, không phải đường riêng."
      },
      {
        short: "ACK và retry",
        type: "Tin cậy",
        title: "Mỗi frame unicast phải được ACK",
        body: "Sau khi phát, thiết bị chờ ACK từ AP trong một khoảng ngắn. Không có ACK, nó coi frame bị mất và tăng backoff, phát lại. Số lần retry tăng làm throughput giảm dù tốc độ danh nghĩa vẫn cao.",
        focus: ["laptop", "ap"],
        edges: ["l-ap"],
        metrics: { medium: "Ổn định", retry: "1", rate: "270 Mbps", channel: "36" },
        changes: ["Chờ ACK", "Retry với backoff lớn hơn"],
        note: "Tín hiệu yếu hoặc nhiễu làm retry tăng. Đo retry rate và SNR, đừng chỉ nhìn “tốc độ kết nối”."
      },
      {
        short: "Hidden node",
        type: "Sự cố",
        title: "Hai máy không nghe thấy nhau",
        body: "Laptop và điện thoại có thể cùng nghe AP nhưng không nghe nhau vì tường/khoảng cách. Cả hai tưởng kênh rảnh và phát đồng thời, gây va chạm tại AP. RTS/CTS giúp giữ chỗ bằng cách để AP phát CTS cho mọi máy.",
        focus: ["laptop", "phone", "ap"],
        edges: ["l-ap", "p-ap"],
        metrics: { medium: "Va chạm ẩn", retry: "3", rate: "144 Mbps", channel: "36 · hidden node" },
        warn: ["laptop", "phone"],
        changes: ["Va chạm tại AP", "Bật RTS/CTS nếu cần"],
        note: "Hidden node là lý do Wi-Fi có thể chậm dù từng máy báo “sóng đầy”. Giảm công suất phát hoặc thêm AP phủ tốt hơn."
      },
      {
        short: "Kênh và nhiễu",
        type: "Quy hoạch",
        title: "Chồng kênh làm giảm tốc độ",
        body: "Ở 2,4 GHz chỉ nên dùng kênh 1, 6, 11 để không chồng lấn. Ở 5 GHz có nhiều kênh hơn nhưng vẫn có nhiễu từ AP hàng xóm. SNR thấp buộc rate adaptation hạ tốc độ và tăng retry.",
        focus: ["ap", "ap2"],
        edges: ["ap-ap2"],
        metrics: { medium: "Nhiễu", retry: "4", rate: "72 Mbps", channel: "36 ↔ 36 · co-channel" },
        changes: ["Đo nhiễu nền", "Chọn kênh ít chồng"],
        note: "Đừng đặt mọi AP cùng kênh. Quy hoạch kênh và công suất phát quan trọng hơn việc tăng số AP một cách ngẫu nhiên."
      },
      {
        short: "Roaming",
        type: "Di động",
        title: "Chuyển AP nhưng giữ phiên",
        body: "Khi tín hiệu AP cũ yếu, thiết bị quét và chuyển sang AP mạnh hơn cùng SSID. Roaming do client quyết định; 802.11r giúp bắt tay nhanh, 802.11k/v hỗ trợ chọn AP. Client “dính” AP cũ là nguyên nhân phổ biến của mạng chập chờn.",
        focus: ["laptop", "ap", "ap2"],
        edges: ["l-ap2", "ap-ap2"],
        metrics: { medium: "Chuyển AP", retry: "0", rate: "300 Mbps", channel: "44 · AP tầng 2" },
        changes: ["Quét AP lân cận", "Chuyển vùng, xác thực lại"],
        note: "Cùng SSID nhưng khác VLAN hoặc khác subnet có thể làm đứt phiên khi roaming nếu không thiết kế mạng phù hợp."
      },
      {
        short: "Tổng kết",
        type: "Tổng kết",
        title: "Wi-Fi là môi trường chia sẻ có nhiễu",
        body: "Khác Ethernet chuyển mạch full-duplex, Wi-Fi là half-duplex, chia sẻ kênh và phụ thuộc vị trí. Chẩn đoán cần đo SNR, retry, utilization kênh, số client và roaming, không chỉ tốc độ quảng cáo.",
        focus: ["all"],
        edges: "all",
        metrics: { medium: "Half-duplex", retry: "Theo tải", rate: "Theo SNR", channel: "Cần quy hoạch" },
        changes: ["Hiểu giới hạn vật lý", "Đo trước khi nâng cấp"],
        note: "Muốn ổn định cho họp video: giảm nhiễu, đủ AP, bật WPA3, ưu tiên 5/6 GHz và kiểm tra retry tại vị trí thật."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 13 — IPv6: 128 bit, SLAAC và dual stack
     ------------------------------------------------------------------ */
  SL.lessons["ipv6"] = {
    id: "ipv6",
    module: "network",
    title: "IPv6: 128 bit, SLAAC và dual stack",
    shortTitle: "IPv6 & SLAAC",
    subtitle: "IPv6 không chỉ là IPv4 dài hơn: nó thay ARP bằng NDP, tự cấu hình bằng SLAAC và thay đổi cách nghĩ về NAT, MTU và firewall.",
    blurb: "Hiểu cách đọc địa chỉ IPv6, prefix /64, SLAAC, ICMPv6 và kiểm tra một máy có IPv6 thật hay chỉ có địa chỉ link-local.",
    duration: "18 phút",
    level: "Trung cấp",
    tags: ["IPv6", "SLAAC", "NDP", "ICMPv6", "dual stack", "AAAA", "MTU", "GUA", "ULA"],
    metrics: [
      { key: "prefix", label: "Prefix", tone: "blue" },
      { key: "addr", label: "Địa chỉ", tone: "violet" },
      { key: "nd", label: "NDP / DAD", tone: "green" },
      { key: "mtu", label: "MTU", tone: "yellow" }
    ],
    nodes: [
      { id: "pc", type: "client", x: 40, y: 210, w: 180, h: 66, label: "PC", sub: "2001:db8::10" },
      { id: "router", type: "router", x: 280, y: 210, w: 180, h: 66, label: "Router", sub: "RA · prefix /64" },
      { id: "dns", type: "dns", x: 520, y: 65, w: 175, h: 64, label: "DNS", sub: "A / AAAA" },
      { id: "server", type: "server", x: 720, y: 210, w: 150, h: 66, label: "Server", sub: "IPv6" },
      { id: "isp", type: "cdn", x: 520, y: 355, w: 175, h: 64, label: "Internet", sub: "IPv6 upstream" }
    ],
    edges: [
      { id: "pc-r", from: "pc", to: "router", kind: "request", label: "RS / NS" },
      { id: "r-pc", from: "router", to: "pc", kind: "response", bow: 70, label: "RA / NA" },
      { id: "r-dns", from: "router", to: "dns", kind: "request", label: "DNS" },
      { id: "r-s", from: "router", to: "server", kind: "request" },
      { id: "r-i", from: "router", to: "isp", kind: "request", label: "default" }
    ],
    learn: [
      "Đọc và rút gọn địa chỉ IPv6; phân biệt GUA, ULA, link-local.",
      "Hiểu NDP thay ARP và DAD kiểm tra trùng địa chỉ.",
      "Mô tả SLAAC từ RA, prefix và interface ID.",
      "Biết vai trò AAAA, Happy Eyeballs và dual stack.",
      "Nhận ra MTU 1280 và ICMPv6 Packet Too Big."
    ],
    steps: [
      {
        short: "Đọc địa chỉ 128 bit",
        type: "Khởi đầu",
        title: "Tám nhóm hex, prefix /64",
        body: "IPv6 dài 128 bit, viết thành 8 nhóm 16 bit. Có thể bỏ các số 0 đầu và dùng :: một lần để nén chuỗi 0. Một mạng LAN thường dùng prefix /64; 64 bit còn lại là interface ID. GUA là địa chỉ toàn cầu, ULA dùng nội bộ, link-local chỉ trong một link.",
        focus: ["pc", "router"],
        edges: ["pc-r"],
        metrics: { prefix: "/64", addr: "2001:db8::10", nd: "link-local fe80::", mtu: "1280" },
        changes: ["Xác định prefix mạng", "Sinh interface ID"],
        note: "Không dùng NAT để tiết kiệm địa chỉ trong IPv6. Firewall vẫn cần thiết vì mọi host có thể có địa chỉ toàn cầu."
      },
      {
        short: "NDP thay ARP",
        type: "Phân giải",
        title: "Neighbor Discovery và DAD",
        body: "IPv6 không dùng ARP. Nó dùng ICMPv6 Neighbor Solicitation/Advertisement, gửi đến multicast solicited-node. Trước khi dùng địa chỉ, host chạy Duplicate Address Detection để chắc địa chỉ chưa bị trùng.",
        focus: ["pc", "router"],
        edges: ["pc-r", "r-pc"],
        metrics: { prefix: "/64", addr: "2001:db8::10", nd: "NS → NA · DAD OK", mtu: "1280" },
        changes: ["Phân giải link-layer", "Kiểm tra trùng địa chỉ"],
        note: "NDP dựa trên multicast; firewall phải cho ICMPv6 cần thiết. Chặn toàn bộ ICMPv6 làm IPv6 hỏng khó hiểu."
      },
      {
        short: "SLAAC",
        type: "Tự cấu hình",
        title: "Router quảng bá prefix, host tự tạo địa chỉ",
        body: "Router gửi Router Advertisement định kỳ hoặc trả lời Router Solicitation. Host ghép prefix /64 với interface ID (EUI-64 hoặc privacy address) để tạo địa chỉ. DHCPv6 là tùy chọn, thường dùng để cấp DNS hoặc địa chỉ có quản lý.",
        focus: ["router", "pc"],
        edges: ["r-pc"],
        metrics: { prefix: "2001:db8:1::/64", addr: "SLAAC", nd: "RA · M/O flags", mtu: "1280" },
        changes: ["Nhận prefix", "Tự sinh địa chỉ"],
        note: "Privacy extensions đổi interface ID theo thời gian để giảm theo dõi. Đừng nhầm địa chỉ tạm với lỗi cấu hình."
      },
      {
        short: "Dual stack & DNS",
        type: "Chuyển đổi",
        title: "A và AAAA cùng tồn tại",
        body: "Máy dual stack có cả IPv4 và IPv6. DNS trả A cho IPv4, AAAA cho IPv6. Happy Eyeballs thử song song và ưu tiên kết nối thành công nhanh hơn, tránh bị treo khi IPv6 lỗi nhưng vẫn được quảng bá.",
        focus: ["pc", "dns", "server"],
        edges: ["r-dns", "r-s"],
        metrics: { prefix: "/64", addr: "IPv4 + IPv6", nd: "OK", mtu: "1280" },
        changes: ["Phân giải A/AAAA", "Chọn đường nhanh hơn"],
        note: "IPv6 lỗi thường biểu hiện chậm chứ không mất hẳn, vì ứng dụng chờ rồi fallback IPv4. Kiểm tra riêng từng họ địa chỉ."
      },
      {
        short: "Header và MTU",
        type: "Truyền tải",
        title: "Router không phân mảnh; ICMPv6 báo MTU",
        body: "Header IPv6 cố định 40 byte, phần mở rộng đặt sau. Router không phân mảnh gói; nếu gói quá lớn, nó gửi ICMPv6 Packet Too Big để nguồn giảm MTU. IPv6 yêu cầu MTU tối thiểu 1280 byte và luôn cần Path MTU Discovery.",
        focus: ["router", "server"],
        edges: ["r-s"],
        metrics: { prefix: "/64", addr: "2001:db8::10", nd: "OK", mtu: "1280 · PMTUD" },
        changes: ["Không phân mảnh tại router", "Nguồn điều chỉnh MTU"],
        note: "Chặn ICMPv6 Packet Too Big làm kết nối lớn bị treo. Đây là lỗi cấu hình firewall rất phổ biến khi bật IPv6."
      },
      {
        short: "Tổng kết",
        type: "Tổng kết",
        title: "IPv6 cần kế hoạch, không chỉ bật lên",
        body: "Muốn triển khai IPv6: có prefix từ ISP, quy hoạch /64 theo VLAN, bật RA/SLAAC hoặc DHCPv6, mở ICMPv6 đúng cách, cập nhật firewall và giám sát. Dual stack là bước chuyển tiếp thực tế.",
        focus: ["all"],
        edges: "all",
        metrics: { prefix: "Theo VLAN", addr: "GUA + LL", nd: "RA / DHCPv6", mtu: "PMTUD" },
        changes: ["Quy hoạch prefix", "Cập nhật firewall"],
        note: "Kiểm tra bằng ip -6 addr, ping6, dig AAAA và curl -6. Nếu chỉ có fe80::, máy chưa nhận được prefix toàn cầu."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 14 — DHCP và ICMP
     ------------------------------------------------------------------ */
  SL.lessons["dhcp-icmp"] = {
    id: "dhcp-icmp",
    module: "network",
    title: "DHCP và ICMP: tự động cấp địa chỉ & chẩn đoán",
    shortTitle: "DHCP & ICMP",
    subtitle: "DHCP giúp máy mới tự có địa chỉ, gateway, DNS; ICMP là ngôn ngữ báo lỗi và đo đường đi mà ping/traceroute dựa vào.",
    blurb: "Phần lớn sự cố “không vào mạng” nằm ở DHCP hoặc ICMP bị chặn. Học cách đọc DORA, lease và các thông điệp lỗi ICMP.",
    duration: "16 phút",
    level: "Cơ bản",
    tags: ["DHCP", "DORA", "lease", "relay", "ICMP", "ping", "traceroute", "PMTUD"],
    metrics: [
      { key: "state", label: "Trạng thái", tone: "blue" },
      { key: "ip", label: "Địa chỉ", tone: "violet" },
      { key: "lease", label: "Lease", tone: "green" },
      { key: "icmp", label: "ICMP", tone: "coral" }
    ],
    nodes: [
      { id: "pc", type: "client", x: 40, y: 95, w: 175, h: 64, label: "PC mới", sub: "chưa có IP" },
      { id: "sw", type: "lb", x: 275, y: 95, w: 160, h: 64, label: "Switch", sub: "broadcast domain" },
      { id: "dhcp", type: "server", x: 500, y: 60, w: 175, h: 64, label: "DHCP server", sub: "pool 192.168.1.0/24" },
      { id: "gw", type: "gateway", x: 500, y: 225, w: 175, h: 64, label: "Gateway", sub: "192.168.1.1" },
      { id: "net", type: "cdn", x: 735, y: 225, w: 130, h: 64, label: "8.8.8.8", sub: "Internet" }
    ],
    edges: [
      { id: "pc-sw", from: "pc", to: "sw", kind: "request" },
      { id: "sw-dhcp", from: "sw", to: "dhcp", kind: "request", label: "DORA" },
      { id: "pc-gw", from: "pc", to: "gw", kind: "request", bow: 18 },
      { id: "gw-net", from: "gw", to: "net", kind: "request", label: "ICMP" }
    ],
    learn: [
      "Mô tả bốn bước DORA và vai trò broadcast/relay.",
      "Hiểu lease, T1/T2, option và rủi ro rogue DHCP.",
      "Đọc kết quả ping: RTT, mất gói, TTL.",
      "Biết ICMP error, traceroute và Packet Too Big.",
      "Có thứ tự chẩn đoán DHCP → gateway → DNS → ứng dụng."
    ],
    steps: [
      {
        short: "DORA",
        type: "Khởi đầu",
        title: "Bốn bước để có địa chỉ",
        body: "Client phát Discover (broadcast), server trả Offer, client gửi Request, server xác nhận ACK. Kèm theo là subnet mask, gateway, DNS, thời hạn lease. Nếu client ở subnet khác, DHCP relay chuyển tiếp thông điệp.",
        focus: ["pc", "sw", "dhcp"],
        edges: ["pc-sw", "sw-dhcp"],
        metrics: { state: "Discover", ip: "0.0.0.0", lease: "—", icmp: "—" },
        changes: ["Broadcast Discover", "Server đề nghị Offer"],
        note: "DHCP dùng UDP 67/68. Nếu không có địa chỉ, kiểm tra VLAN, relay và pool trước khi đổ lỗi cho máy."
      },
      {
        short: "Lease và option",
        type: "Cấp phát",
        title: "Địa chỉ có thời hạn và nhiều tùy chọn",
        body: "Lease thường 8–24 giờ. Client gia hạn ở T1 (50%) và T2 (87,5%) trước khi hết hạn. Option 3 là gateway, option 6 là DNS, option 15 là domain. Reservation giữ một IP cố định theo MAC; rogue DHCP có thể cấp gateway giả để chặn traffic.",
        focus: ["pc", "dhcp"],
        edges: ["sw-dhcp"],
        metrics: { state: "Bound", ip: "192.168.1.57", lease: "24h · T1 12h", icmp: "—" },
        changes: ["Nhận IP + option", "Bắt đầu tính lease"],
        note: "Đừng đặt DHCP server ngoài kiểm soát trong LAN. Bật DHCP snooping để chặn server lạ trên cổng người dùng."
      },
      {
        short: "Ping",
        type: "Chẩn đoán",
        title: "ICMP Echo đo khả năng tới đích",
        body: "Ping gửi Echo Request, nhận Echo Reply. Kết quả cho biết mất gói và RTT. TTL giảm mỗi hop; TTL thấp bất thường có thể do đường đi dài hoặc bị giả mạo. Ping chỉ kiểm tra tới đích, không chứng minh ứng dụng hoạt động.",
        focus: ["pc", "gw", "net"],
        edges: ["pc-gw", "gw-net"],
        metrics: { state: "Bound", ip: "192.168.1.57", lease: "24h", icmp: "4/4 · 21 ms" },
        changes: ["Gửi Echo Request", "Nhận Echo Reply"],
        note: "Nhiều server chặn ping nhưng vẫn chạy web. Ping thất bại chưa kết luận dịch vụ chết."
      },
      {
        short: "ICMP lỗi & traceroute",
        type: "Đường đi",
        title: "TTL hết hạn tạo ra bản đồ đường đi",
        body: "Khi TTL về 0, router gửi ICMP Time Exceeded. Traceroute tăng dần TTL để lộ từng hop. ICMP Destination Unreachable cho biết mạng/cổng không tới; Packet Too Big hỗ trợ PMTUD. Chặn ICMP quá mức làm chẩn đoán và PMTUD hỏng.",
        focus: ["gw", "net", "pc"],
        edges: ["pc-gw", "gw-net"],
        metrics: { state: "Bound", ip: "192.168.1.57", lease: "24h", icmp: "Time Exceeded" },
        changes: ["Tăng TTL từng bước", "Nhận ICMP từ router"],
        note: "Traceroute có thể hiện dấu * do router không trả lời ICMP, không nhất thiết là mất kết nối."
      },
      {
        short: "So sánh & thứ tự kiểm tra",
        type: "Tổng kết",
        title: "DHCP, SLAAC, static và thứ tự debug",
        body: "DHCP phù hợp mạng động; SLAAC tự động trong IPv6; static dùng cho thiết bị hạ tầng. Khi sự cố: kiểm tra link, địa chỉ/lease, gateway, DNS, rồi ứng dụng. Ghi lại từng bước để không sửa mò.",
        focus: ["all"],
        edges: "all",
        metrics: { state: "Đã chẩn đoán", ip: "Hợp lệ", lease: "Còn hạn", icmp: "Theo hop" },
        changes: ["Chọn phương thức cấp địa chỉ", "Đi theo thứ tự lớp"],
        note: "Một máy có IP 169.254.x.x thường là DHCP thất bại (APIPA). Đây là manh mối nhanh để kiểm tra VLAN/relay/pool."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 15 — Điều khiển tắc nghẽn
     ------------------------------------------------------------------ */
  SL.lessons["congestion-control"] = {
    id: "congestion-control",
    module: "transport",
    title: "Điều khiển tắc nghẽn: slow start, AIMD và bufferbloat",
    shortTitle: "Điều khiển tắc nghẽn",
    subtitle: "TCP không chỉ truyền lại khi mất gói; nó liên tục dò dung lượng mạng bằng cwnd, slow start, AIMD và các thuật toán hiện đại.",
    blurb: "Vì sao cùng đường truyền, có lúc nhanh có lúc chậm? Câu trả lời nằm ở cửa sổ tắc nghẽn, hàng đợi router và cách TCP phản ứng với mất gói.",
    duration: "17 phút",
    level: "Nâng cao",
    tags: ["cwnd", "slow start", "AIMD", "fast retransmit", "SACK", "bufferbloat", "CUBIC", "BBR", "AQM"],
    metrics: [
      { key: "cwnd", label: "cwnd", tone: "blue" },
      { key: "ssthresh", label: "ssthresh", tone: "violet" },
      { key: "rtt", label: "RTT", tone: "green" },
      { key: "loss", label: "Mất gói", tone: "coral" }
    ],
    nodes: [
      { id: "sender", type: "server", x: 45, y: 210, w: 175, h: 64, label: "Sender", sub: "cwnd" },
      { id: "router", type: "router", x: 300, y: 210, w: 175, h: 64, label: "Router", sub: "hàng đợi" },
      { id: "bneck", type: "cache", x: 545, y: 210, w: 160, h: 64, label: "Bottleneck", sub: "10 Mbps" },
      { id: "receiver", type: "client", x: 755, y: 210, w: 130, h: 64, label: "Receiver", sub: "rwnd" }
    ],
    edges: [
      { id: "s-r", from: "sender", to: "router", kind: "request", label: "data" },
      { id: "r-b", from: "router", to: "bneck", kind: "request" },
      { id: "b-rcv", from: "bneck", to: "receiver", kind: "request" },
      { id: "rcv-b", from: "receiver", to: "bneck", kind: "response", bow: 22, label: "ACK" },
      { id: "b-r", from: "bneck", to: "router", kind: "response", bow: 22 },
      { id: "r-s", from: "router", to: "sender", kind: "response", bow: 22 }
    ],
    learn: [
      "Phân biệt cwnd, rwnd và cửa sổ hiệu dụng.",
      "Mô tả slow start, ssthresh và AIMD.",
      "Hiểu fast retransmit, 3 ACK trùng và SACK.",
      "Nhận ra bufferbloat và vai trò AQM.",
      "So sánh CUBIC với BBR ở mức khái niệm."
    ],
    steps: [
      {
        short: "Hai cửa sổ",
        type: "Khởi đầu",
        title: "Cửa sổ hiệu dụng = min(cwnd, rwnd)",
        body: "rwnd do receiver quảng bá, giới hạn bộ đệm nhận. cwnd do sender giữ, phản ánh dung lượng mạng sender tin là an toàn. Số byte có thể gửi trước khi chờ ACK là min của hai giá trị. BDP = băng thông × RTT cho biết cần bao nhiêu dữ liệu “trên đường”.",
        focus: ["sender", "receiver"],
        edges: ["s-r", "b-rcv"],
        metrics: { cwnd: "10 KB", ssthresh: "64 KB", rtt: "40 ms", loss: "0%" },
        changes: ["Đọc rwnd", "Giới hạn bởi cwnd"],
        note: "Tăng rwnd không giúp nếu cwnd thấp, và ngược lại. Đo cả hai khi điều tra throughput thấp."
      },
      {
        short: "Slow start",
        type: "Dò dung lượng",
        title: "Tăng theo cấp số nhân đến ssthresh",
        body: "Ban đầu cwnd nhỏ. Mỗi RTT không mất gói, cwnd tăng gấp đôi: 1→2→4→8... đến ssthresh. Sau đó chuyển sang tăng tuyến tính (congestion avoidance). Slow start thực chất không chậm, nó khởi động thận trọng rồi tăng nhanh.",
        focus: ["sender", "router"],
        edges: ["s-r", "r-s"],
        metrics: { cwnd: "32 KB", ssthresh: "64 KB", rtt: "40 ms", loss: "0%" },
        changes: ["cwnd tăng mỗi RTT", "Chạm ssthresh"],
        note: "Kết nối ngắn chịu ảnh hưởng nặng bởi slow start. Đây là lý do tái sử dụng kết nối (keep-alive) quan trọng."
      },
      {
        short: "AIMD",
        type: "Ổn định",
        title: "Tăng cộng, giảm nhân",
        body: "Sau ssthresh, cwnd tăng khoảng 1 MSS mỗi RTT. Khi phát hiện mất gói, cwnd giảm mạnh (thường một nửa). Đường răng cưa là dấu hiệu bình thường của TCP đang dò giới hạn. Các luồng cùng chia sẻ dung lượng theo cách tương đối công bằng.",
        focus: ["sender", "bneck", "receiver"],
        edges: ["s-r", "b-rcv", "rcv-b"],
        metrics: { cwnd: "48 → 24 KB", ssthresh: "48 KB", rtt: "55 ms", loss: "1 sự kiện" },
        changes: ["Tăng tuyến tính", "Giảm khi mất gói"],
        note: "Mất gói không luôn là tắc nghẽn; Wi-Fi lỗi cũng gây mất. TCP cổ điển vẫn phản ứng như tắc nghẽn, đôi khi giảm tốc quá mức."
      },
      {
        short: "Fast retransmit",
        type: "Phục hồi",
        title: "Ba ACK trùng kích hoạt truyền lại sớm",
        body: "Khi một segment mất, receiver nhận các segment sau và gửi ACK lặp cho byte còn thiếu. Ba ACK trùng báo hiệu mất gói; sender truyền lại ngay thay vì chờ timeout. SACK cho biết chính xác đoạn nào đã nhận, giúp truyền lại hiệu quả hơn.",
        focus: ["receiver", "sender"],
        edges: ["rcv-b", "r-s"],
        metrics: { cwnd: "24 → 12 KB", ssthresh: "24 KB", rtt: "60 ms", loss: "3 dup ACK" },
        changes: ["Nhận ACK trùng", "Fast retransmit + SACK"],
        note: "Timeout đắt hơn nhiều so với fast retransmit: chờ RTO rồi quay về slow start. Mạng mất gói ngẫu nhiên thường chịu phạt nặng."
      },
      {
        short: "Bufferbloat & AQM",
        type: "Hàng đợi",
        title: "Đệm quá lớn làm tăng latency",
        body: "Router có hàng đợi lớn có thể giữ gói lâu thay vì bỏ, khiến RTT tăng vọt dù không mất gói. Đây là bufferbloat: tải cao làm video gọi bị trễ. AQM như CoDel chủ động loại gói khi hàng đợi giữ lâu, giữ latency thấp; shaping/policing giới hạn tốc độ.",
        focus: ["router", "bneck"],
        edges: ["r-b"],
        metrics: { cwnd: "Ổn định", ssthresh: "—", rtt: "250 ms", loss: "0% · trễ cao" },
        warn: ["router", "bneck"],
        changes: ["Hàng đợi đầy", "AQM giảm độ trễ"],
        note: "Đo latency dưới tải, không chỉ đo tốc độ. Mạng 1 Gbps vẫn có thể gọi video giật nếu bufferbloat nghiêm trọng."
      },
      {
        short: "Thuật toán hiện đại",
        type: "Tổng kết",
        title: "CUBIC, BBR và mục tiêu cuối",
        body: "CUBIC dùng hàm bậc ba để tăng cwnd, phổ biến trên Linux. BBR mô hình hóa băng thông và RTT thay vì coi mất gói là tắc nghẽn, hiệu quả trên link mất gói. Không thuật toán nào thay thế được đường truyền đủ dung lượng và hàng đợi hợp lý.",
        focus: ["all"],
        edges: "all",
        metrics: { cwnd: "Thích nghi", ssthresh: "—", rtt: "Thấp dưới tải", loss: "Tùy link" },
        changes: ["Chọn thuật toán", "Đo throughput + RTT + loss"],
        note: "Tối ưu thực tế: đủ BDP, bật SACK/ECN, AQM ở router, tránh đường truyền mất gói cao và theo dõi cả latency lẫn throughput."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 16 — Phân giải DNS chuyên sâu
     ------------------------------------------------------------------ */
  SL.lessons["dns-resolution"] = {
    id: "dns-resolution",
    module: "application",
    title: "DNS chuyên sâu: phân giải, TTL và DNSSEC",
    shortTitle: "DNS chuyên sâu",
    subtitle: "Từ stub resolver đến root, TLD, authoritative: một tên miền được phân giải qua nhiều tầng cache và bản ghi, mỗi tầng có TTL và rủi ro riêng.",
    blurb: "DNS là nền của mọi kết nối. Hiểu đệ quy, bản ghi, TTL, cache và DNSSEC để chẩn đoán “web không vào được nhưng mạng vẫn OK”.",
    duration: "18 phút",
    level: "Trung cấp",
    tags: ["DNS", "recursive", "authoritative", "A", "AAAA", "CNAME", "MX", "TTL", "DNSSEC", "DoH"],
    metrics: [
      { key: "record", label: "Bản ghi", tone: "blue" },
      { key: "ttl", label: "TTL", tone: "yellow" },
      { key: "mode", label: "Chế độ", tone: "violet" },
      { key: "cache", label: "Cache", tone: "green" }
    ],
    nodes: [
      { id: "stub", type: "client", x: 35, y: 210, w: 165, h: 66, label: "Máy khách", sub: "stub resolver" },
      { id: "rec", type: "dns", x: 245, y: 210, w: 175, h: 66, label: "Resolver", sub: "đệ quy · cache" },
      { id: "root", type: "dns", x: 475, y: 60, w: 150, h: 60, label: "Root", sub: "." },
      { id: "tld", type: "dns", x: 660, y: 60, w: 150, h: 60, label: "TLD", sub: ".com" },
      { id: "auth", type: "server", x: 660, y: 335, w: 175, h: 66, label: "Authoritative", sub: "example.com" }
    ],
    edges: [
      { id: "stub-rec", from: "stub", to: "rec", kind: "request", label: "RD" },
      { id: "rec-root", from: "rec", to: "root", kind: "request" },
      { id: "rec-tld", from: "rec", to: "tld", kind: "request", bow: -18 },
      { id: "rec-auth", from: "rec", to: "auth", kind: "request", bow: 30 },
      { id: "auth-rec", from: "auth", to: "rec", kind: "response", bow: 30, label: "A" }
    ],
    learn: [
      "Phân biệt stub, recursive resolver và authoritative server.",
      "Hiểu referral, glue record và truy vấn lặp.",
      "Đọc các loại bản ghi A/AAAA/CNAME/MX/TXT/NS/SOA/CAA.",
      "Quản lý TTL, cache âm và NXDOMAIN.",
      "Biết DNSSEC, cache poisoning và DoH/DoT."
    ],
    steps: [
      {
        short: "Stub hỏi resolver",
        type: "Khởi đầu",
        title: "Máy khách chỉ cần hỏi một nơi",
        body: "Ứng dụng gọi stub resolver trong hệ điều hành, gửi truy vấn RD=1 đến recursive resolver (thường của ISP hoặc 8.8.8.8/1.1.1.1). Resolver chịu trách nhiệm đi hỏi khắp nơi và trả kết quả cuối cùng. Nếu cache có sẵn và còn hạn, trả ngay.",
        focus: ["stub", "rec"],
        edges: ["stub-rec"],
        metrics: { record: "A?", ttl: "—", mode: "Đệ quy", cache: "Miss" },
        changes: ["Gửi câu hỏi", "Resolver kiểm tra cache"],
        note: "Kiểm tra DNS bằng dig example.com, nslookup hoặc resolvectl. Xem server nào đang trả lời và thời gian TTL còn lại."
      },
      {
        short: "Referral",
        type: "Điều hướng",
        title: "Root → TLD → authoritative",
        body: "Nếu cache miss, resolver hỏi root, nhận referral về máy chủ .com. Hỏi TLD, nhận referral kèm glue record về nameserver của example.com. Hỏi authoritative, nhận bản ghi A. Đây là truy vấn lặp (iterative) từ phía resolver; stub chỉ thấy một câu trả lời.",
        focus: ["rec", "root", "tld", "auth"],
        edges: ["rec-root", "rec-tld", "rec-auth", "auth-rec"],
        metrics: { record: "A", ttl: "300", mode: "Lặp", cache: "Ghi kết quả" },
        changes: ["Nhận referral", "Hỏi authoritative"],
        note: "Glue record tránh vòng phụ thuộc khi cần địa chỉ IP của chính nameserver. Thiếu glue là lỗi cấu hình DNS phổ biến."
      },
      {
        short: "Các loại bản ghi",
        type: "Bản ghi",
        title: "Mỗi bản ghi trả lời một câu hỏi khác nhau",
        body: "A trỏ IPv4, AAAA trỏ IPv6. CNAME tạo bí danh (không dùng ở apex). MX chỉ mail server, TXT chứa xác minh/SPF, NS chỉ nameserver, SOA chứa thông tin vùng và thời gian cache âm, CAA giới hạn CA được cấp chứng chỉ.",
        focus: ["auth", "rec"],
        edges: ["auth-rec"],
        metrics: { record: "A / AAAA / MX", ttl: "300–3600", mode: "Authoritative", cache: "Theo TTL" },
        changes: ["Trả bản ghi theo loại", "Kèm TTL"],
        note: "CNAME ở apex gây lỗi với NS/SOA. Dùng ALIAS/ANAME hoặc bản ghi A/AAAA trực tiếp khi cần."
      },
      {
        short: "TTL và cache",
        type: "Cache",
        title: "TTL quyết định độ tươi và tải hệ thống",
        body: "TTL ngắn giúp thay đổi nhanh nhưng tăng truy vấn; TTL dài giảm tải nhưng làm thay đổi chậm. NXDOMAIN cũng được cache theo SOA minimum. Trước khi chuyển IP, hạ TTL trước vài giờ; sau khi ổn định mới nâng lại.",
        focus: ["rec", "stub"],
        edges: ["stub-rec"],
        metrics: { record: "A", ttl: "3600 → 60", mode: "Cache hit", cache: "Giảm tải" },
        changes: ["Đếm ngược TTL", "Hết hạn thì hỏi lại"],
        note: "Khi đổi DNS mà “vẫn ra IP cũ”, đó là cache TTL chứ không phải lỗi web. Kiểm tra bằng dig +trace và nhiều resolver."
      },
      {
        short: "Poisoning & mã hóa",
        type: "Bảo mật",
        title: "DNSSEC xác thực, DoH/DoT mã hóa",
        body: "Cache poisoning đưa bản ghi giả vào resolver. DNSSEC ký dữ liệu để resolver xác minh nguồn gốc và toàn vẹn. DoH/DoT mã hóa đường truy vấn để tránh nghe lén, nhưng không thay thế DNSSEC. Bailiwick checking giới hạn bản ghi được chấp nhận.",
        focus: ["rec", "root", "auth"],
        edges: ["rec-root", "rec-auth"],
        metrics: { record: "RRSIG", ttl: "Theo vùng", mode: "DNSSEC", cache: "Có xác thực" },
        changes: ["Xác minh chữ ký", "Mã hóa truy vấn"],
        note: "DNSSEC làm DNS trả lời lớn hơn (có thể cần TCP/EDNS). Chặn DNSSEC có thể làm tên miền không phân giải được."
      },
      {
        short: "Tổng kết",
        type: "Tổng kết",
        title: "Chẩn đoán DNS có trình tự",
        body: "Kiểm tra: máy có DNS server đúng? dig trực tiếp resolver? dig @8.8.8.8? dig +trace? So sánh kết quả. Anycast giúp resolver ở gần trả lời nhanh. TTL và DNSSEC là hai cấu hình cần hiểu trước khi vận hành tên miền thật.",
        focus: ["all"],
        edges: "all",
        metrics: { record: "A/AAAA", ttl: "Có kế hoạch", mode: "Đệ quy + lặp", cache: "Hiểu TTL" },
        changes: ["Đo từng tầng", "Ghi lại kết quả"],
        note: "Lỗi DNS thường biểu hiện “mạng OK nhưng tên miền không vào được”. Đừng đổi cấu hình mạng trước khi kiểm tra DNS."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 17 — Vòng đời HTTP
     ------------------------------------------------------------------ */
  SL.lessons["http-lifecycle"] = {
    id: "http-lifecycle",
    module: "application",
    title: "Vòng đời HTTP: cache, cookie và HTTP/2, HTTP/3",
    shortTitle: "Vòng đời HTTP",
    subtitle: "Một request HTTP đi qua cache, CDN, origin; mỗi header và mỗi phiên bản giao thức quyết định tốc độ và độ an toàn.",
    blurb: "Hiểu method, status, cookie, cache và sự tiến hóa HTTP/1.1 → HTTP/2 → HTTP/3 để tối ưu trang web đúng chỗ.",
    duration: "19 phút",
    level: "Trung cấp",
    tags: ["HTTP", "status code", "cookie", "Cache-Control", "ETag", "HTTP/2", "HTTP/3", "QUIC", "HOL"],
    metrics: [
      { key: "method", label: "Phương thức", tone: "blue" },
      { key: "status", label: "Trạng thái", tone: "green" },
      { key: "cache", label: "Cache", tone: "yellow" },
      { key: "proto", label: "Giao thức", tone: "violet" }
    ],
    nodes: [
      { id: "browser", type: "client", x: 35, y: 210, w: 160, h: 66, label: "Trình duyệt", sub: "cache cục bộ" },
      { id: "edge", type: "cdn", x: 235, y: 210, w: 165, h: 66, label: "CDN edge", sub: "cache HTTP" },
      { id: "origin", type: "server", x: 445, y: 210, w: 165, h: 66, label: "Origin", sub: "app server" },
      { id: "db", type: "db", x: 660, y: 210, w: 150, h: 66, label: "Database", sub: "dữ liệu" },
      { id: "user", type: "presence", x: 235, y: 355, w: 165, h: 60, label: "Người dùng", sub: "cookie / session" }
    ],
    edges: [
      { id: "b-e", from: "browser", to: "edge", kind: "request", label: "GET" },
      { id: "e-o", from: "edge", to: "origin", kind: "request", label: "miss" },
      { id: "o-d", from: "origin", to: "db", kind: "request", label: "query" },
      { id: "o-e", from: "origin", to: "edge", kind: "response", bow: -50, label: "200 / 304" },
      { id: "e-b", from: "edge", to: "browser", kind: "response", bow: 22 }
    ],
    learn: [
      "Đọc request/response và nhóm mã trạng thái.",
      "Phân biệt idempotent với an toàn; dùng cache đúng.",
      "Hiểu cookie, session và thuộc tính bảo mật.",
      "Giải thích HOL của HTTP/1.1 và lợi ích multiplexing.",
      "Biết HTTP/3 trên QUIC giải quyết vấn đề gì."
    ],
    steps: [
      {
        short: "Request / response",
        type: "Khởi đầu",
        title: "Method, path, header, body",
        body: "Request gồm method (GET/POST/PUT/DELETE), đường dẫn, header và body. Response gồm status, header, body. Nhóm 2xx thành công, 3xx chuyển hướng, 4xx lỗi phía client, 5xx lỗi phía server. GET/PUT/DELETE thường idempotent; POST không.",
        focus: ["browser", "edge"],
        edges: ["b-e"],
        metrics: { method: "GET", status: "200 OK", cache: "—", proto: "HTTP/1.1" },
        changes: ["Gửi request", "Nhận response"],
        note: "Đừng dùng GET cho thao tác thay đổi dữ liệu: cache/prefetch có thể gọi lại ngoài ý muốn."
      },
      {
        short: "Cookie & session",
        type: "Danh tính",
        title: "Cookie giữ trạng thái qua các request",
        body: "HTTP vốn không trạng thái. Server đặt cookie qua Set-Cookie; trình duyệt gửi lại trong header Cookie. Cookie phiên chứa session ID; cờ HttpOnly chặn JavaScript đọc, Secure chỉ gửi qua HTTPS, SameSite giảm CSRF.",
        focus: ["browser", "user", "edge"],
        edges: ["b-e"],
        metrics: { method: "GET", status: "Set-Cookie", cache: "no-store", proto: "HTTP/2" },
        changes: ["Lưu cookie", "Gửi kèm request sau"],
        note: "Không nhét dữ liệu nhạy cảm vào cookie nếu không mã hóa/ký. Session ID phải ngẫu nhiên và có thời hạn."
      },
      {
        short: "Cache HTTP",
        type: "Tối ưu",
        title: "ETag và 304 tiết kiệm băng thông",
        body: "Cache-Control quy định thời gian cache và khả năng dùng lại. ETag/Last-Modified cho phép client hỏi điều kiện If-None-Match; nếu không đổi, server trả 304 Not Modified không có body. Vary giúp cache phân biệt theo Accept-Encoding, ngôn ngữ...",
        focus: ["browser", "edge", "origin"],
        edges: ["b-e", "e-o", "o-e"],
        metrics: { method: "GET", status: "304", cache: "max-age + ETag", proto: "HTTP/2" },
        changes: ["Cache hit", "Xác thực lại khi hết hạn"],
        note: "Tài nguyên có người dùng riêng phải dùng private/no-store. Cache sai gây lộ dữ liệu giữa người dùng."
      },
      {
        short: "HTTP/1.1 & HOL",
        type: "Giới hạn",
        title: "Sáu kết nối và tắc đầu dòng",
        body: "HTTP/1.1 thường mở nhiều kết nối TCP do mỗi kết nối xử lý tuần tự. Một response chậm chặn các response sau trên cùng kết nối (head-of-line blocking). Trình duyệt giới hạn khoảng 6 kết nối mỗi host, làm tài nguyên cạnh tranh nhau.",
        focus: ["browser", "origin"],
        edges: ["b-e", "e-o"],
        metrics: { method: "GET × 6", status: "200", cache: "—", proto: "HTTP/1.1" },
        warn: ["browser", "origin"],
        changes: ["Nhiều kết nối", "Xếp hàng tài nguyên"],
        note: "Kỹ thuật cũ: domain sharding, sprite, bundle. HTTP/2 giảm nhu cầu đó nhưng không xóa mọi chi phí."
      },
      {
        short: "HTTP/2",
        type: "Đa luồng",
        title: "Multiplexing trên một kết nối TCP",
        body: "HTTP/2 chia message thành frame, gắn stream ID, cho phép nhiều request/response song song trên một kết nối. HPACK nén header. Tuy nhiên tất cả stream vẫn nằm trên một TCP, nên mất một segment chặn toàn bộ (TCP HOL).",
        focus: ["browser", "edge", "origin"],
        edges: ["b-e", "e-o"],
        metrics: { method: "GET × 20", status: "200", cache: "cache tốt hơn", proto: "HTTP/2" },
        changes: ["Một kết nối, nhiều stream", "Nén header"],
        note: "Server push ít được dùng do khó tối ưu. Ưu tiên preload có chọn lọc, không lạm dụng."
      },
      {
        short: "HTTP/3 & QUIC",
        type: "Tổng kết",
        title: "QUIC trên UDP, stream độc lập",
        body: "HTTP/3 chạy trên QUIC (UDP), tích hợp TLS 1.3, cho phép stream độc lập nên mất gói trên một stream không chặn stream khác. Hỗ trợ 0-RTT (có rủi ro replay) và chuyển mạng mà giữ kết nối (connection migration).",
        focus: ["all"],
        edges: "all",
        metrics: { method: "GET", status: "200", cache: "Theo tài nguyên", proto: "HTTP/3 · QUIC" },
        changes: ["Giảm HOL", "Bắt tay nhanh hơn"],
        note: "HTTP/3 cần mở UDP 443. Một số mạng chặn UDP làm fallback về HTTP/2; hãy kiểm tra thực tế thay vì chỉ bật cờ."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 18 — HTTPS/TLS
     ------------------------------------------------------------------ */
  SL.lessons["tls-https"] = {
    id: "tls-https",
    module: "application",
    title: "HTTPS & TLS: chứng chỉ, bắt tay và lỗi thường gặp",
    shortTitle: "HTTPS & TLS",
    subtitle: "HTTPS = HTTP + TLS. Chứng chỉ xác thực danh tính, trao đổi khóa tạo kênh mã hóa, còn HSTS và OCSP giúp giảm rủi ro thực tế.",
    blurb: "Hiểu chuỗi chứng chỉ, TLS 1.3, SNI/ALPN, forward secrecy và cách chẩn đoán lỗi HTTPS thay vì bấm “tiếp tục”.",
    duration: "18 phút",
    level: "Trung cấp",
    tags: ["HTTPS", "TLS 1.3", "chứng chỉ", "CA", "SNI", "ALPN", "HSTS", "forward secrecy", "0-RTT"],
    metrics: [
      { key: "version", label: "Phiên bản", tone: "blue" },
      { key: "cert", label: "Chứng chỉ", tone: "green" },
      { key: "kx", label: "Trao đổi khóa", tone: "violet" },
      { key: "rtt", label: "Bắt tay", tone: "coral" }
    ],
    nodes: [
      { id: "browser", type: "client", x: 40, y: 210, w: 165, h: 66, label: "Trình duyệt", sub: "client" },
      { id: "server", type: "server", x: 690, y: 210, w: 155, h: 66, label: "Web server", sub: "TLS endpoint" },
      { id: "ca", type: "store", x: 365, y: 55, w: 170, h: 64, label: "Root CA", sub: "tin cậy sẵn" },
      { id: "inter", type: "store", x: 365, y: 355, w: 170, h: 64, label: "Intermediate", sub: "ký leaf" },
      { id: "ocsp", type: "dns", x: 40, y: 350, w: 175, h: 64, label: "OCSP / CT", sub: "kiểm tra thu hồi" }
    ],
    edges: [
      { id: "b-s", from: "browser", to: "server", kind: "request", label: "ClientHello" },
      { id: "s-b", from: "server", to: "browser", kind: "response", bow: 56, label: "ServerHello + cert" },
      { id: "ca-inter", from: "ca", to: "inter", kind: "response" },
      { id: "inter-s", from: "inter", to: "server", kind: "response" },
      { id: "b-ocsp", from: "browser", to: "ocsp", kind: "request" }
    ],
    learn: [
      "Nêu ba mục tiêu bảo mật của HTTPS.",
      "Kiểm tra chuỗi chứng chỉ, SAN và hạn dùng.",
      "Hiểu TLS 1.3, X25519 và forward secrecy.",
      "Biết SNI, ALPN, ECH và rủi ro 0-RTT.",
      "Chẩn đoán lỗi chứng chỉ và vận hành HTTPS."
    ],
    steps: [
      {
        short: "Vì sao HTTPS",
        type: "Khởi đầu",
        title: "Bảo mật, toàn vẹn, xác thực",
        body: "HTTPS mã hóa nội dung để người nghe lén không đọc được, phát hiện sửa đổi trên đường truyền và xác thực server bằng chứng chỉ. Nó không bảo vệ server bị hack, không ẩn hoàn toàn tên miền khỏi người quan sát và không thay thế xác thực người dùng.",
        focus: ["browser", "server"],
        edges: ["b-s"],
        metrics: { version: "TLS 1.3", cert: "hợp lệ", kx: "—", rtt: "1-RTT" },
        changes: ["ClientHello", "ServerHello"],
        note: "HTTPS bảo vệ đường truyền, không bảo vệ dữ liệu sau khi server bị xâm nhập. Vẫn cần vá lỗi, phân quyền và sao lưu."
      },
      {
        short: "Chuỗi chứng chỉ",
        type: "Danh tính",
        title: "Leaf → intermediate → root",
        body: "Server gửi leaf certificate, thường kèm intermediate. Trình duyệt xây chuỗi đến root CA tin cậy. SAN liệt kê tên miền hợp lệ; thời hạn, khóa công khai và chữ ký được kiểm tra. Root CA không bao giờ được gửi trong handshake.",
        focus: ["ca", "inter", "server"],
        edges: ["ca-inter", "inter-s"],
        metrics: { version: "TLS 1.3", cert: "Leaf + chain", kx: "—", rtt: "1-RTT" },
        changes: ["Kiểm tra SAN", "Xác minh chữ ký"],
        note: "Thiếu intermediate là lỗi phổ biến: máy này mở được, máy khác báo lỗi. Dùng chuỗi đầy đủ từ CA."
      },
      {
        short: "TLS 1.2 vs 1.3",
        type: "Bắt tay",
        title: "TLS 1.3 gọn hơn, mặc định an toàn hơn",
        body: "TLS 1.2 cần nhiều vòng và cho phép bộ mã yếu nếu cấu hình sai. TLS 1.3 rút gọn còn 1-RTT, chỉ giữ bộ mã hiện đại, dùng X25519/ECDHE để có forward secrecy: lộ khóa dài hạn không giải mã được phiên cũ.",
        focus: ["browser", "server"],
        edges: ["b-s", "s-b"],
        metrics: { version: "TLS 1.3", cert: "OK", kx: "X25519 · PFS", rtt: "1-RTT" },
        changes: ["Thỏa thuận khóa", "Xác thực cert"],
        note: "Tắt TLS 1.0/1.1. Kiểm tra bằng openssl s_client -tls1_3 hoặc công cụ SSL Labs."
      },
      {
        short: "SNI, ALPN, ECH",
        type: "Định tuyến",
        title: "Một IP phục vụ nhiều tên miền",
        body: "SNI cho server biết tên miền client muốn để chọn chứng chỉ. ALPN thỏa thuận HTTP/2 hoặc HTTP/3 trong handshake. ECH mã hóa SNI để giảm lộ tên miền; nó cần DNS HTTPS record và hỗ trợ hai phía.",
        focus: ["browser", "server"],
        edges: ["b-s"],
        metrics: { version: "TLS 1.3", cert: "Theo SNI", kx: "X25519", rtt: "1-RTT" },
        changes: ["Chọn cert theo SNI", "Chọn giao thức ALPN"],
        note: "SNI cũ vẫn lộ tên miền với người quan sát. ECH chưa phổ biến toàn cầu, nhưng là hướng giảm rò rỉ metadata."
      },
      {
        short: "0-RTT và replay",
        type: "Tối ưu",
        title: "Nhanh hơn nhưng phải chống replay",
        body: "TLS 1.3 cho phép client gửi dữ liệu sớm bằng 0-RTT khi đã có session ticket. Dữ liệu này có thể bị phát lại bởi kẻ tấn công. Chỉ dùng 0-RTT cho request an toàn/idempotent; không dùng cho thanh toán hay thao tác thay đổi trạng thái.",
        focus: ["browser", "server"],
        edges: ["b-s", "s-b"],
        metrics: { version: "TLS 1.3", cert: "Session resumption", kx: "PSK", rtt: "0-RTT" },
        warn: ["browser"],
        changes: ["Gửi dữ liệu sớm", "Server chống replay"],
        note: "0-RTT không thay thế thiết kế idempotent. Nếu nghi ngờ, tắt 0-RTT cho endpoint nhạy cảm."
      },
      {
        short: "Lỗi thường gặp",
        type: "Tổng kết",
        title: "Chẩn đoán HTTPS theo từng lớp",
        body: "Lỗi tên miền: SAN sai. Lỗi thời hạn: cert hết hạn. Lỗi chuỗi: thiếu intermediate. Lỗi giao thức: client/server không khớp TLS. Lỗi hỗn hợp nội dung: tài nguyên HTTP trong trang HTTPS. HSTS buộc HTTPS; ACME tự động gia hạn; mTLS xác thực cả client.",
        focus: ["all"],
        edges: "all",
        metrics: { version: "TLS 1.3", cert: "Giám sát hạn", kx: "PFS", rtt: "Tối ưu" },
        changes: ["Kiểm tra chuỗi", "Tự động gia hạn"],
        note: "Đừng bấm bỏ qua cảnh báo chứng chỉ khi dùng thật. Hãy sửa chuỗi hoặc thời hạn; cảnh báo là tín hiệu tấn công tiềm năng."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 19 — Bảo mật mạng
     ------------------------------------------------------------------ */
  SL.lessons["network-security"] = {
    id: "network-security",
    module: "security-ops",
    title: "Bảo mật mạng: MITM, DDoS, firewall và VPN",
    shortTitle: "Bảo mật mạng",
    subtitle: "Mạng là bề mặt tấn công: nghe lén, giả mạo, DDoS, khai thác ứng dụng. Bảo vệ bằng nhiều lớp, không bằng một thiết bị.",
    blurb: "Hiểu mô hình mối đe dọa, MITM/ARP spoofing, DDoS, firewall/IDS/WAF, DMZ, zero trust và VPN ở mức khái niệm lẫn thực hành.",
    duration: "20 phút",
    level: "Nâng cao",
    tags: ["CIA", "MITM", "ARP spoofing", "DDoS", "SYN flood", "WAF", "IDS/IPS", "zero trust", "VPN", "IPsec"],
    metrics: [
      { key: "threat", label: "Mối đe dọa", tone: "coral" },
      { key: "integrity", label: "Toàn vẹn", tone: "green" },
      { key: "auth", label: "Xác thực", tone: "blue" },
      { key: "exposure", label: "Bề mặt", tone: "violet" }
    ],
    nodes: [
      { id: "attacker", type: "star", x: 35, y: 80, w: 160, h: 64, label: "Kẻ tấn công", sub: "Internet" },
      { id: "client", type: "client", x: 35, y: 340, w: 160, h: 64, label: "Người dùng", sub: "chi nhánh" },
      { id: "fw", type: "gateway", x: 255, y: 210, w: 165, h: 66, label: "Firewall / IPS", sub: "biên mạng" },
      { id: "dns", type: "dns", x: 255, y: 60, w: 165, h: 60, label: "DNS", sub: "nội bộ" },
      { id: "server", type: "server", x: 485, y: 210, w: 165, h: 66, label: "Web server", sub: "DMZ" },
      { id: "db", type: "db", x: 705, y: 210, w: 150, h: 66, label: "Database", sub: "nội bộ" }
    ],
    edges: [
      { id: "at-fw", from: "attacker", to: "fw", kind: "request", label: "tấn công" },
      { id: "cl-fw", from: "client", to: "fw", kind: "request", label: "VPN" },
      { id: "fw-s", from: "fw", to: "server", kind: "request", label: "443" },
      { id: "s-db", from: "server", to: "db", kind: "request", label: "nội bộ" },
      { id: "fw-dns", from: "fw", to: "dns", kind: "request", bow: -18 }
    ],
    learn: [
      "Áp dụng CIA và mô hình mối đe dọa.",
      "Giải thích MITM, ARP/DNS spoofing và cách giảm thiểu.",
      "Phân loại DDoS và biện pháp phòng vệ.",
      "Phân biệt firewall, IDS, IPS, WAF và DMZ.",
      "Hiểu VPN, zero trust và phòng thủ nhiều lớp."
    ],
    steps: [
      {
        short: "Mô hình mối đe dọa",
        type: "Khởi đầu",
        title: "Bảo mật theo CIA và bề mặt tấn công",
        body: "Confidentiality (bí mật), Integrity (toàn vẹn), Availability (sẵn sàng). Mô hình hóa ai tấn công, tài sản nào quan trọng, đường vào nào. Nguyên tắc least privilege và giảm bề mặt: đóng cổng không dùng, tách mạng, cập nhật.",
        focus: ["attacker", "fw", "server"],
        edges: ["at-fw", "fw-s"],
        metrics: { threat: "Phân tích", integrity: "Cần bảo vệ", auth: "Least privilege", exposure: "Đang giảm" },
        changes: ["Liệt kê tài sản", "Xác định đường vào"],
        note: "Không có bảo mật tuyệt đối. Mục tiêu là giảm xác suất và tác động, đồng thời phát hiện sớm khi bị xâm nhập."
      },
      {
        short: "MITM & giả mạo",
        type: "Nghe lén",
        title: "Kẻ tấn công chen giữa đường truyền",
        body: "ARP spoofing khiến nạn nhân gửi traffic qua máy tấn công; DNS spoofing trả IP giả. Trên Wi-Fi công cộng, captive portal giả có thể đánh cắp thông tin. TLS/HSTS, DNSSEC, xác thực chứng chỉ và tránh mạng lạ giảm rủi ro.",
        focus: ["attacker", "client", "dns"],
        edges: ["at-fw", "cl-fw", "fw-dns"],
        metrics: { threat: "MITM", integrity: "TLS phát hiện", auth: "Cert pinning", exposure: "Wi-Fi lạ" },
        warn: ["attacker", "client"],
        changes: ["Đầu độc ARP/DNS", "Chặn bằng TLS/HSTS"],
        note: "HTTPS bảo vệ nội dung nhưng không ẩn hoàn toàn metadata. Kiểm tra chứng chỉ và không cài CA lạ."
      },
      {
        short: "DDoS",
        type: "Sẵn sàng",
        title: "Làm cạn tài nguyên từ nhiều nguồn",
        body: "DDoS volumetric làm đầy băng thông; SYN flood làm cạn bảng kết nối; tấn công lớp ứng dụng gửi request tốn kém. Phòng vệ: anycast/CDN, rate limiting, SYN cookies, IPS, autoscale và kế hoạch ứng phó. Không thể chặn chỉ bằng một firewall biên.",
        focus: ["attacker", "fw", "server"],
        edges: ["at-fw", "fw-s"],
        metrics: { threat: "DDoS", integrity: "—", auth: "—", exposure: "Hạn chế rate" },
        warn: ["fw"],
        changes: ["Lưu lượng tăng vọt", "Lọc phân tán"],
        note: "Phân biệt DDoS với lỗi cấu hình hoặc tăng trưởng thật. Cần baseline lưu lượng để nhận diện bất thường."
      },
      {
        short: "Firewall / IDS / WAF",
        type: "Phòng vệ",
        title: "Mỗi lớp nhìn thấy một phần",
        body: "Firewall lọc theo IP/port/trạng thái; IDS phát hiện dấu hiệu tấn công; IPS chặn chủ động; WAF lọc HTTP theo ứng dụng. DMZ đặt dịch vụ công khai tách khỏi mạng nội bộ. NAT không phải bảo mật.",
        focus: ["fw", "server", "db"],
        edges: ["fw-s", "s-db"],
        metrics: { threat: "Bị lọc", integrity: "Kiểm tra", auth: "Phân vùng", exposure: "DMZ" },
        changes: ["Áp rule", "Tách vùng mạng"],
        note: "Cho phép tối thiểu, ghi log, rà soát rule định kỳ. Một rule any-any vô hiệu hóa toàn bộ thiết kế."
      },
      {
        short: "VPN",
        type: "Đường hầm",
        title: "Mã hóa từ client đến mạng tin cậy",
        body: "VPN site-to-site nối hai mạng; remote-access nối người dùng về công ty. IPsec bảo vệ ở lớp IP; WireGuard/OpenVPN thường dùng UDP và cấu hình gọn. VPN bảo vệ đường truyền, nhưng zero trust yêu cầu xác thực và phân quyền từng dịch vụ.",
        focus: ["client", "fw", "server"],
        edges: ["cl-fw", "fw-s"],
        metrics: { threat: "Giảm nghe lén", integrity: "Mã hóa", auth: "MFA", exposure: "Theo phiên" },
        changes: ["Tạo tunnel", "Xác thực người dùng"],
        note: "VPN không miễn nhiễm malware. Thiết bị đầu cuối bị nhiễm vẫn có thể tấn công nội bộ sau khi kết nối."
      },
      {
        short: "Phòng thủ nhiều lớp",
        type: "Tổng kết",
        title: "Không có một viên đạn bạc",
        body: "Kết hợp vá lỗi, MFA, phân quyền tối thiểu, mã hóa, phân vùng, giám sát, sao lưu và diễn tập ứng phó. Zero trust: không tin mặc định chỉ vì trong mạng; xác thực liên tục và thu nhỏ quyền. Bảo mật là quy trình, không phải sản phẩm.",
        focus: ["all"],
        edges: "all",
        metrics: { threat: "Giảm thiểu", integrity: "Kiểm soát", auth: "MFA", exposure: "Tối thiểu" },
        changes: ["Nhiều lớp kiểm soát", "Giám sát & diễn tập"],
        note: "Sao lưu phải được kiểm tra khôi phục. Một bản backup chưa từng restore không được coi là sao lưu."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 20 — QoS, CDN và cloud
     ------------------------------------------------------------------ */
  SL.lessons["qos-cloud"] = {
    id: "qos-cloud",
    module: "security-ops",
    title: "QoS, CDN và cloud: vận hành ở quy mô lớn",
    shortTitle: "QoS & cloud",
    subtitle: "Khi hệ thống ra Internet: QoS giữ dịch vụ quan trọng, CDN đưa nội dung đến gần người dùng, load balancer và cloud lo phần mở rộng.",
    blurb: "Hiểu độ trễ, jitter, mất gói, hàng đợi, CDN, cân bằng tải, cloud region/AZ và SLO — những thứ quyết định trải nghiệm thật.",
    duration: "18 phút",
    level: "Trung cấp",
    tags: ["QoS", "DSCP", "jitter", "WFQ", "shaping", "CDN", "load balancing", "SLA", "SLO", "cloud"],
    metrics: [
      { key: "latency", label: "Latency", tone: "blue" },
      { key: "jitter", label: "Jitter", tone: "violet" },
      { key: "loss", label: "Mất gói", tone: "coral" },
      { key: "cost", label: "Chi phí", tone: "yellow" }
    ],
    nodes: [
      { id: "client", type: "client", x: 30, y: 210, w: 155, h: 66, label: "Người dùng", sub: "chi nhánh" },
      { id: "cdn", type: "cdn", x: 225, y: 210, w: 160, h: 66, label: "CDN edge", sub: "anycast" },
      { id: "lb", type: "lb", x: 425, y: 210, w: 160, h: 66, label: "Load balancer", sub: "L4/L7" },
      { id: "app", type: "server", x: 625, y: 210, w: 150, h: 66, label: "App server", sub: "autoscale" },
      { id: "db", type: "db", x: 625, y: 350, w: 150, h: 64, label: "Database", sub: "multi-AZ" }
    ],
    edges: [
      { id: "c-cdn", from: "client", to: "cdn", kind: "request", label: "HTTPS" },
      { id: "cdn-lb", from: "cdn", to: "lb", kind: "request", label: "origin" },
      { id: "lb-app", from: "lb", to: "app", kind: "request" },
      { id: "app-db", from: "app", to: "db", kind: "request" },
      { id: "lb-app2", from: "lb", to: "app", kind: "response", bow: 20, label: "sticky" }
    ],
    learn: [
      "Đo latency, jitter, loss và phân loại traffic.",
      "Hiểu DSCP, hàng đợi, shaping/policing.",
      "Giải thích CDN, anycast và cache origin.",
      "Phân biệt cân bằng tải L4/L7 và health check.",
      "Thiết kế cloud region/AZ với SLO và chi phí."
    ],
    steps: [
      {
        short: "Bốn chiều chất lượng",
        type: "Khởi đầu",
        title: "Latency, jitter, loss và băng thông",
        body: "Latency là độ trễ; jitter là dao động độ trễ; loss là mất gói; băng thông là dung lượng. Video call nhạy với jitter/latency, tải file nhạy với băng thông, giao dịch nhạy với cả ba. QoS phân loại traffic để dịch vụ quan trọng không bị bỏ đói.",
        focus: ["client", "cdn"],
        edges: ["c-cdn"],
        metrics: { latency: "30 ms", jitter: "5 ms", loss: "0%", cost: "—" },
        changes: ["Đo baseline", "Phân loại traffic"],
        note: "Đo từ vị trí người dùng thật. Số liệu trong datacenter không đại diện cho trải nghiệm cuối."
      },
      {
        short: "DSCP & hàng đợi",
        type: "Ưu tiên",
        title: "Đánh dấu, xếp hàng, phục vụ",
        body: "DSCP đánh dấu gói (voice, video, best effort). Router dùng hàng đợi ưu tiên hoặc WFQ để chia dung lượng. Shaping làm mượt lưu lượng ra; policing loại bỏ vượt mức. AQM giữ hàng đợi ngắn để giảm bufferbloat.",
        focus: ["cdn", "lb"],
        edges: ["cdn-lb"],
        metrics: { latency: "25 ms", jitter: "2 ms", loss: "0%", cost: "—" },
        changes: ["Đánh dấu DSCP", "Hàng đợi ưu tiên"],
        note: "QoS chỉ sắp xếp trong giới hạn dung lượng. Không thể biến đường 10 Mbps thành 100 Mbps."
      },
      {
        short: "CDN",
        type: "Phân phối",
        title: "Đưa nội dung đến gần người dùng",
        body: "CDN dùng anycast và PoP gần người dùng, cache tài nguyên tĩnh, giảm RTT và tải origin. TTL quyết định độ tươi; purge/invalidation xử lý nội dung thay đổi. Origin shield giảm request dồn về nguồn.",
        focus: ["client", "cdn", "lb"],
        edges: ["c-cdn", "cdn-lb"],
        metrics: { latency: "8 ms", jitter: "1 ms", loss: "0%", cost: "Cache hit 92%" },
        changes: ["Cache tại edge", "Giảm tải origin"],
        note: "Nội dung cá nhân hóa không nên cache công khai. Kiểm tra Vary và header cache trước khi bật CDN."
      },
      {
        short: "Cân bằng tải",
        type: "Mở rộng",
        title: "L4/L7, health check và autoscale",
        body: "Load balancer L4 phân phối theo IP/port; L7 hiểu HTTP và có thể route theo path/header. Health check loại instance lỗi. Sticky session cần thiết cho ứng dụng có trạng thái, nhưng nên thiết kế stateless để scale dễ hơn. Autoscale thêm/bớt instance theo tải.",
        focus: ["lb", "app"],
        edges: ["lb-app", "lb-app2"],
        metrics: { latency: "20 ms", jitter: "3 ms", loss: "0%", cost: "2 instance" },
        changes: ["Health check", "Phân phối request"],
        note: "Một load balancer đơn lẻ là điểm chết. Thiết kế nhiều AZ và giám sát dung lượng."
      },
      {
        short: "Cloud & SLA",
        type: "Hạ tầng",
        title: "Region, AZ, egress và SLO",
        body: "Region là khu vực địa lý; AZ là trung tâm dữ liệu độc lập trong region. Đặt nhiều AZ để chịu lỗi. Egress (dữ liệu ra) ảnh hưởng chi phí; multi-region tăng chi phí và độ phức tạp. SLA là cam kết nhà cung cấp; SLO là mục tiêu nội bộ đo được.",
        focus: ["app", "db", "lb"],
        edges: ["app-db", "lb-app"],
        metrics: { latency: "Theo vùng", jitter: "Thấp", loss: "0%", cost: "Theo egress" },
        changes: ["Triển khai multi-AZ", "Đặt SLO"],
        note: "SLA thường bồi thường bằng credit, không cứu được doanh thu. Phải có phương án dự phòng và diễn tập."
      },
      {
        short: "Tổng kết",
        type: "Tổng kết",
        title: "Thiết kế cho lỗi và đo lường liên tục",
        body: "Mục tiêu vận hành: SLO rõ ràng, giám sát latency/jitter/loss, cảnh báo theo triệu chứng người dùng, CDN + LB + multi-AZ, và kiểm soát chi phí. Thiết kế cho failure: giả định một thành phần sẽ hỏng và hệ thống vẫn chạy.",
        focus: ["all"],
        edges: "all",
        metrics: { latency: "Theo SLO", jitter: "Theo SLO", loss: "Dưới ngưỡng", cost: "Tối ưu" },
        changes: ["Giám sát end-to-end", "Diễn tập sự cố"],
        note: "Đo từ ngoài vào (synthetic + RUM). Dashboard nội bộ xanh không có nghĩa người dùng đang có trải nghiệm tốt."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Luyện tập bổ sung — 6 ca
     ------------------------------------------------------------------ */
  (SL.practice = SL.practice || []).push(
    {
      id: "dns-stale-after-move",
      tag: "DNS",
      title: "Đã đổi IP máy chủ nhưng một nửa người dùng vẫn vào IP cũ",
      scenario: "Nhóm vận hành chuyển web sang IP mới và cập nhật bản ghi A. Một số người dùng vẫn kết nối IP cũ trong nhiều giờ; người dùng mới thì bình thường. dig @8.8.8.8 trả IP mới.",
      metrics: [
        { label: "Bản ghi A", value: "IP mới" },
        { label: "TTL", value: "3600", danger: true },
        { label: "Số người lỗi", value: "~40%", danger: true }
      ],
      options: [
        "Khởi động lại toàn bộ router của người dùng",
        "Chờ cache TTL hết hạn; lần sau hạ TTL trước khi chuyển",
        "Đổi port HTTPS của máy chủ",
        "Tắt DNSSEC để bản ghi cập nhật nhanh hơn"
      ],
      correct: 1,
      explain: "Resolver và máy khách đã cache bản ghi cũ theo TTL 3600 giây. Cập nhật DNS không xóa cache toàn cầu. Quy trình đúng là hạ TTL trước khi chuyển IP vài giờ, chuyển khi TTL thấp, sau đó nâng lại. Tắt DNSSEC không liên quan."
    },
    {
      id: "http2-tcp-hol",
      tag: "HTTP",
      title: "Bật HTTP/2 nhưng trang vẫn chậm khi mạng mất gói",
      scenario: "Trang chuyển từ HTTP/1.1 sang HTTP/2, nhiều tài nguyên tải song song hơn. Tuy nhiên trên tuyến mạng mất gói 2%, tất cả tài nguyên cùng đứng khi một gói bị mất. Server đã bật TLS 1.3.",
      metrics: [
        { label: "Giao thức", value: "HTTP/2" },
        { label: "Mất gói", value: "2%", danger: true },
        { label: "Kiểu chậm", value: "đồng loạt", danger: true }
      ],
      options: [
        "Tắt TLS để giảm chi phí mã hóa",
        "Chuyển sang HTTP/3/QUIC hoặc giảm mất gói; HTTP/2 vẫn chịu TCP HOL",
        "Mở thêm 6 kết nối TCP cho mỗi tên miền",
        "Nén toàn bộ ảnh thành JPEG chất lượng thấp"
      ],
      correct: 1,
      explain: "HTTP/2 multiplexing chia stream nhưng tất cả nằm trên một kết nối TCP. Mất một segment làm toàn bộ kết nối chờ, gọi là TCP head-of-line blocking. HTTP/3 trên QUIC cho stream độc lập; song song đó cần giảm mất gói thật."
    },
    {
      id: "tls-expired-chain",
      tag: "TLS",
      title: "Chỉ một số máy báo lỗi chứng chỉ HTTPS",
      scenario: "Máy Windows mở web bình thường; điện thoại Android báo NET::ERR_CERT_AUTHORITY_INVALID. Chứng chỉ còn hạn, tên miền đúng, nhưng lệnh openssl s_client chỉ thấy leaf certificate.",
      metrics: [
        { label: "Leaf cert", value: "hợp lệ" },
        { label: "Chuỗi gửi kèm", value: "thiếu intermediate", danger: true },
        { label: "Một số client", value: "lỗi", danger: true }
      ],
      options: [
        "Gia hạn chứng chỉ dù còn hạn",
        "Cấu hình server gửi đầy đủ chuỗi leaf + intermediate",
        "Đổi tên miền sang HTTP",
        "Tắt HSTS trên trình duyệt"
      ],
      correct: 1,
      explain: "Một số thiết bị đã cache intermediate hoặc có CA trung gian tin cậy nên mở được; thiết bị khác không xây được chuỗi đến root. Server phải gửi leaf kèm intermediate (không gửi root). Đây là lỗi cấu hình chain rất phổ biến."
    },
    {
      id: "ipv6-local-only",
      tag: "IPv6",
      title: "Máy có IPv6 nhưng mọi trang vẫn chậm rồi mới tải",
      scenario: "ip -6 addr chỉ thấy fe80:: trên máy. Router quảng bá IPv6 nhưng ISP chưa cấp prefix. Trình duyệt thử AAAA trước, chờ timeout rồi fallback IPv4.",
      metrics: [
        { label: "Địa chỉ IPv6", value: "chỉ link-local", danger: true },
        { label: "Prefix toàn cầu", value: "không có", danger: true },
        { label: "IPv4", value: "hoạt động" }
      ],
      options: [
        "Tắt IPv4 để buộc dùng IPv6",
        "Kiểm tra RA/prefix từ ISP; nếu chưa có IPv6 toàn cầu, tắt quảng bá hoặc sửa định tuyến",
        "Đổi DNS sang 8.8.4.4",
        "Tăng MTU lên 9000"
      ],
      correct: 1,
      explain: "fe80:: chỉ dùng trong link, không định tuyến ra Internet. Nếu router quảng bá IPv6 nhưng không có prefix/route toàn cầu, ứng dụng thử IPv6 rồi fallback, gây trễ. Cần prefix hợp lệ, RA đúng và kiểm tra firewall ICMPv6; không tắt IPv4."
    },
    {
      id: "vlan-broadcast-storm",
      tag: "VLAN/STP",
      title: "Cắm thêm một sợi cáp dự phòng, cả mạng LAN đứng",
      scenario: "Sau khi nối thêm link giữa hai switch, đèn link nhấp nháy liên tục, CPU switch 100%, mọi máy trong LAN mất mạng. Bảng MAC đổi cổng liên tục. Không có cấu hình STP trên hai switch.",
      metrics: [
        { label: "CPU switch", value: "100%", danger: true },
        { label: "Bảng MAC", value: "flapping", danger: true },
        { label: "STP", value: "tắt", danger: true }
      ],
      options: [
        "Thay cáp mạng vì đèn nhấp nháy",
        "Rút link dư thừa và bật STP/RSTP trước khi nối lại",
        "Tăng băng thông uplink",
        "Đổi địa chỉ IP của gateway"
      ],
      correct: 1,
      explain: "Hai link tạo vòng lặp lớp 2. Broadcast quay vòng, nhân bản và làm bảng MAC flapping, CPU quá tải. Không có TTL ở Ethernet. Cắt vòng ngay để khôi phục, sau đó bật STP/RSTP, kiểm tra root bridge và cổng blocking trước khi dùng link dự phòng."
    },
    {
      id: "qos-bufferbloat",
      tag: "QoS",
      title: "Tải file lớn làm cuộc gọi video giật dù băng thông còn",
      scenario: "Đường truyền 200 Mbps. Khi ai đó upload file, speedtest vẫn đạt 180 Mbps nhưng RTT tăng từ 20 ms lên 400 ms, jitter 120 ms, video call giật. Không mất gói đáng kể.",
      metrics: [
        { label: "Băng thông", value: "180 Mbps" },
        { label: "RTT dưới tải", value: "400 ms", danger: true },
        { label: "Jitter", value: "120 ms", danger: true }
      ],
      options: [
        "Mua thêm băng thông gấp đôi",
        "Bật QoS/SQM (fq_codel, CAKE), ưu tiên traffic hội thoại và giới hạn upload",
        "Đổi video call sang độ phân giải cao hơn",
        "Tắt Wi-Fi để dùng dây cho mọi người"
      ],
      correct: 1,
      explain: "Đây là bufferbloat: hàng đợi quá lớn giữ gói lâu, đẩy RTT/jitter lên dù không mất gói. Tăng băng thông có thể chỉ làm hàng đợi lớn hơn. Cần AQM/SQM ở router, ưu tiên traffic real-time và kiểm soát upload."
    }
  );

  /* ------------------------------------------------------------------
     Cheatsheets bổ sung
     ------------------------------------------------------------------ */
  (SL.cheatsheets = SL.cheatsheets || []).push(
    {
      id: "dns-http-tls",
      num: "07",
      title: "DNS, HTTP & TLS",
      intro: "Bộ tra cứu nhanh cho tầng ứng dụng: bản ghi DNS, mã HTTP, cache và các bước bắt tay TLS.",
      cards: [
        {
          title: "Bản ghi DNS",
          wide: true,
          html: `<table class="cheat-table">
            <tr><th>Loại</th><th>Ý nghĩa</th><th>Ví dụ</th></tr>
            <tr><td class="mono">A</td><td>IPv4 của tên miền</td><td class="mono">example.com → 93.184.216.34</td></tr>
            <tr><td class="mono">AAAA</td><td>IPv6 của tên miền</td><td class="mono">example.com → 2606:2800::1</td></tr>
            <tr><td class="mono">CNAME</td><td>Bí danh sang tên khác</td><td class="mono">www → example.com</td></tr>
            <tr><td class="mono">MX</td><td>Máy chủ thư</td><td class="mono">mail.example.com</td></tr>
            <tr><td class="mono">TXT</td><td>Xác minh, SPF, DKIM</td><td class="mono">v=spf1 ...</td></tr>
            <tr><td class="mono">NS</td><td>Nameserver của vùng</td><td class="mono">ns1.provider.net</td></tr>
            <tr><td class="mono">SOA</td><td>Thông tin vùng, cache âm</td><td class="mono">minimum TTL</td></tr>
            <tr><td class="mono">CAA</td><td>CA được phép cấp cert</td><td class="mono">letsencrypt.org</td></tr>
          </table>`
        },
        {
          title: "Mã HTTP thường gặp",
          html: `<div class="check-list">
            <span><b>200</b> OK · <b>201</b> Created · <b>204</b> No Content.</span>
            <span><b>301/308</b> chuyển vĩnh viễn · <b>302/307</b> tạm thời.</span>
            <span><b>304</b> Not Modified — dùng cache.</span>
            <span><b>400</b> request sai · <b>401</b> chưa xác thực · <b>403</b> bị cấm · <b>404</b> không thấy.</span>
            <span><b>429</b> quá nhiều request · <b>500</b> lỗi server · <b>502/504</b> lỗi gateway/timeout.</span>
          </div>`
        },
        {
          title: "Cache & cookie",
          html: `<div class="check-list">
            <span><b>Cache-Control:</b> max-age, no-store, private, public, stale-while-revalidate.</span>
            <span><b>ETag + If-None-Match</b> → 304, không tải lại body.</span>
            <span><b>Vary</b> tách cache theo Accept-Encoding / ngôn ngữ.</span>
            <span><b>Cookie:</b> HttpOnly, Secure, SameSite=Lax/Strict/None.</span>
            <span>Nội dung riêng tư: <b>private / no-store</b>, không cache công khai.</span>
          </div>`
        },
        {
          title: "TLS 1.3 & lỗi thường gặp",
          html: `<div class="check-list">
            <span><b>ClientHello</b> (SNI, ALPN, key share) → <b>ServerHello</b> + cert + Finished.</span>
            <span>X25519/ECDHE → <b>forward secrecy</b>; 1-RTT; 0-RTT chỉ cho request an toàn.</span>
            <span>Chuỗi đúng: leaf → intermediate; root nằm trong trust store.</span>
            <span>Kiểm tra: <span class="mono">openssl s_client -connect host:443 -servername host</span>.</span>
            <span>Lỗi hay gặp: hết hạn, sai SAN, thiếu intermediate, lệch giờ hệ thống.</span>
          </div>`
        }
      ]
    },
    {
      id: "ipv6-dhcp-security",
      num: "08",
      title: "IPv6, DHCP & bảo mật",
      intro: "Các con số và thông điệp cần nhớ khi cấu hình địa chỉ, chẩn đoán DHCP và kiểm tra phòng vệ.",
      cards: [
        {
          title: "Địa chỉ IPv6",
          wide: true,
          html: `<table class="cheat-table">
            <tr><th>Loại</th><th>Prefix</th><th>Dùng cho</th></tr>
            <tr><td><b>GUA</b></td><td class="mono">2000::/3</td><td>Địa chỉ toàn cầu, có thể định tuyến Internet</td></tr>
            <tr><td><b>ULA</b></td><td class="mono">fc00::/7</td><td>Nội bộ, tương tự private IPv4</td></tr>
            <tr><td><b>Link-local</b></td><td class="mono">fe80::/10</td><td>Chỉ trong một link; NDP dùng địa chỉ này</td></tr>
            <tr><td><b>Loopback</b></td><td class="mono">::1/128</td><td>Localhost</td></tr>
            <tr><td><b>Multicast</b></td><td class="mono">ff00::/8</td><td> solicited-node, all-nodes</td></tr>
          </table>
          <div class="formula">LAN chuẩn: prefix <span class="hl">/64</span> + interface ID 64 bit</div>`
        },
        {
          title: "DHCP và ICMP",
          html: `<div class="check-list">
            <span><b>DORA:</b> Discover → Offer → Request → ACK (UDP 67/68).</span>
            <span><b>Lease:</b> T1 = 50%, T2 = 87,5%; hết hạn thì xin lại.</span>
            <span><b>Option:</b> 3 gateway · 6 DNS · 15 domain · 51 lease time.</span>
            <span><b>ICMP:</b> Echo, Time Exceeded (traceroute), Destination Unreachable, Packet Too Big.</span>
            <span>IP <span class="mono">169.254.x.x</span> = DHCP thất bại (APIPA).</span>
          </div>`
        },
        {
          title: "Phòng vệ theo lớp",
          html: `<div class="check-list">
            <span><b>Biên:</b> firewall stateful, IPS, DDoS protection, rate limit.</span>
            <span><b>Ứng dụng:</b> WAF, xác thực, phân quyền, vá lỗi.</span>
            <span><b>Dữ liệu:</b> TLS, mã hóa at-rest, sao lưu có kiểm tra restore.</span>
            <span><b>Danh tính:</b> MFA, least privilege, tách tài khoản admin.</span>
            <span><b>Giám sát:</b> log tập trung, cảnh báo, diễn tập ứng phó.</span>
          </div>`
        },
        {
          title: "Số liệu QoS cần nhớ",
          html: `<table class="cheat-table">
            <tr><th>Ứng dụng</th><th>Nhạy nhất</th><th>Mục tiêu tham khảo</th></tr>
            <tr><td>VoIP</td><td>Latency, jitter, loss</td><td>&lt; 150 ms, &lt; 30 ms, &lt; 1%</td></tr>
            <tr><td>Video call</td><td>Jitter, loss</td><td>RTT &lt; 200 ms</td></tr>
            <tr><td>Web/API</td><td>RTT, TTFB</td><td>Tùy SLO</td></tr>
            <tr><td>Tải file</td><td>Băng thông</td><td>Tối đa đường truyền</td></tr>
          </table>
          <div class="formula">BDP = bandwidth × RTT · cwnd hiệu dụng = min(cwnd, rwnd)</div>`
        }
      ]
    }
  );
})();
