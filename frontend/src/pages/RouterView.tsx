import Layout from "./home-components/Layout.tsx";
import {useEffect, useState} from "react";
import request from "../build/request.ts";
import Config from "../assets/config.ts";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js';
import {useParams} from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


export default function RouterView() {
    const [data, setDashData] = useState<DashResponse | null>(null);
    const [err, setErr] = useState('');
    const {pk} = useParams()

    useEffect(() => {
        request.post(Config.baseURL + `/mikrotiks/${pk}/`)
            .then(res => {
                const data = res.data as DashResponse;
                setDashData(data);
            })
            .catch(err => {
                setErr(err.response?.data?.error || err?.message || "Something went wromg")
                console.error(err);
            });
    }, []);
    return (
        <>
            <Layout>
                {data ?
                    err ? <>
                        error
                    </> : <>
                    </> :
                    <>
                        <div role="status" className="max-w-sm animate-pulse">
                            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
                            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
                            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                            <span className="sr-only">Loading...</span>
                        </div>
                        <div role="status" className="space-y-2.5 mt-20 animate-pulse max-w-lg">
                            <div className="flex items-center w-full">
                                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32"></div>
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                            </div>
                            <div className="flex items-center w-full max-w-[480px]">
                                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
                            </div>
                            <div className="flex items-center w-full max-w-[400px]">
                                <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                                <div className="h-2.5 ms-2 bg-gray-200 rounded-full dark:bg-gray-700 w-80"></div>
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                            </div>
                            <div className="flex items-center w-full max-w-[480px]">
                                <div className="h-2.5 ms-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
                            </div>
                            <div className="flex items-center w-full max-w-[440px]">
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-32"></div>
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
                                <div className="h-2.5 ms-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
                            </div>
                            <div className="flex items-center w-full max-w-[360px]">
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                                <div className="h-2.5 ms-2 bg-gray-200 rounded-full dark:bg-gray-700 w-80"></div>
                                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                            </div>
                            <span className="sr-only">Loading...</span>
                        </div>
                    </>
                }
            </Layout>
        </>
    )
}

