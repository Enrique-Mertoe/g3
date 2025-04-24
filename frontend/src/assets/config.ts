const Config = {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    authUrl: "/login",
    mode: import.meta.env.MODE,
    appName: import.meta.env.VITE_APP_NAME || 'MyApp',
    isDev: import.meta.env.MODE === 'development',
    isProd: import.meta.env.MODE === 'production',
};

export default Config;
