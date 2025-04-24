import {useState} from "react";
import Config from "../assets/config.ts";
import request from "../build/request.ts";

type SignInData = {
    email: string;
    password: string;
};

type SignInResponse = FetchResponse<object> & {};

export const useSignIn = () => {
    const [loading,] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signIn = async ({email, password}: SignInData): Promise<SignInResponse> => {
        setError(null);
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            const response = await request.post(Config.authUrl, formData);
            return response.data;
        } catch (err: any) {
            const errMsg =
                err.response?.data?.error ||
                err.message ||
                'An unexpected error occurred';

            return {ok: false, error: [errMsg]};
        }
    };
    const exists = async (email: string): Promise<SignInResponse> => {
        setError(null);
        try {
            const formData = new FormData();
            formData.append('email', email);
            const response = await request.post("/auth/validate/", formData);
            return response.data;
        } catch (err: any) {
            const errMsg =
                err.response?.data?.error ||
                err.message ||
                'An unexpected error occurred';

            return {ok: false, error: [errMsg]};
        }
    };
    const createUser = async (formData: FormData): Promise<SignInResponse> => {
        setError(null);
        try {
            const response = await request.post('/auth/register/', formData);
            return response.data;
        } catch (err: any) {
            const errMsg =
                err.response?.data?.error ||
                err.message ||
                'An unexpected error occurred';

            return {ok: false, error: [errMsg]};
        }
    };
    return {signIn, exists, createUser, loading, error};
};