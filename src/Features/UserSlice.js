import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '../apiUrl';

const initialState = {
    users: [],
    loading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        pages: 1
    }
};

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (params, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('eventify_token');
            const response = await axios.get(`${API_BASE_URL}/admin/users`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const toggleUserStatus = createAsyncThunk(
    'users/toggleUserStatus',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('eventify_token');
            const response = await axios.patch(`${API_BASE_URL}/admin/users/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { id, active: response.data.data.active };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle status');
        }
    }
);

export const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearUserError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(toggleUserStatus.fulfilled, (state, action) => {
                const user = state.users.find(u => u._id === action.payload.id);
                if (user) {
                    user.active = action.payload.active;
                }
            });
    },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;