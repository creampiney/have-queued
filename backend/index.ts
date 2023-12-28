import express, { urlencoded, json } from 'express'
import { Server } from 'socket.io';
import Room from './models/Room'
import RoomList from './models/RoomList'
import cors from 'cors'
import QueuePerson from './models/QueuePerson'
import { createServer } from 'http';

var app = express()
const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
    },
  });

var port = process.env.PORT || 7777

app.use(urlencoded({extended: true}))
app.use(json())
app.use(cors())



const roomList: RoomList = new RoomList()

app.get('/', function (req, res) {
    res.send('There is nothing')
})

app.post('/rooms/create', function (req, res) {
    const body = req.body
    const newRoom = roomList.create(body.host)
    res.send(newRoom)
})
  
app.get('/rooms', function (req, res) {
    res.send(roomList)
})

app.get('/rooms/:id', function (req, res) {
    const room = roomList.find(req.params.id)
    res.send(room)
})

app.put('/rooms/:id/queue/add', function (req, res) {
    const body = req.body

    if (!body.uuid || !body.name) {
        res.send({status: 404, message: "Body doesn't include uuid and name"})
        return
    }

    const room = roomList.find(req.params.id)

    if (!(room instanceof Room)) {
        res.send({status: 404, message: "Room ID not found"})
        return
    }

    room.addQueue(new QueuePerson(body.uuid, body.name))

    io.emit(`room${req.params.id}:update`, room);
    res.send({status: 200, message: "Success"})

})


io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});





  
server.listen(port, function () {
    console.log('Starting node.js on port ' + port)
})