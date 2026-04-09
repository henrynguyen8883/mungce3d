// Tên file: server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Cấu hình Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // Cho phép mọi trình duyệt, mọi website kết nối tới
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`[+] Mở kết nối: ${socket.id}`);

    // Khi 1 account (Tab) kết nối, nó sẽ báo nó thuộc TEAM nào
    socket.on('REGISTER_GROUP', (groupId) => {
        socket.join(groupId);
        console.log(`  -> Client ${socket.id} đã vào khu vực: ${groupId}`);
    });

    // Khi Đội trưởng tạo phòng xong, gửi link lên
    socket.on('LEADER_SEND_LINK', (data) => {
        const { groupId, link } = data;
        console.log(`[🚀] ĐỘI TRƯỞNG nhóm [${groupId}] gửi link: ${link}`);
        
        // Bắn ngay lập tức link này cho các THÀNH VIÊN đang ở trong groupId đó
        socket.to(groupId).emit('MEMBER_JOIN_NOW', link);
    });

    socket.on('disconnect', () => {
        console.log(`[-] Ngắt kết nối: ${socket.id}`);
    });
});

// Chạy server trên Port do môi trường cấp (Render) hoặc 3000 (Local)
// Chạy server trên Port do môi trường cấp (Render)
const PORT = process.env.PORT || 3000;

// Thêm '0.0.0.0' để ép Server mở mạng ra toàn cầu, tránh lỗi 502 của Render
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Trạm Điều Phối WebSockets đang chạy tại cổng ${PORT}`);
});
