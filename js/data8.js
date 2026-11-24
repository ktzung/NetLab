/* NetLab — phụ lục vận hành: giám sát, cấu hình như mã, dự phòng, chính sách định tuyến, ứng cứu */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  /* ------------------------------------------------------------------
     Phụ lục — 6 bài vận hành & tự động hóa (ngoài mục lục Kurose & Ross)
     ------------------------------------------------------------------ */
  SL.modules.push({
    id: "ch9-ops",
    num: "09",
    title: "Phụ lục · Vận hành & tự động hóa",
    tone: "violet",
    blurb: "Ngoài mục lục sách: giám sát, cấu hình như mã, dự phòng, chính sách định tuyến và ứng cứu sự cố.",
    lessons: ["snmp-telemetry", "netconf-yang", "config-drift", "high-availability", "routing-policy", "ops-incident"]
  });

  /* ------------------------------------------------------------------
     Bài 36 — Giám sát mạng
     ------------------------------------------------------------------ */
  SL.lessons["snmp-telemetry"] = {
    id: "snmp-telemetry",
    module: "ch9-ops",
    title: "Giám sát mạng: SNMP, syslog và telemetry",
    shortTitle: "Giám sát mạng",
    subtitle: "Làm sao biết mạng đang khỏe hay ốm mà không ngồi canh từng thiết bị?",
    blurb: "Poll định kỳ, trap chủ động, OID/MIB, syslog tập trung, SNMPv3 và streaming telemetry.",
    duration: "16 phút",
    level: "Trung cấp",
    tags: ["SNMP", "MIB", "OID", "trap", "syslog", "telemetry", "NetFlow", "IPFIX", "NMS"],
    metrics: [
      { key: "dev", label: "Thiết bị", tone: "blue" },
      { key: "poll", label: "Lượt poll", tone: "violet" },
      { key: "trap", label: "Trap", tone: "yellow" },
      { key: "stale", label: "Tuổi dữ liệu", tone: "coral" }
    ],
    nodes: [
      { id: "noc", type: "client", x: 40, y: 80, w: 180, h: 66, label: "Kỹ sư NOC", sub: "bảng điều khiển" },
      { id: "nms", type: "server", x: 300, y: 80, w: 195, h: 66, label: "NMS / collector", sub: "Prometheus · Zabbix" },
      { id: "r1", type: "router", x: 80, y: 300, w: 175, h: 66, label: "Router biên", sub: "SNMP 161/162" },
      { id: "sw1", type: "switch", x: 325, y: 300, w: 175, h: 66, label: "Switch lõi", sub: "cổng 161" },
      { id: "fw", type: "firewall", x: 565, y: 300, w: 175, h: 66, label: "Firewall", sub: "gửi trap khi có sự kiện" }
    ],
    edges: [
      { id: "noc-nms", from: "noc", to: "nms", kind: "data", label: "dashboard" },
      { id: "nms-r1", from: "nms", to: "r1", kind: "request", label: "poll" },
      { id: "nms-sw1", from: "nms", to: "sw1", kind: "request", label: "poll" },
      { id: "fw-nms", from: "fw", to: "nms", kind: "response", bow: 24, label: "trap" },
      { id: "r1-sw1", from: "r1", to: "sw1", kind: "data" }
    ],
    learn: [
      "Phân biệt poll định kỳ và trap chủ động.",
      "Đọc OID/MIB như địa chỉ của biến trạng thái.",
      "Gom log tập trung bằng syslog và mức severity.",
      "Cấu hình SNMPv3 thay cho community v2c.",
      "Chọn telemetry khi cần độ phân giải cao."
    ],
    steps: [
      {
        short: "Hai chiều giám sát",
        type: "Khởi đầu",
        title: "NMS hỏi định kỳ, thiết bị đẩy sự kiện",
        body: "Giám sát có hai chiều: <strong>poll</strong> — NMS hỏi từng thiết bị theo chu kỳ để lấy số liệu; và <strong>trap</strong> — thiết bị tự gửi thông báo khi có sự kiện như cổng down, CPU cao. Poll cho dữ liệu đều, trap cho phản ứng nhanh nhưng có thể mất nếu đường truyền hỏng.",
        focus: ["nms", "r1", "fw"],
        edges: ["nms-r1", "fw-nms"],
        metrics: { dev: "128", poll: "240/phút", trap: "3", stale: "45 s" },
        changes: ["Thiết bị được hỏi định kỳ", "Sự kiện được đẩy ngay"],
        note: "Trap đi bằng UDP nên không bảo đảm tới nơi; đừng coi trap là nguồn dữ liệu duy nhất."
      },
      {
        short: "OID như địa chỉ biến",
        type: "Cơ chế",
        title: "MIB là cây, OID là đường dẫn tới biến",
        body: "Mỗi chỉ số trong SNMP là một <strong>OID</strong> trên cây <strong>MIB</strong>, ví dụ OID của bộ đếm byte vào một cổng. NMS đi bộ cây (<code>walk</code>) để liệt kê cổng, đọc bộ đếm rồi tính tốc độ theo hiệu hai lần poll. Tên biến phụ thuộc MIB mà thiết bị hỗ trợ, nên phải kiểm tra trước khi viết dashboard.",
        focus: ["nms", "sw1"],
        edges: ["nms-sw1"],
        metrics: { dev: "128", poll: "240/phút", trap: "0", stale: "30 s" },
        changes: ["Chỉ số được định danh rõ", "Bộ đếm quy ra tốc độ"],
        note: "Cùng một OID có thể là kiểu 32-bit và quay vòng nhanh trên cổng 10 Gbps; cần dùng bộ đếm 64-bit."
      },
      {
        short: "Syslog tập trung",
        type: "Log",
        title: "Log rời rạc không truy được sự cố",
        body: "Thiết bị gửi log về máy chủ syslog theo mức từ 0 (khẩn) đến 7 (debug). Gom log về một nơi giúp dựng lại dòng thời gian sự cố và tương quan giữa router, switch, firewall. Nên đặt giờ đồng bộ NTP trước, nếu không log lệch giờ sẽ vô dụng.",
        focus: ["r1", "sw1", "nms"],
        edges: ["nms-r1", "r1-sw1"],
        metrics: { dev: "128", poll: "240/phút", trap: "1", stale: "30 s" },
        changes: ["Log được gom một chỗ", "Dòng thời gian sự cố rõ"],
        note: "Syslog gốc không mã hóa; qua Internet nên dùng syslog TLS cổng 6514 hoặc đường quản trị riêng."
      },
      {
        short: "SNMPv3",
        type: "Bảo mật",
        title: "Community v2c là mật khẩu gửi trần",
        body: "SNMPv2c gửi chuỗi community dạng rõ, mặc định hay gặp là <code>public</code>. SNMPv3 thêm xác thực người gửi (MD5/SHA) và mã hóa payload (DES/AES), đồng thời có thể phân quyền chỉ đọc theo nhóm. Với mạng mới, mặc định nên là v3 và khoanh vùng địa chỉ NMS được phép hỏi.",
        focus: ["nms", "r1", "fw"],
        edges: ["nms-r1", "nms-sw1", "fw-nms"],
        metrics: { dev: "128", poll: "240/phút", trap: "0", stale: "30 s" },
        changes: ["Truy vấn được xác thực", "Payload được mã hóa"],
        note: "Khóa SNMPv3 phải đổi khi thay người quản trị; đừng dùng chung một tài khoản cho mọi thiết bị."
      },
      {
        short: "Ngưỡng & baseline",
        type: "Cảnh báo",
        title: "Cảnh báo theo nền, không theo con số tuyệt đối",
        body: "Ngưỡng cố định hay báo nhầm vì lưu lượng thay đổi theo giờ. Cách tốt hơn là dựng <strong>baseline</strong> theo khung giờ rồi cảnh báo khi lệch đáng kể, kèm thời gian duy trì để tránh nhiễu. Mỗi cảnh báo nên gắn với một hành động cụ thể, nếu không sẽ sinh mệt mỏi cảnh báo.",
        focus: ["noc", "nms"],
        edges: ["noc-nms"],
        metrics: { dev: "128", poll: "240/phút", trap: "12", stale: "30 s" },
        changes: ["Giảm cảnh báo giả", "Cảnh báo gắn hành động"],
        note: "Alert fatigue là nguyên nhân thật khiến sự cố bị bỏ qua; hãy đo tỉ lệ cảnh báo hữu ích mỗi tuần."
      },
      {
        short: "Telemetry & flow",
        type: "Tổng kết",
        title: "Poll dày không thay được telemetry",
        body: "Khi cần độ phân giải dưới một giây, thiết bị đẩy <strong>streaming telemetry</strong> chủ động thay vì để NMS hỏi. <strong>NetFlow/IPFIX</strong> bổ sung góc nhìn theo luồng: ai nói với ai, bao nhiêu byte. Cái giá là băng thông, dung lượng lưu và chi phí xử lý, nên thường lấy mẫu và chỉ giữ tổng hợp dài hạn.",
        focus: ["all"],
        edges: "all",
        metrics: { dev: "128", poll: "60/phút", trap: "12", stale: "1 s" },
        changes: ["Dữ liệu gần thời gian thực", "Thấy được luồng giữa hai máy"],
        note: "Telemetry và flow trả lời hai câu khác nhau: thiết bị khỏe không, và luồng nào đang chiếm băng thông."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 37 — NETCONF & YANG
     ------------------------------------------------------------------ */
  SL.lessons["netconf-yang"] = {
    id: "netconf-yang",
    module: "ch9-ops",
    title: "NETCONF và YANG: cấu hình như dữ liệu",
    shortTitle: "NETCONF & YANG",
    subtitle: "Vì sao gõ CLI không đủ để tự động hóa, và mô hình dữ liệu giúp đổi cấu hình an toàn hơn thế nào?",
    blurb: "Phiên NETCONF, mô hình YANG, candidate datastore, commit có xác nhận và rollback.",
    duration: "16 phút",
    level: "Nâng cao",
    tags: ["NETCONF", "YANG", "RESTCONF", "candidate", "commit", "rollback", "idempotent", "automation"],
    metrics: [
      { key: "dev", label: "Thiết bị", tone: "blue" },
      { key: "commit", label: "Thời gian commit", tone: "violet" },
      { key: "rollback", label: "Rollback", tone: "yellow" },
      { key: "fail", label: "Lỗi validate", tone: "coral" }
    ],
    nodes: [
      { id: "eng", type: "client", x: 40, y: 80, w: 185, h: 66, label: "Kỹ sư tự động hóa", sub: "intent / template" },
      { id: "ctrl", type: "server", x: 300, y: 80, w: 195, h: 66, label: "Trình quản lý", sub: "NETCONF client" },
      { id: "cand", type: "db", x: 560, y: 80, w: 170, h: 66, label: "Candidate store", sub: "chưa áp dụng" },
      { id: "r1", type: "router", x: 100, y: 300, w: 170, h: 66, label: "Router 1", sub: "running config" },
      { id: "r2", type: "router", x: 350, y: 300, w: 170, h: 66, label: "Router 2", sub: "running config" },
      { id: "fw", type: "firewall", x: 600, y: 300, w: 165, h: 66, label: "Firewall", sub: "chính sách biên" }
    ],
    edges: [
      { id: "eng-ctrl", from: "eng", to: "ctrl", kind: "data", label: "intent" },
      { id: "ctrl-cand", from: "ctrl", to: "cand", kind: "data", label: "edit-config" },
      { id: "ctrl-r1", from: "ctrl", to: "r1", kind: "request", label: "NETCONF/SSH" },
      { id: "ctrl-r2", from: "ctrl", to: "r2", kind: "request", label: "NETCONF/SSH" },
      { id: "ctrl-fw", from: "ctrl", to: "fw", kind: "request", label: "NETCONF/SSH" },
      { id: "r1-r2", from: "r1", to: "r2", kind: "data" }
    ],
    learn: [
      "Nêu giới hạn của tự động hóa bằng CLI.",
      "Mô tả vai trò mô hình YANG.",
      "Phân biệt candidate, running và startup.",
      "Dùng commit có xác nhận để giảm rủi ro.",
      "Nhận ra idempotent là điều kiện của tự động hóa."
    ],
    steps: [
      {
        short: "CLI không lập trình được",
        type: "Vấn đề",
        title: "Gõ lệnh bằng script là cách mong manh",
        body: "CLI trả về văn bản tự do, thứ tự lệnh quan trọng và không có giao dịch: lệnh thứ ba lỗi thì hai lệnh trước vẫn đã chạy. Khi số thiết bị tăng, script gõ lệnh trở thành nguồn lỗi. Cần một giao diện có cấu trúc, kiểm tra được trước khi áp dụng.",
        focus: ["eng", "ctrl"],
        edges: ["eng-ctrl"],
        metrics: { dev: "24", commit: "—", rollback: "—", fail: "0" },
        changes: ["Thấy rõ giới hạn của CLI", "Cần giao diện có cấu trúc"],
        note: "Nhiều sự cố lớn bắt nguồn từ script áp lệnh nửa chừng trên hàng loạt thiết bị."
      },
      {
        short: "YANG là schema",
        type: "Mô hình",
        title: "YANG mô tả dữ liệu nào được phép tồn tại",
        body: "<strong>YANG</strong> định nghĩa cây dữ liệu cấu hình: tên nút, kiểu, miền giá trị, khóa và ràng buộc bắt buộc. Thiết bị công bố model của mình, nên công cụ biết trước cấu hình hợp lệ mà không phải đoán. Đây là nền để sinh form, kiểm tra và so sánh cấu hình một cách máy đọc được.",
        focus: ["cand", "ctrl"],
        edges: ["ctrl-cand"],
        metrics: { dev: "24", commit: "—", rollback: "—", fail: "2" },
        changes: ["Cấu hình có lược đồ", "Sai kiểu bị chặn sớm"],
        note: "Model YANG của các hãng khác nhau; chuẩn hóa một phần nhờ model IETF như interface, routing."
      },
      {
        short: "Candidate → commit",
        type: "Giao dịch",
        title: "Sửa trên bản nháp, áp dụng một lần",
        body: "NETCONF cho phép sửa <strong>candidate datastore</strong>, kiểm tra bằng <code>validate</code>, rồi <code>commit</code> để đưa toàn bộ thay đổi vào running config. Commit là giao dịch: hoặc tất cả thay đổi vào, hoặc không thay đổi nào. Cách này khác hẳn việc gõ từng lệnh rồi hy vọng không lỗi giữa chừng.",
        focus: ["ctrl", "cand", "r1", "r2"],
        edges: ["ctrl-cand", "ctrl-r1", "ctrl-r2"],
        metrics: { dev: "24", commit: "12 s", rollback: "—", fail: "1" },
        changes: ["Thay đổi có tính giao dịch", "Kiểm tra trước khi áp dụng"],
        note: "Commit trên nhiều thiết bị vẫn không phải giao dịch phân tán tuyệt đối; cần thiết kế rollback theo lô."
      },
      {
        short: "Khóa & confirmed-commit",
        type: "An toàn",
        title: "Khóa datastore và tự hoàn tác nếu mất liên lạc",
        body: "Phiên sửa có thể <strong>lock</strong> datastore để tránh hai người ghi đè nhau. <strong>Confirmed-commit</strong> áp dụng thay đổi nhưng tự hoàn tác sau thời hạn nếu không được xác nhận — rất hữu ích khi sửa đường quản trị có thể làm mất chính kết nối đang dùng.",
        focus: ["ctrl", "cand", "r1"],
        edges: ["ctrl-cand", "ctrl-r1"],
        metrics: { dev: "24", commit: "12 s", rollback: "8 s", fail: "0" },
        changes: ["Không ghi đè chéo", "Tự hoàn tác khi mất phiên"],
        note: "Đừng đặt confirmed-commit quá ngắn; cần đủ thời gian cho người trực xác nhận."
      },
      {
        short: "Idempotent",
        type: "Nguyên tắc",
        title: "Chạy lại cùng một ý định phải ra cùng kết quả",
        body: "Công cụ tự động hóa phải <strong>idempotent</strong>: áp cùng template mười lần vẫn cho cấu hình như một lần, không sinh cấu hình trùng hay thay đổi phụ. Muốn vậy phải mô tả trạng thái mong muốn (<em>declarative</em>) thay vì chuỗi lệnh, và so sánh trước khi ghi.",
        focus: ["ctrl", "r1", "r2"],
        edges: ["ctrl-r1", "ctrl-r2", "r1-r2"],
        metrics: { dev: "24", commit: "9 s", rollback: "—", fail: "0" },
        changes: ["Chạy lặp an toàn", "Không sinh cấu hình rác"],
        note: "Idempotent không có nghĩa là bỏ qua kiểm tra; vẫn phải so sánh trạng thái thực tế với mong muốn."
      },
      {
        short: "RESTCONF & giới hạn",
        type: "Tổng kết",
        title: "JSON qua HTTPS, nhưng độ phủ không đều",
        body: "<strong>RESTCONF</strong> đưa mô hình YANG lên HTTP/JSON, dễ dùng với công cụ web và API gateway. Nhược điểm là không phải thiết bị cũ nào cũng hỗ trợ, model giữa các hãng khác nhau, và một số tính năng chỉ có trên NETCONF. Kiến trúc thực tế thường dùng cả hai, có lớp trừu tượng ở trên.",
        focus: ["all"],
        edges: "all",
        metrics: { dev: "24", commit: "9 s", rollback: "8 s", fail: "0" },
        changes: ["Tự động hóa chạy được trên thiết bị mới", "Thiết bị cũ cần adapter"],
        note: "Kiểm tra model và phiên bản firmware trước khi đưa thiết bị vào pipeline, nếu không tự động hóa sẽ vỡ âm thầm."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 38 — Quản lý cấu hình và drift
     ------------------------------------------------------------------ */
  SL.lessons["config-drift"] = {
    id: "config-drift",
    module: "ch9-ops",
    title: "Quản lý cấu hình: baseline, drift và rollback",
    shortTitle: "Baseline & drift",
    subtitle: "Vì sao cấu hình trên thiết bị lại khác bản thiết kế, và làm sao đưa thay đổi về khuôn?",
    blurb: "Cấu hình chuẩn, lưu phiên bản, phát hiện trôi cấu hình, triển khai có kiểm thử và hoàn tác.",
    duration: "15 phút",
    level: "Trung cấp",
    tags: ["baseline", "drift", "backup", "versioning", "rollback", "audit", "configuration management"],
    metrics: [
      { key: "drift", label: "Drift", tone: "coral" },
      { key: "age", label: "Tuổi backup", tone: "blue" },
      { key: "rollback", label: "Rollback", tone: "yellow" },
      { key: "changes", label: "Thay đổi/tuần", tone: "violet" }
    ],
    nodes: [
      { id: "git", type: "stack", x: 40, y: 80, w: 180, h: 66, label: "Kho cấu hình", sub: "baseline + lịch sử" },
      { id: "runner", type: "gear", x: 290, y: 80, w: 190, h: 66, label: "Pipeline", sub: "render · kiểm thử" },
      { id: "mon", type: "server", x: 545, y: 80, w: 180, h: 66, label: "Giám sát drift", sub: "so sánh định kỳ" },
      { id: "lab", type: "router", x: 90, y: 300, w: 170, h: 66, label: "Router lab", sub: "dry-run" },
      { id: "prod", type: "router", x: 370, y: 300, w: 180, h: 66, label: "Router production", sub: "đang phục vụ" },
      { id: "eng", type: "person", x: 625, y: 300, w: 165, h: 66, label: "Kỹ sư trực", sub: "sửa tay qua CLI" }
    ],
    edges: [
      { id: "git-runner", from: "git", to: "runner", kind: "data", label: "render" },
      { id: "runner-lab", from: "runner", to: "lab", kind: "request", label: "dry-run" },
      { id: "runner-prod", from: "runner", to: "prod", kind: "request", label: "apply" },
      { id: "mon-prod", from: "mon", to: "prod", kind: "response", bow: 24, label: "so sánh" },
      { id: "mon-runner", from: "mon", to: "runner", kind: "data", label: "báo drift" },
      { id: "eng-prod", from: "eng", to: "prod", kind: "response", bow: 24, label: "đăng nhập CLI" }
    ],
    learn: [
      "Định nghĩa baseline và lợi ích của nó.",
      "Lưu cấu hình theo phiên bản như lưu mã.",
      "Phát hiện drift do sửa tay ngoài quy trình.",
      "Triển khai thay đổi có kiểm thử và hoàn tác.",
      "Truy vết ai đổi gì bằng audit."
    ],
    steps: [
      {
        short: "Baseline vàng",
        type: "Khởi đầu",
        title: "Cần một cấu hình chuẩn để so",
        body: "<strong>Baseline</strong> là cấu hình đã được kiểm chứng cho một vai trò thiết bị: mẫu router biên, mẫu switch truy cập. Có baseline mới trả lời được câu hỏi “thiết bị này có đúng như thiết kế không?”. Baseline nên nằm trong kho có phiên bản, không phải trong tài liệu Word rời.",
        focus: ["git", "runner"],
        edges: ["git-runner"],
        metrics: { drift: "—", age: "1 ngày", rollback: "—", changes: "4" },
        changes: ["Có chuẩn để đối chiếu", "Cấu hình được quản lý như mã"],
        note: "Một baseline dùng cho mọi vai trò là baseline vô dụng; hãy tách theo chức năng và vị trí."
      },
      {
        short: "Mỗi thay đổi một phiên bản",
        type: "Phiên bản",
        title: "Lịch sử cấu hình phải trả lời được ai, khi nào, vì sao",
        body: "Mỗi lần đổi cấu hình nên tạo một commit kèm lý do và người thực hiện, giống như mã nguồn. Có lịch sử, ta so được hai phiên bản, quay lại bản trước và giải thích được sự cố. Backup định kỳ chỉ là ảnh chụp; lịch sử mới là câu chuyện.",
        focus: ["git"],
        edges: ["git-runner"],
        metrics: { drift: "—", age: "6 giờ", rollback: "—", changes: "6" },
        changes: ["Thay đổi có dấu vết", "Quay lại bản cũ dễ dàng"],
        note: "Đừng lưu mật khẩu dạng rõ trong kho; dùng tham chiếu tới kho bí mật và che khi render."
      },
      {
        short: "Phát hiện drift",
        type: "Drift",
        title: "Sửa tay qua CLI là nguồn trôi cấu hình",
        body: "<strong>Drift</strong> là khác biệt giữa cấu hình thực tế và baseline. Nó thường đến từ sửa tay khi chữa cháy rồi quên ghi lại. Công cụ so sánh định kỳ, báo khác biệt và mở ticket để đưa thiết bị về chuẩn — hoặc cập nhật baseline nếu thay đổi đó thực sự cần.",
        focus: ["mon", "prod", "eng"],
        edges: ["mon-prod", "eng-prod", "mon-runner"],
        metrics: { drift: "2", age: "6 giờ", rollback: "—", changes: "7" },
        changes: ["Hai thiết bị lệch chuẩn", "Drift được đưa vào ticket"],
        warn: ["prod"],
        note: "Drift không luôn xấu: có thay đổi khẩn cấp hợp lý; điều xấu là drift không được ghi nhận."
      },
      {
        short: "Triển khai có kiểm thử",
        type: "Pipeline",
        title: "Render, chạy thử, áp theo lô, kiểm tra lại",
        body: "Pipeline đọc baseline và tham số, render cấu hình rồi chạy <strong>dry-run</strong> trên thiết bị lab hoặc kiểm tra cú pháp. Sau đó áp theo lô nhỏ, kiểm tra dịch vụ rồi mới sang lô tiếp. Cách này giới hạn phạm vi ảnh hưởng và cho điểm dừng an toàn.",
        focus: ["runner", "lab", "prod"],
        edges: ["runner-lab", "runner-prod"],
        metrics: { drift: "1", age: "6 giờ", rollback: "—", changes: "7" },
        changes: ["Thay đổi được thử trước", "Áp theo lô có điểm dừng"],
        note: "Dry-run không bắt được lỗi logic định tuyến; vẫn cần kiểm tra dịch vụ sau khi áp."
      },
      {
        short: "Rollback",
        type: "Hoàn tác",
        title: "Lưu cấu hình trước khi đổi để quay lại nhanh",
        body: "Trước mỗi lần áp, lưu running-config và đánh dấu bản baseline đang dùng. Khi sự cố, hoàn tác về đúng bản đó thay vì gõ ngược từng lệnh. Thời gian rollback là chỉ số quan trọng: càng ngắn, thiệt hại càng ít.",
        focus: ["git", "prod"],
        edges: ["git-runner", "runner-prod"],
        metrics: { drift: "0", age: "1 giờ", rollback: "90 s", changes: "7" },
        changes: ["Có đường lui rõ ràng", "Giảm thời gian gián đoạn"],
        note: "Kiểm tra bản rollback có thật và áp được, đừng chỉ tin là ‘chắc vẫn còn’."
      },
      {
        short: "Audit & phân quyền",
        type: "Tổng kết",
        title: "Chỉ pipeline được ghi, con người mặc định chỉ đọc",
        body: "Muốn chống drift, quyền ghi cấu hình nên thuộc về pipeline; tài khoản cá nhân mặc định chỉ đọc, có thời hạn nâng quyền và bắt buộc ghi lý do. Log audit trả lời ai đổi gì, khi nào, từ đâu. Đây là kiểm soát tổ chức, không chỉ là công cụ.",
        focus: ["eng", "git", "mon"],
        edges: ["eng-prod", "mon-runner", "git-runner"],
        metrics: { drift: "0", age: "1 giờ", rollback: "90 s", changes: "6" },
        changes: ["Quyền ghi được thu hẹp", "Mọi thay đổi có dấu vết"],
        note: "Tài khoản dùng chung phá vỡ audit; mỗi người một tài khoản, thao tác qua bastion có ghi hình."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 39 — Sẵn sàng cao
     ------------------------------------------------------------------ */
  SL.lessons["high-availability"] = {
    id: "high-availability",
    module: "ch9-ops",
    title: "Sẵn sàng cao: VRRP, LACP và BFD",
    shortTitle: "Sẵn sàng cao",
    subtitle: "Làm sao mạng vẫn chạy khi một thiết bị, một cổng hay một tuyến bị hỏng?",
    blurb: "Điểm hỏng đơn, gateway ảo, gộp liên kết, vòng lặp STP và phát hiện lỗi nhanh bằng BFD.",
    duration: "17 phút",
    level: "Nâng cao",
    tags: ["HA", "VRRP", "HSRP", "LACP", "STP", "BFD", "failover", "dual-homing", "SPOF"],
    metrics: [
      { key: "gw", label: "Gateway", tone: "blue" },
      { key: "fail", label: "Failover", tone: "violet" },
      { key: "links", label: "Liên kết", tone: "yellow" },
      { key: "vlan", label: "VLAN", tone: "coral" }
    ],
    nodes: [
      { id: "pc", type: "client", x: 40, y: 80, w: 170, h: 66, label: "Người dùng", sub: "gateway 10.0.0.1" },
      { id: "sw1", type: "switch", x: 260, y: 80, w: 165, h: 66, label: "Switch A", sub: "LACP" },
      { id: "sw2", type: "switch", x: 470, y: 80, w: 165, h: 66, label: "Switch B", sub: "LACP" },
      { id: "r1", type: "router", x: 150, y: 300, w: 170, h: 66, label: "Router chính", sub: "VRRP master" },
      { id: "r2", type: "router", x: 400, y: 300, w: 175, h: 66, label: "Router dự phòng", sub: "VRRP backup" },
      { id: "isp", type: "cloud", x: 645, y: 300, w: 160, h: 66, label: "ISP", sub: "hai tuyến" }
    ],
    edges: [
      { id: "pc-sw1", from: "pc", to: "sw1", kind: "request" },
      { id: "pc-sw2", from: "pc", to: "sw2", kind: "request", bow: 20 },
      { id: "sw1-r1", from: "sw1", to: "r1", kind: "data" },
      { id: "sw2-r2", from: "sw2", to: "r2", kind: "data" },
      { id: "r1-isp", from: "r1", to: "isp", kind: "request" },
      { id: "r2-isp", from: "r2", to: "isp", kind: "request", bow: 22 },
      { id: "r1-r2", from: "r1", to: "r2", kind: "response", bow: 24, label: "BFD" }
    ],
    learn: [
      "Chỉ ra điểm hỏng đơn trong một thiết kế.",
      "Giải thích gateway ảo VRRP/HSRP.",
      "Phân biệt gộp liên kết với dự phòng thiết bị.",
      "Hiểu vòng lặp do dual-homing và vai trò STP.",
      "Dùng BFD để hội tụ nhanh."
    ],
    steps: [
      {
        short: "Điểm hỏng đơn",
        type: "Khởi đầu",
        title: "Một thiết bị hỏng, cả phòng mất mạng",
        body: "Nếu người dùng chỉ nối vào một switch và switch đó nối vào một router, mỗi thiết bị là một <strong>điểm hỏng đơn</strong> (SPOF). Sẵn sàng cao bắt đầu bằng việc liệt kê SPOF rồi thêm đường hoặc thiết bị dự phòng, kèm kế hoạch chuyển đổi khi hỏng.",
        focus: ["pc", "sw1", "r1"],
        edges: ["pc-sw1", "sw1-r1"],
        metrics: { gw: "10.0.0.1", fail: "—", links: "2", vlan: "12" },
        changes: ["Nhận diện điểm hỏng", "Cần đường dự phòng"],
        note: "Dự phòng nguồn và dự phòng tuyến cũng quan trọng ngang dự phòng thiết bị."
      },
      {
        short: "Gateway ảo",
        type: "VRRP",
        title: "Hai router chia sẻ một địa chỉ IP ảo",
        body: "VRRP/HSRP đặt một <strong>IP ảo</strong> làm gateway cho máy khác. Router master trả lời ARP cho IP ảo; router backup im lặng và tiếp quản khi không còn nghe hello. Máy khác không cần đổi cấu hình, chỉ thấy gateway luôn sống.",
        focus: ["r1", "r2", "pc"],
        edges: ["r1-r2", "pc-sw1", "pc-sw2"],
        metrics: { gw: "10.0.0.1 ảo", fail: "3 s", links: "4", vlan: "12" },
        changes: ["Gateway không phụ thuộc một router", "Backup tiếp quản khi master mất"],
        note: "Hai router cùng thấy nhau qua switch là điều kiện để bầu master; đứt đường đồng bộ dễ gây split-brain."
      },
      {
        short: "LACP",
        type: "Gộp liên kết",
        title: "Nhiều dây thành một liên kết logic",
        body: "LACP gộp nhiều cổng thành một <strong>port-channel</strong> để tăng băng thông và chịu lỗi: một dây đứt, lưu lượng chia lại các dây còn lại. LACP có bắt tay để tránh nối nhầm, nhưng không thay được dự phòng thiết bị — cả hai đầu vẫn có thể là một SPOF.",
        focus: ["sw1", "sw2", "r1", "r2"],
        edges: ["sw1-r1", "sw2-r2"],
        metrics: { gw: "10.0.0.1 ảo", fail: "1.2 s", links: "4", vlan: "12" },
        changes: ["Băng thông gộp", "Một dây đứt vẫn chạy"],
        note: "Các cổng trong một bundle phải cùng tốc độ, cùng VLAN và cùng chế độ; cấu hình lệch sẽ bị treo một phần."
      },
      {
        short: "Vòng lặp & STP",
        type: "Lớp 2",
        title: "Dual-homing tạo vòng, STP chặn bớt",
        body: "Nối máy hoặc switch vào cả hai thiết bị tạo vòng ở lớp 2. <strong>STP</strong> chọn một cây và chặn cổng dư để tránh bão broadcast. Cái giá là một phần băng thông bị chặn cho tới khi có sự cố; các biến thể nhanh như RSTP rút ngắn thời gian hội tụ.",
        focus: ["pc", "sw1", "sw2"],
        edges: ["pc-sw1", "pc-sw2", "sw1-r1", "sw2-r2"],
        metrics: { gw: "10.0.0.1 ảo", fail: "1.2 s", links: "4", vlan: "12" },
        changes: ["Vòng lặp bị chặn", "Một cổng dự phòng im lặng"],
        note: "Cấu hình STP sai hoặc tắt STP có thể gây bão broadcast làm sập cả mạng trong vài giây."
      },
      {
        short: "BFD",
        type: "Phát hiện nhanh",
        title: "Hello chậm làm hội tụ chậm",
        body: "Giao thức định tuyến thường phát hiện lỗi qua hello vài giây; <strong>BFD</strong> gửi gói dò rất ngắn để báo hỏng trong mili-giây, giúp chuyển tuyến nhanh hơn. BFD không tự định tuyến; nó chỉ tăng tốc phát hiện cho VRRP, OSPF, BGP.",
        focus: ["r1", "r2", "isp"],
        edges: ["r1-r2", "r1-isp", "r2-isp"],
        metrics: { gw: "10.0.0.1 ảo", fail: "0.8 s", links: "4", vlan: "12" },
        changes: ["Lỗi được phát hiện sớm", "Chuyển tuyến nhanh hơn"],
        note: "BFD quá nhạy có thể rung khi đường tải cao; cần chỉnh tham số theo thực tế."
      },
      {
        short: "Diễn tập failover",
        type: "Tổng kết",
        title: "Dự phòng chưa kiểm thử là dự phòng trên giấy",
        body: "Định kỳ rút một dây, tắt một router hoặc chặn một tuyến để xem mạng có chuyển đổi đúng và dịch vụ có hồi phục trong ngưỡng cam kết. Ghi lại thời gian phát hiện, thời gian hội tụ và lỗi phát sinh. Không diễn tập thì không biết cấu hình có thật sự chạy.",
        focus: ["all"],
        edges: "all",
        metrics: { gw: "10.0.0.1 ảo", fail: "0.8 s", links: "4", vlan: "12" },
        changes: ["Kiểm chứng khả năng chuyển đổi", "Cập nhật tài liệu vận hành"],
        note: "Diễn tập trong giờ thấp điểm, có người canh lăn tay và kịch bản hoàn tác rõ ràng."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 40 — Chính sách định tuyến
     ------------------------------------------------------------------ */
  SL.lessons["routing-policy"] = {
    id: "routing-policy",
    module: "ch9-ops",
    title: "Chính sách định tuyến: lọc, redistribution và PBR",
    shortTitle: "Chính sách định tuyến",
    subtitle: "Khi nhiều nguồn route cùng tồn tại, ai được tin và gói tin đi theo ý người thiết kế thế nào?",
    blurb: "Khoảng cách quản trị, prefix-list, route-map, redistribution an toàn và định tuyến theo chính sách.",
    duration: "16 phút",
    level: "Nâng cao",
    tags: ["administrative distance", "metric", "prefix-list", "route-map", "redistribution", "PBR", "route flap", "BGP"],
    metrics: [
      { key: "routes", label: "Tuyến", tone: "blue" },
      { key: "ad", label: "AD / metric", tone: "violet" },
      { key: "pbr", label: "Luật PBR", tone: "yellow" },
      { key: "flap", label: "Flap/phút", tone: "coral" }
    ],
    nodes: [
      { id: "r1", type: "router", x: 60, y: 80, w: 170, h: 66, label: "R1 biên", sub: "OSPF + BGP" },
      { id: "r2", type: "router", x: 305, y: 80, w: 165, h: 66, label: "R2 lõi", sub: "OSPF" },
      { id: "r3", type: "router", x: 545, y: 80, w: 165, h: 66, label: "R3 ISP", sub: "eBGP" },
      { id: "fw", type: "firewall", x: 160, y: 300, w: 180, h: 66, label: "Firewall", sub: "PBR theo dịch vụ" },
      { id: "srv", type: "server", x: 440, y: 300, w: 175, h: 66, label: "Server nội bộ", sub: "10.10.0.20" }
    ],
    edges: [
      { id: "r1-r2", from: "r1", to: "r2", kind: "data", label: "OSPF" },
      { id: "r2-r3", from: "r2", to: "r3", kind: "request", label: "eBGP" },
      { id: "r3-r1", from: "r3", to: "r1", kind: "request", bow: 24, label: "dự phòng" },
      { id: "r1-fw", from: "r1", to: "fw", kind: "data" },
      { id: "fw-srv", from: "fw", to: "srv", kind: "request" },
      { id: "r2-srv", from: "r2", to: "srv", kind: "data" }
    ],
    learn: [
      "Giải thích vì sao một đích có nhiều route.",
      "Dùng prefix-list và route-map để lọc, sửa thuộc tính.",
      "Redistribute giữa OSPF và BGP mà không tạo vòng.",
      "Áp PBR cho lưu lượng cần đường riêng.",
      "Nhận biết route flap và cách ổn định."
    ],
    steps: [
      {
        short: "Tin route nào",
        type: "Khởi đầu",
        title: "Khoảng cách quản trị quyết định thứ tự tin",
        body: "Khi nhiều giao thức cùng học một đích, router so <strong>khoảng cách quản trị</strong> (AD) trước, rồi tới metric trong cùng giao thức. AD thấp hơn được tin hơn, ví dụ route tĩnh thường thắng OSPF, OSPF thắng eBGP. Hiểu thứ tự này là bước đầu để gỡ sự cố “sao gói đi đường lạ”.",
        focus: ["r1", "r2", "r3"],
        edges: ["r1-r2", "r2-r3"],
        metrics: { routes: "240", ad: "110 / 20", pbr: "0", flap: "0" },
        changes: ["Thứ tự tin cậy được xác định", "Đường lạ có lời giải thích"],
        note: "AD chỉ so trong một router; hai router có thể chọn đường khác nhau nếu cấu hình lệch."
      },
      {
        short: "Lọc & sửa thuộc tính",
        type: "Route-map",
        title: "Prefix-list chọn route, route-map đổi thuộc tính",
        body: "<strong>Prefix-list</strong> lọc theo tiền tố và độ dài mạng; <strong>route-map</strong> ghép điều kiện với hành động như đặt local-preference, MED hay community. Đây là công cụ để nói “nhận route này, ưu tiên route kia, chặn route nọ” thay vì để giao thức tự quyết.",
        focus: ["r1", "r2"],
        edges: ["r1-r2", "r2-r3"],
        metrics: { routes: "235", ad: "110 / 20", pbr: "0", flap: "0" },
        changes: ["Route được chọn lọc", "Thuộc tính được điều chỉnh"],
        note: "Route-map có thứ tự và hành động ngầm định; thiếu câu deny cuối có thể cho qua route không mong muốn."
      },
      {
        short: "Redistribution",
        type: "Biên giao thức",
        title: "Chuyển route giữa hai thế giới phải có hàng rào",
        body: "Ở biên OSPF–BGP, redistribution đưa route nội bộ ra ngoài và ngược lại. Làm ẩu sẽ tạo vòng hoặc biến router thành đường tắt. Cần seed metric, route-map lọc hai chiều và tag để không đưa route học từ BGP quay lại BGP qua đường khác.",
        focus: ["r1", "r3"],
        edges: ["r1-r2", "r2-r3", "r3-r1"],
        metrics: { routes: "260", ad: "110 / 20", pbr: "0", flap: "1" },
        changes: ["Hai miền định tuyến thông nhau", "Có hàng rào chống vòng"],
        warn: ["r1"],
        note: "Đây là chỗ hay xảy ra sự cố định tuyến nhất; luôn kiểm tra bảng route hai chiều sau khi đổi."
      },
      {
        short: "PBR",
        type: "Chính sách",
        title: "Định tuyến theo nguồn hoặc dịch vụ, không chỉ đích",
        body: "<strong>Policy-based routing</strong> cho phép chọn next-hop theo địa chỉ nguồn, cổng hoặc dấu gói, trước khi tra bảng định tuyến thường. Ví dụ đẩy lưu lượng camera ra tuyến riêng hoặc ép dịch vụ qua firewall. PBR mạnh nhưng khó gỡ lỗi vì đường đi không còn thuần theo đích.",
        focus: ["fw", "r1", "srv"],
        edges: ["r1-fw", "fw-srv", "r2-srv"],
        metrics: { routes: "260", ad: "110 / 20", pbr: "3", flap: "1" },
        changes: ["Lưu lượng đi đường riêng", "Chính sách thay cho bảng route"],
        note: "PBR thường bỏ qua route dự phòng động; phải tự thiết kế đường lui khi next-hop chết."
      },
      {
        short: "Flap & ổn định",
        type: "Ổn định",
        title: "Route nhảy lên xuống làm cả mạng rung",
        body: "Khi tuyến chập chờn, route <strong>flap</strong> liên tục và router phải tính lại, có khi đẩy CPU lên cao. Dampening, BFD và giới hạn số prefix nhận từ hàng xóm giúp giữ ổn định. Với eBGP, cần đặt maximum-prefix để tránh bị đẩy cả bảng route ngoài ý muốn.",
        focus: ["r3", "r1"],
        edges: ["r2-r3", "r3-r1"],
        metrics: { routes: "258", ad: "110 / 20", pbr: "3", flap: "6" },
        changes: ["Route rung được hạn chế", "Router giảm tải tính lại"],
        note: "Dampening quá tay có thể giữ route tốt ở trạng thái phạt lâu; cần đo trước khi bật."
      },
      {
        short: "Kiểm chứng",
        type: "Tổng kết",
        title: "Đọc bảng route, traceroute và nhìn từ ngoài vào",
        body: "Sau mỗi thay đổi, kiểm tra bảng route ở cả hai phía, chạy traceroute từ nhiều nguồn và đối chiếu với looking glass của ISP. So trước và sau giúp phát hiện route bị mất hoặc bị thay bằng đường dài hơn. Chính sách định tuyến phải chứng minh được bằng số liệu, không bằng cảm giác.",
        focus: ["all"],
        edges: "all",
        metrics: { routes: "258", ad: "110 / 20", pbr: "3", flap: "0" },
        changes: ["Thay đổi được xác nhận", "Có bằng chứng trước–sau"],
        note: "Lưu ảnh chụp bảng route trước khi đổi; đó là baseline để so và để hoàn tác."
      }
    ]
  };

  /* ------------------------------------------------------------------
     Bài 41 — Ứng cứu sự cố do thay đổi
     ------------------------------------------------------------------ */
  SL.lessons["ops-incident"] = {
    id: "ops-incident",
    module: "ch9-ops",
    title: "Sự cố do thay đổi: phát hiện, rollback và postmortem",
    shortTitle: "Ứng cứu sự cố",
    subtitle: "Một lệnh ACL sai có thể chặn thanh toán. Làm sao phát hiện nhanh, khoanh vùng đúng và rút kinh nghiệm?",
    blurb: "Phạm vi ảnh hưởng, MTTD/MTTR, rollback, xác nhận hồi phục và postmortem không đổ lỗi.",
    duration: "16 phút",
    level: "Trung cấp",
    tags: ["incident", "change management", "rollback", "MTTD", "MTTR", "SLO", "postmortem", "ACL"],
    metrics: [
      { key: "error", label: "Lỗi 5xx", tone: "coral" },
      { key: "mttd", label: "MTTD", tone: "yellow" },
      { key: "mttr", label: "MTTR", tone: "violet" },
      { key: "slo", label: "SLO", tone: "green" }
    ],
    nodes: [
      { id: "eng", type: "client", x: 40, y: 80, w: 185, h: 66, label: "Kỹ sư thay đổi", sub: "ca triển khai" },
      { id: "ctrl", type: "gear", x: 285, y: 80, w: 180, h: 66, label: "Pipeline", sub: "push cấu hình" },
      { id: "mon", type: "server", x: 530, y: 80, w: 185, h: 66, label: "Giám sát", sub: "SLO · cảnh báo" },
      { id: "r1", type: "router", x: 100, y: 300, w: 175, h: 66, label: "Router biên", sub: "ACL mới" },
      { id: "user", type: "client", x: 365, y: 300, w: 175, h: 66, label: "Người dùng", sub: "thanh toán" },
      { id: "fw", type: "firewall", x: 615, y: 300, w: 175, h: 66, label: "Firewall", sub: "chặn nhầm" }
    ],
    edges: [
      { id: "eng-ctrl", from: "eng", to: "ctrl", kind: "data", label: "commit" },
      { id: "ctrl-r1", from: "ctrl", to: "r1", kind: "request", label: "push" },
      { id: "ctrl-fw", from: "ctrl", to: "fw", kind: "request", label: "push" },
      { id: "r1-fw", from: "r1", to: "fw", kind: "data" },
      { id: "user-r1", from: "user", to: "r1", kind: "request", label: "HTTPS" },
      { id: "mon-r1", from: "mon", to: "r1", kind: "response", bow: 24, label: "telemetry" },
      { id: "mon-fw", from: "mon", to: "fw", kind: "response", bow: 22, label: "log" }
    ],
    learn: [
      "Đánh giá phạm vi ảnh hưởng trước khi đổi.",
      "Phân biệt triệu chứng và nguyên nhân.",
      "Chọn rollback hay sửa tiếp theo thời gian vàng.",
      "Xác nhận hồi phục bằng SLO, không bằng cảm giác.",
      "Viết postmortem tập trung vào hệ thống."
    ],
    steps: [
      {
        short: "Phạm vi ảnh hưởng",
        type: "Khởi đầu",
        title: "Một dòng ACL sai chặn cả luồng thanh toán",
        body: "Thay đổi nhỏ vẫn có thể lan rộng nếu nằm ở thiết bị dùng chung. Trước khi áp, cần biết luồng nào đi qua, ai bị ảnh hưởng, có đường lui chưa và ai trực cùng. <strong>Blast radius</strong> là câu hỏi bắt buộc, không phải nghi thức.",
        focus: ["eng", "ctrl", "r1"],
        edges: ["eng-ctrl", "ctrl-r1"],
        metrics: { error: "0.2%", mttd: "—", mttr: "—", slo: "99.9%" },
        changes: ["Thay đổi được đánh giá rủi ro", "Có người trực và đường lui"],
        note: "Đổi ngoài giờ thấp điểm giảm thiệt hại nhưng dễ thiếu người hỗ trợ; cân nhắc cả hai."
      },
      {
        short: "Cảnh báo đúng",
        type: "Phát hiện",
        title: "MTTD bắt đầu từ một cảnh báo gắn dịch vụ",
        body: "Giám sát nên cảnh báo theo triệu chứng người dùng thấy, như tỉ lệ lỗi 5xx tăng hoặc độ trễ vượt SLO, thay vì chỉ theo CPU. <strong>MTTD</strong> là thời gian từ lúc sự cố xảy ra tới lúc được phát hiện; cảnh báo tốt rút ngắn nó. Tránh cảnh báo trùng lặp làm nhiễu người trực.",
        focus: ["mon", "r1", "user"],
        edges: ["mon-r1", "user-r1"],
        metrics: { error: "18%", mttd: "90 s", mttr: "—", slo: "99.9%" },
        changes: ["Lỗi 5xx tăng vọt", "Cảnh báo bắn về kênh trực"],
        warn: ["user"],
        note: "Đừng đặt ngưỡng cảnh báo trên chỉ số nội bộ không tương quan với trải nghiệm người dùng."
      },
      {
        short: "Khoanh vùng",
        type: "Chẩn đoán",
        title: "So baseline và mốc thời gian thay đổi",
        body: "Khi có cảnh báo, đầu tiên so với baseline: chỉ số nào lệch, từ lúc nào, có trùng mốc deploy không. Đối chiếu log firewall và bảng route để tìm luồng bị chặn. Khoanh vùng theo thời gian và theo luồng nhanh hơn là đọc từng cấu hình.",
        focus: ["mon", "ctrl", "r1", "fw"],
        edges: ["mon-r1", "mon-fw", "ctrl-r1", "ctrl-fw"],
        metrics: { error: "18%", mttd: "90 s", mttr: "—", slo: "99.9%" },
        changes: ["Lỗi trùng mốc deploy", "Luồng thanh toán bị chặn"],
        warn: ["r1"],
        note: "Nếu hai thay đổi xảy ra gần nhau, đừng mặc định thủ phạm là thay đổi sau; kiểm tra bằng bằng chứng."
      },
      {
        short: "Rollback hay sửa tiếp",
        type: "Quyết định",
        title: "Khi chưa rõ nguyên nhân, rollback là mặc định",
        body: "Nếu thay đổi gần nhất khớp triệu chứng và chưa xác định được nguyên nhân trong vài phút, hoàn tác trước để giành lại dịch vụ rồi điều tra sau. Sửa tiếp trên hệ đang lỗi dễ làm mất bằng chứng và kéo dài <strong>MTTR</strong>. Quyết định này nên có trong runbook, không phụ thuộc cảm tính.",
        focus: ["eng", "ctrl"],
        edges: ["eng-ctrl", "ctrl-r1"],
        metrics: { error: "18%", mttd: "90 s", mttr: "11 phút", slo: "99.9%" },
        changes: ["Chọn hoàn tác", "Dịch vụ được ưu tiên"],
        note: "Rollback cũng là thay đổi; phải kiểm tra nó áp đúng bản và không kéo theo lỗi khác."
      },
      {
        short: "Xác nhận hồi phục",
        type: "Xác nhận",
        title: "Đo lại SLO, lưu bằng chứng, thông báo",
        body: "Sau khi hoàn tác, kiểm tra tỉ lệ lỗi và độ trễ trở về ngưỡng, chạy thử một giao dịch thật, rồi thông báo cho người liên quan. Lưu ảnh chụp chỉ số, log và cấu hình tại thời điểm sự cố để phục vụ điều tra. Không tuyên bố hết sự cố khi chưa có số liệu.",
        focus: ["mon", "user", "r1"],
        edges: ["mon-r1", "user-r1"],
        metrics: { error: "0.3%", mttd: "90 s", mttr: "11 phút", slo: "99.9%" },
        changes: ["Lỗi trở về nền", "Giao dịch thử thành công"],
        note: "Theo dõi thêm ít nhất một chu kỳ cao điểm trước khi đóng sự cố."
      },
      {
        short: "Postmortem",
        type: "Tổng kết",
        title: "Tìm lỗi hệ thống, không tìm người để đổ lỗi",
        body: "Postmortem tốt dựng lại dòng thời gian, chỉ ra vì sao thay đổi lọt qua kiểm thử và vì sao phát hiện chậm, rồi đề hành động cụ thể: thêm test ACL, canary theo lô, tự động rollback khi SLO vượt ngưỡng. Mục tiêu là làm hệ thống chịu lỗi tốt hơn, không phải kỷ luật cá nhân.",
        focus: ["all"],
        edges: "all",
        metrics: { error: "0.1%", mttd: "90 s", mttr: "11 phút", slo: "99.9%" },
        changes: ["Nguyên nhân gốc được ghi lại", "Hành động phòng ngừa được giao"],
        note: "Mỗi hành động postmortem cần người phụ trách và hạn chót; nếu không, sự cố sẽ lặp lại."
      }
    ]
  };
})();
