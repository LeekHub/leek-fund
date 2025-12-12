import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button, Input, Tooltip } from 'antd';
import { SendOutlined, MinusOutlined, PlusOutlined, CloseOutlined, SettingOutlined, RobotOutlined } from '@ant-design/icons';
import { postMessage } from '@/utils/common';

const { TextArea } = Input;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  onConfigClick: () => void;
}

export interface AIChatRef {
  open: () => void;
  analyze: (prompt: string) => void;
}

const AIChat = forwardRef<AIChatRef, AIChatProps>(({ onConfigClick }, ref) => {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '您好！我是AI投资助手，可以帮您分析市场行情、解读新闻快讯。有什么可以帮您的吗？'
  }]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: -1, y: 80 }); // -1 means use CSS default (right: 20px)
  const toggleRef = useRef<HTMLElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true);
      setMinimized(false);
    },
    analyze: (prompt: string) => {
      setVisible(true);
      setMinimized(false);
      handleSend(prompt);
    }
  }));

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.command === 'aiResponse') {
        setMessages(prev => [...prev, { role: 'assistant', content: msg.data }]);
        setLoading(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSend = (content: string = inputValue) => {
    if (!content.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content }]);
    setInputValue('');
    setLoading(true);
    
    postMessage('sendAIMessage', content);
  };

  const startDrag = (e: React.MouseEvent, targetRef: React.RefObject<HTMLElement>) => {
    if (maximized) return;
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startDrag(e, containerRef);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const renderMessage = (msg: Message, index: number) => {
    if (msg.role === 'assistant') {
      let html = msg.content;
      if ((window as any).marked) {
        try {
          html = (window as any).marked.parse(msg.content);
          if ((window as any).DOMPurify) {
            html = (window as any).DOMPurify.sanitize(html);
          }
        } catch (e) {
          console.error('Markdown parse error', e);
        }
      }
      return (
        <div 
          key={index} 
          className={`message ${msg.role} markdown`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return <div key={index} className={`message ${msg.role}`}>{msg.content}</div>;
  };

  if (!visible) {
    return (
      <div
        ref={toggleRef as any}
        className="ai-chat-toggle"
        style={{
          position: 'fixed',
          top: position.y,
          left: position.x !== -1 ? position.x : undefined,
          right: position.x === -1 ? 20 : undefined,
          cursor: 'move'
        }}
        onMouseDown={(e) => startDrag(e, toggleRef)}
        onClick={(e) => {
          const moveX = Math.abs(e.clientX - dragStartPos.current.x);
          const moveY = Math.abs(e.clientY - dragStartPos.current.y);
          if (moveX < 5 && moveY < 5) {
            setVisible(true);
          }
        }}
      >
        <RobotOutlined />
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    ...(maximized ? {
      width: '80vw',
      height: '80vh',
      top: '10vh',
      left: '10vw',
      transform: 'none'
    } : {
      top: position.y,
      left: position.x !== -1 ? position.x : undefined,
      right: position.x === -1 ? 20 : undefined,
    })
  };

  return (
    <div 
      ref={containerRef}
      className={`ai-chat-container ${minimized ? 'minimized' : ''}`}
      style={containerStyle}
    >
      <div 
        className="ai-chat-header"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setMaximized(!maximized)}
      >
        <div className="ai-chat-title">AI 投资助手</div>
        <div className="ai-chat-controls">
          <Tooltip title="配置">
            <button onClick={onConfigClick}><SettingOutlined /></button>
          </Tooltip>
          <Tooltip title="最小化">
            <button onClick={() => setMinimized(!minimized)}><MinusOutlined /></button>
          </Tooltip>
          <Tooltip title="最大化">
            <button onClick={() => setMaximized(!maximized)}><PlusOutlined /></button>
          </Tooltip>
          <Tooltip title="关闭">
            <button onClick={() => setVisible(false)}><CloseOutlined /></button>
          </Tooltip>
        </div>
      </div>

      <div className="ai-chat-messages">
        {messages.map(renderMessage)}
        {loading && (
          <div className="message assistant">
            <div className="typing-indicator">AI正在思考...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input">
        <div className="input-row">
          <TextArea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={e => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入您的问题..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={loading}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={() => handleSend()}
            loading={loading}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
});

export default AIChat;
