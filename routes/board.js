var express = require('express');
const app = express();
var router = express.Router();
const multer = require('multer');
const pool = require('../config/dbconfig');

var upload = multer({ dest: 'uploads/' });
var _storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
var upload = multer({ storage: _storage });

Date.prototype.format = function (f) {
    if (!this.valueOf()) return " ";
    var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];
    var weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var d = this;
    return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function ($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear(); // 년 (4자리)
            case "yy": return (d.getFullYear() % 1000).zf(2); // 년 (2자리)
            case "MM": return (d.getMonth() + 1).zf(2); // 월 (2자리)
            case "dd": return d.getDate().zf(2); // 일 (2자리)
            case "KS": return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)
            case "KL": return weekKorName[d.getDay()]; // 요일 (긴 한글)
            case "ES": return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)
            case "EL": return weekEngName[d.getDay()]; // 요일 (긴 영어)
            case "HH": return d.getHours().zf(2); // 시간 (24시간 기준, 2자리)
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)
            case "mm": return d.getMinutes().zf(2); // 분 (2자리)
            case "ss": return d.getSeconds().zf(2); // 초 (2자리)
            case "a/p": return d.getHours() < 12 ? "오전" : "오후"; // 오전/오후 구분
            default: return $1;
        }
    });
};
String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };

String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };

Number.prototype.zf = function (len) { return this.toString().zf(len); };

router.get('/news/:news_number', function (req, res, next) {
    var news_number = req.params.news_number;
    var sess = req.session;
    console.log('뉴스')
    var sql = "SELECT * from content_news where content_news.content_number = ?"
    var hit_sql = "UPDATE content_news SET hit=? where content_news.content_number=?"
    var content_news_best_hit = "SELECT * from content_news ORDER BY content_news.hit DESC"
    var content_video_best_hit = "SELECT * from content_video ORDER BY content_video.hit DESC"
    var reply_sql = "SELECT * from news_reply where news_reply.content_number = ?"
    pool.getConnection((err, conn) => {
        conn.query(sql, [news_number], function (err, row) {
            if (err) {
                console.log('에러');
                console.log(err);
            }
            conn.query(hit_sql, [row[0].hit+1, news_number], function (err, row2) {
                if (err) {
                    console.log('에러');
                    console.log(err);
                }
                conn.query(content_news_best_hit, function (err, best_news) {
                    if (err) {
                        console.log('에러');
                        console.log(err);
                    }
                    conn.query(content_video_best_hit, function (err, best_video) {
                        if (err) {
                            console.log('에러');
                            console.log(err);
                        }
                        conn.query(reply_sql, [news_number], function (err, reply) {
                            if (err) {
                                console.log('에러');
                                console.log(err);
                            }
                            if (row) {
                                conn.release();
                                row[0].upload_time = row[0].upload_time.format('yyyy-MM-dd a/p hh:mm:ss');
                                row[0].update_time = row[0].update_time.format('yyyy-MM-dd a/p hh:mm:ss');
                                for (var i = 0; i < reply.length; i++) {
                                reply[i].upload_time = reply[i].upload_time.format('yyyy-MM-dd a/p hh:mm:ss');
                                }
                                res.render('index.ejs', { title: row[0].title, page: 'board/news.ejs', url: req.url, sess: sess, row: row, best_news: best_news, best_video: best_video , reply:reply});
                            }
                        })
                    })
                })
            })
        })
    })
});

router.get('/video/:video_number', function (req, res, next) {
    var video_number = req.params.video_number;
    var sess = req.session;
    console.log('비디오');
    var sql = "SELECT * from content_video where content_video.video_number = ?"
    var count_hit_sql = "UPDATE content_video SET hit=? where content_video.video_number=?"
    var content_news_best_hit = "SELECT * from content_news ORDER BY content_news.hit DESC"
    var content_video_best_hit = "SELECT * from content_video ORDER BY content_video.hit DESC"
    pool.getConnection((err, conn) => {
        conn.query(sql, [video_number], function (err, row) {
            if (err) {
                console.log('에러');
                console.log(err);
            }
            conn.query(count_hit_sql, [row[0].hit + 1, video_number], function (err, row2) {
                if (err) {
                    console.log('에러');
                    console.log(err);
                }
                conn.query(content_news_best_hit, function (err, best_news) {
                    if (err) {
                        console.log('에러');
                        console.log(err);
                    }
                    conn.query(content_video_best_hit, function (err, best_video) {
                        if (err) {
                            console.log('에러');
                            console.log(err);
                        }
                        if (row) {
                            conn.release();
                            row[0].upload_time = row[0].upload_time.format('yyyy-MM-dd a/p hh:mm:ss');
                            row[0].update_time = row[0].update_time.format('yyyy-MM-dd a/p hh:mm:ss');
                            res.render('index.ejs', { title: row[0].title, page: 'board/video.ejs', url: req.url, sess: sess, row: row, best_news: best_news, best_video: best_video });
                        }
                    })
                })
            })
        })
    })
});
router.get('/upload_news', function (req, res, next) {
    var sess = req.session;
    if (sess.user == undefined) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
        res.write("<script> alert('로그인한 관리자만 사용할 수 있습니다..'); history.back(); </script>");
    } else {
        console.log('뉴스 업로드 페이지')
        res.render('index.ejs', { title: '뉴스 기사 작성', page: 'board/upload_news.ejs', url: req.url, sess: sess });
    }
});

