var exec = require('child_process').exec;

function print(error, stdout, stderr) {
  console.log(stdout);
  console.log(error);
  console.log(stderr);
}

//exec("ls -la", puts);

console.log(__dirname);
exec("mongodump --db test --out " + __dirname + "/db", print);
