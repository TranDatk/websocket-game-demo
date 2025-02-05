Thiết kế 3x3 button.
Mỗi client sẽ được phân biệt theo thứ tự tên A -> B -> C -> D -> E (tối đa 5 client).
Khi vào web app thì người dùng sẽ nhìn thấy như hình mockup với 1 ô là hiển thị tên client, có 8 ô vuông và 1 khung điểm.
Có thể xem đây là một trò chơi chiếm lâu dài.
8 button sẽ không còn hiển thị từ số theo thứ tự nữa. Có thể xem 8 button là 8 lâu đài để chiếm giữ.
Nếu button có trạng thái up (nền xanh lá) thì button không hiển thị gì hết, đây là lâu đài còn trống.
Nếu button có trạng thái down (nền xanh dương) thì là lâu đài đã bị chiếm giữ, cần hiển thị tên người chiếm giữ (A,B...) và thời gian đã chiếm giữ lâu đài (tính theo giây).
Lưu ý là server backend sẽ cần cập nhật số giây và số điểm theo định kỳ mỗi giây.
Quy định logic: Khi 1 người chơi chiếm giữ lâu dài thì có 10 giây đầu tiên được bảo vệ (tức là người chơi khác không chiếm được).
Mỗi người chơi có thể chiếm các lâu đài còn trống hoặc các lâu đài đã bị chiếm hơn 10 giây. Điểm số được tính theo tổng số giây người đó đã chiếm giữ thành công các lâu đài.
Quy định ràng buộc: Nếu trong 30s mà 1 người chơi không click vào bất cứ ô nào (tức là không hoạt động) thì backend sẽ kick người đó ra khỏi cuộc chơi, để tránh lãng phí trong việc xử lý. 

Day 1 - Cơ bản về WebSocket
Tìm hiểu về WebSocket (https://websocket.org) và viết 1 app demo có sử dụng WebSocket
Yêu cầu về tính năng:
- Làm 1 web app có 8 button từ 1 đến 8. Nhiều người sẽ vào web và click vào button để thay đổi trạng thái. Trạng thái của button sẽ hiển thị đồng bộ cho tất cả mọi người dùng đang truy cập vào web
Yêu cầu về kỹ thuật:
- Có 1 cái backend để làm server (có thể tự build hoặc dùng mấy cái online service)
- Front end không cần đăng nhập, khi truy cập vào front end thì sẽ tạo ra 1 client trong websocket. Front end chỉ cần 9 button từ 1 đến 9, button có 2 trạng thái là up (nền xanh lá) and down (nền xanh dương). Khi người dùng click vào nút nào thì sẽ gửi websocket đến server và server sẽ truyền đến tất cả các client khác để đổi màu nút.

Day 2 - Xử lý logic dựa trên WebSocket
https://github.com/user-attachments/assets/cae0f11a-4e7f-4277-af97-a104c95c09b0

![img_v3_02j6_b8f7e82b-c78c-47a7-9b49-9228f902122h](https://github.com/user-attachments/assets/2ba10d0d-b8c5-476e-9bc3-11201556772c)
 
Yêu cầu mới:
- Mỗi client sẽ được phân biệt theo thứ tự tên A -> B -> C -> D -> E (tối đa 5 client). Khi vào web app thì người dùng sẽ nhìn thấy như hình mockup với 1 ô là hiển thị tên client, có 8 ô vuông và 1 khung điểm. Có thể xem đây là một trò chơi chiếm lâu dài.
- 8 button sẽ không còn hiển thị từ số theo thứ tự nữa. Có thể xem 8 button là 8 lâu đài để chiếm giữ.
- Nếu button có trạng thái up (nền xanh lá) thì button không hiển thị gì hết, đây là lâu đài còn trống. Nếu button có trạng thái down (nền xanh dương) thì là lâu đài đã bị chiếm giữ, cần hiển thị tên người chiếm giữ (A,B...) và thời gian đã chiếm giữ lâu đài (tính theo giây). Lưu ý là server backend sẽ cần cập nhật số giây và số điểm theo định kỳ mỗi giây.
- Quy định logic: Khi 1 người chơi chiếm giữ lâu dài thì có 10 giây đầu tiên được bảo vệ (tức là người chơi khác không chiếm được). Mỗi người chơi có thể chiếm các lâu đài còn trống hoặc các lâu đài đã bị chiếm hơn 10 giây. Điểm số được tính theo tổng số giây người đó đã chiếm giữ thành công các lâu đài.
- Quy định ràng buộc: Nếu trong 30s mà 1 người chơi không click vào bất cứ ô nào (tức là không hoạt động) thì backend sẽ kick người đó ra khỏi cuộc chơi, để tránh lãng phí trong việc xử lý. 

Day 3 - Tìm hiểu sâu hơn về WebSocket (sau khi review code)

1) Vấn đề bảo mật
Server backend chạy WebSocket ở port 3001 và không có bảo mật. Như vậy nếu giả sử có người lạ mò ra được server và port (thường là mò ra bằng tool scan tự động) thì người lạ có thể tạo ra các client liên tục. Khi quá 5 clients thì backend sẽ từ chối các client mới, như vậy nếu người lạ chiếm hết 5 clients thì cái web app của mình sẽ không hoạt động được.
Giải pháp đúng: 
- Cần hiểu nguyên lý hoạt động của WebSocket, hiểu được WebSocket khác HTTP như thế nào (tham khảo: https://websocket.org/guides/road-to-websockets/).
- Cần xây dựng cơ chế handshake để xác thực client (tham khảo: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)

Gợi ý: Trong quá trình handshake thì client cần truyền thêm header gì đó vào để websocket server sẽ xác thực và chấp nhận handshake, sau đó mới tiến hành kết nối.

2) Về việc gán dữ liệu và gửi message đến tất cả các clients
Code của em cơ bản là chạy được, tuy nhiên xét về độ tối ưu trong việc sử dụng thì không cao.
Cải thiện:
- Em sử dụng thư viện Websocket của NodeJs thì nên tận dụng hết mọi thứ. Việc thêm mảng clients = [] là không cần thiết vì thư viện đã lưu rồi, chỉ cần gọi server.clients
- Khi ngắt kết nối (on close) thì dùng server.clients là không cần phải check lại mảng clients
- Việc gán dữ liệu vào client thì em có thể gán ở on connection như bình thường:
ws.name = "A"
ws.lastActive = "..."
=> Việc lưu thêm 1 array chứa các clients là không cần thiết và sẽ ảnh hưởng nhiều đến hiệu suất khi có nhiều client truy cập vào. 

3) Về setInterval
Sử dụng setInterval ở server cũng chạy được, nhưng không phải là cách chuẩn khi làm với WebSocket, đặc biệt là khi có nhiều client.
Một số điểm cần cải thiện:
- Cập nhật điểm số trên server bằng castles.forEach là chưa tốt => hạn chế sử dụng vòng lặp trên server vì 1 server có thể có rất nhiều clients. Cơ chế tính điểm là dựa vào số giây, ở server đã lưu startTime thì khi broadcast xuống toàn bộ client là chỉ cần gửi castle (có startTime) và currentTime của server. Từ startTime và currentTime khi chuyển xuống client có thể tính được điểm số. Lúc này việc xử lý điểm số để hiển thị ở client là được tính toán bằng client.
- Cần tham khảo cơ chế heartbeat của websocket (để truyền ping-pong giữa client-server). Sử dụng cơ chế heartbeat để xử lý việc kích người chơi bất hoạt.

