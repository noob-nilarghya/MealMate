const mongoose = require('mongoose');

const dotenv= require('dotenv');
dotenv.config({ path: './config.env'});

const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const exp = require('constants');
const cookieParser= require('cookie-parser'); // to parse cookie

const session= require('express-session'); // use to store cart details in session
const flash= require('express-flash');
const mongoDBStore= require('connect-mongo')(session); // store session in DB instead of RAM (default)

const Emitter = require('events'); // this is a inbuilt package in node, use to trigger and respond to a perticular event from anywhere within the application



const PORT = process.env.PORT || 3000;

// This is how we connect cloud DB atlas with application
const DB = process.env.APP_ATLAS_CONNECTION_STRING ;
mongoose.connect(DB);

const connection = mongoose.connection;
connection.on('error', err => {
    console.log('Connection failed:', err);
});
connection.once('open', () => {
    console.log('DB connected successfully!...');
});


const eventEmitter = new Emitter() ;
app.set('eventEmitterKey', eventEmitter); // this is basically a key-value pair
// so, we can access this event from that key('eventEmitterKey'), anywhere within our app



// ------------  In order to achieve cart functionalities, we will store our cart data in DB in the form of sessions  -------------

// session store (in DB)
const mongoStore= new mongoDBStore({
    mongooseConnection: connection,
    collection: 'sessions' // a document in DB will be created named sessions in which sessions data will be stored
});
// session config (session won't work without cookies)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24} // 24 hrs (jabtak cookie expire nhi hoga, tabtak session bhi expire nhi hoga)
}));
app.use(flash());

app.use(cookieParser());


//set template  engine
app.use(expressLayout);
app.set('view engine','ejs'); 
app.set('views', path.join(__dirname,'/resources/views')); // views ke andaar ka maal template engine ko dikhega
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.static(path.join(process.cwd())));


app.use(express.json( { limit: '10kb' } )); // required (called middleware). // response data more than 10kb is not allowed
app.use(express.urlencoded( { extended: true, limit: '10kb'} ));



// Global middleware
app.use((req, res, next) => {
    res.locals.session= req.session; // all ejs template can access, req.session object by 'session'
    next();
});

// ROUTES HANDLING
const webRouter= require('./routes/webRouter');

app.use('/', webRouter); // route mounting


const server = app.listen(PORT,() => {
    console.log(`Listening on port ${PORT}`);
});


// Now we have to perform socket connection, that has 2 tasks:
// 1. on changing order status on '/admin-order', it should reflect to '/customer-order/:orderID' (singleOrder) in realtime
// 2. on creating new order at route '/order-cart', it should reflect to '/admin-order' (with a autometic page reload)

const io= require('socket.io')(server); // socket io should respond to this server
// Now to to 'layout.ejs' and add '<script src="/socket.io/socket.io.js"></script>' in order to use socket.io in client side (app.js)

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomName) => { 
        socket.join(roomName);  // if event named 'joinRoom' emitted from client side --> Join the room
    });
});

// Now we will use that eventEmitter to emit the event on updating order status (within 'adminOrderController.statusUpdateAdminOrder'), so that we can listen to that event here in server to do actions on socket
eventEmitter.on('statusUpdate', (data) => {
    const roomName= `order_${data.orderID}`;
    io.to(roomName).emit('statusUpdateFromSever', data); // is room pe ek 'statusUpdateFromSever' naam ka event triger karo along with data (recived from adminOrderController), which will be listened by client
});

// Now we will use that eventEmitter to emit the event on updating order status (within 'orderController.createOrder'), so that we can listen to that event here in server to do actions on socket
eventEmitter.on('oderPlaced', () => {
    io.to('adminRoom').emit('orderPlaceFromServer'); // 'adminRoom' pe ek 'orderPlaceFromServer' naam ka event triger karo along with data (recived from orderController), which will be listened by client
});
eventEmitter.on('oderCancelled', () => {
    io.to('adminRoom').emit('orderCancelFromServer');
});
