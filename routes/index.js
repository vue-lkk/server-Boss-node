var express = require('express');
var router = express.Router();
//引入md5加密函数库
const md5 = require('blueimp-md5')
//引入UserModel集合
// const { UserModel, ChatsModel } = require('../db/models')

router.get('/',(req,res) => {
  const data ={name:'lkk'}
  res.send({data})
})

// 注册路由
router.post('/register', (req, res) => {
  //1.获取用户注册请求参数数据(username,password,type)
  const { username, password, type } = req.body
  //  操作数据库--查询用户是否存在
  UserModel.findOne({ username }, (err, user) => {
    if (user) {
      res.send({ code: 1, msg: '用户名已存在！' })
    } else {
      // 操作数据库--保存用户注册成功的信息
      new UserModel({ username, password: md5(password), type }).save((err, user) => {
        // 返回数据中排除掉password
        let data = { _id: user._id, username, type }
        //注册成功：生成一个cookie(userid:user._id),并交给浏览器保存(24小时)
        res.cookie('userId', user._id, { maxAge: 1000 * 60 * 60 * 24 })
        res.send({ code: 0, data })
      })
    }
  })
})


// 登录路由
router.post('/login', (req, res) => {
  //1.获取用户登录请求参数数据(username,password)
  const { username, password } = req.body
  //  操作数据库--查询用户和密码正确，{password:0}代表排除password字段
  UserModel.findOne({ username, password: md5(password) }, { password: 0 }, (err, user) => {
    if (!user) {
      res.send({ code: 1, msg: '用户或密码错误！' })
    } else {
      //登录成功：生成一个cookie(userid:user._id),并交给浏览器保存(24小时)
      res.cookie('userId', user.id, { maxAge: 1000 * 60 * 60 * 24 })
      res.send({ code: 0, data: user })
    }
  })
})


// 完善用户信息路由
router.post('/update', (req, res) => {
  // 从请求的cookie得到userId
  const { userId } = req.cookies
  // 如果不存在，直接返回一个提示信息
  if (!userId) {
    return res.send({ code: 1, msg: '请先登录！' })
  }
  // 存在，根据userid更新对应的user文档数据
  const user = req.body

// 操作数据库--_id查找并更新指定的数据
  UserModel.findByIdAndUpdate({ _id: userId }, user, (error, oldUser) => {
    // oldUser为修改前的数据
    // 这里也不一定_id正确，可能被人篡改了_id,想冒充已经登录
    if (!oldUser) {
      // 通知浏览器删除userId cookie
      res.clearCookie('userId')
    } else {
      const { _id, username, type } = oldUser
      // node端不能使用 ...
      // const data = {...user,_id,username,type}
      // 这里是将登录/注册的用户 + 用户完善的信息 合并一起返回给前端
      const data = Object.assign(user, { _id, username, type })
      res.send({ code: 0, data })
    }
  })
})


// 根据cookie中的userId获取用户信息路由
router.get('/user', (req, res) => {
  // 从请求的cookie得到userId
  const { userId } = req.cookies
  // 如果不存在，直接返回一个提示信息
  if (!userId) {
    return res.send({ code: 1, msg: '请先登录！' })
  }
  // 根据userId查询对应的user
  UserModel.findOne({ _id: userId }, { password: 0 }, (error, user) => {
    res.send({ code: 0, data: user })
  })

})


// 查看老板/大神用户列表
router.get('/list', (req, res) => {
  // 获取到前端传递过来的'dashen'或者'laoban'参数
  const { type } = req.query
  // 操作数据库--查询列表
  UserModel.find({ type }, (error, users) => {
    if (!users) {
      return res.send({ code: 1, msg: '错误' })
    }
    res.send({ code: 0, data: users })
  })
})


// 聊天
// 获取当前用户所有相关聊天信息列表
router.get('/chatlist', (req, res) => {
  // 获取cookie中的userId
  const { userId } = req.cookies
  // 操作数据库--查询得到所有user用户文档数组
  UserModel.find((err, userList) => {
    // 使用对象存储所有的user信息：key为user的_id,val为name和header组成的user对象
    let users = userList.reduce((per, next) => {
      // {'63e3541c10637eda5e63af80':{username:'',header:''}}
      per[next._id] = { username: next.username, header: next.header }
      return per
    }, {})
    // 操作数据库查询所有与当前用户相关的聊天数据
    // 参数1：查询调整
    // 参数2：过滤条件
    // 参数3：回调函数
    ChatsModel.find({ '$or': [{ from: userId }, { to: userId }] }, { password: 0 }, (err, chatMsg) => {
      if (!chatMsg) {
        return res.send({ code: 1, msg: '错误' })
      }
      res.send({ code: 0, data: { users, chatMsg } })
    })
  })
})


// 修改chat指定消息为已读
router.post('/chatread', (req, res) => {
  // 得到请求中的from 和 to 
  const from = req.body.from
  console.log(from)
  const to = req.cookies.userId
  console.log(to)
  // 更新数据库中chat数据
  // 参数1：查询条件
  // 参数2：更新为指定的数据对象
  // 参数3：是否1次更新多条，默认只会更新一条
  // 参数4：更新完成的回调函数
  ChatsModel.update({ from, to, read: false }, { read: true }, { multi: true }, (err, doc) => {
    console.log('/readmsg', doc)
    res.send({ code: 0, data: { readCount: doc.modifiedCount, tip: `${doc.modifiedCount}条已读` } }) // 更新的数量
  })
})


module.exports = router;
