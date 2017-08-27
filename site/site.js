process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const debug = require('debug_zones');
debug.setDefault('App');
debug.quiet(false);

debug.Launch('----------------------------------');


const Express = require('express');
const app = Express();

app.use(require('cookie-parser')());

app.use('/', require('routes/index.js'));
app.listen(80, function(){
  debug.App('Express listening');
});