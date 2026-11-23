/* NetLab — SDN, lớp liên kết, MPLS/datacenter và hành trình một yêu cầu web */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  /* ------------------------------------------------------------------
     Chương 5 — SDN
     ------------------------------------------------------------------ */
  SL.lessons["sdn-control"] = {
    id: "sdn-control",
    module: "ch5-control-plane",
    title: "SDN: mặt phẳng điều khiển lập trình được",
    shortTitle: "SDN & OpenFlow",
    subtitle: "Chuyển từ router tự quyết sang bộ điều khiển trung tâm nhìn toàn mạng và cài luật xuống từng switch.",
    blurb: "Match-plus-action, OpenFlow, controller, traffic engineering và khôi phục khi liên kết hỏng.",
    duration: "16 phút",
    level: "Nâng cao",
    tags: ["SDN", "OpenFlow", "match-action", "flow table", "controller", "traffic engineering", "ECMP", "B4"],
    metrics: [
      { key: "flows", label: "Flow", tone: "blue" },
      { key: "util", label: "Tải", tone: "violet" },
      { key: "ctrl", label: "Độ trễ điều khiển", tone: "yellow" },
      { key: "reroute", label: "Reroute", tone: "coral" }
    ],
    nodes: [
      { id: "app", type: "book", x: 40, y: 80, w: 185, h: 66, label: "Ứng dụng điều khiển", sub: "traffic engineering" },
      { id: "controller", type: "server", x: 300, y: 80, w: 195, h: 66, label: "SDN controller", sub: "ONOS / OpenDaylight" },
      { id: "sw1", type: "lb", x: 180, y: 300, w: 165, h: 66, label: "Switch 1", sub: "flow table" },
      { id: "sw2", type: "lb", x: 430, y: 300, w: 165, h: 66, label: "Switch 2", sub: "flow table" },
      { id: "host", type: "client", x: 680, y: 300, w: 170, h: 66, label: "Host đích", sub: "10.0.0.9" }
    ],
    edges: [
      { id: "ap-c", from: "app", to: "controller", kind: "data", label: "northbound" },
      { id: "c-s1", from: "controller", to: "sw1", kind: "request", label: "OpenFlow" },
      { id: "c-s2", from: "controller", to: "sw2", kind: "request", label: "OpenFlow" },
      { id: "s1-s2", from: "sw1", to: "sw2", kind: "data", label: "data" },
      { id: "s2-h", from: "sw2", to: "host", kind: "request" }
    ],
    learn: [
      "Phân biệt mặt phẳng dữ liệu và điều khiển.",
      "Hiểu flow table và match-plus-action.",
      "Mô tả controller cài luật chủ động và phản ứng.",
      "Giải thích traffic engineering tập trung.",
      "Nhận ra đánh đổi của điều khiển tập trung."
    ],
    steps: [
      {
        short: "Tách hai mặt phẳng",
        type: "Khởi đầu",
        title: "Switch chỉ chuyển, controller quyết định",
        body: "Trong SDN, switch giữ <strong>flow table</strong> và chuyển gói theo luật; quyết định định tuyến nằm ở bộ điều khiển trung tâm. Switch không cần chạy OSPF/BGP phức tạp, chỉ cần giao thức nam-nam để nhận luật.",
        focus: ["controller", "sw1"],
        edges: ["c-s1"],
        metrics: { flows: "0", util: "5%", ctrl: "2 ms", reroute: "—" },
        changes: ["Chức năng được tách rõ", "Switch đơn giản hơn"],
        note: "SDN không bắt buộc tập trung tuyệt đối; nhiều controller có thể chia vùng và đồng bộ."
      },
      {
        short: "Match-plus-action",
        type: "Cơ chế",
        title: "Khớp trường nào, làm hành động gì",
        body: "Mỗi luật gồm <strong>match</strong> trên các trường (MAC, IP, port, VLAN, DSCP...) và <strong>action</strong> (forward cổng, drop, sửa header, gửi controller). Đây là mô hình tổng quát hơn bảng định tuyến đích, cho phép tường lửa, NAT và cân bằng tải ngay trong fabric.",
        focus: ["sw1", "sw2"],
        edges: ["c-s1", "c-s2", "s1-s2"],
        metrics: { flows: "8", util: "18%", ctrl: "2 ms", reroute: "—" },
        changes: ["Luật mô tả được nhiều chức năng", "Chuyển tiếp theo luồng"],
        note: "OpenFlow định nghĩa match 10 trường và các action chuẩn; nhiều switch hỗ trợ tập con."
      },
      {
        short: "Cài luật chủ động",
        type: "Điều khiển",
        title: "Controller đẩy flow trước khi gói đến",
        body: "Với luồng biết trước, controller tính đường và cài flow xuống switch từ trước (proactive). Gói đi thẳng theo luật, không phải hỏi controller. Cách này giữ độ trễ thấp nhưng cần dự đoán lưu lượng và cập nhật khi topology đổi.",
        focus: ["controller", "sw1", "sw2"],
        edges: ["c-s1", "c-s2"],
        metrics: { flows: "120", util: "35%", ctrl: "2 ms", reroute: "—" },
        changes: ["Luồng đi nhanh", "Giảm tải cho controller"],
        note: "Flow có timeout; hết hạn thì switch xóa và có thể phải hỏi lại controller."
      },
      {
        short: "Packet-in & flow-mod",
        type: "Phản ứng",
        title: "Gói lạ thì hỏi controller",
        body: "Khi gói không khớp luật nào, switch gửi <strong>packet-in</strong> lên controller. Controller quyết định và gửi <strong>flow-mod</strong> cài luật mới; các gói sau của cùng luồng đi thẳng. Cơ chế reactive linh hoạt nhưng gói đầu chịu thêm độ trễ.",
        focus: ["sw1", "controller"],
        edges: ["c-s1", "s1-s2"],
        metrics: { flows: "130", util: "38%", ctrl: "12 ms", reroute: "—" },
        changes: ["Luồng mới được học", "Gói đầu chậm hơn"],
        note: "Tấn công packet-in flood có thể làm quá tải controller; cần giới hạn tốc độ và luật mặc định."
      },
      {
        short: "Traffic engineering",
        type: "Ứng dụng",
        title: "Nhìn toàn mạng để chia tải",
        body: "Vì controller thấy toàn bộ topology và lưu lượng, nó có thể đặt các luồng lớn (elephant) sang đường ít tải thay vì để mọi luồng đi theo shortest path. Đây là lợi thế lớn so với định tuyến phân tán chỉ tối ưu từng router.",
        focus: ["app", "controller", "sw1", "sw2"],
        edges: ["ap-c", "c-s1", "c-s2", "s1-s2"],
        metrics: { flows: "240", util: "68%", ctrl: "5 ms", reroute: "—" },
        changes: ["Tải được cân bằng", "Đường đi tối ưu toàn cục"],
        note: "Google B4 dùng SDN để đạt gần 100% hiệu dụng trên các tuyến WAN liên datacenter."
      },
      {
        short: "Khôi phục khi hỏng",
        type: "Tổng kết",
        title: "Controller tính lại và cài đường mới",
        body: "Khi một liên kết hỏng, controller nhận sự kiện, tính lại đường và đẩy flow mới. Tốc độ khôi phục phụ thuộc vòng phát hiện và số flow cần sửa. Điều khiển tập trung mạnh nhưng cũng là điểm cần dự phòng và bảo vệ.",
        focus: ["all"],
        edges: "all",
        metrics: { flows: "240", util: "52%", ctrl: "8 ms", reroute: "180 ms" },
        changes: ["Lưu lượng chuyển tuyến dự phòng", "Mạng hội tụ trở lại"],
        note: "Cần controller HA, kênh quản trị riêng và giới hạn blast radius khi cài luật hàng loạt."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 6 — CRC và đa truy cập
     ------------------------------------------------------------------ */
  SL.lessons["error-detection-mac"] = {
    id: "error-detection-mac",
    module: "ch6-link",
    title: "Bắt lỗi bit và chia sẻ kênh: CRC, ALOHA, CSMA/CD",
    shortTitle: "CRC & đa truy cập",
    subtitle: "Làm sao biết một khung bị hỏng, và nhiều máy nói cùng lúc trên một dây thì ai được phát?",
    blurb: "Parity, checksum, CRC, TDMA, ALOHA, CSMA/CD — những cơ chế lớp 2 giữ Ethernet và Wi-Fi hoạt động.",
    duration: "17 phút",
    level: "Trung cấp",
    tags: ["CRC", "parity", "checksum", "ALOHA", "CSMA/CD", "CSMA/CA", "binary exponential backoff", "multiple access"],
    metrics: [
      { key: "ber", label: "Lỗi bit", tone: "coral" },
      { key: "util", label: "Hiệu dụng", tone: "green" },
      { key: "coll", label: "Va chạm", tone: "yellow" },
      { key: "over", label: "Overhead", tone: "violet" }
    ],
    nodes: [
      { id: "pca", type: "client", x: 40, y: 120, w: 160, h: 66, label: "PC-A", sub: "khung Ethernet" },
      { id: "medium", type: "lb", x: 255, y: 120, w: 185, h: 66, label: "Kênh chia sẻ", sub: "hub · 100 Mbps" },
      { id: "pcb", type: "client", x: 495, y: 120, w: 160, h: 66, label: "PC-B", sub: "cùng miền va chạm" },
      { id: "pcc", type: "client", x: 700, y: 120, w: 160, h: 66, label: "PC-C", sub: "cùng miền va chạm" }
    ],
    edges: [
      { id: "a-m", from: "pca", to: "medium", kind: "request", label: "khung" },
      { id: "b-m", from: "pcb", to: "medium", kind: "request" },
      { id: "c-m", from: "pcc", to: "medium", kind: "request" },
      { id: "m-b", from: "medium", to: "pcb", kind: "data", bow: 18 }
    ],
    learn: [
      "Phân biệt phát hiện lỗi và sửa lỗi.",
      "Hiểu CRC mạnh hơn parity/checksum ở đâu.",
      "So sánh chia kênh, truy cập ngẫu nhiên và lần lượt.",
      "Tính hiệu dụng của ALOHA và slotted ALOHA.",
      "Giải thích CSMA/CD và backoff trong Ethernet."
    ],
    steps: [
      {
        short: "Lỗi bit",
        type: "Khởi đầu",
        title: "Nhiễu làm bit 0 thành 1",
        body: "Trên dây đồng, nhiễu điện từ và suy hao có thể lật bit. Lớp liên kết không sửa mọi lỗi mà thường chỉ <strong>phát hiện</strong> rồi bỏ khung hỏng, để giao thức tầng trên gửi lại. Tỉ lệ lỗi bit (BER) càng cao, càng cần mã mạnh.",
        focus: ["pca", "medium"],
        edges: ["a-m"],
        metrics: { ber: "1e-9", util: "0%", coll: "0", over: "—" },
        changes: ["Xác định rủi ro lỗi", "Cần mã kiểm tra"],
        note: "Phát hiện lỗi không đảm bảo 100%: luôn có xác suất rất nhỏ lỗi không bị bắt."
      },
      {
        short: "Parity & checksum",
        type: "Cơ chế",
        title: "Parity một bit và checksum 16 bit",
        body: "Parity chẵn/lẻ thêm một bit để tổng số bit 1 chẵn hoặc lẻ; nó bắt được số lẻ bit lỗi nhưng bỏ sót lỗi chẵn. Internet checksum chia dữ liệu thành từ 16 bit, cộng bù một rồi gửi kèm — nhẹ nhưng không mạnh bằng CRC.",
        focus: ["pca"],
        edges: ["a-m"],
        metrics: { ber: "1e-9", util: "0%", coll: "0", over: "+2 byte" },
        changes: ["Thêm bit kiểm tra", "Chỉ phát hiện lỗi đơn giản"],
        note: "TCP/UDP dùng checksum 16 bit; Ethernet dùng CRC 32 bit mạnh hơn nhiều."
      },
      {
        short: "CRC",
        type: "Thuật toán",
        title: "Chia đa thức, lấy số dư",
        body: "CRC coi dữ liệu là đa thức nhị phân và chia cho đa thức sinh; số dư là mã kiểm tra. CRC-32 của Ethernet bắt được mọi lỗi chùm ngắn hơn 32 bit và xác suất bỏ sót cực thấp. Phần cứng tính CRC rất nhanh bằng thanh ghi dịch.",
        focus: ["pca", "medium"],
        edges: ["a-m"],
        metrics: { ber: "1e-9", util: "0%", coll: "0", over: "+4 byte" },
        changes: ["Khung có FCS 32 bit", "Lỗi chùm bị bắt tốt"],
        note: "FCS trong Ethernet là trailer 4 byte; khung lỗi bị hủy, không chuyển lên tầng trên."
      },
      {
        short: "Chia kênh",
        type: "Đa truy cập",
        title: "TDMA, FDMA và CDMA giữ chỗ trước",
        body: "Khi nhiều máy dùng chung kênh, có ba họ giao thức. <strong>Chia kênh</strong> cấp khe thời gian (TDMA), băng tần (FDMA) hoặc mã (CDMA) cố định — ổn định nhưng lãng phí khi máy không có dữ liệu.",
        focus: ["pca", "pcb", "pcc"],
        edges: ["a-m", "b-m", "c-m"],
        metrics: { ber: "1e-9", util: "25%", coll: "0", over: "khe cố định" },
        changes: ["Không va chạm", "Kênh rảnh vẫn bị giữ"],
        note: "Chia kênh phù hợp lưu lượng đều; với lưu lượng bùng nổ, truy cập ngẫu nhiên hiệu quả hơn."
      },
      {
        short: "ALOHA & CSMA",
        type: "Ngẫu nhiên",
        title: "Phát khi cần, va chạm thì thử lại",
        body: "ALOHA phát ngay, hiệu dụng tối đa 18%; slotted ALOHA chia khe, đạt 37%. <strong>CSMA</strong> nghe kênh trước khi phát; CSMA/CD còn phát hiện va chạm khi đang truyền, dừng ngay và chờ theo <strong>binary exponential backoff</strong>.",
        focus: ["pca", "pcb", "medium"],
        edges: ["a-m", "b-m"],
        metrics: { ber: "1e-9", util: "55%", coll: "12%", over: "backoff" },
        changes: ["Va chạm được phát hiện", "Thời gian chờ tăng theo lần va chạm"],
        note: "Backoff nhị phân giảm xác suất va chạm lặp lại; sau nhiều lần, khung có thể bị bỏ."
      },
      {
        short: "Lần lượt & Ethernet",
        type: "Tổng kết",
        title: "Polling, token và switch full-duplex",
        body: "Cơ chế lần lượt (polling, token ring) tránh va chạm nhưng có độ trễ chờ và điểm lỗi trung tâm. Ethernet hiện đại dùng switch, mỗi cổng là một miền va chạm riêng và chạy <strong>full-duplex</strong>; nhờ vậy CSMA/CD gần như không còn cần thiết trong LAN chuyển mạch.",
        focus: ["all"],
        edges: "all",
        metrics: { ber: "1e-10", util: "92%", coll: "0%", over: "FCS 4 byte" },
        changes: ["LAN chuyển mạch ổn định", "Không còn va chạm trên switch"],
        note: "Wi-Fi vẫn dùng CSMA/CA vì không thể vừa phát vừa nghe trên cùng tần số."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 6 — MPLS và datacenter
     ------------------------------------------------------------------ */
  SL.lessons["datacenter-mpls"] = {
    id: "datacenter-mpls",
    module: "ch6-link",
    title: "MPLS và mạng trung tâm dữ liệu: bên dưới lớp IP",
    shortTitle: "MPLS & datacenter",
    subtitle: "Nhãn MPLS chuyển tiếp nhanh không cần tra IP; leaf-spine thay thế mô hình ba tầng đã chạm giới hạn.",
    blurb: "Label switching, L3VPN, kiến trúc datacenter, ECMP, VXLAN và lý do Đông-Tây thống trị lưu lượng.",
    duration: "16 phút",
    level: "Nâng cao",
    tags: ["MPLS", "label", "LDP", "RSVP-TE", "L3VPN", "leaf-spine", "ECMP", "VXLAN", "east-west"],
    metrics: [
      { key: "label", label: "Nhãn", tone: "blue" },
      { key: "hops", label: "Chặng", tone: "violet" },
      { key: "ecmp", label: "ECMP", tone: "yellow" },
      { key: "lat", label: "Độ trễ", tone: "coral" }
    ],
    nodes: [
      { id: "ingress", type: "router", x: 30, y: 90, w: 170, h: 66, label: "Ingress LER", sub: "push label" },
      { id: "lsr1", type: "router", x: 230, y: 90, w: 160, h: 66, label: "LSR 1", sub: "swap label" },
      { id: "lsr2", type: "router", x: 420, y: 90, w: 160, h: 66, label: "LSR 2", sub: "swap label" },
      { id: "egress", type: "router", x: 610, y: 90, w: 170, h: 66, label: "Egress LER", sub: "pop label" },
      { id: "tor", type: "lb", x: 400, y: 300, w: 170, h: 66, label: "Leaf / ToR", sub: "ECMP uplink" },
      { id: "srv", type: "server", x: 610, y: 300, w: 170, h: 66, label: "Server", sub: "VM · container" }
    ],
    edges: [
      { id: "in-l1", from: "ingress", to: "lsr1", kind: "request", label: "label 100" },
      { id: "l1-l2", from: "lsr1", to: "lsr2", kind: "request", label: "label 200" },
      { id: "l2-eg", from: "lsr2", to: "egress", kind: "request", label: "label 300" },
      { id: "eg-tor", from: "egress", to: "tor", kind: "request" },
      { id: "tor-s", from: "tor", to: "srv", kind: "request" }
    ],
    learn: [
      "Hiểu nhãn MPLS và lợi ích so với tra IP.",
      "Mô tả push, swap, pop và PHP.",
      "Biết MPLS dùng cho L3VPN và traffic engineering.",
      "So sánh datacenter ba tầng với leaf-spine.",
      "Giải thích ECMP, VXLAN và lưu lượng Đông-Tây."
    ],
    steps: [
      {
        short: "Gắn nhãn",
        type: "Khởi đầu",
        title: "Ingress push nhãn lên gói",
        body: "MPLS chèn một nhãn 20 bit (kèm 3 bit EXP, 1 bit S, 8 bit TTL) giữa header lớp 2 và IP. Router biên <strong>Ingress LER</strong> phân loại gói và gắn nhãn tương ứng với đường đi hoặc VPN. Các router sau chỉ cần đọc nhãn, không tra IP đích.",
        focus: ["ingress", "lsr1"],
        edges: ["in-l1"],
        metrics: { label: "100", hops: "1", ecmp: "—", lat: "0,4 ms" },
        changes: ["Gói có nhãn", "Đường đi được mã hóa trong nhãn"],
        note: "MPLS nằm giữa lớp 2 và 3, thường được gọi là giao thức lớp 2,5."
      },
      {
        short: "Hoán đổi nhãn",
        type: "Cơ chế",
        title: "LSR đổi nhãn và chuyển tiếp",
        body: "Mỗi <strong>LSR</strong> giữ bảng nhãn: nhãn vào, cổng ra, nhãn ra. Gói được hoán đổi nhãn và gửi đi mà không cần tra bảng định tuyến IP. Nhãn được phân phối bằng LDP hoặc RSVP-TE; RSVP-TE còn đặt trước băng thông cho tuyến.",
        focus: ["lsr1", "lsr2"],
        edges: ["in-l1", "l1-l2", "l2-eg"],
        metrics: { label: "200 → 300", hops: "3", ecmp: "—", lat: "0,8 ms" },
        changes: ["Chuyển tiếp theo nhãn", "Không phụ thuộc địa chỉ đích"],
        note: "Nhãn có thể xếp chồng (label stack) để làm VPN hoặc đường hầm lồng nhau."
      },
      {
        short: "Pop & L3VPN",
        type: "Ứng dụng",
        title: "Gỡ nhãn ở chặng áp chót",
        body: "Router áp chót thường <strong>pop</strong> nhãn (penultimate hop popping) để router biên đích chỉ cần tra IP một lần. Với L3VPN, nhãn ngoài dẫn đường trong mạng nhà cung cấp, nhãn trong xác định VRF của khách hàng; các khách hàng dùng chung địa chỉ mà vẫn tách biệt.",
        focus: ["lsr2", "egress", "tor"],
        edges: ["l2-eg", "eg-tor"],
        metrics: { label: "pop", hops: "4", ecmp: "—", lat: "1,1 ms" },
        changes: ["Gói trở về IP thường", "VRF tách khách hàng"],
        note: "MPLS VPN rất phổ biến ở ISP; SD-WAN hiện đại thường thay bằng overlay IPsec/VXLAN."
      },
      {
        short: "Datacenter ba tầng",
        type: "Kiến trúc",
        title: "Border, aggregation, access",
        body: "Mô hình truyền thống có router biên, switch aggregation và switch access nối server. Lưu lượng chủ yếu Bắc-Nam (ra Internet) nên thiết kế tối ưu cho hướng đó. Khi ứng dụng phân tán, lưu lượng <strong>Đông-Tây</strong> giữa server tăng vọt và mô hình ba tầng thành nút thắt.",
        focus: ["tor", "srv"],
        edges: ["tor-s"],
        metrics: { label: "—", hops: "3 tầng", ecmp: "STP chặn", lat: "50 µs" },
        changes: ["Lưu lượng Đông-Tây tăng", "Cổng aggregation quá tải"],
        note: "STP chặn liên kết dự phòng nên không dùng hết băng thông; đây là lý do leaf-spine ra đời."
      },
      {
        short: "Leaf-spine & ECMP",
        type: "Hiện đại",
        title: "Mọi leaf nối mọi spine, chia tải nhiều đường",
        body: "<strong>Leaf-spine</strong> là topology Clos hai tầng: mỗi leaf nối tới mọi spine, mọi đường đều active. <strong>ECMP</strong> băm header để chia luồng qua nhiều đường; hash cố định giữ thứ tự gói trong một luồng. Độ trễ giữa hai server chỉ qua hai chặng.",
        focus: ["tor", "egress", "srv"],
        edges: ["eg-tor", "tor-s"],
        metrics: { label: "—", hops: "2", ecmp: "8 đường", lat: "25 µs" },
        changes: ["Không lãng phí liên kết", "Độ trễ thấp và ổn định"],
        note: "ECMP có thể lệch tải nếu hash kém; nhiều fabric dùng flowlet switching để cân bằng tốt hơn."
      },
      {
        short: "Overlay VXLAN",
        type: "Tổng kết",
        title: "Mạng ảo trên fabric IP",
        body: "VXLAN đóng gói khung lớp 2 trong UDP/IP để tạo mạng ảo trải trên fabric lớp 3; EVPN làm mặt phẳng điều khiển cho VXLAN. Overlay cho phép di chuyển VM/container giữ nguyên địa chỉ, tách biệt khỏi topology vật lý và hỗ trợ multi-tenant.",
        focus: ["all"],
        edges: "all",
        metrics: { label: "VNI 5001", hops: "2", ecmp: "16", lat: "30 µs" },
        changes: ["Mạng ảo độc lập vật lý", "Dễ mở rộng đa tenant"],
        note: "VXLAN thêm overhead 50 byte; cần điều chỉnh MTU hoặc phân mảnh để tránh mất gói."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 6 — Một ngày của yêu cầu web
     ------------------------------------------------------------------ */
  SL.lessons["day-in-life"] = {
    id: "day-in-life",
    module: "ch6-link",
    title: "Một ngày của một yêu cầu web: từ DHCP đến HTTP",
    shortTitle: "Một ngày web",
    subtitle: "Gõ một tên miền và nhấn Enter: DHCP, ARP, DNS, TCP, TLS và HTTP nối tiếp nhau trong chưa đầy một giây.",
    blurb: "Bài tổng hợp nối toàn bộ kiến thức: mỗi giao thức chuẩn bị gì cho giao thức kế tiếp và thời gian đi đâu.",
    duration: "18 phút",
    level: "Tổng hợp",
    tags: ["DHCP", "ARP", "DNS", "TCP", "TLS", "HTTP", "NAT", "waterfall"],
    metrics: [
      { key: "time", label: "Thời gian", tone: "blue" },
      { key: "hops", label: "Chặng", tone: "violet" },
      { key: "pkts", label: "Gói", tone: "yellow" },
      { key: "cache", label: "Cache", tone: "coral" }
    ],
    nodes: [
      { id: "laptop", type: "client", x: 30, y: 80, w: 160, h: 66, label: "Laptop", sub: "vừa bật Wi-Fi" },
      { id: "ap", type: "presence", x: 220, y: 80, w: 160, h: 66, label: "Wi-Fi AP", sub: "L2 bridge" },
      { id: "switch", type: "lb", x: 410, y: 80, w: 160, h: 66, label: "Switch", sub: "học MAC" },
      { id: "router", type: "gateway", x: 600, y: 80, w: 170, h: 66, label: "Router/NAT", sub: "192.168.1.1" },
      { id: "dhcp", type: "server", x: 220, y: 300, w: 160, h: 66, label: "DHCP", sub: "cấp IP" },
      { id: "dns", type: "dns", x: 410, y: 300, w: 160, h: 66, label: "DNS", sub: "resolver" },
      { id: "web", type: "server", x: 600, y: 300, w: 170, h: 66, label: "Web server", sub: "HTTPS 443" }
    ],
    edges: [
      { id: "la-ap", from: "laptop", to: "ap", kind: "request" },
      { id: "ap-sw", from: "ap", to: "switch", kind: "request" },
      { id: "sw-dh", from: "switch", to: "dhcp", kind: "request", label: "DHCP" },
      { id: "sw-r", from: "switch", to: "router", kind: "request" },
      { id: "r-dns", from: "router", to: "dns", kind: "request", label: "DNS" },
      { id: "r-web", from: "router", to: "web", kind: "request", label: "HTTPS" },
      { id: "web-r", from: "web", to: "router", kind: "response", bow: 22, label: "200 OK" }
    ],
    learn: [
      "Kể lại thứ tự DHCP → ARP → DNS → TCP → TLS → HTTP.",
      "Biết mỗi bước cần gì từ bước trước.",
      "Đọc waterfall và xác định thời gian đi đâu.",
      "Hiểu vai trò cache và tái sử dụng kết nối.",
      "Nhận ra NAT thay đổi địa chỉ nguồn khi ra Internet."
    ],
    steps: [
      {
        short: "DHCP",
        type: "Khởi đầu",
        title: "Xin địa chỉ, gateway và DNS",
        body: "Laptop chưa có IP. Nó phát <strong>DHCP DISCOVER</strong> quảng bá; server trả OFFER, client REQUEST, server ACK. Kết quả: IP, subnet mask, default gateway và địa chỉ DNS. Không có bước này, máy không biết mình thuộc mạng nào.",
        focus: ["laptop", "ap", "switch", "dhcp"],
        edges: ["la-ap", "ap-sw", "sw-dh"],
        metrics: { time: "180 ms", hops: "1", pkts: "4", cache: "0%" },
        changes: ["Có IP và gateway", "Có địa chỉ DNS"],
        note: "DHCP dùng UDP 67/68 và quảng bá lớp 2; router cần DHCP relay nếu server ở mạng khác."
      },
      {
        short: "ARP",
        type: "Lớp 2",
        title: "Tìm MAC của gateway",
        body: "Để gửi gói ra ngoài, laptop cần MAC của gateway trong cùng subnet. Nó phát <strong>ARP request</strong> quảng bá hỏi 192.168.1.1; gateway trả unicast MAC. Switch học vị trí MAC từ khung và chuyển đúng cổng về sau.",
        focus: ["laptop", "switch", "router"],
        edges: ["la-ap", "ap-sw", "sw-r"],
        metrics: { time: "200 ms", hops: "1", pkts: "6", cache: "0%" },
        changes: ["Có MAC gateway", "Switch học bảng MAC"],
        note: "ARP chỉ trong miền quảng bá; muốn tới mạng khác, MAC đích là gateway, IP đích vẫn là server."
      },
      {
        short: "DNS",
        type: "Tên miền",
        title: "Đổi tên thành IP",
        body: "Laptop gửi truy vấn A cho example.com tới resolver. Resolver hỏi root, TLD rồi authoritative server, sau đó trả IP và cache theo TTL. Nếu cache còn hiệu lực, bước này gần như tức thời.",
        focus: ["laptop", "router", "dns"],
        edges: ["sw-r", "r-dns"],
        metrics: { time: "260 ms", hops: "4", pkts: "8", cache: "0%" },
        changes: ["Có IP server", "Bản ghi được cache"],
        note: "Đo DNS riêng khỏi tải trang; nhiều trang chậm vì DNS chứ không phải băng thông."
      },
      {
        short: "TCP handshake",
        type: "Giao vận",
        title: "SYN, SYN-ACK, ACK tới cổng 443",
        body: "Trình duyệt mở TCP tới IP server cổng 443. Bắt tay ba bước thiết lập trạng thái hai chiều và thống nhất số thứ tự. Sau bước này mới có thể gửi TLS ClientHello; RTT của bắt tay là chi phí cố định của mọi kết nối mới.",
        focus: ["laptop", "router", "web"],
        edges: ["sw-r", "r-web", "web-r"],
        metrics: { time: "310 ms", hops: "10", pkts: "11", cache: "0%" },
        changes: ["Kết nối TCP mở", "Sẵn sàng cho TLS"],
        note: "Tái sử dụng kết nối (keep-alive) tránh lặp lại bắt tay; HTTP/3 dùng QUIC gộp bắt tay."
      },
      {
        short: "TLS + HTTP",
        type: "Ứng dụng",
        title: "Bắt tay khóa rồi gửi GET",
        body: "TLS 1.3 trao đổi khóa trong một RTT, xác thực chứng chỉ server rồi mới gửi HTTP GET. Server trả 200 OK cùng HTML, kèm <strong>Cache-Control</strong> và ETag cho lần sau. NAT tại router thay địa chỉ nguồn riêng thành IP công cộng và giữ bảng ánh xạ.",
        focus: ["laptop", "router", "web"],
        edges: ["r-web", "web-r"],
        metrics: { time: "520 ms", hops: "10", pkts: "24", cache: "0%" },
        changes: ["Nhận HTML", "Kết nối được mã hóa"],
        note: "TLS 1.3 giảm còn 1 RTT; 0-RTT có rủi ro replay nên chỉ dùng cho yêu cầu an toàn."
      },
      {
        short: "Hiển thị & cache",
        type: "Tổng kết",
        title: "Tải tài nguyên, dùng lại kết nối",
        body: "Trình duyệt phân tích HTML, tải CSS/JS/ảnh — ưu tiên tài nguyên chặn render. Tài nguyên tĩnh có thể đến từ cache hoặc CDN; kết nối TLS được tái sử dụng. Tổng thời gian khoảng một giây, trong đó phần lớn là RTT và tài nguyên, không phải băng thông thô.",
        focus: ["all"],
        edges: "all",
        metrics: { time: "980 ms", hops: "10", pkts: "58", cache: "62%" },
        changes: ["Trang hiển thị", "Tài nguyên được cache"],
        note: "Tối ưu theo waterfall: cắt RTT (CDN), giảm tài nguyên chặn render, tăng cache hit."
      }
    ]
  };
})();
