import useWebSocket, { ReadyState } from 'react-use-websocket';

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'ws://127.0.0.1:7860/queue/join';

const { sendMessage, lastMessage, readyState } = useWebSocket(URL);