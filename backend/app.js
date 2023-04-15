const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const cron = require("node-cron")
var http = require("http");

const HttpError = require("./Exceptions/http-error");
const rideRoutes = require("./routes/ride-routes");
const driverRoutes = require("./routes/driver-routes");
const driverController = require("./controllers/driver.controllers");

const port = 8080;
var server = http.createServer(app);


app.use(bodyParser.json());

app.use((req, res, next) => {
    // Enabling CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use("/api/ride", rideRoutes);
app.use("/api/driver", driverRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Resource not found', 404);
    next(error);
})

app.use((error, req, res, next) => {
    // If the response is already given
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An unknown error found!' });
})

const sio = require('./socketio.js');
sio.init(server);

sio.getIO().on("connection", (socket) => {
    console.log("connetetd");
    console.log(socket.id, "has joined");
    socket.on("ping_back", (msg) => {
        driverController.driverHealthCheck(msg);
    });
});


//new pass Ckpi0rEau7ihiNDd
mongoose
    .connect("mongodb+srv://dhruvmehta212:Dhruv@0211@cluster0.n8lw289.mongodb.net/uber-clone?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        server.listen(port, "0.0.0.0", () => {
            console.log("server started at " + port);
        });
    })
    .catch((err) => {
        console.log(err);
    })

//cron job to ping drivers every 5 min
cron.schedule("*/5 * * * *", () => {
    console.log("running cron")
    sio.getIO().emit("ping", "hey there");
})