4) Viết thêm logic xử lý hàng loạt
- Tăng số lượng lâu đài lên 30 (gồm 5 ngang x 6 dọc) và số lượng client lên 10.
- Mỗi client khi kết nối vào game thì thay vì hiển thị chữ cái thì sẽ hiển thị màu, tham khảo bảng màu https://flatuicolors.com/palette/defo để chọn 10 màu phân cho các client.
- Khi mỗi client kết nối vào game thì sẽ được ngẫu nhiên chiếm 1 lâu đài còn trống trong game. Nếu không con castle nào trống thì sẽ không kết nối được.
- Khi 1 người chơi nào đó bị không còn giữ được lâu đài sẽ bị kick ra khỏi cuộc chơi.
- Ở phần bên phải, thay vì chỉ hiển thị "Scores: 10" thì sẽ cần hiển thị các thông tin sau: 
Scores: x => điểm số hiện tại của người chơi đó
Players: x => số lượng người chơi
Castles: x => số lâu đài người đó đang giữ
- Ở phần bên trái, thay vì hiển thị tên ABC thì sẽ hiển thị màu nền là màu sắc của người chơi đó và hiển thị trạng thái Online/Offline (nếu còn trong game thì online, nếu bị kick ra thì là offline)
- Các ô thể hiện lâu dài sẽ không còn hiển thị 2 xanh dương xanh lá nữa mà hiển thị màu trắng là còn trống và màu nền theo màu của người chơi đã chiếm lâu đài. Không hiển thị tên ABC mà chỉ hiển thị số giây đã chiếm giữ lâu đài.

5) Xử lý đồng thời nhiều Websocket
- Cần viết 1 page testing, khi vào page đó thì sẽ to ra 10 khung (ngang 5 khung x dọc 2 khung). Mỗi khung sẽ tạo 1 UI game và 1 client tương ứng với UI đó. Như vậy trên page testing đó sẽ có 30 websocket client hoạt động độc lập để test chức năng

![image](https://github.com/user-attachments/assets/47cd20c0-420d-45bd-89ea-626f47fd6256)
