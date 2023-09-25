module.exports = function (server) {
    // 《1》得到服务器端IO对象
    const io = require('socket.io')(server, { cors: true })

    // 《2》监视连接（当有一个客户连接上时回调）
    io.on('connection', function (socket) {
        console.log('服务器端有一个客户连接：socketio connected')

        // 《3》绑定订阅事件sendMsg，接收客户端发送过来的消息
        socket.on('sendMsg', function (data) {
            console.log('服务器--收到--浏览器端的消息', data)

            // 《4》发布事件receiveMsg，向客户端发送消息
            io.emit('receiveMsg', data.name + '_' + data.data)
            console.log('服务器--发送消息到--浏览器端', data)
        })
    })
}

// 《5》在bin/www中启动socket.io
// require('../socketIO/tesst')(server)