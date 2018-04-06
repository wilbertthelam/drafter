const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const session = require('express-session');

const devEnv = process.env.NODE_ENV === 'development';

// Hot reloading middleware
const webpack = devEnv ? require('webpack') : undefined;
const webpackDevMiddleware = devEnv ? require('webpack-dev-middleware') : undefined;
const config = devEnv ? require('./webpack.config.js') : undefined;

const app = express();
const compiler = devEnv ? webpack(config) : undefined;
const io = socketIo();

const sessionMiddleware = session({
  secret: 'drafter_auth_secret',
  resave: false,
  saveUninitialized: true,
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);

const index = require('./routes/index');
const api = require('./routes/api');
const users = require('./routes/users');
const draftroom = require('./routes/draftroom')(io);

// Dev hot loading
if (devEnv) {
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }));
}

app.set('io', io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', api);
app.use('/users', users);
app.use('/draftroom', draftroom);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
