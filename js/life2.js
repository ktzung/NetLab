/* NetLab — Góc đời thường cho các bài mới theo 8 chương */
(function () {
  "use strict";

  const SL = window.NETLAB;
  if (!SL) return;

  const life = SL.life || (SL.life = {});

  life["network-edge-core"] = {
    scene: {
      title: "Từ phòng khách ra đường lớn",
      text: "Mạng gia đình chỉ là đoạn đầu của một hành trình dài: router trong nhà, nhà cung cấp dịch vụ, điểm trung chuyển và trung tâm dữ liệu ở nước ngoài.",
      map: [
        { icon: "home", label: "Router nhà", sub: "cửa ngõ đầu tiên" },
        { icon: "road", label: "Nhà mạng", sub: "đường trục đô thị" },
        { icon: "server", label: "Trung tâm dữ liệu", sub: "đích cuối" }
      ]
    },
    packetLinks: [],
    steps: [
      "Máy tính nối Wi-Fi trong nhà giống xe rời bãi đỗ; chưa ra đường lớn được nếu không qua cổng router.",
      "Cáp quang hay 4G chỉ là loại đường khác nhau; đường càng nhiều làn thì tải càng lớn, nhưng không làm đích gần hơn.",
      "Router chuyển từng gói một, như bưu tá phân loại thư theo địa chỉ chứ không giữ cả xe hàng.",
      "Chuyển mạch gói giống ghép nhiều chuyến xe nhỏ; chuyển mạch kênh giống thuê riêng một làn xe dù không dùng hết.",
      "Các nhà mạng gặp nhau ở điểm trung chuyển như các tuyến xe buýt gặp nhau ở bến lớn; không có bến thì phải vòng xa.",
      "Trải nghiệm cuối bị chi phối bởi đoạn chậm nhất, giống chuyến đi bị kẹt ở đúng một nút giao."
    ]
  };

  life["email-p2p"] = {
    scene: {
      title: "Bưu điện và nhóm bạn chép tài liệu",
      text: "Email đi qua máy chủ như thư đi qua bưu điện; chia sẻ ngang hàng giống mỗi bạn giữ một phần tài liệu và trao đổi trực tiếp.",
      map: [
        { icon: "mail", label: "Hộp thư", sub: "người gửi và người nhận" },
        { icon: "server", label: "Máy chủ thư", sub: "trạm trung chuyển" },
        { icon: "file", label: "Tệp chia sẻ", sub: "các máy ngang hàng" }
      ]
    },
    packetLinks: [],
    steps: [
      "Bỏ thư vào hộp giống chương trình gửi tới máy chủ thư; bạn không tự mang thư tới nhà người nhận.",
      "Bưu điện cần biết địa chỉ người nhận thuộc bưu cục nào, giống máy chủ tra bản ghi MX của tên miền.",
      "Khi bưu cục bên nhận đóng cửa, thư nằm lại ở hàng đợi và được gửi lại; thư không biến mất ngay.",
      "Người nhận ra bưu cục lấy thư bằng thẻ, giống ứng dụng dùng IMAP/POP3 để tải thư về.",
      "Nhóm bạn giữ các mảnh tài liệu khác nhau và đổi trực tiếp, không cần một kho trung tâm duy nhất.",
      "Ai chép nhiều thì được ưu tiên nhận phần tiếp, giống cơ chế tit-for-tat trong mạng ngang hàng."
    ]
  };

  life["socket-programming"] = {
    scene: {
      title: "Quầy dịch vụ có số thứ tự",
      text: "Máy chủ mở cổng và xếp hàng chờ như quầy giao dịch; khách bấm số, được phục vụ, rồi ra về. UDP giống gửi bưu thiếp không cần biên nhận.",
      map: [
        { icon: "store", label: "Quầy đăng ký", sub: "bind và listen" },
        { icon: "queue", label: "Hàng chờ", sub: "backlog kết nối" },
        { icon: "check", label: "Phục vụ xong", sub: "đóng kết nối" }
      ]
    },
    packetLinks: [],
    steps: [
      "Quầy phải có địa chỉ và số hiệu rõ ràng trước khi mở, giống bind vào IP và cổng cố định.",
      "Khách gọi tới quầy và xác nhận hai chiều trước khi làm việc, giống bắt tay SYN, SYN-ACK, ACK.",
      "Quầy lấy một khách ra phục vụ, giống accept trả về socket riêng cho từng kết nối.",
      "Dữ liệu đến như một dòng chữ liền mạch, người nhận phải tự biết chỗ nào kết thúc một câu.",
      "Gửi bưu thiếp không cần biết người nhận có mặt; gói UDP cũng vậy, có thể mất mà không báo.",
      "Đóng quầy phải đúng thủ tục để khách cuối không bị bỏ dở, giống FIN và trạng thái TIME_WAIT."
    ]
  };

  life["reliable-transfer"] = {
    scene: {
      title: "Chuyển hàng có biên nhận",
      text: "Người gửi chỉ chắc hàng đến khi có biên nhận. Gửi từng thùng thì chậm, gửi cả lô thì phải biết thùng nào mất để gửi lại đúng thùng đó.",
      map: [
        { icon: "package", label: "Người gửi", sub: "giữ bản sao" },
        { icon: "road", label: "Đường hàng", sub: "có thể mất mát" },
        { icon: "check", label: "Biên nhận", sub: "xác nhận đã đến" }
      ]
    },
    packetLinks: [],
    steps: [
      "Đường giao hàng có thể làm mất hoặc hỏng thùng; giao thức phải giả định kênh không hoàn hảo.",
      "Gửi một thùng rồi chờ biên nhận rất chắc nhưng lãng phí thời gian, giống stop-and-wait.",
      "Đánh số thùng và đặt hẹn giờ giúp phát hiện thùng mất mà không cần chờ vô hạn.",
      "Gửi nhiều thùng liên tiếp tăng hiệu suất, nhưng người nhận phải xếp lại đúng thứ tự.",
      "Khi một thùng mất, gửi lại cả lô từ thùng đó là đơn giản nhưng tốn, giống Go-Back-N.",
      "Chỉ gửi lại đúng thùng thiếu thì tiết kiệm hơn nhưng cần bộ đệm phức tạp, giống Selective Repeat."
    ]
  };

  life["router-internals"] = {
    scene: {
      title: "Trạm kiểm soát trên cao tốc",
      text: "Xe vào trạm, được chỉ làn, rồi xếp hàng ra. Trạm làm việc nhanh nhưng cửa ra hẹp thì xe vẫn dồn.",
      map: [
        { icon: "road", label: "Cửa vào", sub: "đọc đích đến" },
        { icon: "queue", label: "Bãi chờ", sub: "bộ đệm gói" },
        { icon: "arrow", label: "Cửa ra", sub: "chọn làn tiếp" }
      ]
    },
    packetLinks: [],
    steps: [
      "Cửa vào đọc biển số và đích đến, giống cổng vào bóc header và tra bảng chuyển tiếp.",
      "Bảng chỉ đường dùng tiền tố dài nhất, giống router chọn tuyến khớp cụ thể nhất trong FIB.",
      "Các làn trong trạm nối cửa vào với cửa ra; nếu một làn bị chặn, cả hàng phía sau ùn theo.",
      "Cửa ra hẹp hơn lưu lượng thì xe xếp hàng; bộ đệm đầy thì buộc phải từ chối, giống tail drop.",
      "Trạm có thể ưu tiên xe cứu thương, chia lượt hoặc chia theo tỉ lệ, giống các thuật toán lập lịch.",
      "Khi hàng quá dài, trạm báo ngược để xe giảm tốc thay vì chờ đầy mới bỏ, giống ECN và AQM."
    ]
  };

  life["routing-algorithms"] = {
    scene: {
      title: "Chọn đường về nhà giờ tan tầm",
      text: "Mỗi tài xế biết một phần bản đồ. Chia sẻ thông tin đầy đủ thì tìm được đường ngắn, nhưng tin cũ có thể khiến cả đoàn quay vòng.",
      map: [
        { icon: "road", label: "Bản đồ", sub: "đồ thị có trọng số" },
        { icon: "info", label: "Tin đường", sub: "quảng bá trạng thái" },
        { icon: "check", label: "Tuyến chọn", sub: "chi phí nhỏ nhất" }
      ]
    },
    packetLinks: [],
    steps: [
      "Mỗi nút giao là một đỉnh, mỗi đoạn đường là một cạnh có chi phí; bài toán bắt đầu từ mô hình đó.",
      "Mỗi tài xế gửi tin về đoạn đường mình biết, giống router quảng bá trạng thái liên kết.",
      "Khi đã có bản đồ đầy đủ, chọn dần nút gần nhất sẽ ra đường ngắn, giống thuật toán Dijkstra.",
      "Nếu chỉ nghe hàng xóm, mỗi người cập nhật dần theo kinh nghiệm, giống vector khoảng cách.",
      "Tin cũ lan vòng: A tưởng đường qua B tốt, B lại tưởng nhờ A, chi phí tăng mãi nếu không chặn.",
      "Chọn thuật toán là đánh đổi giữa hội tụ nhanh, bộ nhớ và khả năng chịu lỗi."
    ]
  };

  life["ospf-bgp"] = {
    scene: {
      title: "Đi lại trong thành phố và bay giữa quốc gia",
      text: "Trong một thành phố, bạn dùng bản đồ nội bộ. Ra nước ngoài, bạn phải theo tuyến của hãng bay và quy định xuất nhập cảnh, không chỉ đường ngắn nhất.",
      map: [
        { icon: "road", label: "Nội thành", sub: "OSPF trong AS" },
        { icon: "gateway", label: "Cửa khẩu", sub: "biên giữa các AS" },
        { icon: "star", label: "Tuyến quốc tế", sub: "chính sách BGP" }
      ]
    },
    packetLinks: [],
    steps: [
      "Mỗi công ty tự quản mạng của mình; bên trong dùng giao thức nội bộ như OSPF để tìm đường.",
      "OSPF chia khu vực như chia quận; thay đổi trong một quận không làm cả thành phố tính lại.",
      "Ra khỏi công ty phải qua cửa khẩu, giống router biên chạy eBGP với nhà mạng khác.",
      "Các phòng ban trong cùng công ty trao đổi tuyến qua iBGP để mọi người biết đường ra.",
      "Không phải lúc nào cũng chọn đường ngắn nhất; khách hàng được ưu tiên hơn đối tác, giống chính sách BGP.",
      "Một địa chỉ có thể được quảng bá ở nhiều nơi để người dùng đến gần nhất, giống anycast."
    ]
  };

  life["sdn-control"] = {
    scene: {
      title: "Nhạc trưởng và dàn nhạc",
      text: "Thay vì mỗi nhạc công tự nghe nhau, một nhạc trưởng nhìn toàn bộ bản nhạc và ra hiệu cho từng nhóm vào đúng nhịp.",
      map: [
        { icon: "book", label: "Bản nhạc", sub: "chính sách toàn mạng" },
        { icon: "star", label: "Nhạc trưởng", sub: "bộ điều khiển" },
        { icon: "check", label: "Nhạc công", sub: "switch chuyển tiếp" }
      ]
    },
    packetLinks: [],
    steps: [
      "Nhạc công chỉ chơi theo hiệu lệnh, giống switch chỉ chuyển theo bảng luồng được cài.",
      "Mỗi hiệu lệnh nói rõ gặp tình huống nào thì làm gì, giống luật match-plus-action.",
      "Nhạc trưởng có thể chuẩn bị trước cho đoạn nhạc đã biết, giống cài luồng chủ động.",
      "Khi có tình huống bất ngờ, nhạc công giơ tay hỏi và nhạc trưởng ra hiệu mới, giống packet-in và flow-mod.",
      "Nhìn toàn bản nhạc giúp phân bè hợp lý hơn là mỗi người tự chọn, giống traffic engineering.",
      "Nếu nhạc trưởng ốm, cần người thay ngay; hệ thống điều khiển cũng cần dự phòng."
    ]
  };

  life["error-detection-mac"] = {
    scene: {
      title: "Tem niêm phong và phòng họp chung",
      text: "Tem niêm phong giúp biết gói hàng còn nguyên; phòng họp chung cần luật để nhiều người cùng nói mà không át nhau.",
      map: [
        { icon: "package", label: "Gói hàng", sub: "khung có mã kiểm tra" },
        { icon: "shield", label: "Tem niêm phong", sub: "CRC phát hiện sửa" },
        { icon: "presence", label: "Phòng họp", sub: "chia sẻ một kênh" }
      ]
    },
    packetLinks: [],
    steps: [
      "Đường vận chuyển có thể làm rách hoặc ướt hàng; dây mạng cũng có thể lật bit vì nhiễu.",
      "Một con tem đơn giản chỉ phát hiện vài kiểu hỏng, giống parity bắt lỗi lẻ nhưng bỏ sót lỗi chẵn.",
      "Tem niêm phong tốt hơn kiểm tra được nhiều kiểu hỏng, giống CRC bắt được lỗi chùm ngắn.",
      "Chia phòng họp theo giờ, theo khu vực hoặc theo mã riêng giúp không ai nói chồng, giống TDMA/FDMA/CDMA.",
      "Nói tự do dễ chồng tiếng; nghe trước khi nói và dừng khi nghe thấy tiếng khác thì đỡ hơn, giống CSMA/CD.",
      "Khi mỗi người có phòng riêng, không còn chuyện giành micro, giống switch full-duplex."
    ]
  };

  life["datacenter-mpls"] = {
    scene: {
      title: "Kho hàng có mã kệ và sân bay trung chuyển",
      text: "Nhãn MPLS giống mã kệ giúp nhân viên chuyển hàng nhanh mà không đọc lại toàn bộ đơn; leaf-spine giống sân bay nối mọi điểm qua một tầng trung chuyển.",
      map: [
        { icon: "package", label: "Kiện hàng", sub: "gói IP" },
        { icon: "file", label: "Mã kệ", sub: "nhãn MPLS" },
        { icon: "star", label: "Sân bay", sub: "leaf-spine" }
      ]
    },
    packetLinks: [],
    steps: [
      "Dán mã kệ lên kiện hàng giúp nhân viên biết đi đâu mà không cần mở đơn, giống ingress gắn nhãn.",
      "Mỗi kho đổi mã kệ theo chặng tiếp theo, giống LSR hoán đổi nhãn.",
      "Đến kho cuối thì bóc mã để giao đúng người nhận, giống router biên pop nhãn.",
      "Một kho ba tầng có một cửa chính; hàng nội bộ chuyển qua lại dễ ùn, giống lưu lượng Đông-Tây.",
      "Sân bay trung chuyển nối mọi điểm đến qua một tầng, nhiều cửa hoạt động song song, giống leaf-spine.",
      "Nhiều hãng cùng thuê một sân bay nhưng tách khu riêng, giống VXLAN và đa khách thuê."
    ]
  };

  life["day-in-life"] = {
    scene: {
      title: "Một buổi sáng mở laptop",
      text: "Máy chưa có địa chỉ, chưa biết cổng ra, chưa biết tên miền trỏ đi đâu. Từng bước nhỏ nối tiếp nhau để trang web hiện ra.",
      map: [
        { icon: "home", label: "Nhận chìa khóa", sub: "DHCP cấp IP" },
        { icon: "book", label: "Tra danh bạ", sub: "DNS đổi tên miền" },
        { icon: "server", label: "Gõ cửa", sub: "TCP, TLS, HTTP" }
      ]
    },
    packetLinks: [],
    steps: [
      "Như nhận chìa khóa và địa chỉ căn hộ, máy xin IP, cổng ra và địa chỉ DNS qua DHCP.",
      "Muốn gửi thư trong tòa nhà phải biết số phòng, máy hỏi MAC của gateway bằng ARP.",
      "Danh bạ cho biết tên người ứng với số điện thoại, DNS đổi tên miền thành địa chỉ IP.",
      "Trước khi nói chuyện dài, hai bên xác nhận đã nghe nhau, giống bắt tay TCP tới cổng 443.",
      "Hai bên thống nhất cách nói chuyện riêng tư rồi mới trao đổi nội dung, giống TLS rồi HTTP GET.",
      "Trang hiện ra nhờ nhiều tài nguyên; đồ đã có sẵn trong tủ thì lấy lại nhanh hơn, giống cache và CDN."
    ]
  };

  life["cellular-4g5g"] = {
    scene: {
      title: "Điện thoại vào mạng như làm thủ tục sân bay",
      text: "SIM là căn cước, trạm gốc là cửa kiểm tra, và nhà mạng cấp cho bạn một đường đi riêng tới Internet.",
      map: [
        { icon: "file", label: "SIM", sub: "danh tính thuê bao" },
        { icon: "presence", label: "Trạm gốc", sub: "cửa kết nối vô tuyến" },
        { icon: "gateway", label: "Cổng ra", sub: "phiên dữ liệu" }
      ]
    },
    packetLinks: [],
    steps: [
      "Điện thoại chọn cửa ít đông và xếp hàng vào, giống chọn cell và mở kết nối RRC.",
      "Nhân viên so căn cước với danh sách, giống mạng xác thực SIM bằng AKA.",
      "Sau khi xác thực, bạn được cấp thẻ lên máy bay và đường đi riêng, giống bearer và địa chỉ IP.",
      "Sân bay mới có nhiều cửa hơn và luồng riêng, giống 5G NR với băng rộng và MIMO lớn.",
      "Có làn riêng cho khách gấp, làn cho gia đình và làn cho đoàn đông, giống các network slice.",
      "Chuyến bay đổi cửa nhưng hành lý vẫn theo đúng người, giống handover giữ nguyên phiên."
    ]
  };

  life["mobility-management"] = {
    scene: {
      title: "Chuyển nhà mà giữ số điện thoại",
      text: "Bạn đổi chỗ ở nhưng vẫn muốn bạn bè gọi số cũ. Một người giữ hộ số và chuyển tiếp cuộc gọi tới nơi ở mới.",
      map: [
        { icon: "home", label: "Địa chỉ nhà", sub: "home address" },
        { icon: "arrow", label: "Địa chỉ tạm", sub: "care-of address" },
        { icon: "presence", label: "Người chuyển tiếp", sub: "home agent" }
      ]
    },
    packetLinks: [],
    steps: [
      "Bạn bè gọi số cũ nhưng bạn đã ở nơi khác; nếu không có ai chuyển tiếp thì cuộc gọi rơi, giống TCP đứt khi IP đổi.",
      "Bạn báo nơi ở mới cho người giữ hộ số, giống thiết bị đăng ký care-of address.",
      "Mọi cuộc gọi vẫn qua người giữ số rồi mới chuyển tới bạn, giống định tuyến gián tiếp.",
      "Nếu bạn bè biết nơi ở mới, họ gọi thẳng và đỡ một chặng, giống binding update và định tuyến trực tiếp.",
      "Chuyển trong cùng tòa nhà chỉ đổi phòng; chuyển sang tòa khác mới phải báo địa chỉ mới, giống handover L2 và L3.",
      "Ứng dụng hiện đại giữ cuộc gọi qua nhiều mạng như tổng đài thông minh, giống MPTCP và QUIC."
    ]
  };

  life["crypto-signatures"] = {
    scene: {
      title: "Ổ khóa, con dấu và giấy chứng nhận",
      text: "Khóa chung giống chìa nhà phải chép cho cả nhà; khóa công khai giống ổ khóa ai cũng mở được nhưng chỉ bạn có chìa. Chữ ký số là con dấu chỉ bạn sở hữu.",
      map: [
        { icon: "key", label: "Chìa khóa", sub: "bí mật và công khai" },
        { icon: "file", label: "Con dấu", sub: "chữ ký số" },
        { icon: "check", label: "Giấy chứng nhận", sub: "CA xác nhận" }
      ]
    },
    packetLinks: [],
    steps: [
      "Chép chìa cho nhiều người thì khó giữ bí mật, giống bài toán chia khóa đối xứng.",
      "Phát ổ khóa công khai cho mọi người, ai cũng khóa hộp nhưng chỉ bạn mở được, giống RSA/ECDH.",
      "Dấu vân tay của tài liệu rất khó làm giả bằng tài liệu khác, giống hàm băm.",
      "Một con tem có khóa chung chỉ người trong nhóm kiểm tra được, giống HMAC.",
      "Con dấu riêng của bạn chứng minh bạn đã ký và không thể phủ nhận, giống chữ ký số.",
      "Giấy chứng nhận có dấu của cơ quan đáng tin giúp người lạ tin bạn, giống CA và chuỗi chứng chỉ."
    ]
  };

  life["ipsec-vpn"] = {
    scene: {
      title: "Đường hầm riêng xuyên phố đông",
      text: "Thay vì để hàng đi lộ thiên qua mọi ngã tư, bạn thuê một đường hầm kín nối thẳng hai đầu. Đường hầm tốn thêm chỗ nhưng che được hàng.",
      map: [
        { icon: "home", label: "Chi nhánh", sub: "đầu đường hầm" },
        { icon: "shield", label: "Đường hầm kín", sub: "ESP mã hóa" },
        { icon: "server", label: "Trụ sở", sub: "đầu còn lại" }
      ]
    },
    packetLinks: [],
    steps: [
      "Hai tòa nhà muốn nối riêng với nhau qua đường công cộng, giống VPN site-to-site.",
      "Có loại đường hầm che hàng và loại chỉ dán niêm phong, giống ESP và AH.",
      "Mỗi chiều đi có thỏa thuận riêng về cách che và khóa, giống hai security association.",
      "Hai đầu phải gặp nhau bí mật để thống nhất chìa, giống IKE và Diffie-Hellman.",
      "Đường hầm làm xe cao hơn, không qua được cổng thấp; gói lớn cũng phải chia nhỏ, giống MTU và MSS.",
      "Nhân viên ở xa có thể vào bằng cửa riêng có xác thực, giống remote-access VPN và zero trust."
    ]
  };
})();
