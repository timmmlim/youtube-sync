const express = require("express")()
const http = require("http").Server(express)
const io = require("socket.io")(http)

var state = {
    video_id: '',
    isPlaying: false,
    currTime: 0
}

var count = 0

io.on("connection", socket => {
    count += 1
    console.log("current count: " + count)
    socket.emit("state", state)
    io.emit("count", count)

    // handle disconnect 
    socket.on("disconnect", socket => {
        count -= 1
        console.log("current count: " + count)
        io.emit("count", count)
    })

    // send play and pause to all players 
    socket.on("update video state", playbackStatus => {
        switch(playbackStatus) {
            case "play": 
                state.isPlaying = true
                io.emit("state", state)
                break
            case "pause":
                state.isPlaying = false
                io.emit("state", state)
                break
        }
    })

    // send video id to all players 
    socket.on("update video id", video_id => {
        state.video_id = video_id
        io.emit("state", state)
    })

    // receive playback time from player
    socket.on("update video time", newTime => {
        state.currTime = newTime
        io.emit("state", state)
    })

    // periodically receive state from sockets.  
    setInterval(function () {
        io.emit("get current state")}, 60)
    
    socket.on("receive current state", data => {
        state = data
        console.log(state)
    })
})

http.listen(process.env.PORT || 3000)