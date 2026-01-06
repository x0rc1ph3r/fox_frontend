import axios from "axios";
import { API_URL } from "../src/constants";

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        "Content-Type": "application/json",
        'ngrok-skip-browser-warning': 'true',
    }
})