//게시글 작성
router.post('/upload_news', upload.single('userfile'), function (req, res) {
    var body = req.body;
    var sess = req.session;
    if (req.file == undefined) {
        var sql = "insert into content_news(id, name, league, team, img, title, content, upload_time, update_time, hit, recommend, non_recommend) values (?,?,?,?,?,?,?,now(),now(),0,0,0)"
        console.log(sql)
        pool.getConnection((err, conn) => {
            conn.query(sql, [sess.user.id, sess.user.name, body.league, body.team, userfile, body.title, body.content],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                        res.write("<script> alert('게시글 작성에 문제가 있습니다..'); history.back(); </script>");
                        return;
                    }
                    if (result) {
                        conn.release()
                        res.redirect('/');
                    } else {
                    }
                });
        })
    } else {
        var userfile = req.file.filename;
        var sql = "insert into content_news(id, name, league, team, img, title, content, upload_time, update_time, hit, recommend, non_recommend) values (?,?,?,?,?,?,?,now(),now(),0,0,0)"
        pool.getConnection((err, conn) => {
            conn.query(sql, [sess.user.id, sess.user.name, body.league, body.team, userfile, body.title, body.content],
                function (err, result) {
                    if (err) {
                        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                        res.write("<script> alert('게시글 작성에 문제가 있습니다..'); history.back(); </script>");
                        return;
                    }
                    if (result) {
                        conn.release();
                        res.redirect('/');
                    } else {
                    }
                });
        })
    }
})


// 게시글 작성 GET
router.get('/upload_video', function (req, res, next) {
    var sess = req.session;
    if (sess.user == undefined) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
        res.write("<script> alert('로그인한 관리자만 사용할 수 있습니다..'); history.back(); </script>");
    } else {
        console.log('뉴스 업로드 페이지')
        res.render('index.ejs', { title: '동영상 기사 작성', page: 'board/upload_video.ejs', url: req.url, sess: sess });
    }
});

//게시글 작성 POST
router.post('/upload_video', upload.single('userfile'), function (req, res) {
    var body = req.body;
    var sess = req.session;
    if (req.file == undefined) {
        var sql = "insert into content_video(user_id, name, league, team, thumbnail, video, title, content, upload_time, update_time, hit, recommend, non_recommend) values (?,?,?,?,?,?,?,?,now(),now(),0,0,0)"
        console.log(sql)
        pool.getConnection((err, conn) => {
            conn.query(sql, [sess.user.id, sess.user.name, body.league, body.team, userfile, body.video, body.title, body.content],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                        res.write("<script> alert('게시글 작성에 문제가 있습니다..'); history.back(); </script>");
                        return;
                    }
                    if (result) {
                        conn.release()
                        res.redirect('/');
                    } else {
                    }
                });
        })
    } else {
        var userfile = req.file.filename;
        var sql = "insert into content_video(user_id, name, league, team, thumbnail, video, title, content, upload_time, update_time, hit, recommend, non_recommend) values (?,?,?,?,?,?,?,?,now(),now(),0,0,0)"
        pool.getConnection((err, conn) => {
            conn.query(sql, [sess.user.id, sess.user.name, body.league, body.team, userfile, body.video, body.title, body.content],
                function (err, result) {
                    if (err) {
                        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                        res.write("<script> alert('게시글 작성에 문제가 있습니다..'); history.back(); </script>");
                        return;
                    }
                    if (result) {
                        conn.release();
                        res.redirect('/');
                    } else {
                    }
                });
        })
    }
})

// 최신뉴스
router.get('/hot_news', function (req, res, next) {
    var sess = req.session;
    console.log('최신뉴스')
    var sql = "SELECT * from content_news ORDER BY content_news.content_number DESC"
    pool.getConnection((err, conn) => {
        conn.query(sql, function (err, row) {
            if (err) {
                console.log('에러');
                console.log(err);
            }
            if (row) {
                conn.release();
                for (i = 0; i < row.length; i++) {
                    row[i].upload_time = row[i].upload_time.format('yyyy-MM-dd a/p hh:mm:ss');
                    row[i].update_time = row[i].update_time.format('yyyy-MM-dd a/p hh:mm:ss');
                }
                res.render('index.ejs', { title: '최신 뉴스', page: 'board/hot_news.ejs', url: req.url, sess: sess, row: row });
            }
        })
    })
});

