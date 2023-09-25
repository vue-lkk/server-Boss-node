module.exports = function (server) {
    // 引入聊天集合
    const { ChatsModel } = require('../db/models')
    // 《1》得到服务器端IO对象,cors解决跨域
    const io = require('socket.io')(server,{cors: true})

    // 《2》监视连接（当有一个客户连接上时回调）
    io.on('connection', function (socket) {
        console.log('服务器端有一个客户连接：socketio connected')

        // 《3》绑定订阅事件sendMsg，接收客户端发送过来的消息
        socket.on('sendMsg', function ({ from, to, content }) {
            console.log('服务器--收到--浏览器的消息', { from, to, content })
            // 处理数据（保存消息）
            // 准备chatmsg对象的相关数据
            const chat_id = [from, to].sort().join('_') // 组成格式：from_to,或者to_from,排序解决唯一性
            const create_time = Date.now()
            new ChatsModel({ from, to, content, chat_id, create_time }).save((error, chatMsg) => {
                // 《4》发布事件receiveMsg，向所有连接的客户端发送消息
                // console.log(chatMsg)
                io.emit('receiveMsg', chatMsg)
                console.log('服务器--发送消息到--浏览器', chatMsg)
            })
        })
    })
}

// 《5》在bin/www中启动socket.io
// require('../socketIO/test')(server)