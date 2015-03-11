//
// Johan Coppieters - jan 2013 - Cody CMS
//
// empty website for Cody CMS
//
//

var cody = require('cody');
var express = cody.express;
var fs = cody.fs;
var mysql = cody.mysql;

var ejs = cody.ejs;

cody.server = express();
var bodyParser = cody.bodyParser;
var expressSession = cody.expressSession;
var multer = cody.multer;


// use the new 4.x middleware
cody.server.use(bodyParser());
cody.server.use(expressSession({secret: 'a secret', cookie: { maxAge: 60*60*1000 }}));
cody.server.use(bodyParser.urlencoded({ extended: true }));
cody.server.use(multer());


// startup a routing for all static content of cody (images, javascript, css)
cody.server.get("/cody/static/*", function (req, res) {
    var fileserver = new cody.Static(req, res, "");
    fileserver.serve();
});



// startup all the web applications

cody.bootstrap = function () {
// startup all the web applications


  var connection = mysql.createConnection({
    host: "localhost",
    user: "cody", password: "ydoc",
    database: "cody"
  });

  connection.connect();

  connection.query("SELECT * FROM websites WHERE active='Y' AND ownerconfirmed='Y' ORDER BY id", function(err, rows, fields) {
      if(err) throw err;
      cody.Application.each(rows, function(next){
        var row = this;

        cody.startWebApp(cody.server, {
            "name": row.name,
            "mailFrom": "info@cody-cms.org",
            "smtp": "smtpmailer.howest.be",
            "version": row.version,
            "defaultlanguage": row.defaultlanguage,
            "hostnames" : row.hostname,
            "dbuser": row.dbuser,
            "dbpassword": row.dbpassword,
            "dbhost": row.dbhost,
            "datapath": row.datapath,
            "db": row.db,
            "controllers": require("./websites/" + row.name + "/controllers/")
          }, next);

      }, function() {
        console.log("Loaded all apps....");
        connection.end();

        cody.server.listen(80);
        console.log('Listening on port 80')
      });
  });



  if (!process.stderr.isTTY) {
      process.on('uncaughtException', function (err) {
          console.error('Uncaught exception : ' + err.stack);
      });
  }
};

cody.bootstrap();
