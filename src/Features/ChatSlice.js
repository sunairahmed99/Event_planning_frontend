import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '../apiUrl';

const initialState = {
    messages: [],
    loading: false,
    error: null,
};

export const fetchChatHistory = createAsyncThunk(
    'chat/fetchChatHistory',
    async (roomId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/chat/${roomId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat history');
        }
    }
);

export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async (messageData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/user/chat`, messageData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addOptimisticMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        receiveMessage: (state, action) => {
             // Handle duplicate check
             const isDuplicate = state.messages.some(msg => 
                 msg.senderId === action.payload.senderId && 
                 msg.message === action.payload.message &&
                 Math.abs(new Date(msg.timestamp) - new Date(action.payload.timestamp)) < 2000
             );
             if (!isDuplicate) {
                 state.messages.push(action.payload);
             }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChatHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchChatHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(fetchChatHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { addOptimisticMessage, receiveMessage } = chatSlice.actions;
export default chatSlice.reducer;
