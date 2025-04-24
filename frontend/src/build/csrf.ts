// csrf.js

import {getCookie} from "../hooks/useCrf.ts";
import request from "./request.ts";
import Config from "../assets/config.ts";

export async function initializeCsrfToken() {
    try {
        await request.get(Config.baseURL + '/api/csrf/');
        request.defaults.headers['X-CSRFToken'] = getCookie('csrftoken');
    } catch (error) {
        console.error('Failed to initialize CSRF token', error);
    }
}
