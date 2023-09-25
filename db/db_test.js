/*
------mongodb练习案例------
*/ 
// 《1》连接数据库
// 引入密码加密插件
const md5 = require('blueimp-md5')
// 1.引入mongoose
const mongoose = require('mongoose')
// 2.连接指定数据库
mongoose.connect('mongodb://localhost:27017/gzhipi_test')
// 3.获取连接对象
const conn = mongoose.connection
// 绑定连接完成的监听
conn.on('connected', () => {
    console.log('数据库连接成功！')
})

// 《2》得到对应特定集合的Model
const userSchema = mongoose.Schema({
    username: { type: String, required: true }, // 用户名
    password: { type: String, required: true }, // 密码
    type: { type: String, required: true }      // 用户类型：dashen/laoban
})

// 《3》定义Model(与集合对应，可以操作集合)
const UserModel = mongoose.model('user', userSchema) // 集合名：users

// 《4》向外暴露Model
exports.UserModel = UserModel


// 添加一条数据
function testSave() {
    const user = {
        username: '程序员8',
        password: md5('123'),
        type:'dashen'
    }
    // 插件实例
    const userModel = new UserModel(user)
    // 保存到数据库
    userModel.save((error, user) => {
        console.log(error,user)
    })
}
// testSave()


// 查找一个或多个
function testFind() {
    // 查找多个
    // UserModel.find((error,users) => {
    //     console.log(error,users)
    // })
    // 查找一个
    UserModel.findOne({_id:'63bfb64c8417d0136bad42e5'},(error,user) => {
        console.log(error,user)
    })
}
// testFind()


// 更新一条数据
function testUpdate() {
    UserModel.findByIdAndUpdate({_id:'63bfb64c8417d0136bad42e5'},{username:"程序员66"},(error,user) => {
        console.log(error,user)
    })
}
// testUpdate()


// 删除一条或所有的数据
function testRemove() {
    // 删除一条
    UserModel.remove({_id:'63bfb64c8417d0136bad42e5'}, (error,result) => {
        console.log(error,result)
    })
    // 删除全部
    UserModel.remove((error,result) => {
        console.log(error,result)
    })
}
testRemove()

