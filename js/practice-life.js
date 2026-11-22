/* NetLab — bối cảnh đời thường và sơ đồ sự cố cho phần Luyện tập */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  SL.practiceScenes = {
    "dns-vs-ip": {
      context: "Sáng thứ Hai ở văn phòng, cả nhóm vẫn mở được dashboard nội bộ bằng IP nhưng gõ tên miền thì trình duyệt đứng im.",
      note: "Đường mạng vẫn thông; chỉ bước tra tên miền bị kẹt.",
      chain: [
        { icon: "client", label: "Máy nhân viên", sub: "ping 1.1.1.1 · 12 ms", state: "ok" },
        { icon: "book", label: "DNS nội bộ", sub: "timeout", state: "bad" },
        { icon: "server", label: "example.com", sub: "ERR_NAME_NOT_RESOLVED", state: "bad" }
      ]
    },
    "same-switch-different-subnet": {
      context: "Một tiệm in nhỏ vừa kê thêm máy in cạnh máy tính. Cả hai cắm chung một switch nhưng nhân viên không gửi được lệnh in.",
      note: "Cùng mặt đường nhưng khác dãy nhà: ARP không vượt được ranh giới subnet.",
      chain: [
        { icon: "client", label: "PC quầy", sub: "192.168.1.50/24", state: "ok" },
        { icon: "gateway", label: "Switch chung", sub: "khác subnet", state: "bad" },
        { icon: "server", label: "Máy in", sub: "192.168.2.20/24", state: "bad" }
      ]
    },
    "latency-not-bandwidth": {
      context: "Bạn họp online với đối tác ở nước ngoài. Speedtest vẫn báo gần 1 Gbps nhưng hình giật, tiếng vọng như gọi qua loa cũ.",
      note: "Đường rộng không có nghĩa gói tin đi nhanh; hàng đợi làm RTT và jitter tăng.",
      chain: [
        { icon: "client", label: "Máy gọi video", sub: "RTT 180 ms", state: "bad" },
        { icon: "router", label: "Router gia đình", sub: "940 Mbps · jitter 65 ms", state: "bad" },
        { icon: "presence", label: "Đối tác", sub: "hình giật, tiếng vọng", state: "bad" }
      ]
    },
    "routing-loop": {
      context: "Bạn nhờ bộ phận kỹ thuật kiểm tra vì trang web công ty rất chậm. Lệnh traceroute cứ quay lại đúng hai địa chỉ cũ.",
      note: "Hai router chuyển hàng qua lại; TTL về 0 và gói bị hủy.",
      loop: true,
      chain: [
        { icon: "client", label: "Máy của bạn", sub: "gửi tới server", state: "ok" },
        { icon: "router", label: "Router A", sub: "10.0.0.2", state: "bad" },
        { icon: "router", label: "Router B", sub: "10.0.0.3", state: "bad" }
      ]
    },
    "port-forwarding": {
      context: "Bạn lắp camera cho cửa hàng. Trong nhà xem bình thường, nhưng đi công tác mở 4G lại không xem được.",
      note: "Kết nối từ ngoài đi vào nhưng chưa có luật mở cửa đúng địa chỉ và cổng.",
      chain: [
        { icon: "server", label: "Camera", sub: "192.168.1.50:8080", state: "ok" },
        { icon: "gateway", label: "Router + NAT", sub: "port 8080 bị chặn", state: "bad" },
        { icon: "presence", label: "Điện thoại 4G", sub: "timeout từ Internet", state: "bad" }
      ]
    },
    "tcp-window-bdp": {
      context: "Nhóm thiết kế gửi file lớn sang máy chủ ở xa. Đường truyền 1 Gbps nhưng một luồng tải chỉ được khoảng 80 Mbps.",
      note: "Cửa sổ nhận 1 MB quá nhỏ so với quãng đường RTT 120 ms.",
      chain: [
        { icon: "server", label: "Máy chủ", sub: "đường 1 Gbps", state: "ok" },
        { icon: "road", label: "Tuyến xa", sub: "RTT 120 ms", state: "bad" },
        { icon: "client", label: "Máy thiết kế", sub: "cửa sổ 1 MB", state: "bad" }
      ]
    },
    "dns-stale-after-move": {
      context: "Công ty vừa chuyển website sang máy chủ mới. Sáng hôm sau, một nửa khách hàng vẫn vào địa chỉ cũ dù bạn đã cập nhật bản ghi.",
      note: "Resolver còn giữ câu trả lời cũ trong thời gian TTL 3600 giây.",
      chain: [
        { icon: "server", label: "Web IP mới", sub: "bản ghi A đã đổi", state: "ok" },
        { icon: "cache", label: "Cache resolver", sub: "giữ IP cũ · TTL 3600", state: "bad" },
        { icon: "client", label: "Khách hàng", sub: "~40% vào IP cũ", state: "bad" }
      ]
    },
    "http2-tcp-hol": {
      context: "Trang bán hàng vừa nâng cấp HTTP/2. Ở nhà mạng tốt thì nhanh, nhưng khách dùng Wi-Fi yếu thấy cả trang cùng đứng khi mất một gói.",
      note: "Nhiều stream vẫn nằm chung một kết nối TCP; một gói mất làm tất cả chờ.",
      chain: [
        { icon: "client", label: "Trình duyệt", sub: "HTTP/2 nhiều stream", state: "ok" },
        { icon: "road", label: "Kết nối TCP", sub: "mất gói 2%", state: "bad" },
        { icon: "server", label: "Web server", sub: "mọi stream cùng chờ", state: "bad" }
      ]
    },
    "tls-expired-chain": {
      context: "Ứng dụng ngân hàng mở tốt trên laptop nhưng điện thoại Android của mẹ bạn lại báo chứng chỉ không tin cậy. Chứng chỉ vẫn còn hạn.",
      note: "Máy chủ chỉ gửi chứng chỉ lá; thiếu mắt nối để lần tới root.",
      chain: [
        { icon: "client", label: "Điện thoại Android", sub: "ERR_CERT_AUTHORITY_INVALID", state: "bad" },
        { icon: "server", label: "Web server", sub: "chỉ gửi leaf cert", state: "bad" },
        { icon: "shield", label: "Intermediate CA", sub: "thiếu trong chuỗi", state: "bad" }
      ]
    },
    "ipv6-local-only": {
      context: "Laptop vừa bật IPv6, ai cũng tưởng mạng nhanh hơn. Nhưng mỗi trang đều chờ vài giây rồi mới tải bằng IPv4.",
      note: "Máy chỉ có địa chỉ link-local; trình duyệt thử IPv6 trước rồi mới quay về IPv4.",
      chain: [
        { icon: "client", label: "Laptop", sub: "chỉ fe80::", state: "bad" },
        { icon: "router", label: "Router", sub: "RA không có prefix", state: "bad" },
        { icon: "server", label: "Website", sub: "IPv4 fallback sau timeout", state: "ok" }
      ]
    },
    "vlan-broadcast-storm": {
      context: "Cuối tuần, bạn cắm thêm một sợi cáp dự phòng giữa hai switch cho chắc. Thứ Hai cả văn phòng mất mạng, đèn switch nhấp nháy liên tục.",
      note: "Hai switch nối thành vòng; broadcast quay mãi vì Ethernet không có TTL.",
      loop: true,
      chain: [
        { icon: "gateway", label: "Switch A", sub: "CPU 100%", state: "bad" },
        { icon: "road", label: "Hai uplink", sub: "vòng lặp lớp 2", state: "bad" },
        { icon: "gateway", label: "Switch B", sub: "bảng MAC flapping", state: "bad" }
      ]
    },
    "qos-bufferbloat": {
      context: "Cả nhà cùng dùng Internet. Hễ ai tải file lớn là cuộc gọi video của bạn giật, dù speedtest vẫn báo còn gần 180 Mbps.",
      note: "Hàng đợi ở router quá lớn: gói không mất nhưng phải chờ rất lâu.",
      chain: [
        { icon: "client", label: "Máy tải file", sub: "upload 180 Mbps", state: "ok" },
        { icon: "queue", label: "Hàng đợi router", sub: "RTT 20 → 400 ms", state: "bad" },
        { icon: "presence", label: "Cuộc gọi video", sub: "jitter 120 ms", state: "bad" }
      ]
    }
  };
})();
