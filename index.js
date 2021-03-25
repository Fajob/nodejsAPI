const express = require('express')
const app = express()
app.listen(8060, () => console.log("启动服务"))
// 参数问题
const bodyParser = require('body-parser')//解析参数
app.use(bodyParser.json())//json请求
app.use(bodyParser.urlencoded({extended: false}))//表单请求
// 跨域问题
const cors = require('cors')
app.use(cors())//解决跨域

const router = express.Router()

// 登录拦截，支持所有请求方式
// let login = true
// app.all("*", (req, res, next) => {
// 	if(!login)
// 		return res.json("未登录")
// 	next()//继续向下执行
// })

// get请求
// app.get("/", (req, res) => {
// 	res.json("helloWorld")
// 	res.send("<div style='color: red'>helloWorld</div>")
// })

// post请求
// app.post("/login", (req, res) => {
// 	res.json("helloWorld")
// })

// 带参请求
// app.post("/test/:data", (req, res) => {
// 	return res.json({query: req.query, data: req.params, json: req.body})
// })

// 数据库
const mysql = require('mysql')
const option = {
	host: '127.0.0.1',
	user: 'root',
	password: 'Go123!@#',
	port: '3306',
	database: 'school',
	// connectTimeout: 5000,//连接超时
	// mutipleStatements: false//是否允许一个query中包含多条sql语句
}

// 重连机制
// let conn 
// reconn()
// function reconn(){
// 	conn = mysql.createConnection(option)
// 	conn.on('error', err => err.code === 'PROTOCOL_CONNECTION_LOST' && setTimeout(reconn, 2000))
// }
// app.all("/", (req, res) => {
// 	conn.connect()
// 	pool.query('SELECT * FROM students', (e, r) => {
// 		res.json(new Result({data: r}))
// 	})
// 	conn.end()
// })

// 连接池
let pool
repool()
function repool(){
	pool = mysql.createPool({
		...option,
		waitForConnections: true,//当无连接池可用时，true-等待，false-
		connectionLimit: 100,//连接数限制
		queueLimit: 0//最大连接等待数，0-无限制
	})
	pool.on('error', err => err.code === 'PROTOCOL_CONNECTION_LOST' && setTimeout(repool, 2000))
}
// app.all("/", (req, res) => {
// 	pool.getConnection((err, conn) => {
// 		conn.query('SELECT * FROM students', (e, r) => {
// 			res.json(new Result({data: r}))
// 		})
// 		conn.release()
// 	})
// })

function Result({code = 1, msg = '', data = {}}){
	this.code = code
	this.msg = msg
	this.data = data
}

module.exports = {pool, Result, router, app}

// const login = require('./login/index.js')
// app.use('/login', login)
app.use('/login', require('./login'))
