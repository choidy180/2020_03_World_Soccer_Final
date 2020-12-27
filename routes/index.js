var express = require('express');
const app = express();
const { HTTPVersionNotSupported } = require('http-errors');
var router = express.Router();
const pool = require('../config/dbconfig');
const moment = require("moment");

// 메인페이지
router.get('/', function (req, res) {
    var sess = req.session;
    console.log('메인페이지')
    var content_news_sql = "SELECT * from content_news ORDER BY content_news.hit ASC";
    var content_video_sql = "SELECT * from content_video";
    var content_news_best_hit = "SELECT * from content_video ORDER BY content_video.hit DESC"
    pool.getConnection((err, conn) => {
        conn.query(content_news_sql, function (err, news) {
            if (err) {
                console.log('에러');
                console.log(err);
            }
            conn.query(content_video_sql, function (err, video) {
                if (err) {
                    console.log('에러');
                    console.log(err);
                }
                conn.query(content_news_best_hit, function (err, best_video) {
                    if (err) {
                        console.log('에러');
                        console.log(err);
                    }
                    if (news) {
                        conn.release();
                        res.render('index.ejs', { title: 'MAIN', page: 'main/main.ejs', url: req.url, sess: sess, news: news, video: video, best_video: best_video });
                    }
                })
            })
        })
    })
});

// 회원가입
router.get('/sign_up', function (req, res, next) {
    var sess = req.session;
    sess.destroy();
    console.log('회원가입')
    res.render('index.ejs', { title: 'SIGN_UP', page: 'user/sign_up.ejs', url: req.url, sess: sess });
});

// 로그인
router.get('/login', function (req, res, next) {
    var sess = req.session;
    sess.destroy();
    console.log('로그인')
    res.render('index.ejs', { title: 'LOG_IN', page: 'user/login.ejs', url: req.url, sess: sess });
});

// 로그아웃
router.get('/logout', function (req, res) {
    var sess = req.session;
    console.log('로그아웃');
    sess.destroy();
    res.redirect('/');
})

module.exports = router;