// 최신영상
router.get('/hot_video', function (req, res, next) {
    var sess = req.session;
    console.log('최신영상')
    var sql = "SELECT * from content_video ORDER BY content_video.video_number DESC"
    pool.getConnection((err, conn) => {
        conn.query(sql, function (err, row) {
            if (err) {
                console.log('에러');
                console.log(err);
            }
            if (row) {
                conn.release();
                for (i = 0; i < row.length; i++) {
                    row[i].upload_time = row[i].upload_time.format('yyyy-MM-dd a/p hh:mm:ss');
                    row[i].update_time = row[i].update_time.format('yyyy-MM-dd a/p hh:mm:ss');
                }
                res.render('index.ejs', { title: '최신 뉴스', page: 'board/hot_video.ejs', url: req.url, sess: sess, row: row });
            }
        })
    })
});

// 기록, 순위
router.get('/record_premier', function (req, res, next) {
    var sess = req.session;
    var sql = "SELECT * from team where team.league=?  ORDER BY ((team.win * 3) + (team.draw * 1))  DESC, (team.score - team.loss) DESC"
    pool.getConnection((err, conn) => {
        conn.query(sql, ['premier'], function (err, row) {
            if (err) {
                console.log(err);
                return;
            }
            if (row) {
                conn.release();
                console.log("기록/순위");
                res.render('index.ejs', { title: '프리미어 리그 기록/순위', page: 'board/record_premier.ejs', url: req.url, sess: sess, row:row })
            }
        });
    })
})

// 프리미어리그
router.get('/record_laliga', function (req, res, next) {
    var sess = req.session;
    var sql = "SELECT * from team where team.league=?  ORDER BY ((team.win * 3) + (team.draw * 1))  DESC, (team.score - team.loss) DESC"
    pool.getConnection((err, conn) => {
        conn.query(sql, ['laliga'], function (err, row) {
            if (err) {
                console.log(err);
                return;
            }
            if (row) {
                conn.release();
                console.log("기록/순위");
                res.render('index.ejs', { title: '프리메라리가 기록/순위', page: 'board/record_laliga.ejs', url: req.url, sess: sess, row:row })
            }
        });
    })
})

// 분데스리가
router.get('/record_bundes', function (req, res, next) {
    var sess = req.session;
    var sql = "SELECT * from team where team.league=?  ORDER BY ((team.win * 3) + (team.draw * 1))  DESC, (team.score - team.loss) DESC"
    pool.getConnection((err, conn) => {
        conn.query(sql, ['bundes'], function(err, row){
            if (err) {
                console.log(err);
                return;
            }
            if(row) {
                conn.release();
                res.render('index.ejs', { title: '기록/순위', page: 'board/record_bundes.ejs', url: req.url, sess: sess, row:row })
            }
        })
    })
})

// 세리에
router.get('/record_seria', function (req, res, next) {
    var sess = req.session;
    var sql = "SELECT * from team where team.league=?  ORDER BY ((team.win * 3) + (team.draw * 1))  DESC, (team.score - team.loss) DESC"
    pool.getConnection((err, conn) => {
        conn.query(sql, ['serie'], function(err, row){
            if (err) {
                console.log(err);
                return;
            }
            if(row) {
                conn.release();
                res.render('index.ejs', { title: '기록/순위', page: 'board/record_seria.ejs', url: req.url, sess: sess , row:row})
            }
        })
    })
})

router.get('/record_league_1', function (req, res, next) {
    var sess = req.session;
    console.log("기록/순위");
    res.render('index.ejs', { title: '기록/순위', page: 'board/record_league_1.ejs', url: req.url, sess: sess })
})

router.post('/input_news_reply/:number', function(req, res, next){
    console.log("ㅎㅇ");
    var number = req.params.number
    console.log(number)
    var sess = req.session;
    var body = req.body;
    var sql = "insert into news_reply(content_number, id, name, content, upload_time, recommend, non_recommend) values (?,?,?,?,now(),0,0)"
    pool.getConnection((err, conn)=> {
        conn.query(sql, [req.params.number, sess.user.id, sess.user.name, body.content], 
            function(err, result){
                if(err){
                    console.log(err);
                    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                    res.write("<script> alert('댓글 작성에 문제가 있습니다..'); history.back(); </script>");
                    return;
                }
                if(result){
                    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                    res.write("<script> alert('댓글 작성 완료..'); history.back(); </script>");
                    return;
                } else {
                }
            })
    })
})

module.exports = router;