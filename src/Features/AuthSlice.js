import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '../apiUrl';

const initialState = {
    user: JSON.parse(localStorage.getItem('eventify_user')) || null,
    isAuthenticated: !!localStorage.getItem('eventify_user'),
    loading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/user/login`, credentials);
            if (res.data.success) {
                const userInfo = {
                    id: res.data.data.id,
                    name: res.data.data.name,
                    email: res.data.data.email,
                    phone: res.data.data.phone,
                    role: res.data.data.role || 'user',
                    image: res.data.data.image || null,
                    isGoogleUser: res.data.data.isGoogleUser || false
                };
                localStorage.setItem('eventify_user', JSON.stringify(userInfo));
                localStorage.setItem('eventify_token', res.data.token);
                return userInfo;
            }
            return rejectWithValue(res.data.message || 'Login failed');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Something went wrong');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/user/register`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                return res.data;
            }
            return rejectWithValue(res.data.message || 'Registration failed');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Something went wrong');
        }
    }
);

export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async (data, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/user/verify`, data);
            if (res.data.success) {
                return res.data;
            }
            return rejectWithValue(res.data.message || 'Verification failed');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Something went wrong');
        }
    }
);

export const fetchMe = createAsyncThunk(
    'auth/fetchMe',
    async (token, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const userInfo = {
                    id: res.data.data.id,
                    name: res.data.data.name,
                    email: res.data.data.email,
                    phone: res.data.data.phone,
                    role: res.data.data.role || 'user',
                    image: res.data.data.image || null,
                    isGoogleUser: res.data.data.isGoogleUser || false
                };
                localStorage.setItem('eventify_user', JSON.stringify(userInfo));
                localStorage.setItem('eventify_token', token);
                return userInfo;
            }
            return rejectWithValue(res.data.message || 'Failed to fetch user');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Something went wrong');
        }
    }
);


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('eventify_user');
            localStorage.removeItem('eventify_token');
        },
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            localStorage.setItem('eventify_user', JSON.stringify(action.payload));
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMe.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchMe.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(verifyEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
