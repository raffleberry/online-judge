var express = require("express");
var bodyParser = require("body-parser");
var btoa = require("btoa");
var atob = require("atob");
var jd = require("./judge");


var app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");

app.get("/", function (req, res) {
    res.render("index");
});

app.get("/run", function (req, res) {
    var code = atob(req.query.code);
    var stdin = atob(req.query.stdin);
    // res.send(JSON.stringify({
    //     "code" : req.query.code, "stdout" : req.query.stdin
    // }));
    jd.judge(code, stdin).then(function (data) {
        var payload = JSON.stringify({
            "stdout": data[0],
            "stderr": data[1]
        });
        console.log(payload);
        console.log(btoa(payload));
        res.send(btoa(payload))
    }).catch(function (data) {
        res.send("something went horribly wrong!");
    })
})

app.listen(3000, function () {
    console.log("serving at http://localhost:3000");
});