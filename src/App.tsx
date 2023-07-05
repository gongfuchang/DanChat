import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Chat, {
  Bubble,
  MessageProps,
  useMessages,
  QuickReplyItemProps,
  useQuickReplies,
  Card,
  CardTitle,
  CardText,
  List,
  ListItem,
  Flex,
  FlexItem,
  ScrollView,
  ToolbarItemProps,
} from '@chatui/core';
import OrderSelector from './ordderSelector';
import { socket } from './socket';

type MessageWithId = Omit<MessageProps, '_id'>;

const initialMessages: MessageWithId[] = [

  {
    type: 'text',
    content: { text: 'Hi，我是你的专属智能助理小蜜，有问题请随时找我哦~' },
    user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg', name: '小小蜜' },
    createdAt: Date.now(),
    hasTime: true
  }

];

const defaultQuickReplies = [
  {
    icon: 'shopping-bag',
    name: '咨询订单问题（高亮）',
    code: 'orderSelector',
    isHighlight: true,
  },
  {
    icon: 'shopping-bag',
    name: '如何申请退款（高亮）',
    code: 'orderSelector',
    isHighlight: true,
  },
  {
    icon: 'message',
    name: '联系人工服务（高亮+新）',
    code: 'q1',
    isNew: true,
    isHighlight: true,
  }
];

const skillList = [
  { title: '话费充值', desc: '智能充值智能充值' },
  { title: '评价管理', desc: '我的评价' },
  { title: '联系商家', desc: '急速联系' },
  { title: '红包卡券', desc: '使用优惠' },
  { title: '修改地址', desc: '修改地址' },
];

const toolbar = [
  {
    type: 'image',
    icon: 'image',
    title: '发送图片',
  },
  {
    type: 'file',
    icon: 'file',
    title: '发送PDF',
  },
  {
    type: 'keyboard-circle',
    icon: 'keyboard-circle',
    title: '查看示例',
  }

];

export default function App() {
  // 消息列表
  const { messages, appendMsg, updateMsg, setTyping, prependMsgs } = useMessages(initialMessages);
  const { quickReplies, replace } = useQuickReplies(defaultQuickReplies);
  const msgRef = React.useRef(null);

  window.appendMsg = appendMsg;
  window.msgRef = msgRef;

  function wrapMarkdown(val: string) {
    return (
      <div className="detailed-content">
        <ReactMarkdown
          children={val} remarkPlugins={[remarkGfm]}
        />
      </div>
    );
  }

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value: any) {
      setFooEvents(value);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
    };
  }, []);

  function sendSocket(queryStr: string, handler: Function) {
    // //和后端服务建立链接
    // const socket = io('ws://127.0.0.1:7860/queue/join', {
    //   path: '/queue/join'
    // });
    // socket.on("connect", () => {
    //   console.log('connect');
    // });
    // socket.on("data", (data) => {
    //   console.log('data>>' + data);
    // });
    // socket.connect();
    // socket.send('{data:""}');
    // socket.on('send_hash', (data) => {
    //   console.log('send_hash' + data); 
    //   socket.emit('{"fn_index":0,"session_hash":"abcdefg"}');

    // });
    // socket.on('estimation', (data) => {
    //   console.log(data); 
    // });
    // socket.on('send_data', (data) => {
    //   console.log('send_data>>' + data);
    //   socket.emit(`{"fn_index":0,"data":["${queryStr}",2048,0.7,0.95,null],"event_data":null,"session_hash":"abcdefg"}`);
    // });
    // socket.on('process_generating', (data) => {
    //   console.log('process_generating>>' + data); 
    // });
    // socket.on('process_completed', (data) => {
    //   console.log('process_completed>>' + data); 
    // });

  }
  // 发送回调
  function handleSend(type: string, val: string) {
    if (type === 'text' && val.trim()) {
      // TODO: 发送请求
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
      });

      setTimeout(() => {
        setTyping(true);
      }, 1);

      // // 模拟回复消息
      // setTimeout(() => {
      //   appendMsg({
      //     type: 'text',
      //     content: { text: wrapMarkdown('亲，您遇到什么问题啦？请简要描述您的问题~**这是加粗的文字**') },
      //   });
      // }, 1000);
      sendSocket(val, updateMsg);
    }
  }

  // 快捷短语回调，可根据 item 数据做出不同的操作，这里以发送文本消息为例
  function handleQuickReplyClick(item: QuickReplyItemProps) {
    handleSend('text', item.name);
    //TODO

  }

  function handleToolbarClick(item: ToolbarItemProps) {
    if (item.type === 'orderSelector') {
      appendMsg({
        type: 'order-selector',
        content: {},
      });
    }
  }

  function renderMessageContent(msg: MessageProps) {
    const { type, content } = msg;

    // 根据消息类型来渲染
    switch (type) {
      case 'text':
        return <Bubble content={content.text} />;
      case 'guess-you':
        return (
          <Card fluid>
            <Flex>
              <div className="guess-you-aside">
                <h1>猜你想问</h1>
              </div>
              <FlexItem>
                <List>
                  <ListItem content="我的红包退款去哪里?" as="a" rightIcon="chevron-right" />
                  <ListItem content="我的红包退款去哪里?" as="a" rightIcon="chevron-right" />
                  <ListItem content="如何修改评价?" as="a" rightIcon="chevron-right" />
                  <ListItem content="物流问题咨询" as="a" rightIcon="chevron-right" />
                </List>
              </FlexItem>
            </Flex>
          </Card>
        );
      case 'skill-cards':
        return (
          <ScrollView
            className="skill-cards"
            data={skillList}
            fullWidth
            renderItem={(item) => (
              <Card>
                <CardTitle>{item.title}</CardTitle>
                <CardText>{item.desc}</CardText>
              </Card>
            )}
          />
        );
      case 'order-selector':
        return <OrderSelector />;
      case 'image':
        return (
          <Bubble type="image">
            <img src={content.picUrl} alt="" />
          </Bubble>
        );
      default:
        return null;
    }
  }

  return (
    <div style={{ height: 'calc(100vh - 48px)', marginTop: '-12px' }}>
      <Chat
        navbar={{
          rightContent: [
            {
              icon: 'setting',
              title: 'Applications',
            }
          ],
          title: 'KittyGPT 智能助理',
        }}
        rightAction={{ icon: 'compass' }}
        toolbar={toolbar}
        messagesRef={msgRef}
        onToolbarClick={handleToolbarClick}
        recorder={{ canRecord: true }}
        wideBreakpoint="600px"
        messages={messages}
        renderMessageContent={renderMessageContent}
        quickReplies={quickReplies}
        onQuickReplyClick={handleQuickReplyClick}
        onSend={handleSend}
        onImageSend={() => Promise.resolve()}
      />
    </div>
  );
};
