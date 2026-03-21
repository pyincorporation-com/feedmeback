class WebSocketService {
  private socket: WebSocket | null = null;

  connect(questionId: string, token: string) {
    let API_URL: string;

    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      API_URL = `${protocol}://api.feedmeback.cloud`;
    } else {
      API_URL = `ws://api.feedmeback.cloud`;
    }

    const url = `${API_URL}/ws/question/${questionId}/?token=${token}`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message received:", data);
      } catch (err) {
        console.error("Invalid JSON:", event.data);
      }
    };

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(type: string, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...data }));
    }
  }
}

export default new WebSocketService();
