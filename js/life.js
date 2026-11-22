/* NetLab — Góc đời thường: một câu chuyện gần gũi cho từng bài và từng bước */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  const life = {};

  life["signals-latency"] = {
    scene: {
      title: "Chuyến hàng cao tốc về quê",
      text: "Băng thông là số làn xe, độ trễ là quãng đường, còn hàng đợi là cảnh ùn ứ trước trạm thu phí. Đường rộng không làm quãng đường ngắn lại.",
      map: [
        { icon: "package", label: "Đóng hàng", sub: "dữ liệu vào gói" },
        { icon: "road", label: "Cao tốc", sub: "nhiều làn, có giới hạn" },
        { icon: "home", label: "Nhận hàng", sub: "ứng dụng hiển thị" }
      ]
    },
    packetLinks: [],
    steps: [
      "Mỗi tệp giống một chuyến hàng: phải chia thành nhiều thùng nhỏ trước khi lên xe.",
      "Đường 4 làn không có nghĩa chuyến nào cũng chạy 120 km/h; xe đông, xe tải và trạm thu phí vẫn làm chậm.",
      "Hàng đi từ Hà Nội vào TP.HCM mất thời gian bất kể đường rộng bao nhiêu; băng thông không rút ngắn quãng đường.",
      "Giờ cao điểm, xe dồn trước trạm thu phí: mạng vẫn đủ rộng nhưng độ trễ tăng vì phải xếp hàng.",
      "Trạm thu phí quá tải phải chặn xe; router hết bộ đệm cũng bỏ gói và TCP phải gửi lại.",
      "Trải nghiệm cuối là hàng đến đúng giờ và nguyên vẹn, không phải con số tối đa trên biển báo."
    ]
  };

  life["osi-encapsulation"] = {
    scene: {
      title: "Gửi món quà cho người bạn ở xa",
      text: "Món quà được bọc hộp, dán phiếu giao, xếp lên xe rồi mới đi. Mỗi lớp thêm một lớp vỏ và thông tin cần cho chặng của nó.",
      map: [
        { icon: "package", label: "Món quà", sub: "dữ liệu ứng dụng" },
        { icon: "mail", label: "Hộp và phiếu", sub: "header từng lớp" },
        { icon: "road", label: "Xe giao", sub: "tín hiệu trên đường" }
      ]
    },
    packetLinks: [
      { id: "http", label: "HTTP → TCP → IPv4" },
      { id: "tls", label: "TLS record" }
    ],
    steps: [
      "Bạn viết lời nhắn trước: nội dung này vẫn là của bạn, chưa cần biết sẽ đi bằng xe hay máy bay.",
      "Bưu điện dán phiếu ghi người gửi, người nhận và loại hàng; TCP thêm port và số thứ tự để ghép đúng luồng.",
      "Trên phiếu giao ghi địa chỉ nhà, không phải biển số xe; IP là địa chỉ logic dùng xuyên nhiều chặng.",
      "Mỗi chặng lại có người vận chuyển riêng: Ethernet ghi MAC của chặng kế tiếp, không nhất thiết là người nhận cuối.",
      "Xe chạy trên đường, hàng nằm trong thùng; bit là tín hiệu thật sự chạy trên dây hoặc sóng.",
      "Người nhận mở thùng ngoài, bỏ phiếu giao, rồi mới đọc lời nhắn bên trong."
    ]
  };

  life["ethernet-arp"] = {
    scene: {
      title: "Giao đồ cho hàng xóm trong chung cư",
      text: "Bạn biết căn hộ B-1203 nhưng chưa biết ai ở đó. Bạn phải hỏi cả tầng, có người trả lời, rồi mới giao đúng cửa.",
      map: [
        { icon: "client", label: "Người gửi", sub: "biết số căn hộ" },
        { icon: "presence", label: "Hỏi cả tầng", sub: "ARP broadcast" },
        { icon: "home", label: "Đúng cửa", sub: "unicast tới MAC" }
      ]
    },
    packetLinks: [
      { id: "arp", label: "ARP request" },
      { id: "http", label: "Ethernet + IPv4" }
    ],
    steps: [
      "Bạn có số căn hộ đích nhưng thiếu tên người nhận; máy có IP đích nhưng thiếu MAC đích.",
      "Bạn nói to trong hành lang: Ai ở căn B-1203? ARP broadcast hỏi cả miền quảng bá.",
      "Đúng người trả lời riêng cho bạn, kèm địa chỉ cửa; ARP reply đi unicast về máy hỏi.",
      "Bạn ghi tên và cửa vào sổ rồi lần sau đi thẳng; switch học MAC và chuyển đúng cổng.",
      "Nếu người nhận ở tòa khác, bạn giao cho bảo vệ tòa mình trước; MAC đích là gateway, IP đích vẫn là người nhận.",
      "Bảo vệ không mang thư mời họp tòa nhà sang tòa bên cạnh; router chặn broadcast, ARP chỉ trong LAN."
    ]
  };

  life["ip-subnet"] = {
    scene: {
      title: "Chia khu phố thành các dãy nhà",
      text: "Mỗi dãy có một dải số nhà riêng, một cổng khu và quy tắc ai ở cùng dãy. Muốn sang dãy khác phải ra cổng chung.",
      map: [
        { icon: "home", label: "Dãy nhà", sub: "subnet" },
        { icon: "file", label: "Số nhà", sub: "host" },
        { icon: "gateway", label: "Cổng khu", sub: "default gateway" }
      ]
    },
    packetLinks: [
      { id: "http", label: "IP đích và MAC gateway" },
      { id: "icmp", label: "Ping cùng subnet" }
    ],
    steps: [
      "Địa chỉ nhà gồm tên dãy và số nhà; IPv4 gồm phần network và phần host.",
      "Dãy có 256 số nhưng số đầu là tên dãy, số cuối là loa phát thanh; chỉ 254 nhà dùng được.",
      "Bạn so số dãy của người nhận với dãy mình; máy AND subnet mask để biết cùng hay khác mạng.",
      "Gửi trong cùng dãy thì ghi thẳng số nhà; ra ngoài dãy thì ghi số nhà người nhận nhưng đưa cho cổng khu.",
      "Cổng khu chọn đường ra phố lớn; router chọn route, NAT đổi địa chỉ nguồn khi đi Internet.",
      "Thư hồi âm cũng phải qua cổng khu; thiếu route chiều về thì đi được mà không nhận được trả lời."
    ]
  };

  life["routing-ttl"] = {
    scene: {
      title: "Chuyển hàng qua nhiều bưu cục",
      text: "Không bưu cục nào biết toàn bộ đường đi; mỗi nơi chỉ chọn nơi giao tiếp theo. Tem giới hạn số trạm giúp hàng lạc không quay vòng mãi.",
      map: [
        { icon: "store", label: "Điểm gửi", sub: "nguồn" },
        { icon: "router", label: "Bưu cục", sub: "chặng kế tiếp" },
        { icon: "home", label: "Người nhận", sub: "đích" }
      ]
    },
    packetLinks: [
      { id: "icmp", label: "ICMP và TTL" }
    ],
    steps: [
      "Bạn chỉ cần mang hàng ra bưu cục gần nhất; máy chỉ cần biết default gateway.",
      "Bưu cục có nhiều tuyến: nội thành, liên tỉnh, còn lại là tuyến chung; router chọn route khớp cụ thể nhất.",
      "Mỗi bưu cục đóng một con dấu; mỗi router giảm TTL một đơn vị.",
      "Nếu hai bưu cục chuyển qua lại, tem hết chỗ đóng thì hàng bị trả lại; TTL về 0 thì router gửi ICMP.",
      "Khi tuyến chính tắc, bưu cục chuyển sang tuyến phụ; route dự phòng chỉ cứu được nếu đã cấu hình và thử trước.",
      "Bạn gửi nhiều phong bì có tem 1, 2, 3… để biết từng bưu cục; traceroute tăng TTL để lộ từng hop."
    ]
  };

  life["tcp-window"] = {
    scene: {
      title: "Chuyển đồ lên chung cư bằng thang máy",
      text: "Bạn chỉ đưa được vài thùng mỗi chuyến; người nhận xác nhận rồi mới đưa tiếp. Thang máy nhỏ hoặc đường đông sẽ làm giảm số thùng đang trên đường.",
      map: [
        { icon: "package", label: "Thùng đồ", sub: "byte" },
        { icon: "queue", label: "Thang máy", sub: "cửa sổ" },
        { icon: "home", label: "Căn hộ", sub: "bộ nhận" }
      ]
    },
    packetLinks: [
      { id: "tcp-syn", label: "TCP SYN + MSS" },
      { id: "http", label: "TCP segment" }
    ],
    steps: [
      "Bạn gọi điện hỏi căn hộ có sẵn sàng nhận không; SYN mở kết nối và chốt số thứ tự.",
      "Người nhận nói có, tôi đang chờ; SYN-ACK xác nhận và mở chiều ngược.",
      "Bạn nói bắt đầu nhé; ACK hoàn tất, cả hai bên thống nhất cách đánh số thùng.",
      "Bạn chỉ đưa số thùng vừa đủ thang máy chở; cửa sổ TCP giới hạn dữ liệu đang bay.",
      "Một thùng rơi, bạn dừng và gửi lại từ thùng đó; TCP phát hiện mất gói và retransmit.",
      "Tòa nhà xa, thang máy chậm thì cần cửa sổ lớn hơn để không ngồi chờ; BDP quyết định lượng dữ liệu tối ưu.",
      "Người nhận hết chỗ chứa thì xin gửi chậm; mạng tắc thì TCP tự giảm; hai giới hạn khác nhau cùng bảo vệ hệ thống."
    ]
  };

  life["udp-realtime"] = {
    scene: {
      title: "Xem bóng đá trực tiếp cùng bạn bè",
      text: "Pha bóng mới nhất quan trọng hơn pha bị lỡ. Bạn thà mất một khung hình còn hơn dừng cả trận để chờ tải lại.",
      map: [
        { icon: "presence", label: "Sân vận động", sub: "nguồn realtime" },
        { icon: "cdn", label: "Đường truyền", sub: "mất gói nhỏ" },
        { icon: "client", label: "Người xem", sub: "phát ngay" }
      ]
    },
    packetLinks: [
      { id: "dns-udp", label: "DNS trên UDP" },
      { id: "quic", label: "QUIC / HTTP3" }
    ],
    steps: [
      "Bạn bật trận bóng ngay, không chờ xác nhận từng khung; UDP gửi datagram không bắt tay.",
      "Bạn hỏi bạn tỷ số bao nhiêu và nhận một câu trả lời ngắn; DNS hỏi một câu, đáp một câu.",
      "Khung hình đến muộn đã lỗi thời; gói cũ trong video call cũng không còn giá trị.",
      "Bạn dùng đệm vài giây để hình không giật; jitter buffer làm phẳng dao động nhưng tăng độ trễ.",
      "Bạn tự ghi lại bàn thắng và gửi lại cho người khác; QUIC tự xây tin cậy và mã hóa trên UDP.",
      "Bạn chọn xem trực tiếp hay tải lại highlights; ứng dụng chọn UDP/QUIC hay TCP theo nhu cầu."
    ]
  };

  life["dns-http-https"] = {
    scene: {
      title: "Tra số nhà rồi mới giao hàng",
      text: "Bạn không nhớ địa chỉ người nhận, phải tra danh bạ, gọi xác nhận, rồi mới giao. Mỗi bước đều có thể làm chậm hoặc hỏng.",
      map: [
        { icon: "book", label: "Danh bạ", sub: "DNS" },
        { icon: "shield", label: "Xác nhận", sub: "TCP + TLS" },
        { icon: "home", label: "Giao hàng", sub: "HTTP" }
      ]
    },
    packetLinks: [
      { id: "http", label: "HTTP GET" },
      { id: "dns-udp", label: "DNS query" },
      { id: "tls", label: "TLS record" }
    ],
    steps: [
      "Bạn có tên nhà Lan nhưng cần số nhà; trình duyệt cần đổi tên miền thành IP trước khi kết nối.",
      "Danh bạ địa phương hỏi tiếp danh bạ thành phố và người quản lý khu phố; resolver đi theo chuỗi DNS.",
      "Bạn gọi điện xác nhận đúng người rồi mới đọc địa chỉ; TCP bắt tay và TLS xác thực trước khi gửi HTTP.",
      "Bạn gửi yêu cầu lấy hàng trong phong bì niêm phong; GET đi trong kênh HTTPS đã mã hóa.",
      "Lần sau bạn ghé kho gần nhà thay vì chạy về xưởng; CDN cache trả nội dung tại edge.",
      "Nếu một con đường tắc, bạn chọn tuyến khác; HTTP/2 và HTTP/3 giảm chờ bằng nhiều luồng."
    ]
  };

  life["nat-firewall"] = {
    scene: {
      title: "Lễ tân tòa nhà và danh sách khách",
      text: "Cả tòa nhà dùng chung một số điện thoại, nhưng lễ tân biết chuyển máy cho căn hộ nào. Ai không có hẹn hoặc không đúng cửa sẽ bị chặn.",
      map: [
        { icon: "gateway", label: "Lễ tân", sub: "NAT + firewall" },
        { icon: "home", label: "Căn hộ", sub: "IP riêng" },
        { icon: "key", label: "Danh sách", sub: "port và rule" }
      ]
    },
    packetLinks: [],
    steps: [
      "Các căn hộ dùng số nội bộ, không ai bên ngoài gọi thẳng được; IP riêng không định tuyến trên Internet.",
      "Lễ tân ghi số chung và số máy lẻ cho từng cuộc gọi; NAT/PAT ánh xạ IP và port nguồn.",
      "Khi bạn gọi ra, lễ tân nhớ cuộc gọi đó để chuyển phản hồi về đúng căn hộ; stateful firewall theo dõi kết nối.",
      "Bạn muốn shipper vào đúng căn hộ thì để lại tên và giờ hẹn; port forwarding mở một cửa có kiểm soát.",
      "Mỗi cửa mở thêm là một rủi ro; mỗi port mở là một bề mặt tấn công, NAT không thay firewall.",
      "Muốn biết khách có vào được không, hãy thử từ bên ngoài; thử trong tòa nhà không chứng minh được cửa ngoài."
    ]
  };

  life["troubleshooting"] = {
    scene: {
      title: "Bác sĩ khám bệnh theo thứ tự",
      text: "Không đoán mò từ triệu chứng chung. Hỏi bệnh sử, khám từng bộ phận, xét nghiệm, rồi mới kết luận và thử lại sau khi sửa.",
      map: [
        { icon: "client", label: "Bệnh nhân", sub: "người dùng" },
        { icon: "flask", label: "Xét nghiệm", sub: "ping, dig, curl" },
        { icon: "worker", label: "Bác sĩ", sub: "quy trình" }
      ]
    },
    packetLinks: [
      { id: "icmp", label: "Ping / ICMP" },
      { id: "dns-udp", label: "DNS query" },
      { id: "http", label: "HTTP request" }
    ],
    steps: [
      "Trước khi nghi bệnh nặng, kiểm tra bệnh nhân có cắm điện và thở được không; bắt đầu từ cáp, đèn link, Wi-Fi.",
      "Kiểm tra nhịp tim và huyết áp cơ bản; xem IP, mask, gateway có đúng không.",
      "Đo phản xạ tại chỗ; ping gateway để biết máy có ra khỏi phòng không.",
      "Cho bệnh nhân đi bộ ra hành lang; ping IP ngoài để tách lỗi LAN khỏi lỗi ra Internet.",
      "Nếu đi lại bình thường nhưng không nhớ tên thuốc, nghi trí nhớ; ping IP được nhưng tên miền lỗi là nghi DNS.",
      "Kiểm tra đúng loại cửa phòng bệnh; dịch vụ có mở đúng port không, thử từ đúng phía.",
      "Mỗi lần chỉ đổi một thứ rồi đo lại; nếu thay ba thứ cùng lúc, bạn không biết cái nào đã cứu."
    ]
  };

  life["vlan-stp"] = {
    scene: {
      title: "Khu phố có nhiều hẻm và một đường vành đai",
      text: "Mỗi hẻm là một cộng đồng riêng dù dùng chung mặt đường. Đường vòng đẹp nhưng nếu không có biển cấm, xe sẽ chạy vòng mãi.",
      map: [
        { icon: "home", label: "Hẻm 10", sub: "VLAN 10" },
        { icon: "road", label: "Đường vành đai", sub: "trunk" },
        { icon: "gateway", label: "Cổng khu", sub: "inter-VLAN" }
      ]
    },
    packetLinks: [
      { id: "vlan-dns", label: "802.1Q VLAN" }
    ],
    steps: [
      "Hẻm 10 và hẻm 20 dùng chung mặt đường nhưng không nghe loa của nhau; mỗi VLAN là một broadcast domain.",
      "Một con đường lớn có biển ghi hẻm nào; trunk gắn tag 802.1Q cho từng frame.",
      "Xe đi từ hẻm 10 qua đường lớn sang hẻm 10 bên kia; frame giữ VLAN khi qua trunk.",
      "Nếu có hai đường vòng mà không có biển cấm, xe chạy vòng và tạo kẹt vô tận; STP chặn vòng lớp 2.",
      "Cả khu bầu một tổ trưởng và chọn đường ngắn nhất; STP bầu root bridge và block cổng dư.",
      "Muốn từ hẻm 10 sang hẻm 20 phải qua cổng khu; inter-VLAN cần gateway lớp 3."
    ]
  };

  life["wifi-csma"] = {
    scene: {
      title: "Cả nhà nói chuyện trong phòng khách",
      text: "Không ai vừa nói vừa nghe rõ. Ai cũng phải nghe trước, chờ khoảng lặng, nói xong chờ người kia dạ để biết đã nghe.",
      map: [
        { icon: "presence", label: "Người nói", sub: "station" },
        { icon: "home", label: "Phòng khách", sub: "medium dùng chung" },
        { icon: "client", label: "Người nghe", sub: "AP" }
      ]
    },
    packetLinks: [
      { id: "wifi", label: "802.11 + LLC/SNAP" }
    ],
    steps: [
      "Bạn nghe xem phòng có ai đang nói không rồi mới nói; CSMA/CA nghe trước khi phát.",
      "Người nghe phải dạ để bạn biết câu đã tới; mỗi frame Wi-Fi unicast cần ACK.",
      "Hai người ở hai phòng khuất không nghe nhau, cùng nói và va vào nhau; hidden node làm hỏng frame.",
      "Cả xóm cùng dùng một kênh thì tiếng chồng lên nhau; chồng kênh Wi-Fi làm giảm tốc độ.",
      "Bạn đi từ phòng khách sang bếp nhưng vẫn giữ câu chuyện; roaming chuyển AP mà không đứt phiên.",
      "Muốn họp video ổn, giảm tiếng ồn, kê thêm loa đúng chỗ, dùng kênh rộng và kiểm tra lại tại chỗ ngồi."
    ]
  };

  life["ipv6"] = {
    scene: {
      title: "Chuyển sang hệ địa chỉ nhà dài hơn",
      text: "Khu phố mới có đủ số cho từng căn, không cần dùng chung cổng. Mỗi nhà tự tạo số từ tên khu, nhưng vẫn cần bảng chỉ đường và quy tắc an ninh.",
      map: [
        { icon: "home", label: "Khu phố /64", sub: "prefix" },
        { icon: "file", label: "Số căn", sub: "interface ID" },
        { icon: "gateway", label: "Bảng chỉ đường", sub: "router" }
      ]
    },
    packetLinks: [
      { id: "ipv6-http", label: "HTTP trên IPv6" }
    ],
    steps: [
      "Địa chỉ mới dài hơn để không phải chia chung; IPv6 dùng 128 bit và /64 cho mỗi LAN.",
      "Không còn loa hỏi cả khu, mỗi nhà đăng ký với bảng tin; NDP và DAD thay ARP.",
      "Bạn tự lấy tên khu ghép với số căn; SLAAC ghép prefix router quảng bá với interface ID.",
      "Bạn vẫn giữ cả số nhà cũ và mới trong danh bạ; dual stack và bản ghi A/AAAA.",
      "Đường nhỏ không cho xe quá khổ; router không phân mảnh, ICMPv6 báo Packet Too Big.",
      "Đổi hệ địa chỉ cần quy hoạch, biển chỉ dẫn, bảo vệ và kiểm tra; không chỉ bật công tắc."
    ]
  };

  life["dhcp-icmp"] = {
    scene: {
      title: "Nhận chìa khóa căn hộ từ lễ tân",
      text: "Bạn không tự chọn số phòng. Lễ tân hỏi bạn cần gì, đưa lựa chọn, bạn xác nhận rồi mới nhận chìa khóa có thời hạn.",
      map: [
        { icon: "gateway", label: "Lễ tân", sub: "DHCP server" },
        { icon: "key", label: "Chìa khóa", sub: "lease" },
        { icon: "home", label: "Căn hộ", sub: "IP, gateway, DNS" }
      ]
    },
    packetLinks: [
      { id: "icmp", label: "ICMP Echo" },
      { id: "dns-udp", label: "UDP cho DHCP/DNS" }
    ],
    steps: [
      "Bạn ra lễ tân hỏi có phòng trống không; Discover, Offer, Request, ACK cấp địa chỉ.",
      "Chìa khóa có hạn và kèm nội quy; lease có T1/T2, gateway và DNS đi kèm.",
      "Bạn gọi loa kiểm tra phòng có người không; ping kiểm tra khả năng tới đích.",
      "Nếu bạn đi sai tầng, bảo vệ chỉ đường; ICMP Time Exceeded và traceroute lộ từng chặng.",
      "Có phòng tự phục vụ, phòng cấp qua lễ tân, phòng cố định; DHCP, SLAAC và static có thứ tự kiểm tra."
    ]
  };

  life["congestion-control"] = {
    scene: {
      title: "Quán trà sữa đông khách",
      text: "Quán tăng dần số ly pha mỗi phút. Khi hàng quá dài, quán giảm tốc rồi tăng lại. Khay đệm quá lớn chỉ làm khách chờ lâu hơn.",
      map: [
        { icon: "store", label: "Quán", sub: "sender" },
        { icon: "queue", label: "Hàng đợi", sub: "buffer" },
        { icon: "client", label: "Khách", sub: "receiver" }
      ]
    },
    packetLinks: [
      { id: "tcp-syn", label: "TCP SYN và MSS" },
      { id: "http", label: "TCP segment" }
    ],
    steps: [
      "Quán chỉ nhận số ly mà bếp và khay cùng chịu được; cửa sổ hiệu dụng là min của cwnd và rwnd.",
      "Lúc mới mở, quán tăng gấp đôi công suất mỗi lần; slow start tăng theo cấp số nhân.",
      "Thấy hàng dài, quán giảm một nửa rồi tăng từ từ; AIMD tăng cộng, giảm nhân.",
      "Ba khách cùng phàn nàn một món bị thiếu, quán sửa ngay; ba ACK trùng kích hoạt fast retransmit.",
      "Khay đệm quá lớn giữ khách chờ nhưng không làm bếp nhanh hơn; bufferbloat tăng latency.",
      "Có quán dùng hàng đợi thông minh, có quán dùng công thức mới; CUBIC và BBR tối ưu khác nhau."
    ]
  };

  life["dns-resolution"] = {
    scene: {
      title: "Hỏi đường từ người địa phương",
      text: "Bạn hỏi quán nước, họ chỉ sang công an khu vực, người đó chỉ tới đúng nhà. Kết quả được ghi nhớ có thời hạn để lần sau khỏi hỏi lại.",
      map: [
        { icon: "client", label: "Người hỏi", sub: "stub resolver" },
        { icon: "book", label: "Bảng chỉ dẫn", sub: "root và TLD" },
        { icon: "presence", label: "Người địa phương", sub: "authoritative" }
      ]
    },
    packetLinks: [
      { id: "dns-udp", label: "DNS query trên UDP" }
    ],
    steps: [
      "Bạn chỉ cần hỏi quán gần nhất; máy khách hỏi một resolver thay vì tự đi khắp nơi.",
      "Quán chỉ sang công an khu vực, công an chỉ sang tổ dân phố; resolver đi root, TLD rồi authoritative.",
      "Mỗi người trả lời một kiểu câu hỏi; A, AAAA, CNAME, MX trả thông tin khác nhau.",
      "Bạn ghi địa chỉ vào sổ với hạn dùng; TTL quyết định cache giữ bao lâu.",
      "Kẻ xấu dán biển giả hoặc nghe lén câu hỏi; DNSSEC xác thực, DoH/DoT mã hóa.",
      "Muốn tìm lỗi, hỏi lại nhiều nguồn và kiểm tra từng chặng; chẩn đoán DNS có trình tự."
    ]
  };

  life["http-lifecycle"] = {
    scene: {
      title: "Đặt món qua ứng dụng giao đồ ăn",
      text: "Bạn chọn món, quán xác nhận, tài xế lấy hàng và giao. Ứng dụng nhớ đơn cũ, quán nhớ món quen, nhưng thông tin riêng phải được bảo vệ.",
      map: [
        { icon: "client", label: "Điện thoại", sub: "client" },
        { icon: "store", label: "Quán", sub: "server và cache" },
        { icon: "home", label: "Nhà bạn", sub: "response" }
      ]
    },
    packetLinks: [
      { id: "http", label: "HTTP request" },
      { id: "quic", label: "HTTP/3 trên QUIC" }
    ],
    steps: [
      "Bạn gửi yêu cầu gọi món, quán trả thực đơn; request/response gồm method, path, header, body.",
      "Ứng dụng nhớ bạn là ai giữa các lần mở; cookie và session giữ trạng thái.",
      "Quán báo món đã hết hay giá đổi; ETag và 304 giúp kiểm tra bản cũ thay vì tải lại.",
      "Một tài xế giao nhiều đơn nhưng chỉ một làn đường, đơn đầu kẹt thì đơn sau chờ; HTTP/1.1 bị HOL blocking.",
      "Một chuyến xe chở nhiều đơn được sắp xếp; HTTP/2 multiplexing trên một kết nối.",
      "Nếu đường chính tắc, ứng dụng chọn tuyến khác; HTTP/3 trên QUIC có nhiều luồng độc lập."
    ]
  };

  life["tls-https"] = {
    scene: {
      title: "Giao hàng niêm phong và xác minh người nhận",
      text: "Bạn không chỉ cần hộp kín mà còn phải biết đúng người gửi, hàng không bị sửa, và người nhận đúng là người đã hẹn.",
      map: [
        { icon: "store", label: "Người gửi", sub: "server" },
        { icon: "shield", label: "Niêm phong", sub: "TLS" },
        { icon: "home", label: "Người nhận", sub: "client" }
      ]
    },
    packetLinks: [
      { id: "tls", label: "TLS 1.3 record" }
    ],
    steps: [
      "Niêm phong giúp người ngoài không đọc, không sửa và biết đúng người gửi; HTTPS cung cấp bí mật, toàn vẹn, xác thực.",
      "Bạn kiểm tra giấy tờ của người giao qua nhiều cấp; chứng chỉ leaf, intermediate rồi root.",
      "Thủ tục mới gọn hơn, ít bước hơn nhưng vẫn xác minh; TLS 1.3 rút ngắn handshake.",
      "Người giao gọi đúng tên bạn dù nhiều nhà cùng địa chỉ; SNI chọn đúng chứng chỉ, ALPN chọn giao thức.",
      "Bạn gửi trước yêu cầu để giao nhanh, nhưng kẻ xấu có thể phát lại; 0-RTT cần chống replay.",
      "Nếu giấy tờ hết hạn, sai tên hoặc thiếu dấu, đừng bỏ qua; lỗi HTTPS thường chỉ đúng lớp bị hỏng."
    ]
  };

  life["network-security"] = {
    scene: {
      title: "Bảo vệ ngôi nhà nhiều lớp",
      text: "Khóa cửa không đủ nếu cửa sổ mở. Camera phát hiện, két sắt giảm thiệt hại, báo cháy xử lý tình huống. Không lớp nào tự nó là tuyệt đối.",
      map: [
        { icon: "key", label: "Khóa cửa", sub: "xác thực" },
        { icon: "presence", label: "Camera", sub: "giám sát" },
        { icon: "shield", label: "Két sắt", sub: "mã hóa, phân vùng" }
      ]
    },
    packetLinks: [
      { id: "tls", label: "TLS bảo vệ đường truyền" }
    ],
    steps: [
      "Bạn liệt kê cửa, cửa sổ, ban công và thứ cần bảo vệ; mô hình mối đe dọa và bề mặt tấn công.",
      "Kẻ xấu có thể đứng giữa đường hoặc giả làm người giao hàng; MITM và spoofing.",
      "Một nhóm người cùng đứng trước cửa làm tắc lối vào; DDoS làm cạn tài nguyên.",
      "Chó giữ nhà, camera và khóa cửa nhìn thấy những thứ khác nhau; firewall, IDS, WAF bổ sung nhau.",
      "Bạn đi qua đường hầm riêng để về nhà; VPN mã hóa đường truyền, không diệt virus trong nhà.",
      "Khóa, camera, báo cháy, két và bảo hiểm phải cùng vận hành; phòng thủ nhiều lớp và diễn tập."
    ]
  };

  life["qos-cloud"] = {
    scene: {
      title: "Điều hành chuỗi quán ăn",
      text: "Món gấp phải đi trước, bếp phụ giúp khi đông, chi nhánh gần khách hơn, và luôn có phương án khi một bếp hỏng.",
      map: [
        { icon: "store", label: "Bếp trung tâm", sub: "origin" },
        { icon: "home", label: "Chi nhánh", sub: "CDN và edge" },
        { icon: "worker", label: "Điều phối", sub: "QoS và LB" }
      ]
    },
    packetLinks: [
      { id: "quic", label: "QUIC và UDP" }
    ],
    steps: [
      "Bạn đo thời gian chờ, độ dao động, món rơi và sức chứa; latency, jitter, loss, băng thông.",
      "Món gấp được đánh dấu đỏ và đưa lên trước; DSCP và hàng đợi ưu tiên.",
      "Mở chi nhánh gần khách để giao nhanh; CDN đưa cache đến gần người dùng.",
      "Khi một quầy quá tải, điều phối sang quầy khác; load balancer, health check, autoscale.",
      "Mỗi chi nhánh đặt ở khu vực khác nhau và có cam kết giờ mở; region, AZ, SLA/SLO.",
      "Giả định một bếp sẽ hỏng và đo từ phía khách; thiết kế cho lỗi, synthetic và RUM."
    ]
  };

  SL.life = life;
})();
