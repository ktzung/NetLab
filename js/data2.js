/* NetLab — bài 6–10, luyện tập, cheatsheets và Packet Lab */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  /* ------------------------------------------------------------------
     Bài 6 — TCP: bắt tay, cửa sổ trượt, truyền lại
     ------------------------------------------------------------------ */
  SL.lessons["tcp-window"] = {
    id: "tcp-window",
    module: "transport-app",
    title: "TCP: bắt tay, cửa sổ trượt và truyền lại",
    shortTitle: "TCP & cửa sổ",
    subtitle: "Kết nối tin cậy được thiết lập ra sao, cửa sổ kiểm soát lượng dữ liệu đang bay, và vì sao mất một gói làm cả luồng chậm lại?",
    blurb: "TCP không chỉ “gửi lại khi mất gói”. Nó liên tục cân bằng giữa tốc độ, độ trễ và sức chứa của mạng.",
    duration: "18 phút",
    level: "Trung cấp",
    tags: ["TCP", "three-way handshake", "sliding window", "congestion", "retransmission", "ACK", "BDP"],
    metrics: [
      { key: "state", label: "Trạng thái", tone: "blue" },
      { key: "window", label: "Cửa sổ", tone: "violet" },
      { key: "inflight", label: "Đang bay", tone: "yellow" },
      { key: "retrans", label: "Truyền lại", tone: "coral" }
    ],
    nodes: [
      { id: "client", type: "client", x: 45, y: 200, w: 170, h: 68, label: "Client", sub: "ISN = 1000" },
      { id: "network", type: "cdn", x: 350, y: 200, w: 185, h: 68, label: "Mạng", sub: "RTT 40 ms" },
      { id: "server", type: "server", x: 680, y: 200, w: 175, h: 68, label: "Server", sub: "ISN = 9000" }
    ],
    edges: [
      { id: "c-n", from: "client", to: "network", kind: "request", label: "SYN" },
      { id: "n-s", from: "network", to: "server", kind: "request" },
      { id: "s-n", from: "server", to: "network", kind: "response", label: "SYN-ACK", bow: 30 },
      { id: "n-c", from: "network", to: "client", kind: "response", bow: 30 },
      { id: "c-n2", from: "client", to: "network", kind: "data", label: "ACK + data", bow: -32 },
      { id: "n-s2", from: "network", to: "server", kind: "data", bow: -32 }
    ],
    learn: [
      "Mô tả ba bước bắt tay và vai trò của ISN, SYN, ACK.",
      "Giải thích cửa sổ trượt giới hạn dữ liệu đang bay.",
      "Tính BDP và nhận ra cửa sổ nhỏ làm giảm throughput.",
      "Phân biệt kiểm soát luồng với kiểm soát tắc nghẽn."
    ],
    steps: [
      {
        short: "Ba bước bắt tay",
        type: "Khởi đầu",
        title: "Client gửi SYN để mở kết nối",
        body: "TCP bắt đầu bằng SYN mang số thứ tự khởi tạo (ISN). Server phản hồi SYN-ACK, client gửi ACK. Sau ba bước, hai bên thống nhất số thứ tự và kết nối sẵn sàng — trước khi một byte dữ liệu nào được gửi.",
        focus: ["client", "network", "server"],
        edges: ["c-n", "n-s"],
        metrics: { state: "SYN_SENT", window: "—", inflight: "0 B", retrans: "0" },
        changes: ["Client gửi SYN", "Server nhận yêu cầu mở"],
        note: "Mỗi chiều có ISN riêng. ACK có nghĩa “tôi đã nhận đến số thứ tự này và chờ byte tiếp theo”."
      },
      {
        short: "SYN-ACK",
        type: "Phản hồi",
        title: "Server xác nhận và mở chiều ngược",
        body: "Server gửi SYN-ACK: vừa xác nhận SYN của client, vừa mở chiều ngược lại bằng ISN của mình. Đây là lý do bắt tay TCP tốn một RTT đầy đủ trước khi dữ liệu đầu tiên có thể đi.",
        focus: ["client", "server"],
        edges: ["s-n", "n-c"],
        metrics: { state: "SYN_RECEIVED", window: "64 KB", inflight: "0 B", retrans: "0" },
        changes: ["Server gửi SYN-ACK", "Hai chiều được thiết lập"],
        note: "SYN flood lợi dụng trạng thái nửa mở này. SYN cookie giúp server chịu tải mà không cấp phát tài nguyên ngay."
      },
      {
        short: "ACK hoàn tất",
        type: "Kết nối",
        title: "Kết nối đã sẵn sàng",
        body: "Client gửi ACK cuối. Cả hai bên bước vào trạng thái ESTABLISHED. Từ đây dữ liệu được chia thành segment, mỗi segment có số thứ tự và cần được xác nhận.",
        focus: ["client", "server"],
        edges: ["c-n2", "n-s2"],
        metrics: { state: "ESTABLISHED", window: "64 KB", inflight: "0 B", retrans: "0" },
        changes: ["Bắt tay hoàn tất", "Có thể gửi dữ liệu"],
        note: "Với HTTPS, TLS handshake diễn ra tiếp sau TCP, cộng thêm một hoặc hai RTT trước khi có dữ liệu ứng dụng."
      },
      {
        short: "Cửa sổ trượt",
        type: "Kiểm soát",
        title: "Chỉ một lượng dữ liệu được bay cùng lúc",
        body: "Cửa sổ nhận cho biết còn bao nhiêu byte có thể gửi mà chưa cần ACK. Client lấp đầy cửa sổ rồi chờ. Khi ACK đến, cửa sổ “trượt” về phía trước. Cơ chế này tránh làm ngập máy nhận và mạng.",
        focus: ["client", "network", "server"],
        edges: ["c-n2", "n-s2"],
        metrics: { state: "ESTABLISHED", window: "64 KB", inflight: "48 KB", retrans: "0" },
        changes: ["Nhiều segment đang bay", "ACK mở khóa byte mới"],
        note: "Cửa sổ hiệu dụng = min(cửa sổ nhận, cửa sổ tắc nghẽn). Hai giới hạn khác nhau nhưng cùng chặn gửi."
      },
      {
        short: "Mất gói",
        type: "Sự cố",
        title: "Một gói mất kéo theo truyền lại",
        body: "Nếu một segment bị mất, các ACK lặp lại báo hiệu. TCP có thể truyền lại nhanh sau ba ACK trùng, hoặc chờ timeout. Trong lúc chờ, cửa sổ tắc nghẽn giảm, nên throughput tụt ngay cả khi phần lớn gói vẫn đến.",
        focus: ["network"],
        edges: ["c-n2", "n-s2", "s-n"],
        metrics: { state: "FAST_RECOVERY", window: "32 KB", inflight: "20 KB", retrans: "1" },
        warn: ["network"],
        changes: ["Phát hiện mất gói", "Cửa sổ bị thu nhỏ"],
        note: "TCP không phân biệt mất gói do lỗi vật lý hay do hàng đợi đầy; cả hai đều bị hiểu là tắc nghẽn."
      },
      {
        short: "BDP và giới hạn",
        type: "Tính toán",
        title: "Đường nhanh nhưng xa vẫn cần cửa sổ lớn",
        body: "Băng thông × RTT = lượng dữ liệu tối đa đang bay (BDP). Với 1 Gbps và RTT 120 ms, BDP khoảng 15 MB. Nếu cửa sổ chỉ 1 MB, một luồng TCP không thể lấp đầy đường truyền dù đường rất nhanh.",
        focus: ["client", "network", "server"],
        edges: "all",
        metrics: { state: "ESTABLISHED", window: "15 MB (BDP)", inflight: "15 MB", retrans: "0" },
        changes: ["Cửa sổ phải đủ lớn", "Throughput tiến gần băng thông"],
        note: "Cần bật TCP window scaling cho đường có BDP lớn. Đây là lý do nhiều luồng song song nhanh hơn một luồng."
      },
      {
        short: "Hai loại kiểm soát",
        type: "Tổng kết",
        title: "Flow control và congestion control",
        body: "Flow control bảo vệ máy nhận khỏi bị ngập; congestion control bảo vệ mạng khỏi bị quá tải. TCP điều chỉnh cửa sổ dựa trên cả hai tín hiệu. Tối ưu TCP là tối ưu cả hai đầu, không chỉ một tham số.",
        focus: ["all"],
        edges: "all",
        metrics: { state: "Ổn định", window: "Theo BDP", inflight: "Vừa đủ", retrans: "Thấp" },
        changes: ["Cân bằng tốc độ và tắc nghẽn", "Giảm retransmission"],
        note: "Mất gói 0,1% có thể làm throughput giảm mạnh nếu RTT cao. Hãy đo retransmission, không chỉ đo tốc độ."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 7 — UDP và truyền thông thời gian thực
     ------------------------------------------------------------------ */
  SL.lessons["udp-realtime"] = {
    id: "udp-realtime",
    module: "transport-app",
    title: "UDP và truyền thông thời gian thực",
    shortTitle: "UDP & realtime",
    subtitle: "Khi nào bỏ qua bắt tay và truyền lại? DNS, game, gọi thoại và QUIC dùng UDP vì những lý do rất khác nhau.",
    blurb: "UDP không phải “TCP hỏng”. Nó là công cụ tối giản để ứng dụng tự quyết định điều gì đáng chờ và điều gì nên bỏ.",
    duration: "14 phút",
    level: "Trung cấp",
    tags: ["UDP", "DNS", "QUIC", "jitter", "realtime", "datagram", "VoIP", "game"],
    metrics: [
      { key: "header", label: "Header", tone: "blue" },
      { key: "delay", label: "Độ trễ", tone: "violet" },
      { key: "loss", label: "Mất gói", tone: "coral" },
      { key: "retry", label: "Truyền lại", tone: "yellow" }
    ],
    nodes: [
      { id: "app", type: "client", x: 40, y: 75, w: 175, h: 68, label: "Ứng dụng realtime", sub: "voice / game" },
      { id: "dns", type: "dns", x: 40, y: 345, w: 175, h: 68, label: "DNS resolver", sub: "UDP 53" },
      { id: "net", type: "cdn", x: 355, y: 210, w: 180, h: 68, label: "Mạng", sub: "mất gói 2%" },
      { id: "server", type: "server", x: 675, y: 75, w: 180, h: 68, label: "Game / voice server", sub: "UDP 443" },
      { id: "cdn", type: "cache", x: 675, y: 345, w: 180, h: 68, label: "CDN edge", sub: "HTTP/3 trên QUIC" }
    ],
    edges: [
      { id: "a-n", from: "app", to: "net", kind: "request", label: "datagram" },
      { id: "n-s", from: "net", to: "server", kind: "request" },
      { id: "s-n", from: "server", to: "net", kind: "response", bow: 28 },
      { id: "n-a", from: "net", to: "app", kind: "response", bow: 28 },
      { id: "d-n", from: "dns", to: "net", kind: "request", label: "query" },
      { id: "n-d", from: "net", to: "dns", kind: "response", bow: 26 },
      { id: "n-c", from: "net", to: "cdn", kind: "data", label: "QUIC" },
      { id: "c-n", from: "cdn", to: "net", kind: "response", bow: 26 }
    ],
    learn: [
      "Biết UDP chỉ thêm 8 byte header và không bắt tay.",
      "Hiểu vì sao dữ liệu thời gian thực thường thà mất gói còn hơn chờ.",
      "Dùng jitter buffer và retry ở tầng ứng dụng khi cần.",
      "Nhận ra QUIC xây tin cậy và mã hóa trên nền UDP."
    ],
    steps: [
      {
        short: "Datagram tối giản",
        type: "Khởi đầu",
        title: "UDP gửi thẳng, không bắt tay",
        body: "UDP chỉ có 8 byte header: port nguồn, port đích, độ dài và checksum. Không có số thứ tự, không ACK, không cửa sổ. Ứng dụng gửi datagram và mạng cố gắng chuyển nó đi ngay.",
        focus: ["app", "net"],
        edges: ["a-n"],
        metrics: { header: "8 B", delay: "1 RTT", loss: "0%", retry: "Ứng dụng" },
        changes: ["Không thiết lập kết nối", "Không đảm bảo thứ tự"],
        note: "UDP phù hợp khi dữ liệu mới hơn quan trọng hơn dữ liệu cũ bị mất."
      },
      {
        short: "DNS một phát",
        type: "Ứng dụng",
        title: "DNS hỏi một câu, chờ một câu trả lời",
        body: "Một truy vấn DNS thường vừa một datagram. Nếu mất, resolver tự thử lại sau vài giây. Không cần dựng kết nối TCP chỉ để hỏi một tên miền ngắn — nhưng DNS lớn hoặc DNSSEC có thể chuyển sang TCP.",
        focus: ["dns", "net"],
        edges: ["d-n", "n-d"],
        metrics: { header: "8 B", delay: "20–80 ms", loss: "0%", retry: "Resolver" },
        changes: ["Query đi trong một gói", "Ứng dụng quyết định thử lại"],
        note: "DNS-over-HTTPS bọc DNS trong HTTPS, thêm tin cậy và quyền riêng tư nhưng cũng thêm độ trễ."
      },
      {
        short: "Gói đến muộn",
        type: "Realtime",
        title: "Dữ liệu cũ không còn giá trị",
        body: "Trong cuộc gọi thoại, một khung âm thanh đến muộn 400 ms đã vô dụng. TCP sẽ giữ các gói sau lại để chờ gói mất, gây trễ dây chuyền. UDP cho phép bỏ qua gói muộn và tiếp tục phát gói mới.",
        focus: ["app", "net", "server"],
        edges: ["a-n", "n-s", "s-n", "n-a"],
        metrics: { header: "8 B", delay: "40 ms", loss: "2%", retry: "0" },
        warn: ["net"],
        changes: ["Bỏ gói đến muộn", "Giữ độ trễ thấp"],
        note: "Với video call, mất một khung hình nhỏ dễ chịu hơn dừng toàn bộ hình để chờ."
      },
      {
        short: "Jitter buffer",
        type: "Giảm rung",
        title: "Đệm nhỏ để làm phẳng dao động",
        body: "Jitter là độ lệch RTT giữa các gói. Ứng dụng realtime dùng jitter buffer: giữ gói thêm một khoảng ngắn để phát đều. Buffer quá nhỏ gây giật; quá lớn tăng độ trễ. Đây là đánh đổi do ứng dụng chọn.",
        focus: ["app", "net"],
        edges: ["a-n", "n-a"],
        metrics: { header: "8 B", delay: "60–120 ms", loss: "1%", retry: "Che giấu lỗi" },
        changes: ["Làm phẳng jitter", "Tăng độ trễ có kiểm soát"],
        note: "Không nên đặt jitter buffer cố định quá lớn cho mọi mạng; đo jitter thực tế trước."
      },
      {
        short: "QUIC trên UDP",
        type: "Hiện đại",
        title: "Tin cậy và mã hóa do ứng dụng tự xây",
        body: "QUIC chạy trên UDP nhưng tự thêm số thứ tự, truyền lại, kiểm soát tắc nghẽn và TLS. Nhờ vậy nó tránh được một số hạn chế của TCP, đặc biệt khi mở nhiều luồng song song và khôi phục kết nối nhanh.",
        focus: ["net", "cdn"],
        edges: ["n-c", "c-n"],
        metrics: { header: "8 B UDP + QUIC", delay: "1 RTT", loss: "Có xử lý", retry: "QUIC" },
        changes: ["QUIC thêm tin cậy", "HTTP/3 dùng QUIC"],
        note: "QUIC không phải “UDP tin cậy” miễn phí: nó vẫn chịu tắc nghẽn và vẫn cần ứng dụng xử lý đúng."
      },
      {
        short: "Chọn TCP hay UDP",
        type: "Tổng kết",
        title: "Chọn theo điều ứng dụng cần",
        body: "Cần đúng thứ tự, đầy đủ và có thể chờ? Chọn TCP. Cần độ trễ thấp, chấp nhận mất mát và tự xử lý? Chọn UDP. Đừng chọn UDP chỉ vì “nhanh”, và đừng chọn TCP rồi tưởng nó tự giải quyết mọi thứ.",
        focus: ["all"],
        edges: "all",
        metrics: { header: "Tùy giao thức", delay: "Tùy nhu cầu", loss: "Tùy chấp nhận", retry: "Tùy thiết kế" },
        changes: ["Hai mô hình phù hợp hai bài toán", "Ứng dụng chịu trách nhiệm"],
        note: "Video streaming hiện đại thường dùng HTTP/3 hoặc các giao thức lai, không đơn giản là TCP hay UDP thuần."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 8 — DNS, HTTP và HTTPS
     ------------------------------------------------------------------ */
  SL.lessons["dns-http-https"] = {
    id: "dns-http-https",
    module: "transport-app",
    title: "DNS, HTTP và HTTPS",
    shortTitle: "DNS, HTTP & HTTPS",
    subtitle: "Từ lúc gõ tên miền đến lúc trang hiện ra: phân giải DNS, bắt tay TCP/TLS, gửi HTTP và nhận từ CDN.",
    blurb: "Một trang web đơn giản có thể cần DNS, TCP, TLS, HTTP và cache — mỗi bước đều có thể là nguồn gốc của độ trễ.",
    duration: "18 phút",
    level: "Trung cấp",
    tags: ["DNS", "HTTP", "HTTPS", "TLS", "CDN", "cache", "HTTP/2", "HTTP/3"],
    metrics: [
      { key: "dns", label: "DNS", tone: "violet" },
      { key: "tls", label: "TLS", tone: "blue" },
      { key: "ttfb", label: "TTFB", tone: "yellow" },
      { key: "cache", label: "Cache", tone: "green" }
    ],
    nodes: [
      { id: "browser", type: "client", x: 35, y: 210, w: 170, h: 68, label: "Browser", sub: "example.com" },
      { id: "resolver", type: "dns", x: 235, y: 72, w: 180, h: 68, label: "DNS resolver", sub: "hỏi đệ quy" },
      { id: "root", type: "db", x: 465, y: 45, w: 160, h: 62, label: "DNS gốc / TLD", sub: "trả NS" },
      { id: "server", type: "server", x: 690, y: 210, w: 175, h: 68, label: "Web server", sub: "origin" },
      { id: "cdn", type: "cache", x: 450, y: 355, w: 175, h: 68, label: "CDN edge", sub: "cache gần bạn" }
    ],
    edges: [
      { id: "b-r", from: "browser", to: "resolver", kind: "request", label: "DNS?" },
      { id: "r-root", from: "resolver", to: "root", kind: "request" },
      { id: "root-r", from: "root", to: "resolver", kind: "response", bow: 22 },
      { id: "r-b", from: "resolver", to: "browser", kind: "response", bow: 60, label: "IP" },
      { id: "b-c", from: "browser", to: "cdn", kind: "request", label: "GET /" },
      { id: "c-s", from: "cdn", to: "server", kind: "data", label: "miss" },
      { id: "s-c", from: "server", to: "cdn", kind: "response", bow: 24 },
      { id: "c-b", from: "cdn", to: "browser", kind: "response", bow: 24, label: "200 OK" }
    ],
    learn: [
      "Đi qua các bước phân giải DNS đệ quy và cache.",
      "Phân biệt TCP handshake, TLS handshake và HTTP request.",
      "Hiểu TTFB và vai trò của CDN/cache.",
      "Nhận ra HTTP/2 và HTTP/3 giải quyết vấn đề gì."
    ],
    steps: [
      {
        short: "Phân giải tên miền",
        type: "Khởi đầu",
        title: "Browser cần đổi tên thành địa chỉ IP",
        body: "Browser kiểm tra cache DNS cục bộ trước. Nếu chưa có, nó hỏi resolver. Tên miền không đi thẳng đến web server; trước hết phải được dịch thành địa chỉ IP để lớp mạng có thể định tuyến.",
        focus: ["browser", "resolver"],
        edges: ["b-r"],
        metrics: { dns: "Đang hỏi", tls: "—", ttfb: "—", cache: "Cache trống" },
        changes: ["Kiểm tra cache DNS", "Gửi truy vấn đến resolver"],
        note: "DNS cache có TTL. TTL ngắn linh hoạt hơn nhưng tăng tải và độ trễ phân giải."
      },
      {
        short: "Đệ quy DNS",
        type: "Phân giải",
        title: "Resolver hỏi lần lượt các máy chủ DNS",
        body: "Resolver hỏi DNS gốc, máy chủ TLD rồi máy chủ có thẩm quyền của tên miền. Kết quả cuối cùng là bản ghi A/AAAA. Resolver cache kết quả để lần sau trả lời ngay.",
        focus: ["resolver", "root"],
        edges: ["r-root", "root-r"],
        metrics: { dns: "45 ms", tls: "—", ttfb: "—", cache: "Ghi cache" },
        changes: ["Hỏi theo chuỗi thẩm quyền", "Nhận IP đích"],
        note: "DNSSEC xác thực dữ liệu DNS; nó không mã hóa nội dung truy vấn."
      },
      {
        short: "TCP + TLS",
        type: "Bảo mật",
        title: "Kết nối và thỏa thuận khóa",
        body: "Browser mở TCP đến IP vừa nhận. Với HTTPS, TLS handshake xác thực chứng chỉ, thỏa thuận khóa và thiết lập kênh mã hóa. TLS 1.3 thường chỉ cần một RTT, nhưng vẫn cộng thêm vào thời gian trước byte đầu tiên.",
        focus: ["browser", "server"],
        edges: ["b-r", "b-c", "c-s"],
        metrics: { dns: "45 ms", tls: "60 ms", ttfb: "—", cache: "Chưa dùng" },
        changes: ["TCP kết nối", "TLS bảo vệ phiên"],
        note: "SNI giúp server biết tên miền cần phục vụ trước khi hoàn tất TLS. ECH đang được dùng để che cả SNI."
      },
      {
        short: "Gửi HTTP",
        type: "Yêu cầu",
        title: "GET đi qua kênh đã mã hóa",
        body: "Browser gửi request HTTP: method, path, header, cookie. Server (hoặc CDN) xử lý và trả status, header, body. TTFB đo từ lúc gửi request đến byte đầu tiên của phản hồi, gồm cả xếp hàng và xử lý phía server.",
        focus: ["browser", "server"],
        edges: ["b-c", "c-s"],
        metrics: { dns: "45 ms", tls: "60 ms", ttfb: "180 ms", cache: "MISS" },
        changes: ["Request được gửi", "Server xử lý"],
        note: "TTFB cao có thể do DNS, TLS, mạng hoặc server. Đo từng phần thay vì đoán."
      },
      {
        short: "CDN cache",
        type: "Tối ưu",
        title: "Lần sau, CDN trả lời thay origin",
        body: "Nếu CDN đã có nội dung và còn hạn, nó trả trực tiếp cho người dùng, giảm tải origin và rút ngắn khoảng cách. Cache hit không chỉ nhanh hơn mà còn giảm chi phí băng thông đường trục.",
        focus: ["browser", "cdn"],
        edges: ["b-c", "c-b"],
        metrics: { dns: "Cache DNS", tls: "0–20 ms", ttfb: "35 ms", cache: "HIT" },
        changes: ["CDN trả nội dung", "Origin không bị gọi"],
        note: "Cache key thường gồm URL và một số header. Đặt Vary sai có thể làm cache hit giảm mạnh."
      },
      {
        short: "HTTP/2 và HTTP/3",
        type: "Tổng kết",
        title: "Nhiều tài nguyên, ít chờ hơn",
        body: "HTTP/1.1 bị chặn đầu dòng khi tải nhiều tài nguyên. HTTP/2 ghép nhiều stream trên một kết nối TCP. HTTP/3 chuyển sang QUIC trên UDP để giảm độ trễ và tránh chặn đầu dòng ở tầng giao vận.",
        focus: ["all"],
        edges: "all",
        metrics: { dns: "Tùy cache", tls: "Tùy phiên", ttfb: "Thấp hơn", cache: "Tối ưu" },
        changes: ["Ghép nhiều stream", "Giảm RTT và chặn đầu dòng"],
        note: "Tối ưu web là chuỗi: DNS nhanh, TLS sớm, CDN gần, cache đúng và giao thức phù hợp."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 9 — NAT, firewall và port forwarding
     ------------------------------------------------------------------ */
  SL.lessons["nat-firewall"] = {
    id: "nat-firewall",
    module: "operations",
    title: "NAT, firewall và port forwarding",
    shortTitle: "NAT & firewall",
    subtitle: "Vì sao máy trong nhà ra Internet được nhưng người ngoài không vào được camera? Bảng NAT và luật firewall trả lời.",
    blurb: "Một địa chỉ công cộng chia cho nhiều thiết bị nhờ NAT; firewall quyết định kết nối nào được phép đi qua.",
    duration: "16 phút",
    level: "Trung cấp",
    tags: ["NAT", "PAT", "firewall", "port forwarding", "DNAT", "conntrack", "private IP", "UPnP"],
    metrics: [
      { key: "nat", label: "Bảng NAT", tone: "blue" },
      { key: "public", label: "IP công cộng", tone: "violet" },
      { key: "inbound", label: "Kết nối vào", tone: "coral" },
      { key: "state", label: "Trạng thái", tone: "green" }
    ],
    nodes: [
      { id: "pc", type: "client", x: 35, y: 70, w: 175, h: 68, label: "PC", sub: "192.168.1.10" },
      { id: "phone", type: "client", x: 35, y: 350, w: 175, h: 68, label: "Điện thoại", sub: "192.168.1.11" },
      { id: "router", type: "router", x: 350, y: 210, w: 185, h: 72, label: "Router NAT", sub: "203.0.113.5" },
      { id: "server", type: "server", x: 690, y: 70, w: 175, h: 68, label: "Server Internet", sub: "198.51.100.20:443" },
      { id: "camera", type: "cache", x: 690, y: 350, w: 175, h: 68, label: "Camera IP", sub: "192.168.1.50:8080" }
    ],
    edges: [
      { id: "pc-r", from: "pc", to: "router", kind: "request", label: "src .10:51000" },
      { id: "ph-r", from: "phone", to: "router", kind: "request", bow: -20 },
      { id: "r-s", from: "router", to: "server", kind: "request", label: "src .5:62001" },
      { id: "s-r", from: "server", to: "router", kind: "response", bow: 26 },
      { id: "r-pc", from: "router", to: "pc", kind: "response", bow: 26, label: "conntrack" },
      { id: "r-cam", from: "router", to: "camera", kind: "data", label: "DNAT :8080" }
    ],
    learn: [
      "Phân biệt IP riêng và IP công cộng, hiểu PAT.",
      "Đọc bảng NAT và vai trò của conntrack.",
      "Cấu hình port forwarding đúng hướng và đúng giao thức.",
      "Nhận ra rủi ro khi mở cổng hoặc dùng UPnP tràn lan."
    ],
    steps: [
      {
        short: "IP riêng không đi xa",
        type: "Khởi đầu",
        title: "Máy trong LAN dùng địa chỉ riêng",
        body: "192.168.1.10 là địa chỉ riêng, không được định tuyến trên Internet. Router NAT thay IP nguồn bằng IP công cộng và một port nguồn riêng trước khi gói ra ngoài. IP đích vẫn là server.",
        focus: ["pc", "router", "server"],
        edges: ["pc-r", "r-s"],
        metrics: { nat: "Chưa có", public: "203.0.113.5", inbound: "Chặn", state: "Mới" },
        changes: ["IP nguồn được thay", "Port nguồn được ánh xạ"],
        note: "NAT giúp tiết kiệm IPv4, nhưng làm phức tạp các ứng dụng cần kết nối vào từ ngoài."
      },
      {
        short: "Bảng NAT",
        type: "Ánh xạ",
        title: "Mỗi kết nối có một ánh xạ riêng",
        body: "Router ghi: 192.168.1.10:51000 ↔ 203.0.113.5:62001. Khi phản hồi về port 62001, router tra bảng và chuyển về đúng máy, đúng port. Nhiều thiết bị có thể dùng chung IP công cộng nhờ port khác nhau.",
        focus: ["pc", "phone", "router"],
        edges: ["pc-r", "ph-r", "r-s", "s-r"],
        metrics: { nat: "2 ánh xạ", public: "203.0.113.5", inbound: "Chỉ phản hồi", state: "Đã thiết lập" },
        changes: ["Bảng NAT có entry", "Phản hồi được dịch ngược"],
        note: "PAT (NAT overload) là kiểu phổ biến ở gia đình: một IP công cộng, nhiều port nguồn."
      },
      {
        short: "Firewall có trạng thái",
        type: "Kiểm soát",
        title: "Chỉ kết nối đã thiết lập được quay về",
        body: "Firewall stateful theo dõi kết nối. Gói từ ngoài vào không khớp một kết nối đã thiết lập sẽ bị chặn theo mặc định. Đây là lý do PC trong nhà nhận được phản hồi dù không mở cổng nào.",
        focus: ["router", "server"],
        edges: ["s-r", "r-pc"],
        metrics: { nat: "Đã có", public: "203.0.113.5", inbound: "Chặn", state: "ESTABLISHED" },
        changes: ["Firewall theo dõi trạng thái", "Phản hồi được cho qua"],
        note: "Stateful firewall khác với ACL tĩnh: nó hiểu kết nối, không chỉ so khớp địa chỉ và port."
      },
      {
        short: "Port forwarding",
        type: "Mở cổng",
        title: "Chủ động chuyển kết nối vào một thiết bị",
        body: "Muốn xem camera từ ngoài, ta tạo luật DNAT: 203.0.113.5:8080 → 192.168.1.50:8080. Luật phải chỉ rõ giao thức TCP, đúng port và đúng thiết bị. Mở sai port hoặc sai IP là lỗi cấu hình phổ biến.",
        focus: ["router", "camera", "server"],
        edges: ["r-cam"],
        metrics: { nat: "DNAT :8080", public: "203.0.113.5", inbound: "Cho phép 8080", state: "Luật mới" },
        changes: ["Kết nối vào được chuyển tiếp", "Cần luật firewall đi kèm"],
        note: "Không nên mở toàn bộ cổng camera ra Internet. Ưu tiên VPN hoặc reverse proxy có xác thực."
      },
      {
        short: "Rủi ro mở cổng",
        type: "Bảo mật",
        title: "Mỗi cổng mở là một bề mặt tấn công",
        body: "Port forwarding chỉ nên mở cho dịch vụ thực sự cần và có xác thực. UPnP tự mở cổng tiện nhưng nguy hiểm nếu thiết bị bị chiếm quyền. Kiểm tra log, cập nhật firmware và đóng cổng không dùng.",
        focus: ["router", "camera"],
        edges: ["r-cam", "s-r"],
        metrics: { nat: "Tối thiểu", public: "Ẩn dịch vụ", inbound: "Có kiểm soát", state: "Giám sát" },
        warn: ["camera"],
        changes: ["Giảm bề mặt tấn công", "Bật xác thực và log"],
        note: "NAT không phải firewall. Nhiều router gia đình có cả hai, nhưng không nên coi NAT là lớp bảo mật duy nhất."
      },
      {
        short: "Tổng kết NAT",
        type: "Tổng kết",
        title: "Ai được vào, vào đâu, bằng giao thức nào?",
        body: "Ba câu hỏi cho mọi sự cố kết nối vào: IP công cộng là gì, luật NAT trỏ đến đâu, firewall có cho phép giao thức/port đó không. Kiểm tra theo thứ tự từ ngoài vào trong sẽ nhanh hơn đoán.",
        focus: ["all"],
        edges: "all",
        metrics: { nat: "Rõ ràng", public: "Đúng", inbound: "Đúng luật", state: "Hoạt động" },
        changes: ["Luồng vào được kiểm chứng", "Giảm lỗi cấu hình"],
        note: "Dùng công cụ kiểm tra port từ mạng ngoài; thử từ trong LAN không chứng minh được port forwarding."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 10 — Chẩn đoán sự cố theo lớp
     ------------------------------------------------------------------ */
  SL.lessons["troubleshooting"] = {
    id: "troubleshooting",
    module: "operations",
    title: "Chẩn đoán sự cố mạng theo lớp",
    shortTitle: "Chẩn đoán sự cố",
    subtitle: "Một quy trình từ dưới lên: kiểm tra vật lý, IP, gateway, DNS, định tuyến, transport và ứng dụng — mỗi bước loại trừ một giả thuyết.",
    blurb: "Đừng đoán. Hãy thay đổi một biến tại một thời điểm và dùng lệnh phù hợp để chứng minh lớp nào đang hỏng.",
    duration: "20 phút",
    level: "Tổng hợp",
    tags: ["troubleshooting", "ping", "traceroute", "nslookup", "ipconfig", "curl", "OSI", "sự cố"],
    metrics: [
      { key: "layer", label: "Lớp đang kiểm", tone: "blue" },
      { key: "test", label: "Phép thử", tone: "violet" },
      { key: "result", label: "Kết quả", tone: "yellow" },
      { key: "next", label: "Bước tiếp", tone: "green" }
    ],
    nodes: [
      { id: "laptop", type: "client", x: 30, y: 200, w: 155, h: 68, label: "Laptop", sub: "192.168.1.23" },
      { id: "wifi", type: "worker", x: 215, y: 65, w: 160, h: 68, label: "Wi-Fi / AP", sub: "L1–L2" },
      { id: "router", type: "router", x: 390, y: 200, w: 165, h: 68, label: "Router", sub: "gateway .1" },
      { id: "isp", type: "cdn", x: 570, y: 65, w: 160, h: 68, label: "ISP", sub: "ra Internet" },
      { id: "target", type: "dns", x: 735, y: 200, w: 135, h: 68, label: "DNS / Web", sub: "đích cuối" }
    ],
    edges: [
      { id: "l-w", from: "laptop", to: "wifi", kind: "request" },
      { id: "w-r", from: "wifi", to: "router", kind: "request" },
      { id: "r-i", from: "router", to: "isp", kind: "request" },
      { id: "i-t", from: "isp", to: "target", kind: "request" },
      { id: "t-i", from: "target", to: "isp", kind: "response", bow: 24 },
      { id: "i-r", from: "isp", to: "router", kind: "response", bow: 24 },
      { id: "r-w", from: "router", to: "wifi", kind: "response", bow: 24 },
      { id: "w-l", from: "wifi", to: "laptop", kind: "response", bow: 24 }
    ],
    learn: [
      "Áp dụng quy trình chẩn đoán từ lớp 1 đến lớp 7.",
      "Chọn lệnh phù hợp để kiểm tra IP, gateway, DNS, route, port.",
      "Phân biệt lỗi DNS với lỗi kết nối IP.",
      "Thay đổi một biến tại một thời điểm và ghi lại kết quả."
    ],
    steps: [
      {
        short: "Lớp 1–2",
        type: "Vật lý",
        title: "Bắt đầu từ kết nối vật lý",
        body: "Kiểm tra đèn cổng, cáp, Wi-Fi đã kết nối chưa, có bắt được SSID không. Nếu tín hiệu yếu hoặc chập chờn, mọi bước phía trên đều không đáng tin. Đây là lớp rẻ nhất để kiểm tra và loại trừ.",
        focus: ["laptop", "wifi"],
        edges: ["l-w"],
        metrics: { layer: "L1–L2", test: "LED / Wi-Fi", result: "Đã kết nối", next: "Kiểm tra IP" },
        changes: ["Xác nhận liên kết vật lý", "Loại trừ cáp/Wi-Fi"],
        note: "Wi-Fi hiện “đã kết nối” vẫn có thể không có Internet. Liên kết lớp 2 không đồng nghĩa có IP hợp lệ."
      },
      {
        short: "Cấu hình IP",
        type: "Lớp 3",
        title: "Máy có IP, mask và gateway đúng?",
        body: "Chạy ipconfig (Windows) hoặc ip addr / ifconfig. Kiểm tra địa chỉ có phải 169.254.x.x (APIPA) không, mask có đúng không, gateway có cùng subnet không. IP tự cấp sai là dấu hiệu DHCP không trả lời.",
        focus: ["laptop", "router"],
        edges: ["l-w", "w-r"],
        metrics: { layer: "L3", test: "ipconfig / ip addr", result: "192.168.1.23/24", next: "Ping gateway" },
        changes: ["Xác nhận IP hợp lệ", "Loại trừ DHCP"],
        note: "169.254.x.x là địa chỉ link-local tự cấp; thường có nghĩa máy không nhận được DHCP."
      },
      {
        short: "Ping gateway",
        type: "LAN",
        title: "Máy có đi được đến gateway?",
        body: "Ping gateway 192.168.1.1. Nếu được, liên kết LAN và cấu hình IP cơ bản ổn. Nếu không, kiểm tra switch, Wi-Fi, VLAN, firewall trên router hoặc ARP. Đừng vội kết luận do Internet khi chưa qua được gateway.",
        focus: ["laptop", "wifi", "router"],
        edges: ["l-w", "w-r", "r-w"],
        metrics: { layer: "L3", test: "ping gateway", result: "3 ms", next: "Ping IP ngoài" },
        changes: ["LAN thông", "Gateway phản hồi"],
        note: "Một số gateway chặn ICMP ping. Nếu ping fail nhưng web vẫn mở, đừng coi ping là bằng chứng duy nhất."
      },
      {
        short: "Ping IP ngoài",
        type: "Định tuyến",
        title: "Phân biệt lỗi LAN với lỗi ra ngoài",
        body: "Ping 1.1.1.1. Nếu được, đường ra Internet và NAT ổn; lỗi nằm ở DNS hoặc ứng dụng. Nếu không, kiểm tra route, NAT, firewall và ISP. Đây là phép thử tách biệt IP khỏi tên miền.",
        focus: ["router", "isp"],
        edges: ["r-i", "i-t", "t-i"],
        metrics: { layer: "L3–L4", test: "ping 1.1.1.1", result: "12 ms", next: "Kiểm tra DNS" },
        changes: ["Internet IP thông", "Nghi vấn chuyển sang DNS"],
        note: "Ping IP thành công nhưng mở tên miền thất bại là chữ ký kinh điển của lỗi DNS."
      },
      {
        short: "Kiểm tra DNS",
        type: "Lớp 7",
        title: "Tên miền có phân giải được?",
        body: "Dùng nslookup example.com hoặc dig. Nếu trả IP, DNS ổn. Nếu timeout, thử đổi resolver hoặc kiểm tra cấu hình DNS. So sánh kết quả giữa máy và router để biết lỗi cục bộ hay toàn mạng.",
        focus: ["laptop", "target"],
        edges: ["l-w", "w-r", "r-i", "i-t"],
        metrics: { layer: "L7", test: "nslookup / dig", result: "203.0.113.10", next: "Kiểm tra port" },
        changes: ["DNS phân giải đúng", "Loại trừ lỗi tên miền"],
        note: "DNS có cache. Kết quả cũ có thể vẫn còn sau khi đổi bản ghi; thử cache-busting hoặc resolver khác."
      },
      {
        short: "Kiểm tra port",
        type: "Lớp 4",
        title: "Dịch vụ có mở đúng cổng?",
        body: "Dùng curl -v https://example.com hoặc telnet host 443 để kiểm tra kết nối TCP/TLS. Nếu DNS đúng, IP đúng nhưng port không mở, lỗi nằm ở firewall, dịch vụ chưa chạy hoặc NAT/port forwarding.",
        focus: ["laptop", "target"],
        edges: ["i-t", "t-i"],
        metrics: { layer: "L4–L7", test: "curl -v :443", result: "TLS 200 OK", next: "Xác nhận ứng dụng" },
        changes: ["Port và TLS thông", "Cô lập lỗi ứng dụng"],
        note: "Thử từ mạng ngoài khi kiểm tra port forwarding. Thử từ trong LAN có thể đi theo đường khác."
      },
      {
        short: "Quy trình tổng kết",
        type: "Tổng kết",
        title: "Một biến, một phép thử, một kết luận",
        body: "Ghi lại triệu chứng, thay đổi một thứ, kiểm tra lại, rồi mới đi tiếp. Quy trình từ dưới lên giúp loại trừ nhanh và tránh sửa nhiều thứ cùng lúc. Khi xong, ghi lại nguyên nhân để lần sau nhanh hơn.",
        focus: ["all"],
        edges: "all",
        metrics: { layer: "Toàn bộ", test: "Theo thứ tự", result: "Xác định lỗi", next: "Ghi nhận & phòng ngừa" },
        changes: ["Có bằng chứng từng lớp", "Tránh sửa mò"],
        note: "Sự cố mạng thường có nhiều lớp cùng lúc. Hãy chứng minh từng lớp, đừng suy đoán từ một triệu chứng."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Luyện tập — 6 tình huống
     ------------------------------------------------------------------ */
  SL.practice = [
    {
      id: "dns-vs-ip",
      tag: "DNS",
      title: "Web không mở bằng tên miền nhưng IP vẫn sống",
      scenario: "Máy ping 1.1.1.1 thấy 12 ms. Mở https://example.com báo ERR_NAME_NOT_RESOLVED. Đổi DNS sang 1.1.1.1 thì vào được bình thường.",
      metrics: [
        { label: "Ping IP", value: "12 ms" },
        { label: "DNS", value: "timeout", danger: true },
        { label: "Web", value: "không phân giải", danger: true }
      ],
      options: [
        "Tăng băng thông đường truyền",
        "Kiểm tra cấu hình DNS và thử resolver khác",
        "Thay card mạng vì ping IP vẫn được",
        "Mở port 80 trên firewall"
      ],
      correct: 1,
      explain: "Ping IP thành công chứng minh đường mạng và NAT ổn. Lỗi chỉ nằm ở phân giải tên miền. Đổi resolver thành công là bằng chứng trực tiếp: hãy kiểm tra DNS được cấp qua DHCP, DNS nội bộ hoặc cache DNS trên máy."
    },
    {
      id: "same-switch-different-subnet",
      tag: "Subnet",
      title: "Cùng switch nhưng không ping được",
      scenario: "PC 192.168.1.50/24 và máy in 192.168.2.20/24 cắm cùng một switch. Ping thất bại, ARP không thấy máy in. Gateway của PC là 192.168.1.1.",
      metrics: [
        { label: "PC", value: "192.168.1.50/24" },
        { label: "Máy in", value: "192.168.2.20/24" },
        { label: "ARP", value: "không thấy", danger: true }
      ],
      options: [
        "Khởi động lại switch là đủ",
        "Đưa hai máy về cùng subnet hoặc cấu hình gateway/route đúng",
        "Tắt firewall trên PC",
        "Thay cáp mạng"
      ],
      correct: 1,
      explain: "Cùng switch không có nghĩa cùng subnet. 192.168.1.0/24 và 192.168.2.0/24 là hai mạng logic khác nhau; gói cần router định tuyến. ARP chỉ hoạt động trong cùng subnet nên không thấy nhau là bình thường."
    },
    {
      id: "latency-not-bandwidth",
      tag: "Độ trễ",
      title: "Đường 1 Gbps nhưng gọi video vẫn giật",
      scenario: "Speedtest đạt 940 Mbps nhưng cuộc gọi video giật và tiếng vọng. RTT 180 ms, jitter 65 ms, mất gói 0,4%.",
      metrics: [
        { label: "Tốc độ", value: "940 Mbps" },
        { label: "RTT", value: "180 ms", danger: true },
        { label: "Jitter", value: "65 ms", danger: true }
      ],
      options: [
        "Mua gói 2 Gbps để có thêm băng thông",
        "Bật QoS/SQM, giảm bufferbloat và kiểm tra Wi-Fi",
        "Đổi sang dây cáp quang mới",
        "Tăng cửa sổ TCP trên trình duyệt"
      ],
      correct: 1,
      explain: "Băng thông cao không sửa được độ trễ và jitter. Video call nhạy với RTT/jitter hơn tốc độ đỉnh. Ưu tiên QoS/SQM, kiểm tra nhiễu Wi-Fi, bufferbloat và đường đi thực tế. Nâng cấp gói cước có thể không thay đổi gì."
    },
    {
      id: "routing-loop",
      tag: "Định tuyến",
      title: "Traceroute lặp cùng hai địa chỉ",
      scenario: "Traceroute đến server lặp 10.0.0.2 → 10.0.0.3 → 10.0.0.2. RTT tăng dần rồi timeout. Ping từ gateway gần nhất vẫn được.",
      metrics: [
        { label: "Traceroute", value: "lặp 2 hop", danger: true },
        { label: "TTL", value: "về 0", danger: true },
        { label: "Gateway", value: "ổn" }
      ],
      options: [
        "Tăng TTL trên máy client",
        "Sửa bảng định tuyến/route tĩnh đang tạo vòng lặp",
        "Xóa cache DNS và thử lại",
        "Đổi địa chỉ MAC của máy"
      ],
      correct: 1,
      explain: "Hai router trỏ lẫn nhau tạo vòng lặp. TTL giảm đến 0 và packet bị hủy, nên traceroute lặp địa chỉ. Tăng TTL chỉ làm vòng lặp kéo dài hơn; cần sửa route sai hoặc giao thức định tuyến."
    },
    {
      id: "port-forwarding",
      tag: "NAT",
      title: "Camera xem trong nhà được, ngoài Internet không",
      scenario: "Camera 192.168.1.50:8080 xem được trong LAN. Từ ngoài, truy cập 203.0.113.5:8080 bị timeout. Router có IP công cộng và firewall mặc định chặn vào.",
      metrics: [
        { label: "Trong LAN", value: "200 OK" },
        { label: "Ngoài Internet", value: "timeout", danger: true },
        { label: "Port 8080", value: "đóng", danger: true }
      ],
      options: [
        "Bật port forwarding TCP 8080 đến 192.168.1.50 và mở firewall tương ứng",
        "Đặt camera vào DMZ mở toàn bộ cổng",
        "Đổi IP camera sang 10.0.0.50",
        "Tắt NAT trên router"
      ],
      correct: 0,
      explain: "NAT chỉ tự cho phản hồi của kết nối đi ra. Kết nối từ ngoài cần luật DNAT/port forwarding trỏ đúng IP:port, kèm luật firewall cho phép TCP 8080. DMZ toàn bộ cổng là lựa chọn rủi ro cao, không phải cách sửa tối thiểu."
    },
    {
      id: "tcp-window-bdp",
      tag: "TCP",
      title: "Một luồng TCP không lấp đầy đường 1 Gbps",
      scenario: "Đường truyền 1 Gbps, RTT 120 ms. Một luồng TCP chỉ đạt 80 Mbps. Cửa sổ nhận hiện tại 1 MB. Nhiều luồng song song cho tổng tốc độ cao hơn.",
      metrics: [
        { label: "Băng thông", value: "1 Gbps" },
        { label: "RTT", value: "120 ms" },
        { label: "Cửa sổ", value: "1 MB", danger: true }
      ],
      options: [
        "Nâng cấp lên 10 Gbps",
        "Bật TCP window scaling và tăng cửa sổ/gộp luồng phù hợp",
        "Giảm MTU xuống 576 byte",
        "Chuyển toàn bộ ứng dụng sang UDP"
      ],
      correct: 1,
      explain: "BDP = 1 Gbps × 120 ms ≈ 15 MB. Cửa sổ 1 MB chỉ cho tối đa khoảng 1 MB / 0,12 s ≈ 66 Mbps, khớp với 80 Mbps quan sát. Cần window scaling, cửa sổ đủ lớn hoặc nhiều luồng song song; nâng băng thông không giải quyết giới hạn cửa sổ."
    }
  ];

  /* ------------------------------------------------------------------
     Cheatsheets
     ------------------------------------------------------------------ */
  SL.cheatsheets = [
    {
      id: "layers",
      num: "01",
      title: "Mô hình & đóng gói",
      intro: "Bản đồ 7 lớp, ánh xạ TCP/IP và header của từng lớp. Dùng để khoanh vùng sự cố trước khi chạy lệnh.",
      cards: [
        {
          title: "Bảy lớp OSI",
          wide: true,
          html: `<table class="cheat-table">
            <tr><th>Lớp</th><th>Tên</th><th>Chức năng</th><th>Ví dụ</th></tr>
            <tr><td class="mono">7</td><td><b>Application</b></td><td>Giao thức ứng dụng</td><td>HTTP, DNS, SMTP</td></tr>
            <tr><td class="mono">6</td><td><b>Presentation</b></td><td>Mã hóa, nén, định dạng</td><td>TLS, UTF-8, JPEG</td></tr>
            <tr><td class="mono">5</td><td><b>Session</b></td><td>Quản lý phiên</td><td>Cookie, session ID</td></tr>
            <tr><td class="mono">4</td><td><b>Transport</b></td><td>Port, tin cậy, luồng</td><td>TCP, UDP, QUIC</td></tr>
            <tr><td class="mono">3</td><td><b>Network</b></td><td>Địa chỉ logic, định tuyến</td><td>IP, ICMP</td></tr>
            <tr><td class="mono">2</td><td><b>Data Link</b></td><td>Frame, MAC, truy cập môi trường</td><td>Ethernet, Wi-Fi</td></tr>
            <tr><td class="mono">1</td><td><b>Physical</b></td><td>Bit, tín hiệu, môi trường</td><td>Cáp, quang, sóng</td></tr>
          </table>`
        },
        {
          title: "Ánh xạ TCP/IP",
          html: `<table class="cheat-table">
            <tr><th>TCP/IP</th><th>Tương ứng OSI</th><th>PDU</th></tr>
            <tr><td><b>Application</b></td><td>5–7</td><td>Data</td></tr>
            <tr><td><b>Transport</b></td><td>4</td><td>Segment / datagram</td></tr>
            <tr><td><b>Internet</b></td><td>3</td><td>Packet</td></tr>
            <tr><td><b>Network Access</b></td><td>1–2</td><td>Frame / bit</td></tr>
          </table>
          <div class="formula">Dữ liệu → Segment → Packet → Frame → Bit</div>`
        },
        {
          title: "Header của mỗi lớp",
          html: `<div class="check-list">
            <span><b>Ethernet:</b> MAC nguồn/đích, EtherType, FCS (14 B + FCS).</span>
            <span><b>IP:</b> IP nguồn/đích, TTL, protocol, checksum (20 B tối thiểu).</span>
            <span><b>TCP:</b> port, seq/ack, flags, window, checksum (20–60 B).</span>
            <span><b>UDP:</b> port, length, checksum (8 B).</span>
            <span><b>TLS:</b> record header, handshake, mã hóa ứng dụng.</span>
          </div>`
        },
        {
          title: "Khoanh vùng sự cố",
          html: `<div class="check-list">
            <span>Không lên đèn / không bắt Wi-Fi → L1.</span>
            <span>Có link nhưng không ping gateway → L2/L3.</span>
            <span>Ping IP được, tên miền không → DNS/ứng dụng.</span>
            <span>Ping được nhưng web không mở → port/TLS/ứng dụng.</span>
            <span>Một số trang chậm, đo RTT cao → mạng/định tuyến.</span>
          </div>`
        }
      ]
    },
    {
      id: "addressing",
      num: "02",
      title: "IP & subnet",
      intro: "Đọc prefix, tính network/broadcast/host và quyết định gói đi trực tiếp hay qua default gateway.",
      cards: [
        {
          title: "Bảng prefix thông dụng",
          wide: true,
          html: `<table class="cheat-table">
            <tr><th>Prefix</th><th>Mask</th><th>Tổng địa chỉ</th><th>Host dùng được</th><th>Ví dụ network</th></tr>
            <tr><td class="mono">/24</td><td class="mono">255.255.255.0</td><td>256</td><td><b>254</b></td><td class="mono">192.168.1.0</td></tr>
            <tr><td class="mono">/25</td><td class="mono">255.255.255.128</td><td>128</td><td><b>126</b></td><td class="mono">192.168.1.0 / .128</td></tr>
            <tr><td class="mono">/26</td><td class="mono">255.255.255.192</td><td>64</td><td><b>62</b></td><td class="mono">192.168.1.0 / .64</td></tr>
            <tr><td class="mono">/27</td><td class="mono">255.255.255.224</td><td>32</td><td><b>30</b></td><td class="mono">192.168.1.0 / .32</td></tr>
            <tr><td class="mono">/28</td><td class="mono">255.255.255.240</td><td>16</td><td><b>14</b></td><td class="mono">192.168.1.0 / .16</td></tr>
            <tr><td class="mono">/29</td><td class="mono">255.255.255.248</td><td>8</td><td><b>6</b></td><td class="mono">192.168.1.0 / .8</td></tr>
            <tr><td class="mono">/30</td><td class="mono">255.255.255.252</td><td>4</td><td><b>2</b></td><td class="mono">192.168.1.0 / .4</td></tr>
          </table>`
        },
        {
          title: "Máy tính subnet",
          wide: true,
          html: `<div class="calc">
            <div class="calc-grid">
              <div class="calc-field"><label>Địa chỉ IP</label><input id="snIp" value="192.168.1.10" spellcheck="false"></div>
              <div class="calc-field"><label>Prefix (/)</label><input id="snPrefix" type="number" min="8" max="32" value="24"></div>
            </div>
            <div class="calc-out" id="snOut"><span>Network</span><b>192.168.1.0/24</b><small>Đang tính…</small></div>
            <table class="cheat-table" style="margin-top:10px">
              <tr><th>Thuộc tính</th><th>Giá trị</th></tr>
              <tr><td>Subnet mask</td><td class="mono" id="snMask">255.255.255.0</td></tr>
              <tr><td>Broadcast</td><td class="mono" id="snBroadcast">192.168.1.255</td></tr>
              <tr><td>Host khả dụng</td><td id="snHosts">254</td></tr>
              <tr><td>Dải host</td><td class="mono" id="snRange">192.168.1.1 – 192.168.1.254</td></tr>
            </table>
          </div>`
        },
        {
          title: "Dải địa chỉ riêng",
          html: `<table class="cheat-table">
            <tr><th>Dải</th><th>Prefix</th><th>Ghi chú</th></tr>
            <tr><td class="mono">10.0.0.0 – 10.255.255.255</td><td class="mono">/8</td><td>Doanh nghiệp lớn</td></tr>
            <tr><td class="mono">172.16.0.0 – 172.31.255.255</td><td class="mono">/12</td><td>Văn phòng, lab</td></tr>
            <tr><td class="mono">192.168.0.0 – 192.168.255.255</td><td class="mono">/16</td><td>Gia đình, router</td></tr>
            <tr><td class="mono">169.254.0.0/16</td><td class="mono">/16</td><td>Link-local, APIPA</td></tr>
          </table>
          <div class="formula">Private IP <span class="hl">không được định tuyến</span> trên Internet</div>`
        },
        {
          title: "Cùng subnet hay không?",
          html: `<div class="formula">network = IP <span class="hl">AND</span> subnet mask</div>
          <div class="check-list">
            <span>network(IP nguồn) = network(IP đích) → gửi trực tiếp, ARP MAC đích.</span>
            <span>Khác network → gửi đến default gateway.</span>
            <span>IP đích giữ nguyên; MAC đích có thể là gateway.</span>
            <span>Gateway phải cùng subnet với host.</span>
          </div>`
        }
      ]
    },
    {
      id: "ports",
      num: "03",
      title: "Cổng & giao thức",
      intro: "Bảng cổng thường gặp, khác biệt TCP/UDP, bản ghi DNS và mã HTTP cần nhớ khi đọc log.",
      cards: [
        {
          title: "Cổng thường gặp",
          wide: true,
          html: `<table class="cheat-table">
            <tr><th>Port</th><th>Giao thức</th><th>Dùng cho</th><th>Ghi nhớ</th></tr>
            <tr><td class="mono">20/21</td><td>TCP</td><td>FTP</td><td>Dữ liệu / điều khiển</td></tr>
            <tr><td class="mono">22</td><td>TCP</td><td>SSH, SFTP</td><td>Quản trị từ xa</td></tr>
            <tr><td class="mono">25/587</td><td>TCP</td><td>SMTP</td><td>Gửi mail / submission</td></tr>
            <tr><td class="mono">53</td><td>UDP/TCP</td><td>DNS</td><td>UDP thường, TCP khi lớn</td></tr>
            <tr><td class="mono">67/68</td><td>UDP</td><td>DHCP</td><td>Server / client</td></tr>
            <tr><td class="mono">80</td><td>TCP</td><td>HTTP</td><td>Không mã hóa</td></tr>
            <tr><td class="mono">123</td><td>UDP</td><td>NTP</td><td>Đồng bộ thời gian</td></tr>
            <tr><td class="mono">443</td><td>TCP/UDP</td><td>HTTPS, QUIC</td><td>TLS, HTTP/3</td></tr>
            <tr><td class="mono">3389</td><td>TCP</td><td>RDP</td><td>Remote Desktop</td></tr>
          </table>`
        },
        {
          title: "TCP và UDP",
          html: `<table class="cheat-table">
            <tr><th></th><th>TCP</th><th>UDP</th></tr>
            <tr><td>Kết nối</td><td>Có bắt tay</td><td>Không</td></tr>
            <tr><td>Tin cậy</td><td>Có ACK, retransmit</td><td>Không</td></tr>
            <tr><td>Thứ tự</td><td>Đảm bảo</td><td>Không</td></tr>
            <tr><td>Header</td><td>20–60 B</td><td>8 B</td></tr>
            <tr><td>Phù hợp</td><td>Web, file, email</td><td>DNS, voice, game</td></tr>
          </table>`
        },
        {
          title: "Bản ghi DNS",
          html: `<table class="cheat-table">
            <tr><th>Loại</th><th>Ý nghĩa</th></tr>
            <tr><td class="mono">A</td><td>Tên → IPv4</td></tr>
            <tr><td class="mono">AAAA</td><td>Tên → IPv6</td></tr>
            <tr><td class="mono">CNAME</td><td>Bí danh tên miền</td></tr>
            <tr><td class="mono">MX</td><td>Mail server</td></tr>
            <tr><td class="mono">TXT</td><td>Xác thực, SPF, DKIM</td></tr>
            <tr><td class="mono">NS</td><td>Máy chủ tên miền</td></tr>
          </table>`
        },
        {
          title: "Mã HTTP cần nhớ",
          html: `<table class="cheat-table">
            <tr><th>Mã</th><th>Nghĩa</th><th>Gợi ý</th></tr>
            <tr><td class="mono">200</td><td>OK</td><td>Thành công</td></tr>
            <tr><td class="mono">301/302</td><td>Redirect</td><td>Kiểm tra Location</td></tr>
            <tr><td class="mono">304</td><td>Not Modified</td><td>Cache còn hạn</td></tr>
            <tr><td class="mono">401/403</td><td>Chưa xác thực / bị chặn</td><td>Token, quyền</td></tr>
            <tr><td class="mono">404</td><td>Không thấy</td><td>Path, route</td></tr>
            <tr><td class="mono">429</td><td>Quá nhiều request</td><td>Rate limit</td></tr>
            <tr><td class="mono">500/502/504</td><td>Lỗi server/gateway</td><td>Log phía sau</td></tr>
          </table>`
        }
      ]
    },
    {
      id: "transport",
      num: "04",
      title: "TCP, UDP & BDP",
      intro: "Bắt tay, cửa sổ, BDP và lựa chọn giao thức. Dùng máy tính để thấy vì sao đường nhanh vẫn chậm.",
      cards: [
        {
          title: "TCP ba bước",
          html: `<div class="check-list">
            <span><b>SYN</b> — client gửi ISN, mở kết nối.</span>
            <span><b>SYN-ACK</b> — server xác nhận, gửi ISN của mình.</span>
            <span><b>ACK</b> — client xác nhận, kết nối ESTABLISHED.</span>
            <span>TLS 1.3 thêm khoảng 1 RTT trước dữ liệu.</span>
          </div>
          <div class="formula">Ít nhất <span class="hl">1 RTT</span> trước byte dữ liệu đầu tiên</div>`
        },
        {
          title: "BDP & cửa sổ",
          wide: true,
          html: `<div class="calc">
            <div class="calc-grid">
              <div class="calc-field"><label>Băng thông (Mbps)</label><input id="bdpMbps" type="number" value="1000"></div>
              <div class="calc-field"><label>RTT (ms)</label><input id="bdpRtt" type="number" value="120"></div>
              <div class="calc-field"><label>Cửa sổ hiện tại (MB)</label><input id="bdpWin" type="number" value="1" step="0.1"></div>
            </div>
            <div class="calc-out" id="bdpOut"><span>BDP cần thiết</span><b>15 MB</b><small>Đang tính…</small></div>
            <div class="formula">BDP = bandwidth × RTT<br>throughput tối đa ≈ window / RTT</div>
          </div>`
        },
        {
          title: "Hai tầng kiểm soát",
          html: `<table class="cheat-table">
            <tr><th>Cơ chế</th><th>Bảo vệ</th><th>Tín hiệu</th></tr>
            <tr><td><b>Flow control</b></td><td>Máy nhận</td><td>Window nhận</td></tr>
            <tr><td><b>Congestion control</b></td><td>Mạng</td><td>Mất gói, RTT</td></tr>
          </table>
          <div class="check-list">
            <span>Cửa sổ hiệu dụng = min(window nhận, cwnd).</span>
            <span>Mất gói làm cwnd giảm, throughput tụt.</span>
            <span>RTT cao cần window scaling.</span>
          </div>`
        },
        {
          title: "Khi nào chọn UDP",
          html: `<div class="check-list">
            <span>Cần độ trễ thấp hơn độ đầy đủ: voice, game, video realtime.</span>
            <span>Dữ liệu cũ đến muộn không còn giá trị.</span>
            <span>Ứng dụng tự xử lý retry, thứ tự, mã hóa.</span>
            <span>DNS query nhỏ; QUIC cho web hiện đại.</span>
            <span>Không chọn UDP chỉ vì “nhanh” mà bỏ qua kiểm soát tắc nghẽn.</span>
          </div>`
        }
      ]
    },
    {
      id: "cli",
      num: "05",
      title: "Lệnh chẩn đoán",
      intro: "Bộ lệnh theo lớp cho macOS/Linux và Windows, kèm cách đọc kết quả để không sửa mò.",
      cards: [
        {
          title: "Bộ lệnh theo lớp",
          wide: true,
          html: `<table class="cheat-table">
            <tr><th>Lớp</th><th>macOS / Linux</th><th>Windows</th><th>Mục đích</th></tr>
            <tr><td>L1–L2</td><td class="mono">ip link / ifconfig</td><td class="mono">ipconfig /all</td><td>Link, Wi-Fi, MAC</td></tr>
            <tr><td>L3</td><td class="mono">ip addr / ip route</td><td class="mono">ipconfig / route print</td><td>IP, gateway, route</td></tr>
            <tr><td>L3</td><td class="mono">ping / traceroute</td><td class="mono">ping / tracert</td><td>Reachability, path</td></tr>
            <tr><td>L2/L3</td><td class="mono">arp -a / ip neigh</td><td class="mono">arp -a</td><td>IP ↔ MAC</td></tr>
            <tr><td>L7</td><td class="mono">dig / nslookup</td><td class="mono">nslookup</td><td>DNS</td></tr>
            <tr><td>L4</td><td class="mono">nc -vz host 443</td><td class="mono">Test-NetConnection</td><td>Port TCP</td></tr>
            <tr><td>L7</td><td class="mono">curl -vI https://…</td><td class="mono">curl.exe -vI …</td><td>HTTP/TLS</td></tr>
            <tr><td>L4</td><td class="mono">ss -tulpn / netstat</td><td class="mono">netstat -ano</td><td>Socket đang mở</td></tr>
          </table>`
        },
        {
          title: "ping và traceroute",
          html: `<div class="formula">ping -c 4 1.1.1.1<br>traceroute example.com</div>
          <div class="check-list">
            <span>Ping gateway được → LAN ổn.</span>
            <span>Ping IP ngoài được, tên miền không → DNS.</span>
            <span>Traceroute lặp địa chỉ → vòng lặp định tuyến.</span>
            <span>Dấu * có thể do router chặn ICMP, không chắc lỗi.</span>
          </div>`
        },
        {
          title: "DNS và HTTP",
          html: `<div class="formula">dig +short example.com<br>dig @1.1.1.1 example.com<br>curl -vI https://example.com</div>
          <div class="check-list">
            <span>So sánh resolver hệ thống với resolver công cộng.</span>
            <span>curl -v cho thấy DNS, TCP, TLS, HTTP theo thứ tự.</span>
            <span>Thêm -I để chỉ lấy header, nhanh hơn tải body.</span>
          </div>`
        },
        {
          title: "Đọc kết quả",
          html: `<div class="check-list">
            <span>169.254.x.x → DHCP không trả lời.</span>
            <span>Destination host unreachable → route/ARP/L2.</span>
            <span>Connection refused → port đóng, dịch vụ không chạy.</span>
            <span>Timeout → firewall, route, NAT hoặc mất gói.</span>
            <span>TLS error → chứng chỉ, SNI, thời gian hệ thống.</span>
          </div>`
        }
      ]
    },
    {
      id: "units",
      num: "06",
      title: "Đơn vị & ngân sách",
      intro: "Đổi Mbps sang MB/s, tính thời gian tải và đọc độ trễ theo từng chặng. Đừng nhầm bit với byte.",
      cards: [
        {
          title: "Mbps, MB/s và thời gian tải",
          wide: true,
          html: `<div class="calc">
            <div class="calc-grid">
              <div class="calc-field"><label>Tốc độ (Mbps)</label><input id="unitMbps" type="number" value="100"></div>
              <div class="calc-field"><label>Kích thước tệp (MB)</label><input id="unitSize" type="number" value="1024"></div>
            </div>
            <div class="calc-out" id="unitOut"><span>Tốc độ tương đương</span><b>12,5 MB/s</b><small>Đang tính…</small></div>
            <div class="formula">MB/s = Mbps ÷ 8<br>thời gian = kích thước × 8 ÷ Mbps</div>
          </div>`
        },
        {
          title: "Nhị phân và thập phân",
          html: `<table class="cheat-table">
            <tr><th>Đơn vị</th><th>Giá trị</th><th>Ghi chú</th></tr>
            <tr><td class="mono">1 KB</td><td>1.000 B</td><td>Thập phân (SI)</td></tr>
            <tr><td class="mono">1 KiB</td><td>1.024 B</td><td>Nhị phân</td></tr>
            <tr><td class="mono">1 MB</td><td>1.000.000 B</td><td>Nhà mạng thường dùng</td></tr>
            <tr><td class="mono">1 MiB</td><td>1.048.576 B</td><td>Hệ điều hành</td></tr>
          </table>
          <div class="formula">1 byte = 8 bit · 1 Mbps = 0,125 MB/s</div>`
        },
        {
          title: "Ngân sách độ trễ",
          html: `<div class="latency-bars">
            <div class="latency-row"><span>LAN</span><div class="latency-bar"><i style="width:8%"></i></div><b>1–5 ms</b></div>
            <div class="latency-row"><span>Cùng quốc gia</span><div class="latency-bar"><i style="width:24%"></i></div><b>10–30 ms</b></div>
            <div class="latency-row"><span>Xuyên lục địa</span><div class="latency-bar"><i style="width:58%"></i></div><b>80–150 ms</b></div>
            <div class="latency-row"><span>Vệ tinh địa tĩnh</span><div class="latency-bar"><i style="width:100%"></i></div><b>500–700 ms</b></div>
          </div>
          <p>Ngân sách thường gặp: tương tác &lt; 100 ms, gọi thoại &lt; 150 ms, video &lt; 200 ms.</p>`
        },
        {
          title: "Chuẩn Wi-Fi",
          html: `<table class="cheat-table">
            <tr><th>Chuẩn</th><th>Băng tần</th><th>Tốc độ lý thuyết</th></tr>
            <tr><td>Wi-Fi 4 (802.11n)</td><td>2,4 / 5 GHz</td><td>600 Mbps</td></tr>
            <tr><td>Wi-Fi 5 (802.11ac)</td><td>5 GHz</td><td>6,9 Gbps</td></tr>
            <tr><td>Wi-Fi 6 (802.11ax)</td><td>2,4 / 5 / 6</td><td>9,6 Gbps</td></tr>
            <tr><td>Wi-Fi 6E</td><td>6 GHz</td><td>9,6 Gbps</td></tr>
            <tr><td>Wi-Fi 7 (802.11be)</td><td>2,4 / 5 / 6</td><td>46 Gbps</td></tr>
          </table>
          <p>Tốc độ thực thường thấp hơn nhiều do nhiễu, khoảng cách, số client và overhead.</p>`
        }
      ]
    }
  ];

  /* ------------------------------------------------------------------
     Packet Lab
     ------------------------------------------------------------------ */
  SL.lab = {
    components: {
      client: { label: "Máy khách", type: "client", latency: 1, capacity: 1000, cost: 0, tone: "blue" },
      access: { label: "Switch truy cập", type: "lb", latency: 0.5, capacity: 1000, cost: 10, tone: "coral" },
      home: { label: "Router gia đình", type: "router", latency: 2, capacity: 300, cost: 0, tone: "violet" },
      firewall: { label: "Tường lửa", type: "gateway", latency: 1.5, capacity: 800, cost: 25, tone: "coral" },
      isp: { label: "ISP", type: "cdn", latency: 8, capacity: 1000, cost: 0, tone: "green" },
      internet: { label: "Internet", type: "cdn", latency: 25, capacity: 1000, cost: 0, tone: "violet" },
      vpn: { label: "VPN gateway", type: "gateway", latency: 12, capacity: 400, cost: 30, tone: "violet" },
      lb: { label: "Load balancer", type: "lb", latency: 1, capacity: 1000, cost: 20, tone: "coral" },
      proxy: { label: "Reverse proxy", type: "worker", latency: 2, capacity: 900, cost: 15, tone: "coral" },
      web: { label: "Web server", type: "server", latency: 4, capacity: 500, cost: 35, tone: "blue", replicas: true, maxReplicas: 6 },
      db: { label: "Database", type: "db", latency: 6, capacity: 400, cost: 45, tone: "green", replicas: true, maxReplicas: 4 },
      cdn: { label: "CDN edge", type: "cache", latency: 3, capacity: 1200, cost: 18, tone: "green" },
      dns: { label: "DNS resolver", type: "dns", latency: 5, capacity: 1000, cost: 8, tone: "violet" }
    },
    presets: [
      {
        id: "home-web",
        name: "Web gia đình",
        pipeline: ["client", "home", "isp", "internet", "web"],
        mbps: 80,
        replicas: { web: 1 }
      },
      {
        id: "enterprise",
        name: "Web doanh nghiệp",
        pipeline: ["client", "access", "firewall", "lb", "web", "db"],
        mbps: 600,
        replicas: { web: 3, db: 1 }
      },
      {
        id: "vpn",
        name: "VPN từ xa",
        pipeline: ["client", "home", "internet", "vpn", "firewall", "web"],
        mbps: 120,
        replicas: { web: 1 }
      },
      {
        id: "media",
        name: "Phát video",
        pipeline: ["client", "home", "isp", "cdn", "web"],
        mbps: 900,
        replicas: { web: 2 }
      },
      {
        id: "dns",
        name: "Phân giải DNS",
        pipeline: ["client", "home", "isp", "dns", "web"],
        mbps: 50,
        replicas: { web: 1 }
      }
    ],
    defaults: {
      pipeline: ["client", "home", "isp", "internet", "web"],
      mbps: 80,
      replicas: { web: 1 }
    }
  };
})();
