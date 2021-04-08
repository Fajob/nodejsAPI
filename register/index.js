const {pool, Result, router} = require("../index.js")

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
					conn.query('insert into users(username, pwd) value(?, ?)', [username, pwd])
					res.send({code: 1, msg: '注册成功'})
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