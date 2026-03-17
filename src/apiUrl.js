const API_BASE_URL = import.meta.env.MODE === 'production' 
    ? `https://event-planning-backend.vercel.app` 
    : `http://localhost:9000`;

export default API_BASE_URL;
