import io from 'socket.io-client';


export const initializeSocket = () => {
    const storedSocketId = localStorage.getItem('socketId');
    console.log(storedSocketId)
    const socket = io('http://localhost:8900', {
        query: { socketId: storedSocketId }
    });

    // Save socketId to localStorage on successful connection
    socket.on('connect', () => {
        sessionStorage.setItem('socketId', socket.id);
    });

    return socket;
};

