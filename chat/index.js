const {
	pool,
	Result,
	router
} = require("../index.js")

// 获取用户列表
router.all('/users/get', (req, res) => {
	let {
		adminId
	} = req.body
	let page = req.body.page ? req.body.page : req.query.page ? req.query.page : 1 //默认为1
	let num = req.body.num ? req.body.num : req.query.num ? req.query.num : 5 //一页条数
	if (!adminId) {
		adminId = req.query.adminId
	}
	// 验证必传参数
	if (!adminId) {
		res.send({
			code: 0,
			msg: "参数有误"
		})
		return
	}
	try {
		// 和数据库对比
		pool.getConnection((err, conn) => {
			conn.query(`select * from users where id = ?`, [adminId], (e, r) => {
				if (req.body.page) {
					// 分页
					conn.query(`select * from users limit ${num} offset ${num*(page-1)}`, (e1,
						r1) => {
						if (r1) {
							res.send({
								code: 1,
								msg: '获取成功',
								data: r1
							})
						} else {
							res.send({
								code: 0,
								msg: '获取失败',
								error: e1
							})
						}
					});
				} else {
					// 不分页
					// if(r.length > 0){
					conn.query('select * from users', (e1, r1) => {
						r1.splice(--adminId, 1)
						res.send({
							code: 1,
							msg: '获取成功',
							data: r1
						})
					});
					// }else{
					// 	res.send({code: 0, msg: '未登录'})
					// }
				}
			});
			// 释放连接池
			conn.release()
		})
	} catch (e) {
		console.log("login --", e)
	}
})

// 发送消息
router.all('/chatting/send', (req, res) => {
	let {
		fromAdminId,
		toAdminId,
		msg,
		time
	} = req.body

	// 验证必传参数
	if (!fromAdminId || !toAdminId) {
		res.send({
			code: 0,
			msg: "参数有误"
		})
		return
	}
	try {
		// 和数据库对比
		pool.getConnection((err, conn) => {
			conn.query('insert into send_msgs(toAdminId, msg, time) value(?, ?, ?)', [toAdminId, msg,
				time
			], (e, r) => {
				if (e) {
					res.send({
						code: 0,
						msg: '发送失败',
						error: e
					})
				} else {
					conn.query(
						'insert into receive_msgs(fromAdminId, msg, time) value(?, ?, ?)', [
							fromAdminId, msg, time
						], (e, r) => {
							if (e) {
								res.send({
									code: 0,
									msg: '发送失败',
									error: e
								})
							} else {
								res.send({
									code: 1,
									msg: '发送成功'
								})
							}
						})
				}
			})
			// 释放连接池
			conn.release()
		})
	} catch (e) {
		console.log("login --", e)
	}
})
// 接收消息
router.get('/chatting/get', (req, res) => {
	let {
		fromAdminId
	} = req.query
	// 验证必传参数
	if (!fromAdminId) {
		return
	}

	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		"Connection": "keep-alive"
	});

	res.write("retry: 10000\n");
	res.write("event: connecttime\n");
	// res.write("data: " + (new Date()) + "\n\n");
	// res.write("data: " + (new Date()) + "\n\n");
	
	let interval 
	let old_receive_msgs
	let new_receive_msgs
	pool.getConnection((err, conn) => {
		conn.query("select * from receive_msgs where fromAdminId = ?", [fromAdminId], (e, r) => {
			old_receive_msgs = r
		})
		interval = setInterval(() => {
			conn.query("select * from receive_msgs where fromAdminId = ?", [fromAdminId], (e, r) => {
				new_receive_msgs = r
				if (new_receive_msgs.length > old_receive_msgs.length) {
					old_receive_msgs = new_receive_msgs
					res.write("data: " + JSON.stringify(r[r.length - 1]) + "\n\n");
				}else{
					res.write("data: 暂无新消息\n\n");
				}
			})
		}, 1000);
		// 释放连接池
		conn.release()
	})
	/* let interval = setInterval(() => {
		pool.getConnection((err, conn) => {
			conn.query("select * from receive_msgs where fromAdminId = ?", [fromAdminId], (e, r) => {
					if (r.length > 0) {
						res.write("data: " + JSON.stringify(r[r.length - 1]) + "\n\n");
					}
				})
			// 释放连接池
			conn.release()
		})
	}, 1000); */

	req.connection.addListener("close", function() {
		clearInterval(interval);
	}, false);
})

module.exports = router
