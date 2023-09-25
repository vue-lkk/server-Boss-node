// 《1》连接数据库
// 引入密码加密插件
const md5 = require('blueimp-md5')
// 1.引入mongoose
const mongoose = require('mongoose')
// 2.连接指定数据库
mongoose.connect('mongodb://localhost:27017/gzhipi')
// 3.获取连接对象
const conn = mongoose.connection
// 4.监听是否连接成功
conn.on('connected',() => {
    console.log('数据库连接成功！')
})


// 《2》定义user集合的Model
const userSchema = mongoose.Schema({
    username:{type:String, required:true}, // 用户名
    password:{type:String, required:true}, // 密码
    type:{type:String,required:true}, // 用户类型 dashen/laoban
    header:{type:String}, // 头像名称
    post:{type:String}, // 职责
    info:{type:String}, //个人或项目介绍
    company:{type:String}, //公司名称
    salary:{type:String} //工资
})

// 定义chats集合的Model
const chatsSchema = mongoose.Schema({
    from:{type:String,required:true}, //发送消息用户的id
    to:{type:String,required:true},  //接收消息用户的id
    chat_id:{type:String,required:true}, //from 和 to组成的字符串
    content:{type:String,require:true}, //消息内容
    read:{type:Boolean,default:false}, //标识内容是否已读
    create_time:{type:Number} //创建时间
})

// 《3》定义Model(与集合对应，可以操作集合)
const UserModel = mongoose.model('user',userSchema) // 集合名：users
const ChatsModel = mongoose.model('chat',chatsSchema) // 集合名：Chat

// 《4》一次性向外暴露Model
// module.exports = UserModel
// 《4》多次向外暴露Model
exports.UserModel = UserModel
exports.ChatsModel = ChatsModel