import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import API_BASE_URL from '../apiUrl';

const initialState = {
    reviews: [],
    loading: false,
    error: null,
};

export const fetchReviews = createAsyncThunk(
    'reviews/fetchReviews',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/reviews`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
        }
    }
);

export const addReview = createAsyncThunk(
    'reviews/addReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/user/reviews`, reviewData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add review');
        }
    }
);

const reviewSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        clearReviewError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload.data;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addReview.fulfilled, (state, action) => {
                state.reviews.unshift(action.payload.data);
            });
    },
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
