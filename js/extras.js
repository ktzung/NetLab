/* NetLab — luyện tập và cheatsheet cho các chương mới */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  (SL.practice = SL.practice || []).push(
    {
      id: "sdn-flow-stale",
      tag: "SDN",
      title: "Đổi tuyến trên controller nhưng lưu lượng vẫn đi đường cũ",
      scenario: "Controller đã tính lại đường sau khi một liên kết hỏng và hiển thị topology mới. Tuy vậy, bộ đếm trên switch vẫn tăng ở cổng cũ. Một số luồng mới đi đúng, các luồng lớn vẫn theo đường cũ.",
      metrics: [
        { label: "Controller", value: "online" },
        { label: "Flow cũ", value: "còn hạn", danger: true },
        { label: "Mất gói", value: "0%", danger: false }
      ],
      options: [
        "Tăng băng thông các liên kết còn lại",
        "Kiểm tra flow cũ và gửi flow-mod xóa/cập nhật đúng luồng",
        "Khởi động lại toàn bộ switch trong fabric",
        "Đổi địa chỉ IP của controller"
      ],
      correct: 1,
      explain: "Flow đã cài có timeout nên vẫn tiếp tục khớp dù topology đổi. Controller phải chủ động xóa hoặc sửa flow bị ảnh hưởng, không chỉ cài flow cho luồng mới. Kiểm tra cả kênh OpenFlow và hàng đợi packet-in trước khi kết luận switch hỏng."
    },
    {
      id: "fcs-errors-one-port",
      tag: "Ethernet",
      title: "Một cổng switch tăng FCS errors liên tục",
      scenario: "Switch trong phòng lab báo counter CRC/FCS errors tăng đều trên đúng một cổng nối tới máy trạm. Các cổng khác sạch. Máy trạm vẫn vào mạng nhưng thỉnh thoảng phải tải lại trang.",
      metrics: [
        { label: "FCS errors", value: "tăng", danger: true },
        { label: "Cổng khác", value: "0 lỗi" },
        { label: "Tốc độ", value: "1 Gbps" }
      ],
      options: [
        "Thay switch vì CRC là lỗi phần mềm",
        "Kiểm tra cáp, đầu nối và thương lượng tốc độ/duplex của riêng cổng đó",
        "Tăng MTU toàn mạng để giảm lỗi",
        "Đổi DNS của máy trạm"
      ],
      correct: 1,
      explain: "CRC/FCS là mã kiểm tra khung; lỗi tập trung ở một cổng chỉ ra vấn đề vật lý hoặc thương lượng tốc độ/duplex trên đúng đoạn đó — cáp hỏng, đầu nối lỏng, nhiễu hoặc một đầu full-duplex một đầu half-duplex. Khi thương lượng sai, va chạm và lỗi CRC tăng mạnh dù băng thông danh nghĩa vẫn đủ."
    },
    {
      id: "wifi-handover-drop",
      tag: "Chuyển vùng",
      title: "Cuộc gọi video rớt khi đi qua hành lang",
      scenario: "Nhân viên đi từ phòng họp ra hành lang, sóng Wi-Fi vẫn tốt nhưng cuộc gọi video đứt khoảng 2 giây rồi phải kết nối lại. Hai AP nằm ở hai subnet khác nhau và cùng SSID.",
      metrics: [
        { label: "RSSI", value: "−58 dBm" },
        { label: "Mất gói", value: "12%", danger: true },
        { label: "Subnet", value: "đổi", danger: true }
      ],
      options: [
        "Tăng công suất phát của cả hai AP",
        "Giữ roaming trong cùng subnet hoặc bật 802.11r/11k và kiểm tra thời gian handover",
        "Đổi DNS nội bộ sang resolver công cộng",
        "Tắt NAT trên router biên"
      ],
      correct: 1,
      explain: "Đổi AP trong cùng subnet chỉ là handover lớp 2, IP giữ nguyên nên TCP không đứt. Sang subnet khác là handover lớp 3, địa chỉ IP đổi và kết nối cũ không còn hợp lệ. Giữ L2 roaming rộng, bật 802.11r để giảm thời gian bắt tay lại, hoặc dùng giao thức chịu migration như QUIC/MPTCP cho ứng dụng."
    },
    {
      id: "ipsec-mtu-hang",
      tag: "VPN",
      title: "VPN kết nối nhưng trang lớn tải mãi không xong",
      scenario: "Ping nhỏ qua đường hầm IPsec thành công. Trình duyệt mở trang đăng nhập được nhưng trang có nhiều tài nguyên thì treo ở bước tải. Kích thước gói tối đa qua tunnel nhỏ hơn MTU của mạng vật lý.",
      metrics: [
        { label: "Ping nhỏ", value: "OK" },
        { label: "Tải lớn", value: "treo", danger: true },
        { label: "MTU tunnel", value: "1420" }
      ],
      options: [
        "Tăng MTU tunnel lên 1500 để khớp mạng vật lý",
        "Đặt MTU tunnel hợp lý và clamp MSS trên router để TCP không gửi gói quá lớn",
        "Chuyển toàn bộ VPN sang cổng 443",
        "Tắt ESP để giảm overhead"
      ],
      correct: 1,
      explain: "Đóng gói IPsec thêm header nên gói 1500 byte không còn vừa đường hầm. Khi cờ DF bật, router không phân mảnh và gói lớn bị bỏ âm thầm — ping nhỏ vẫn qua nên dễ đánh lừa. Giảm MTU tunnel và clamp MSS để TCP thương lượng kích thước phù hợp; đây là lỗi cấu hình, không phải mã hóa chậm."
    },
    {
      id: "mpls-label-mismatch",
      tag: "MPLS",
      title: "LSP mới không thông dù đã cấu hình nhãn",
      scenario: "Kỹ sư cấu hình nhãn vào 100 tại ingress và nhãn ra 200 tại LSR kế tiếp. Gói bị bỏ tại LSR thứ hai. Bảng nhãn hai đầu không khớp và phiên LDP giữa hai router đang down.",
      metrics: [
        { label: "Ingress", value: "push 100" },
        { label: "LSR nhận", value: "chờ 200", danger: true },
        { label: "LDP", value: "down", danger: true }
      ],
      options: [
        "Tăng băng thông liên kết giữa hai LSR",
        "Khôi phục phiên LDP/RSVP và đối chiếu bảng nhãn hai đầu trước khi kiểm tra lại LSP",
        "Khởi động lại toàn bộ router trong mạng",
        "Đổi giao thức định tuyến nội bộ sang BGP"
      ],
      correct: 1,
      explain: "Nhãn không tự xuất hiện: LDP hoặc RSVP-TE phân phối ánh xạ nhãn giữa các LSR. Phiên down khiến mỗi bên dùng giá trị cũ hoặc không có, gói mang nhãn không được bảng nhãn chấp nhận và bị bỏ. Khôi phục mặt phẳng điều khiển nhãn rồi đối chiếu nhãn vào/ra ở cả hai đầu trước khi nghi ngờ phần cứng."
    },
    {
      id: "slow-first-page-dns",
      tag: "DNS",
      title: "Lần đầu mở trang chậm, các lần sau nhanh",
      scenario: "Người dùng đo được lần đầu tải trang mất 1,8 giây, trong đó 1,2 giây là phân giải tên miền. Lần thứ hai chỉ còn 300 ms. Cùng máy, cùng mạng, không đổi cấu hình gì.",
      metrics: [
        { label: "Lần đầu", value: "1,8 s", danger: true },
        { label: "DNS", value: "1,2 s", danger: true },
        { label: "Lần sau", value: "300 ms" }
      ],
      options: [
        "Tăng băng thông máy chủ web",
        "Đo và tối ưu phân giải DNS: resolver gần hơn, cache hợp lý, prefetch tên miền",
        "Đổi địa chỉ IP của máy chủ web",
        "Tắt HTTPS để bỏ bước bắt tay"
      ],
      correct: 1,
      explain: "Chênh lệch lớn giữa lần đầu và lần sau là dấu hiệu cache. Lần đầu phải đi qua resolver và các server thẩm quyền; lần sau lấy từ cache. Tối ưu bằng resolver gần người dùng, TTL hợp lý và prefetch; tăng băng thông không rút ngắn thời gian chờ phân giải."
    }
  );

  (SL.cheatsheets = SL.cheatsheets || []).push(
    {
      id: "sdn-routing",
      num: "09",
      title: "SDN, định tuyến & MPLS",
      intro: "Bảng tra nhanh cho mặt phẳng điều khiển: so sánh thuật toán, thứ tự chọn tuyến BGP, luật OpenFlow và nhãn MPLS.",
      cards: [
        {
          title: "Link-state và distance-vector",
          html: `<table class="cheat-table">
            <tr><th>Tiêu chí</th><th>Link-state (OSPF)</th><th>Distance-vector (RIP)</th></tr>
            <tr><td>Thông tin biết</td><td>Toàn bộ topology</td><td>Chỉ tuyến tốt nhất từ hàng xóm</td></tr>
            <tr><td>Thuật toán</td><td>Dijkstra</td><td>Bellman-Ford</td></tr>
            <tr><td>Hội tụ</td><td>Nhanh, ít vòng lặp</td><td>Chậm, có count-to-infinity</td></tr>
            <tr><td>Bộ nhớ</td><td>Cao hơn</td><td>Thấp hơn</td></tr>
          </table>`
        },
        {
          title: "Thứ tự chọn tuyến BGP",
          html: `<table class="cheat-table">
            <tr><th>Bước</th><th>Tiêu chí</th></tr>
            <tr><td class="mono">1</td><td>Local preference cao nhất</td></tr>
            <tr><td class="mono">2</td><td>AS-PATH ngắn nhất</td></tr>
            <tr><td class="mono">3</td><td>Origin (IGP &lt; EGP &lt; incomplete)</td></tr>
            <tr><td class="mono">4</td><td>MED thấp nhất</td></tr>
            <tr><td class="mono">5</td><td>eBGP trước iBGP, rồi router ID / địa chỉ thấp</td></tr>
          </table>`
        },
        {
          title: "OpenFlow: match và action",
          html: `<table class="cheat-table">
            <tr><th>Match thường dùng</th><th>Action thường dùng</th></tr>
            <tr><td>MAC nguồn/đích, EtherType, VLAN</td><td>Chuyển ra cổng</td></tr>
            <tr><td>IP nguồn/đích, giao thức</td><td>Drop</td></tr>
            <tr><td>TCP/UDP port</td><td>Sửa header (VLAN, MAC, IP)</td></tr>
            <tr><td>Ingress port, DSCP</td><td>Gửi controller (packet-in)</td></tr>
          </table>`
        },
        {
          title: "MPLS và fabric",
          html: `<table class="cheat-table">
            <tr><th>Khái niệm</th><th>Ý nghĩa</th></tr>
            <tr><td><b>Push</b></td><td>Ingress thêm nhãn khi gói vào LSP</td></tr>
            <tr><td><b>Swap</b></td><td>LSR đổi nhãn theo bảng nhãn</td></tr>
            <tr><td><b>Pop / PHP</b></td><td>Gỡ nhãn ở chặng áp chót</td></tr>
            <tr><td><b>Label stack</b></td><td>Nhiều nhãn lồng nhau cho VPN/đường hầm</td></tr>
            <tr><td><b>Leaf-spine</b></td><td>Clos hai tầng, mọi uplink active</td></tr>
            <tr><td><b>ECMP</b></td><td>Băm header chia luồng qua nhiều đường</td></tr>
          </table>`
        }
      ]
    },
    {
      id: "wireless-mobility-security",
      num: "10",
      title: "Không dây, di động & bảo mật",
      intro: "Thành phần 4G/5G, các mức handover, nguyên thủy mật mã và cấu hình IPsec thường gặp khi vận hành.",
      cards: [
        {
          title: "4G/5G: thành phần chính",
          html: `<table class="cheat-table">
            <tr><th>Thành phần</th><th>Vai trò</th></tr>
            <tr><td><b>UE</b></td><td>Thiết bị đầu cuối, chứa SIM/USIM</td></tr>
            <tr><td><b>eNodeB / gNB</b></td><td>Trạm gốc vô tuyến</td></tr>
            <tr><td><b>MME / AMF</b></td><td>Quản lý phiên, xác thực, di động</td></tr>
            <tr><td><b>S-GW / UPF</b></td><td>Neo dữ liệu, đường hầm tới trạm</td></tr>
            <tr><td><b>P-GW</b></td><td>Cửa ra Internet, cấp IP cho UE</td></tr>
            <tr><td><b>HSS / AUSF</b></td><td>Dữ liệu thuê bao, vector xác thực</td></tr>
          </table>`
        },
        {
          title: "Handover và quản lý di động",
          html: `<table class="cheat-table">
            <tr><th>Tình huống</th><th>Điều gì xảy ra</th></tr>
            <tr><td>Cùng subnet, đổi AP</td><td>Handover L2, IP giữ nguyên</td></tr>
            <tr><td>Khác subnet</td><td>Handover L3, cần CoA/binding</td></tr>
            <tr><td>4G/5G</td><td>S-GW/P-GW làm anchor, X2/N2 chuyển ngữ cảnh</td></tr>
            <tr><td>TCP thuần</td><td>Đứt khi cặp IP/cổng đổi</td></tr>
            <tr><td>MPTCP / QUIC</td><td>Chuyển đường hoặc connection ID, không bắt tay lại</td></tr>
          </table>`
        },
        {
          title: "Nguyên thủy mật mã",
          html: `<table class="cheat-table">
            <tr><th>Công cụ</th><th>Dùng cho</th><th>Lưu ý</th></tr>
            <tr><td><b>AES-GCM</b></td><td>Mã hóa + toàn vẹn</td><td>Khóa phiên, rất nhanh</td></tr>
            <tr><td><b>RSA / ECDH</b></td><td>Trao đổi khóa, chữ ký</td><td>Chậm hơn, khóa dài hơn</td></tr>
            <tr><td><b>SHA-256</b></td><td>Vân tay dữ liệu</td><td>Không dùng MD5/SHA-1</td></tr>
            <tr><td><b>HMAC</b></td><td>Xác thực bằng khóa chung</td><td>Nhanh, cần chia khóa</td></tr>
            <tr><td><b>Chữ ký số</b></td><td>Toàn vẹn + không chối bỏ</td><td>Ký hash, không ký toàn tệp</td></tr>
            <tr><td><b>Chứng chỉ</b></td><td>Gắn tên miền với khóa</td><td>Kiểm tra chuỗi, hạn, OCSP</td></tr>
          </table>`
        },
        {
          title: "IPsec và VPN",
          html: `<table class="cheat-table">
            <tr><th>Mục</th><th>Ghi nhớ</th></tr>
            <tr><td><b>ESP</b></td><td>Mã hóa + xác thực, dùng tunnel mode</td></tr>
            <tr><td><b>AH</b></td><td>Chỉ xác thực, không qua NAT</td></tr>
            <tr><td><b>SA / SPI</b></td><td>Một chiều một SA; SPI chọn SA</td></tr>
            <tr><td><b>IKE</b></td><td>Pha 1 kênh an toàn, pha 2 ESP SA</td></tr>
            <tr><td><b>NAT-T</b></td><td>Bọc ESP trong UDP 4500</td></tr>
            <tr><td><b>MTU/MSS</b></td><td>Giảm MTU, clamp MSS tránh treo tải lớn</td></tr>
          </table>`
        }
      ]
    }
  );
  (SL.practiceScenes = SL.practiceScenes || {});
  Object.assign(SL.practiceScenes, {
    "sdn-flow-stale": {
      context: "Sau khi một liên kết trong fabric hỏng, controller đã hội tụ và hiển thị topology mới. Nhóm vận hành thấy bộ đếm cổng cũ vẫn tăng đều mỗi phút.",
      note: "Topology đúng nhưng luật cũ chưa hết hạn: lưu lượng lớn vẫn khớp flow cũ.",
      chain: [
        { icon: "star", label: "SDN controller", sub: "topology mới · online", state: "ok" },
        { icon: "lb", label: "Switch biên", sub: "flow cũ còn hạn", state: "bad" },
        { icon: "arrow", label: "Lưu lượng", sub: "vẫn đi cổng cũ", state: "bad" }
      ]
    },
    "fcs-errors-one-port": {
      context: "Switch phòng lab báo lỗi khung trên đúng một cổng nối máy trạm. Máy vẫn dùng mạng được nhưng thỉnh thoảng phải tải lại trang.",
      note: "Lỗi khu trú ở một đoạn dây: nghi cáp, đầu nối hoặc thương lượng tốc độ/duplex.",
      chain: [
        { icon: "client", label: "Máy trạm", sub: "vẫn vào mạng", state: "ok" },
        { icon: "lb", label: "Cổng switch", sub: "FCS errors tăng", state: "bad" },
        { icon: "check", label: "Cổng khác", sub: "0 lỗi", state: "ok" }
      ]
    },
    "wifi-handover-drop": {
      context: "Nhân viên đi từ phòng họp ra hành lang. Sóng vẫn tốt nhưng cuộc gọi video đứt khoảng hai giây rồi ứng dụng phải kết nối lại.",
      note: "Hai AP khác subnet: handover lớp 3 đổi IP làm kết nối TCP cũ không còn hợp lệ.",
      chain: [
        { icon: "presence", label: "AP phòng họp", sub: "RSSI −58 dBm", state: "ok" },
        { icon: "arrow", label: "Chuyển vùng", sub: "đổi subnet và IP", state: "bad" },
        { icon: "client", label: "Cuộc gọi video", sub: "TCP đứt 2 giây", state: "bad" }
      ]
    },
    "ipsec-mtu-hang": {
      context: "Đường hầm IPsec đã lên. Ping nhỏ qua tunnel bình thường nhưng trang có nhiều tài nguyên tải mãi không xong.",
      note: "Gói lớn mang cờ DF bị bỏ vì vượt MTU sau khi đóng gói; cần giảm MTU và clamp MSS.",
      chain: [
        { icon: "packet", label: "Ping nhỏ", sub: "qua tunnel OK", state: "ok" },
        { icon: "shield", label: "Gói lớn DF", sub: "vượt MTU tunnel", state: "bad" },
        { icon: "server", label: "Trình duyệt", sub: "treo khi tải", state: "bad" }
      ]
    },
    "mpls-label-mismatch": {
      context: "Kỹ sư vừa dựng một LSP mới giữa hai router biên. Gói vào đường hầm nhưng bị bỏ ở LSR thứ hai, dù cấu hình nhãn đã nhập đủ.",
      note: "Phiên LDP down khiến bảng nhãn hai đầu lệch nhau: nhãn vào không khớp nhãn chờ.",
      chain: [
        { icon: "router", label: "Ingress LER", sub: "push nhãn 100", state: "ok" },
        { icon: "router", label: "LSR thứ hai", sub: "chờ nhãn 200", state: "bad" },
        { icon: "info", label: "Phiên LDP", sub: "down", state: "bad" }
      ]
    },
    "slow-first-page-dns": {
      context: "Người dùng báo trang nội bộ mở rất chậm trong lần đầu truy cập, nhưng các lần sau gần như tức thời dù không đổi gì.",
      note: "Thời gian chênh lệch nằm ở bước phân giải tên miền, không phải băng thông tải dữ liệu.",
      chain: [
        { icon: "client", label: "Lần đầu", sub: "DNS 1,2 giây", state: "bad" },
        { icon: "dns", label: "Resolver", sub: "phải hỏi upstream", state: "bad" },
        { icon: "cache", label: "Lần sau", sub: "cache · 300 ms", state: "ok" }
      ]
    }
  });
})();
