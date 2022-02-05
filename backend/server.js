// 필요한 모듈들을 가져오기
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    port: process.env.MYSQL_PORT
});

// const db = require("./db");

// Express 서버를 생성
const app = express();

// json형태로 오는 요청의 본문을 해석해줄수 있게 등록
app.use(bodyParser.json());

connection.query("DROP DATABASE IF EXISTS myapp;", 
    (err, results) => {
        if (err) throw err;
        console.log("Database dropped");
});

connection.query("CREATE DATABASE myapp;", 
    (err, results) => {
        if (err) throw err;
        console.log("Database created");
});

/*connection.query("USE myapp;", 
    (err, results) => {
        if (err) throw err;
        console.log("Database connected");
});*/

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
});

// 테이블 생성하기
pool.query(`CREATE TABLE lists (
    id INTEGER AUTO INCREMENT,
    value TEXT,
    PRIMARY KEY (id)
)`, (err, results, fields) => {
    console.log("results", results)
});

// DB lists 테이블에 있는 모든 데이터를 프론트 서버에 보내주기
app.get("/api/values", function(req, res) {
    // 데이터베이스에 모든 정보 가져오기
    pool.query("SELECT * FROM lists;", (err, results, fields) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            return res.json(results);
        }
    })
});

// 클라이언트에서 입력한 값을 데이터베이스 lists 테이블에 넣어주기
app.post("/api/value", function (req, res, next) {
    // 데이터베이스에 값 넣어주기
    pool.query(`INSERT INTO lists (value) VALUES("${req.body.value}")`, (err, results, fields) => {
        if (err) {
            return res.status(500).send(err)
        } else {
            return res.json({ success: true, value: req.body.value })
        }
    })
});

app.listen(5000, () => {
    console.log('애플리케이션이 5000번 포트에서 시작되었습니다.')
});
