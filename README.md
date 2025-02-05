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

https://github.com/user-attachments/assets/cae0f11a-4e7f-4277-af97-a104c95c09b0

![img_v3_02j6_b8f7e82b-c78c-47a7-9b49-9228f902122h](https://github.com/user-attachments/assets/2ba10d0d-b8c5-476e-9bc3-11201556772c)


