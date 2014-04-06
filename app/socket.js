module.exports = function(app, io) {

	io.sockets.on('connection', function(socket) {
		socket.on('message', function(message) {
			socket.broadcast.to(socket.room).emit('message', message);
		});
		socket.on('filter', function(message) {
			socket.broadcast.to(socket.room).emit('filter', message);
		});
		socket.on('quitting', function() {
			if (socket.room == null) {
				socket.leave(socket.room);
			}
			socket.broadcast.to(socket.room).emit('quitting');
		});
		socket.on('joinRoom', function(data) {
			socket.join(data.room);
			socket.room = data.room;
			socket.broadcast.to(socket.room).emit('joinedRoom', data.myID)
		});
		socket.on('joinedRoom', function(myID) {
			socket.broadcast.to(socket.room).emit('joinedRoomReturn', myID)
		})
	});
};