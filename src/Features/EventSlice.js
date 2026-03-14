import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '../apiUrl';

const initialState = {
    events: [],
    categories: [],
    loading: false,
    error: null,
};

export const fetchEventsData = createAsyncThunk(
    'events/fetchEventsData',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('eventify_token');
            const [eventsRes, categoriesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/events`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/admin/categories`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            return {
                events: eventsRes.data.data,
                categories: categoriesRes.data.data
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch events data');
        }
    }
);

export const saveEvent = createAsyncThunk(
    'events/saveEvent',
    async ({ type, data, id }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('eventify_token');
            const url = type === 'add'
                ? `${API_BASE_URL}/admin/events`
                : `${API_BASE_URL}/admin/events/${id}`;
            const method = type === 'add' ? 'post' : 'put';

            const response = await axios({
                method,
                url,
                data,
                headers: { 
                    Authorization: `Bearer ${token}`
                    // 'Content-Type': 'multipart/form-data' // Axios does this automatically for FormData
                }
            });
            return { type, data: response.data.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to save event');
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'events/deleteEvent',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('eventify_token');
            await axios.delete(`${API_BASE_URL}/admin/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete event');
        }
    }
);

const eventSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEventsData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchEventsData.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload.events;
                state.categories = action.payload.categories;
            })
            .addCase(fetchEventsData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(saveEvent.fulfilled, (state, action) => {
                if (action.payload.type === 'add') {
                    state.events.unshift(action.payload.data);
                } else {
                    const index = state.events.findIndex(e => e._id === action.payload.data._id);
                    if (index !== -1) {
                        state.events[index] = action.payload.data;
                    }
                }
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.events = state.events.filter(e => e._id !== action.payload);
            });
    },
});

export default eventSlice.reducer;
