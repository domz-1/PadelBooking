import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class SocketService {
    private socket: Socket | null = null;

    connect(userId?: number) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            transports: ["websocket"],
        });

        this.socket.on("connect", () => {
            console.log("Connected to Real-time server");
            if (userId) {
                this.socket?.emit("join", userId);
            }
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from Real-time server");
        });
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
