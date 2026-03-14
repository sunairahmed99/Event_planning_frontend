import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../../apiUrl';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatHistory, sendMessage, addOptimisticMessage, receiveMessage } from '../../Features/ChatSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import './ChatWidget.css';

const socket = io(API_BASE_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

const ChatWidget = () => {
    const dispatch = useDispatch();
    const { messages: chatHistory, loading } = useSelector((state) => state.chat);
    
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const chatEndRef = useRef(null);
    const navigate = useNavigate();

    const getGuestId = () => {
        let gid = localStorage.getItem('chat_guest_id');
        if (!gid) {
            gid = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chat_guest_id', gid);
        }
        return gid;
    };

    const [roomId, setRoomId] = useState(getGuestId());

    useEffect(() => {
        const uid = user?.id || user?._id;
        if (isAuthenticated && uid) {
            setRoomId(uid);
        } else {
            setRoomId(getGuestId());
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (!isOpen) return;

        socket.emit('join_room', roomId);

        const handleReceiveMessage = (data) => {
            dispatch(receiveMessage(data));
        };

        socket.on('receive_message', handleReceiveMessage);
        
        dispatch(fetchChatHistory(roomId));

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [isOpen, roomId, dispatch]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const trimmedMsg = message.trim();
        if (!trimmedMsg) return;

        const currentUserId = isAuthenticated ? (user?.id || user?._id) : getGuestId();
        const currentUserName = isAuthenticated ? user?.name : 'Guest User';

        if (!roomId || !currentUserId || !trimmedMsg) return;

        const messageData = {
            roomId,
            senderId: currentUserId,
            senderName: currentUserName,
            message: trimmedMsg,
            isAdmin: false,
            timestamp: new Date().toISOString(),
        };

        dispatch(addOptimisticMessage(messageData));
        setMessage('');

        socket.emit('send_message', messageData);
        dispatch(sendMessage(messageData));
    };

    return (
        <div className="chat-widget-container">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-window shadow-lg"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <User size={20} />
                                <span>Support Chat</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="chat-messages">
                            {!isAuthenticated ? (
                                <div className="login-prompt">
                                    <p>Please login first to start chatting with our support team.</p>
                                    <button className="btn-primary" onClick={() => navigate('/auth')}>Login Now</button>
                                </div>
                            ) : (
                                <>
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`message-wrapper ${msg.isAdmin ? 'admin' : 'user'}`}>
                                            <div className="message-bubble">
                                                {msg.message}
                                                <span className="message-time">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </>
                            )}
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder={isAuthenticated ? "Type a message..." : "Please login to chat"}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={!isAuthenticated}
                            />
                            <button type="submit" disabled={!message.trim() || !isAuthenticated}>
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                className="chat-trigger-btn shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </motion.button>

        </div>
    );
};

export default ChatWidget;

