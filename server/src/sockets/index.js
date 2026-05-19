module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Authentication and joining rooms can be handled here
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
