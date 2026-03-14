import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '../apiUrl';

const initialState = {
    consultations: [],
    loading: false,
    error: null,
};

export const fetchConsultations = createAsyncThunk(
    'consultations/fetchConsultations',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('eventify_token');
            const response = await axios.get(`${API_BASE_URL}/admin/consultations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch consultations');
        }
    }
);

const consultationSlice = createSlice({
    name: 'consultations',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchConsultations.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConsultations.fulfilled, (state, action) => {
                state.loading = false;
                state.consultations = action.payload;
            })
            .addCase(fetchConsultations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default consultationSlice.reducer;
