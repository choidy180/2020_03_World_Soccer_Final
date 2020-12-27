var express = require('express');
const pool = require('../config/dbconfig');
var router = express.Router();

// 회원가입
router.post('/join', function (req, res) {
  var body = req.body
  birth = body.year + "-" + body.month + "-" + body.day
  tel = body.tel_1st + "-" + body.tel_2nd + "-" + body.tel_3rd
  var sql = "insert into user(id, passwd, name, birth, email, tel, type, grade) values (?, ?, ?, ?, ?, ?, '사용자', '루키')"
  if (body.passwd != body.passwd2) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
    res.write("<script> alert('비밀번호가 일치하지 않습니다..'); history.back(); </script>");
  } else {
    pool.getConnection((err, conn) => {
      conn.query(sql, [body.id, body.passwd, body.name, birth, body.email, tel],
        function (err, result) {
          if (err) {
            console.log(err);
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
            res.write("<script> alert('아이디가 중복되었습니다..'); history.back(); </script>");
            return;
          }
          if (result) {
            res.redirect("/");
          } else {

          }
        })
    })
  }
})

// 로그인
router.post('/login', function(req, res){
  var sess = req.session; // 세션값 사용
  var body = req.body;
  pool.getConnection((err, conn) => {
    if (err) throw err;
    var sql = "SELECT * FROM user where id=? and passwd=?";
    conn.query(sql, [body.id, body.passwd], (err, row) => {
      conn.release()
      if (err) {
        console.log("로그인 에러")
        console.log(err);
      }
      else {
        if(row[0] == null){
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
          res.write("<script> alert('아이디와 비밀번호가 일치하지 않습니다..'); history.back(); </script>");
        }
        else {
          sess.user = row[0];
          res.redirect('/');
        }
      }
    })
  })
})

module.exports = router;