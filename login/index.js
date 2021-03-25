const {pool, Result, router} = require("../index.js")

router.all('/', (req, res) => {
	pool.getConnection((err, conn) => {
		conn.query('SELECT * FROM students', (e, r) => res.json(new Result({data: r})))
		conn.release()
	})
})

module.exports = router