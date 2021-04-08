const {pool, Result, router} = require("../index.js")

// 登录
router.all('/l', (req, res) => {
	let { username, pwd } = req.body
	if(!username && !pwd){
		username = req.query.username
		pwd = req.query.pwd
	}
	// 验证必传参数
	if(!username || !pwd){
		res.send({
			code: 0,
			msg: "参数有误"
		})
		return
	}
	try{
		// 和数据库对比
		pool.getConnection((err, conn) => {
			conn.query('select * from users where username = ? and pwd = ?', [username, pwd], (e, r) => {
				if(r.length > 0){
					res.send({code: 1, msg: '登录成功', data: r[0]})
				}else{
					res.send({code: 0, msg: '用户名或密码有误'})
				}
			});
			// 释放连接池
			conn.release()
		})
	}catch(e){
		console.log("login --", e)
	}
})

// 注册
router.all('/r', (req, res) => {
	let { username, pwd } = req.body
	if(!username && !pwd){
		username = req.query.username
		pwd = req.query.pwd
	}
	// 验证必传参数
	if(!username || !pwd){
		res.send({
			code: 0,
			msg: "参数有误"
		})
		return
	}
	try{
		// 和数据库对比
		pool.getConnection((err, conn) => {
			conn.query('select * from users where username = ?', [username], (e, r) => {
				if(r.length > 0){
					res.send({code: 0, msg: '用户已存在'})
				}else{
					conn.query('insert into users(username, pwd) value(?, ?)', [username, pwd], (e, r) => {
						if(e){
							res.send({code: 0, msg: '注册失败', error: e})
						}else{
							res.send({code: 1, msg: '注册成功'})
						}
					})
				}
			})
			// 释放连接池
			conn.release()
		})
	}catch(e){
		console.log("login --", e)
	}
})

module.exports = router