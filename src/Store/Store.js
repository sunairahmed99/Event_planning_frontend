import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from '../Features/CategorySlice';
import userReducer from '../Features/UserSlice';
import reviewReducer from '../Features/ReviewSlice';
import chatReducer from '../Features/ChatSlice';
import consultationReducer from '../Features/ConsultationSlice';
import eventReducer from '../Features/EventSlice';
import authReducer from '../Features/AuthSlice';
import dashboardReducer from '../Features/DashboardSlice';

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
    users: userReducer,
    reviews: reviewReducer,
    chat: chatReducer,
    consultations: consultationReducer,
    events: eventReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
  },
});