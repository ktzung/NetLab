/* NetLab — Chương 3 và 5: truyền tin cậy, router, thuật toán định tuyến, OSPF/BGP */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  /* ------------------------------------------------------------------
     Chương 3 — Truyền tin cậy
     ------------------------------------------------------------------ */
  SL.lessons["reliable-transfer"] = {
    id: "reliable-transfer",
    module: "ch3-transport",
    title: "Truyền tin cậy: từ stop-and-wait đến cửa sổ trượt",
    shortTitle: "Truyền tin cậy",
    subtitle: "Trên một kênh có thể mất gói và lỗi bit, làm sao gửi đúng thứ tự mà không chờ từng gói một?",
    blurb: "Checksum, ACK, timeout, số thứ tự, pipelining, Go-Back-N và Selective Repeat — nền tảng của TCP.",
    duration: "18 phút",
    level: "Trung cấp",
    tags: ["reliable data transfer", "stop-and-wait", "pipelining", "Go-Back-N", "Selective Repeat", "ACK", "timeout", "sequence number"],
    metrics: [
      { key: "window", label: "Cửa sổ", tone: "blue" },
      { key: "util", label: "Hiệu dụng", tone: "violet" },
      { key: "retx", label: "Truyền lại", tone: "coral" },
      { key: "loss", label: "Mất gói", tone: "yellow" }
    ],
    nodes: [
      { id: "sender", type: "client", x: 60, y: 210, w: 175, h: 66, label: "Máy gửi", sub: "ứng dụng" },
      { id: "channel", type: "road", x: 330, y: 210, w: 190, h: 66, label: "Kênh", sub: "RTT 40 ms · mất 2%" },
      { id: "receiver", type: "server", x: 640, y: 210, w: 175, h: 66, label: "Máy nhận", sub: "bộ đệm" }
    ],
    edges: [
      { id: "s-c", from: "sender", to: "channel", kind: "request", label: "data" },
      { id: "c-r", from: "channel", to: "receiver", kind: "request" },
      { id: "r-c", from: "receiver", to: "channel", kind: "response", bow: 24, label: "ACK" },
      { id: "c-s", from: "channel", to: "sender", kind: "response", bow: 24 }
    ],
    learn: [
      "Xác định ba cơ chế: phát hiện lỗi, xác nhận và truyền lại.",
      "Tính hiệu dụng của stop-and-wait và của pipelining.",
      "Phân biệt Go-Back-N với Selective Repeat.",
      "Hiểu vì sao số thứ tự và cửa sổ đi cùng nhau.",
      "Nhận ra TCP dùng ACK tích lũy và SACK."
    ],
    steps: [
      {
        short: "Kênh không tin cậy",
        type: "Khởi đầu",
        title: "Bit có thể lỗi, gói có thể mất",
        body: "Kênh thật không hoàn hảo: nhiễu làm sai bit, bộ đệm đầy làm mất gói, ACK cũng có thể mất. Giao thức tin cậy cần <strong>checksum</strong> để phát hiện lỗi, <strong>ACK/NAK</strong> để phản hồi và <strong>timeout</strong> để gửi lại khi không nhận được phản hồi.",
        focus: ["sender", "channel", "receiver"],
        edges: ["s-c", "c-r"],
        metrics: { window: "1", util: "3%", retx: "0", loss: "2%" },
        changes: ["Xác định kênh có lỗi", "Chuẩn bị cơ chế phát hiện"],
        note: "Không có cơ chế nào sửa được mọi lỗi; tin cậy là đánh đổi giữa độ chính xác, độ trễ và băng thông."
      },
      {
        short: "Stop-and-wait",
        type: "Cơ chế",
        title: "Gửi một gói rồi chờ ACK",
        body: "Stop-and-wait gửi một gói, chờ ACK rồi mới gửi gói tiếp. Với gói 1 KB, đường 1 Gbps và RTT 40 ms, thời gian truyền chỉ 8 µs nhưng phải chờ 40 ms — hiệu dụng khoảng <strong>0,02%</strong>. Kênh gần như rảnh trong lúc chờ.",
        focus: ["sender", "receiver"],
        edges: ["s-c", "c-r", "r-c"],
        metrics: { window: "1", util: "3%", retx: "0", loss: "2%" },
        changes: ["Đơn giản nhưng lãng phí kênh", "Hiệu dụng thấp khi RTT lớn"],
        note: "Hiệu dụng = (L/R) / (L/R + RTT); RTT càng lớn, stop-and-wait càng kém."
      },
      {
        short: "Số thứ tự & timeout",
        type: "Sửa lỗi",
        title: "ACK mất thì gửi lại, nhưng đừng nhận trùng",
        body: "Người gửi đặt <strong>timer</strong>; hết hạn mà chưa có ACK thì gửi lại. Số thứ tự 0/1 giúp bên nhận phát hiện gói trùng do ACK bị mất. Nếu ACK đến trễ, bên gửi vẫn có thể nhận ACK của lần gửi trước — số thứ tự giải quyết nhập nhằng này.",
        focus: ["sender", "receiver"],
        edges: ["s-c", "r-c"],
        metrics: { window: "1", util: "3%", retx: "8%", loss: "2%" },
        changes: ["Có truyền lại khi timeout", "Gói trùng bị loại nhờ số thứ tự"],
        note: "Timeout quá ngắn gây truyền lại thừa; quá dài làm chậm phục hồi. TCP ước lượng RTT động."
      },
      {
        short: "Pipelining",
        type: "Tăng tốc",
        title: "Nhiều gói cùng bay trên kênh",
        body: "<strong>Pipelining</strong> cho phép tối đa N gói chưa được xác nhận cùng lúc. Hiệu dụng tăng gần N lần, tới khi đầy kênh. Cửa sổ càng lớn càng cần bộ đệm hai đầu và cơ chế xử lý mất gói chính xác hơn.",
        focus: ["sender", "channel", "receiver"],
        edges: ["s-c", "c-r", "r-c"],
        metrics: { window: "10", util: "30%", retx: "2%", loss: "2%" },
        changes: ["Nhiều gói đang trên đường", "Hiệu dụng tăng theo cửa sổ"],
        note: "Cửa sổ tối ưu xấp xỉ băng thông × RTT (BDP); cửa sổ nhỏ hơn BDP thì không bao giờ đầy kênh."
      },
      {
        short: "Go-Back-N",
        type: "Mất gói",
        title: "Mất một gói, gửi lại cả cửa sổ",
        body: "Go-Back-N dùng ACK tích lũy: ACK n nghĩa là mọi gói tới n đã nhận. Khi gói n mất, bên nhận bỏ các gói sau; bên gửi timeout và gửi lại từ n. Đơn giản nhưng lãng phí khi cửa sổ lớn và mất gói thường xuyên.",
        focus: ["sender", "receiver"],
        edges: ["s-c", "r-c"],
        metrics: { window: "10", util: "27%", retx: "25%", loss: "2%" },
        changes: ["Bên nhận chỉ nhận đúng thứ tự", "Truyền lại hàng loạt sau mất gói"],
        note: "GBN phù hợp khi mất gói hiếm; khi mất nhiều, chi phí truyền lại tăng nhanh."
      },
      {
        short: "Selective Repeat",
        type: "Tổng kết",
        title: "Chỉ gửi lại đúng gói bị mất",
        body: "Selective Repeat đánh dấu từng gói bằng ACK riêng, bên nhận đệm các gói đến sai thứ tự và chỉ yêu cầu lại gói thiếu. Hiệu quả hơn GBN nhưng cần bộ đệm và logic phức tạp hơn. TCP dùng ACK tích lũy kèm tùy chọn <strong>SACK</strong> để gần với SR.",
        focus: ["all"],
        edges: "all",
        metrics: { window: "10", util: "29%", retx: "5%", loss: "2%" },
        changes: ["Chỉ truyền lại gói thiếu", "Bên nhận đệm gói đến sớm"],
        note: "Chọn GBN hay SR là đánh đổi giữa đơn giản và hiệu quả; TCP thực tế kết hợp cả hai."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 4 — Bên trong router
     ------------------------------------------------------------------ */
  SL.lessons["router-internals"] = {
    id: "router-internals",
    module: "ch4-data-plane",
    title: "Bên trong router: tra bảng, chuyển mạch, xếp hàng",
    shortTitle: "Ruột router",
    subtitle: "Mỗi gói đi qua cổng vào, bảng chuyển tiếp, fabric và cổng ra — mỗi khối đều có thể thành nút thắt.",
    blurb: "Longest prefix match, switching fabric, hàng đợi đầu ra, lập lịch và chính sách bỏ gói.",
    duration: "15 phút",
    level: "Trung cấp",
    tags: ["router", "FIB", "longest prefix match", "switching fabric", "head-of-line blocking", "scheduling", "AQM", "bufferbloat"],
    metrics: [
      { key: "lookup", label: "Tra bảng", tone: "blue" },
      { key: "queue", label: "Hàng đợi", tone: "violet" },
      { key: "buf", label: "Bộ đệm", tone: "yellow" },
      { key: "drop", label: "Bỏ gói", tone: "coral" }
    ],
    nodes: [
      { id: "input", type: "gateway", x: 40, y: 90, w: 170, h: 66, label: "Cổng vào", sub: "decapsulate" },
      { id: "fabric", type: "lb", x: 260, y: 90, w: 175, h: 66, label: "Switching fabric", sub: "crossbar" },
      { id: "output", type: "gateway", x: 485, y: 90, w: 175, h: 66, label: "Cổng ra", sub: "hàng đợi" },
      { id: "next", type: "router", x: 710, y: 90, w: 165, h: 66, label: "Router kế", sub: "chặng tiếp" }
    ],
    edges: [
      { id: "in-f", from: "input", to: "fabric", kind: "request", label: "gói tin" },
      { id: "f-out", from: "fabric", to: "output", kind: "request" },
      { id: "out-n", from: "output", to: "next", kind: "request", label: "truyền đi" }
    ],
    learn: [
      "Mô tả bốn khối của router: input, fabric, output, control.",
      "Giải thích longest prefix match và vai trò FIB.",
      "Nhận ra head-of-line blocking và tranh chấp đầu ra.",
      "Hiểu công thức kích thước bộ đệm và bufferbloat.",
      "Phân biệt FIFO, priority, round robin và WFQ."
    ],
    steps: [
      {
        short: "Cổng vào",
        type: "Khởi đầu",
        title: "Nhận khung, bóc header, chuẩn bị tra bảng",
        body: "Cổng vào nhận tín hiệu, bóc khung lớp 2, kiểm tra lỗi rồi đọc IP đích. Gói được đưa vào hàng đợi tra cứu nếu bảng bận. Đây là nơi đầu tiên quyết định gói đi đâu trong router.",
        focus: ["input"],
        edges: ["in-f"],
        metrics: { lookup: "5 ns", queue: "0 ms", buf: "10%", drop: "0%" },
        changes: ["Khung được bóc", "IP đích được đọc"],
        note: "Cổng vào tốc độ cao dùng pipeline phần cứng; mỗi gói chỉ có vài nano-giây để tra bảng."
      },
      {
        short: "Longest prefix match",
        type: "Tra bảng",
        title: "Prefix dài nhất thắng",
        body: "Router so địa chỉ đích với các prefix trong <strong>FIB</strong>. Với 10.1.2.3, cả /8, /16 và /24 đều khớp; prefix /24 dài nhất được chọn vì mô tả cụ thể nhất. Bảng lớn dùng TCAM để tra song song.",
        focus: ["input"],
        edges: ["in-f"],
        metrics: { lookup: "3 ns", queue: "0 ms", buf: "12%", drop: "0%" },
        changes: ["Chọn tuyến cụ thể nhất", "Gói có next-hop rõ ràng"],
        note: "Không có default route thì gói bị bỏ; default route 0.0.0.0/0 là prefix ngắn nhất."
      },
      {
        short: "Chuyển mạch",
        type: "Cơ chế",
        title: "Fabric nối cổng vào với cổng ra",
        body: "Ba kiểu fabric phổ biến: qua bộ nhớ, qua bus chung và crossbar. Crossbar cho nhiều chuyển mạch song song nhưng vẫn có thể tắc nếu nhiều cổng vào cùng tranh một cổng ra — <strong>head-of-line blocking</strong>.",
        focus: ["fabric"],
        edges: ["in-f", "f-out"],
        metrics: { lookup: "3 ns", queue: "0,5 ms", buf: "20%", drop: "0%" },
        changes: ["Gói được chuyển sang cổng ra", "Tranh chấp xuất hiện khi tải cao"],
        note: "Fabric nhanh hơn tổng các cổng vào là điều kiện để router không tự thành nút thắt."
      },
      {
        short: "Hàng đợi đầu ra",
        type: "Cảnh báo",
        title: "Nhiều luồng cùng đổ về một cổng",
        body: "Khi lưu lượng vào một cổng ra vượt tốc độ đường truyền, gói phải xếp hàng. Bộ đệm quá lớn gây <strong>bufferbloat</strong>: độ trễ tăng vọt dù throughput vẫn đẹp. Bộ đệm quá nhỏ làm mất gói và giảm throughput.",
        focus: ["output"],
        edges: ["f-out", "out-n"],
        metrics: { lookup: "3 ns", queue: "12 ms", buf: "85%", drop: "0,2%" },
        changes: ["Hàng đợi đầu ra tăng", "RTT tăng theo tải"],
        note: "Quy tắc cũ B = RTT × C chỉ là điểm khởi đầu; thực tế cần AQM để giữ hàng đợi ngắn."
      },
      {
        short: "Lập lịch",
        type: "Chính sách",
        title: "Ai được gửi trước khi cổng ra bận?",
        body: "FIFO đơn giản nhưng không ưu tiên. Priority queue cho voice đi trước nhưng có thể bỏ đói luồng khác. Round robin chia đều; <strong>WFQ</strong> chia theo trọng số, phù hợp để bảo vệ dịch vụ quan trọng.",
        focus: ["output"],
        edges: ["out-n"],
        metrics: { lookup: "3 ns", queue: "4 ms", buf: "55%", drop: "0%" },
        changes: ["Thứ tự phục vụ được kiểm soát", "Dịch vụ quan trọng được bảo vệ"],
        note: "Phân loại gói (DSCP) chỉ có tác dụng nếu hàng đợi và lịch thực sự tôn trọng nhãn đó."
      },
      {
        short: "Bỏ gói & AQM",
        type: "Tổng kết",
        title: "Tail drop, RED/CoDel và ECN",
        body: "Khi bộ đệm đầy, tail drop bỏ gói đến sau — dễ tạo hiện tượng đồng bộ TCP. <strong>AQM</strong> như RED hoặc CoDel bỏ gói sớm để báo tắc nghẽn trước khi hàng đợi quá dài; ECN đánh dấu thay vì bỏ. Mục tiêu là giữ độ trễ thấp mà vẫn đầy kênh.",
        focus: ["all"],
        edges: "all",
        metrics: { lookup: "3 ns", queue: "2 ms", buf: "35%", drop: "0,1%" },
        changes: ["Hàng đợi được giữ ngắn", "TCP giảm tốc trước khi tràn"],
        note: "Mất gói không xấu nếu nó là tín hiệu tắc nghẽn đúng lúc; mất gói do bộ đệm phình mới là vấn đề."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 5 — Thuật toán định tuyến
     ------------------------------------------------------------------ */
  SL.lessons["routing-algorithms"] = {
    id: "routing-algorithms",
    module: "ch5-control-plane",
    title: "Thuật toán định tuyến: Dijkstra và vector khoảng cách",
    shortTitle: "LS & DV",
    subtitle: "Mỗi router chỉ thấy hàng xóm, vậy cả mạng tìm được đường ngắn nhất bằng cách nào?",
    blurb: "Link-state với Dijkstra, distance-vector với Bellman-Ford, count-to-infinity và các mẹo chống vòng lặp.",
    duration: "18 phút",
    level: "Trung cấp",
    tags: ["link-state", "Dijkstra", "distance-vector", "Bellman-Ford", "count-to-infinity", "split horizon", "OSPF", "RIP"],
    metrics: [
      { key: "cost", label: "Chi phí", tone: "blue" },
      { key: "hops", label: "Số chặng", tone: "violet" },
      { key: "table", label: "Bảng", tone: "yellow" },
      { key: "conv", label: "Hội tụ", tone: "coral" }
    ],
    nodes: [
      { id: "a", type: "router", x: 40, y: 90, w: 150, h: 66, label: "A", sub: "router" },
      { id: "b", type: "router", x: 250, y: 90, w: 150, h: 66, label: "B", sub: "router" },
      { id: "c", type: "router", x: 460, y: 90, w: 150, h: 66, label: "C", sub: "router" },
      { id: "d", type: "router", x: 250, y: 300, w: 150, h: 66, label: "D", sub: "router" },
      { id: "e", type: "router", x: 460, y: 300, w: 150, h: 66, label: "E", sub: "router" }
    ],
    edges: [
      { id: "a-b", from: "a", to: "b", kind: "data", label: "1" },
      { id: "b-c", from: "b", to: "c", kind: "data", label: "2" },
      { id: "a-d", from: "a", to: "d", kind: "data", label: "4" },
      { id: "b-d", from: "b", to: "d", kind: "data", label: "1" },
      { id: "c-e", from: "c", to: "e", kind: "data", label: "3" },
      { id: "d-e", from: "d", to: "e", kind: "data", label: "1" },
      { id: "b-e", from: "b", to: "e", kind: "data", label: "5", bow: 18 }
    ],
    learn: [
      "Mô hình mạng thành đồ thị có trọng số.",
      "Chạy Dijkstra trên bản đồ link-state.",
      "Hiểu trao đổi vector khoảng cách giữa hàng xóm.",
      "Giải thích count-to-infinity và split horizon.",
      "So sánh độ phức tạp, bộ nhớ và tốc độ hội tụ của LS/DV."
    ],
    steps: [
      {
        short: "Mô hình đồ thị",
        type: "Khởi đầu",
        title: "Router là đỉnh, liên kết là cạnh có chi phí",
        body: "Mỗi router là một đỉnh; mỗi liên kết là cạnh với <strong>cost</strong> (có thể là 1, băng thông nghịch đảo hoặc độ trễ). Bài toán định tuyến trở thành tìm đường ngắn nhất từ nguồn tới đích trên đồ thị có trọng số.",
        focus: ["a", "b", "d"],
        edges: ["a-b", "a-d", "b-d"],
        metrics: { cost: "—", hops: "—", table: "trống", conv: "0 s" },
        changes: ["Xác định đồ thị và trọng số", "Chưa có bảng định tuyến"],
        note: "Chi phí có thể đổi theo thời gian; định tuyến là bài toán động, không phải tính một lần."
      },
      {
        short: "Link-state flooding",
        type: "Thu thập",
        title: "Mỗi router quảng bá trạng thái liên kết",
        body: "Trong <strong>link-state</strong>, mỗi router gửi gói LSA mô tả các liên kết của mình cho toàn mạng. Sau khi hội tụ, mọi router có cùng bản đồ đầy đủ và tự chạy thuật toán đường ngắn nhất. Flooding tốn băng thông nhưng cho cái nhìn nhất quán.",
        focus: ["a", "b", "c", "d", "e"],
        edges: ["a-b", "b-c", "a-d", "b-d", "c-e", "d-e"],
        metrics: { cost: "—", hops: "—", table: "đầy đủ", conv: "1 s" },
        changes: ["Bản đồ mạng được lan truyền", "Mọi router thấy cùng topology"],
        note: "LSA có số thứ tự để loại bản tin cũ; lũ lụt có kiểm soát tránh vòng lặp."
      },
      {
        short: "Dijkstra",
        type: "Thuật toán",
        title: "Chọn đỉnh gần nhất chưa cố định",
        body: "Dijkstra khởi tạo khoảng cách 0 cho nguồn, vô cực cho các đỉnh khác. Mỗi vòng chọn đỉnh chưa cố định có khoảng cách nhỏ nhất, rồi cập nhật khoảng cách cho hàng xóm. Kết quả là cây đường ngắn nhất từ nguồn tới mọi đích.",
        focus: ["a", "b", "d", "e"],
        edges: ["a-b", "a-d", "b-d", "d-e"],
        metrics: { cost: "A→E = 3", hops: "2", table: "đã tính", conv: "1,2 s" },
        changes: ["Có cây đường ngắn nhất", "Bảng chuyển tiếp được điền"],
        note: "Với A→E: A-B-D-E cost 3 thắng A-D-E cost 5; Dijkstra luôn chọn tổng trọng số nhỏ nhất."
      },
      {
        short: "Distance-vector",
        type: "Thuật toán",
        title: "Hàng xóm kể nhau nghe vector khoảng cách",
        body: "Mỗi router giữ vector chi phí tới mọi đích và định kỳ gửi cho hàng xóm. Nhận vector của hàng xóm, router cập nhật theo <strong>Bellman-Ford</strong>: chi phí tới X = min(chi phí hiện tại, chi phí tới hàng xóm + chi phí hàng xóm tới X). Không cần bản đồ đầy đủ.",
        focus: ["a", "b", "c", "d"],
        edges: ["a-b", "b-c", "b-d", "a-d"],
        metrics: { cost: "A→E = 4", hops: "3", table: "hội tụ dần", conv: "3 s" },
        changes: ["Router chỉ cần vector hàng xóm", "Hội tụ chậm hơn LS"],
        note: "DV nhẹ bộ nhớ nhưng lan truyền thông tin chậm và dễ tạo vòng lặp tạm thời."
      },
      {
        short: "Count-to-infinity",
        type: "Sự cố",
        title: "Liên kết hỏng làm chi phí leo thang",
        body: "Khi A mất kết nối, B và C có thể cập nhật lẫn nhau qua đường vòng: B học từ C, C học từ B, chi phí tăng dần tới vô cực. <strong>Split horizon</strong> (không quảng bá ngược lại nơi học được) và poison reverse giảm vấn đề; thực tế dùng hop limit.",
        focus: ["b", "c", "d"],
        edges: ["b-c", "b-d", "d-e"],
        metrics: { cost: "→ ∞", hops: "—", table: "dao động", conv: "20 s" },
        changes: ["Bảng tạm thời sai", "Cần cơ chế chống vòng lặp"],
        note: "Count-to-infinity là lý do RIP dùng hop count tối đa 15; OSPF tránh bằng bản đồ đầy đủ."
      },
      {
        short: "Chọn LS hay DV",
        type: "Tổng kết",
        title: "Đánh đổi giữa hiểu biết và chi phí",
        body: "Link-state (OSPF, IS-IS) hội tụ nhanh, dễ debug nhưng tốn bộ nhớ và CPU. Distance-vector (RIP) đơn giản, nhẹ nhưng hội tụ chậm và dễ vòng lặp. Không có thuật toán nào tốt nhất cho mọi mạng; quy mô và chính sách quyết định.",
        focus: ["all"],
        edges: "all",
        metrics: { cost: "ổn định", hops: "ổn định", table: "hội tụ", conv: "0,5 s" },
        changes: ["Mạng hội tụ", "Bảng định tuyến ổn định"],
        note: "Trong thực tế, OSPF/IS-IS lo trong AS; BGP lo giữa các AS với chính sách phức tạp hơn."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Chương 5 — OSPF và BGP
     ------------------------------------------------------------------ */
  SL.lessons["ospf-bgp"] = {
    id: "ospf-bgp",
    module: "ch5-control-plane",
    title: "OSPF và BGP: định tuyến trong AS và giữa các ISP",
    shortTitle: "OSPF & BGP",
    subtitle: "Bên trong một mạng, OSPF tìm đường ngắn nhất; giữa các ISP, BGP chọn đường theo chính sách thương mại.",
    blurb: "Hai mặt phẳng định tuyến: link-state trong AS và path-vector giữa các AS, cùng anycast và định tuyến theo chính sách.",
    duration: "17 phút",
    level: "Trung cấp",
    tags: ["OSPF", "BGP", "AS", "eBGP", "iBGP", "AS-PATH", "local preference", "anycast", "hot potato"],
    metrics: [
      { key: "as", label: "AS", tone: "blue" },
      { key: "path", label: "AS-PATH", tone: "violet" },
      { key: "cost", label: "Cost", tone: "yellow" },
      { key: "pref", label: "Ưu tiên", tone: "coral" }
    ],
    nodes: [
      { id: "r1", type: "router", x: 30, y: 90, w: 165, h: 66, label: "R1 · AS100", sub: "OSPF area 0" },
      { id: "r2", type: "router", x: 235, y: 90, w: 165, h: 66, label: "R2 · AS100", sub: "OSPF" },
      { id: "border", type: "router", x: 440, y: 90, w: 175, h: 66, label: "Border · AS100", sub: "ASBR" },
      { id: "peer", type: "router", x: 655, y: 90, w: 165, h: 66, label: "Peer · AS200", sub: "eBGP" },
      { id: "prefix", type: "server", x: 655, y: 300, w: 165, h: 66, label: "203.0.113.0/24", sub: "prefix đích" }
    ],
    edges: [
      { id: "r1-r2", from: "r1", to: "r2", kind: "data", label: "OSPF" },
      { id: "r2-b", from: "r2", to: "border", kind: "data" },
      { id: "b-p", from: "border", to: "peer", kind: "request", label: "eBGP" },
      { id: "p-px", from: "peer", to: "prefix", kind: "request", label: "advertise" }
    ],
    learn: [
      "Phân biệt intra-AS và inter-AS.",
      "Hiểu OSPF dùng link-state và cost liên kết.",
      "Mô tả eBGP/iBGP và thuộc tính AS-PATH.",
      "Giải thích vì sao chính sách thắng đường ngắn.",
      "Nhận ra anycast trong CDN và DNS root."
    ],
    steps: [
      {
        short: "Biên AS",
        type: "Khởi đầu",
        title: "Mỗi ISP là một autonomous system",
        body: "Một <strong>AS</strong> là tập router dưới cùng chính sách quản trị. Bên trong AS, mục tiêu là đường ngắn nhất; giữa các AS, mục tiêu là chính sách thương mại và ổn định. Vì vậy Internet dùng hai giao thức khác nhau cho hai phạm vi.",
        focus: ["border", "peer"],
        edges: ["b-p"],
        metrics: { as: "AS100 → AS200", path: "—", cost: "—", pref: "—" },
        changes: ["Xác định ranh giới quản trị", "Chuẩn bị hai loại định tuyến"],
        note: "ASN là số 16 hoặc 32 bit; các AS trao đổi tuyến qua BGP, không trao đổi bản đồ liên kết."
      },
      {
        short: "OSPF bên trong",
        type: "Nội bộ",
        title: "Link-state, area và cost băng thông",
        body: "OSPF dùng link-state trong AS: mỗi router quảng bá LSA, tính Dijkstra trên cost liên kết. Mạng lớn chia thành <strong>area</strong> để giảm LSA và tăng tốc hội tụ; area 0 là backbone. Cost mặc định tỉ lệ nghịch băng thông.",
        focus: ["r1", "r2", "border"],
        edges: ["r1-r2", "r2-b"],
        metrics: { as: "AS100", path: "nội bộ", cost: "10 + 10", pref: "cost" },
        changes: ["Bảng nội bộ hội tụ", "Chọn đường ngắn nhất trong AS"],
        note: "OSPF chạy trực tiếp trên IP protocol 89, không dùng TCP/UDP; hello giữ quan hệ hàng xóm."
      },
      {
        short: "BGP quảng bá prefix",
        type: "Giữa AS",
        title: "eBGP nói với hàng xóm ngoài, iBGP lan trong AS",
        body: "Router biên dùng <strong>eBGP</strong> để nhận prefix từ AS lân cận, kèm <strong>NEXT-HOP</strong> và <strong>AS-PATH</strong>. Sau đó nó dùng iBGP để lan thông tin cho các router khác trong AS100. BGP là path-vector: đường đi được mô tả bằng dãy AS.",
        focus: ["border", "peer"],
        edges: ["b-p", "p-px"],
        metrics: { as: "AS100, AS200", path: "200", cost: "—", pref: "100" },
        changes: ["Prefix được học từ AS200", "AS-PATH ghi nhận đường đi"],
        note: "eBGP thường qua kết nối trực tiếp; iBGP cần full-mesh hoặc route reflector để tránh vòng lặp."
      },
      {
        short: "AS-PATH & chọn đường",
        type: "Chính sách",
        title: "Đường ngắn chưa chắc được chọn",
        body: "BGP loại tuyến có AS-PATH chứa ASN của mình để chống vòng lặp. Khi nhiều tuyến hợp lệ, thứ tự ưu tiên gồm local-preference, AS-PATH ngắn, origin, MED... Chính sách doanh nghiệp có thể thắng mọi so sánh độ dài đường.",
        focus: ["border", "peer", "prefix"],
        edges: ["b-p", "p-px"],
        metrics: { as: "AS100", path: "200 300", cost: "—", pref: "200" },
        changes: ["Tuyến vòng bị loại", "Tuyến tốt nhất theo chính sách"],
        note: "AS-PATH ngắn chỉ là tiêu chí sau local-preference; đừng dạy BGP như thuật toán ngắn nhất đơn thuần."
      },
      {
        short: "Hot potato",
        type: "Thương mại",
        title: "Đẩy lưu lượng ra khỏi mạng mình sớm nhất",
        body: "ISP thường ưu tiên tuyến từ khách hàng hơn peer, và peer hơn provider vì chi phí. <strong>Hot potato routing</strong> chọn cổng ra gần nhất nội bộ, kể cả khi đường bên ngoài dài hơn. Lợi ích của ISP đôi khi khác lợi ích end-to-end.",
        focus: ["r1", "border", "peer"],
        edges: ["r1-r2", "b-p"],
        metrics: { as: "AS100", path: "200", cost: "5 nội bộ", pref: "customer" },
        changes: ["Ưu tiên theo quan hệ thương mại", "Đường có thể không ngắn nhất"],
        note: "Chính sách BGP là lý do traceroute đôi khi đi vòng qua nước thứ ba dù về địa lý gần hơn."
      },
      {
        short: "Anycast",
        type: "Tổng kết",
        title: "Cùng một prefix, nhiều vị trí",
        body: "Với <strong>anycast</strong>, nhiều máy chủ quảng bá cùng prefix; BGP đưa mỗi người dùng tới vị trí gần nhất theo topology. CDN, DNS root và một số dịch vụ DDoS protection dùng cách này để giảm độ trễ và chia tải.",
        focus: ["all"],
        edges: "all",
        metrics: { as: "nhiều AS", path: "gần nhất", cost: "—", pref: "anycast" },
        changes: ["Người dùng tới site gần", "Tự động chuyển khi một site hỏng"],
        note: "Anycast không đảm bảo cùng người dùng luôn tới cùng site; session dài cần thiết kế cẩn thận."
      }
    ]
  };
})();
