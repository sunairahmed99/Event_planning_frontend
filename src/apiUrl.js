const API_BASE_URL = import.meta.env.MODE === 'production' 
    ? `https://event-planning-backend.vercel.app` 
    : `https://event-planning-backend.vercel.app`;

export default API_BASE_URL;
