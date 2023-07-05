import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw';


export default function WebSocketDemo() {
    //Public API that will echo messages sent to it back to the client
    const [socketUrl, setSocketUrl] = useState('ws://127.0.0.1:7860/queue/join');
    const [messageHistory, setMessageHistory] = useState([]);

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

    useEffect(() => {
        if (lastMessage !== null) {
            const msg = JSON.parse(lastMessage.data || '')['msg'];
            if(msg == 'send_hash'){
                handleSendHash();
            }
            setMessageHistory((prev) => prev.concat(decodeMsg(lastMessage)));
        }
    }, [lastMessage, setMessageHistory]);

    const rdm = 'session' + Math.floor(Math.random()*1000000);

    const handleSendHash = useCallback(
        () => {
            sendMessage(`{"fn_index":0,"session_hash":"${rdm}"}`)
        },
        []
    );
    const handleSendQuery = useCallback(
        () => {
            sendMessage(`{"fn_index":0,"data":["做一个markdown表格，包含班级1个真实姓名的同学的学号、姓名、排名、期末总成绩，按成绩由高到低。",2048,0.7,0.95,null],"event_data":null,"session_hash":"${rdm}"}`)
            // sendMessage(`{"fn_index":0,"data":["做一个markdown表格示例。",2048,0.7,0.95,null],"event_data":null,"session_hash":"${rdm}"}`)

        },
        []
    );

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    function decodeMsg(message: MessageEvent<any>): string{
        if(!message || !message.data) return '';
        const jso = JSON.parse(message.data || '');
        const msg = jso['msg'], output = jso['output'];
        if(!msg || !output) return msg;
        const data = output['data'].reverse();
        for (let index = 0; index < data.length; index++) {
            const elm = data[index];        
            if(!elm) continue;
            const visible = elm['visible'];
            if(visible === true){
                console.log(elm['value']);
                const val = trimHtmlTag(elm['value']);       
                return wrapMarkdown(val);         
                // return msg == 'process_completed' ? wrapMarkdown(val) : wrapText(val);
            }
        }
        return '';
    }
    function trimHtmlTag(val: string): string{
        if(!val) return val;
        return val.split('ChatGLM-6B：').pop().replace(/<[^>]+>/g, '');
    }

    function wrapMarkdown(val: any) {
        return (
          <div className="detailed-content">
            <ReactMarkdown
              children={val} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}
            />
          </div>
        );
      }
      function wrapText(val: any) {
        return (
          <div className="detailed-content">
            <pre>{val}</pre>
          </div>
        );
      }
    const mk = `* Lists\n* [ ] todo\n* [x] done`
    return (
        <div>
            <ReactMarkdown
              children={mk} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}
            />
            <br></br>
            <button onClick={handleSendHash}>
                send hash
            </button><span>&nbsp;</span>
            <button
                onClick={handleSendQuery}
                disabled={readyState !== ReadyState.OPEN}
            >
                send query
            </button>
            <br /><br />
            <span>The WebSocket is currently: {connectionStatus}</span>
            <br /><br />
            {lastMessage ? <div>Last message: {decodeMsg(lastMessage)}</div> : null}
            <br /><br />
        </div>
    );
};