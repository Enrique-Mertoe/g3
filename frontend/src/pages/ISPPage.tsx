import Layout from "./home-components/Layout.tsx";
import React, {useEffect, useState} from "react";
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
import {getCookie} from "../hooks/useCrf.ts";
import GIcon from "../ui/components/Icons.tsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


export default function ISPPage() {
    const [data, setDashData] = useState<CompanyInfo>({
        address: "", email: "", name: "", phone: ""
    });
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        request.get(Config.baseURL + "/isp/?api=1")
            .then(res => {
                const data = res.data as { company: CompanyInfo };
                setDashData(data.company);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);
    const csrf = getCookie("csrftoken")
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        setDashData((prev) => ({...prev, [name]: value}));
    };

    function submit(formData: FormData) {
        setLoading(true)
        request.post(Config.baseURL + "/isp/", formData)
            .then(res => {
                setLoading(false);
                if (res.status == 201)
                    alert("Info updated successfully")
                // const data = res.data as { company: CompanyInfo };
                // setDashData(data.company);
            })
            .catch(err => {
                setLoading(false);
                console.error(err);
            });
    }

    return (
        <>
            <Layout>
                {
                    data !== null ?

                        <div className="p-4 sm:p-8">


                            <h2 className="font-semibold text-xl text-gray-800 leading-tight border-b-2 border-slate-100 pb-4">
                                Company Information
                            </h2>

                            <form method="post"
                                  onSubmit={e => {
                                      e.preventDefault()
                                      submit(new FormData(e.target as HTMLFormElement))
                                  }}
                                  className="mt-6 space-y-6">
                                {csrf != null ?
                                    <input type="hidden" name="_token" value={csrf}/>
                                    : ''}
                                <input
                                    type="hidden" name="_method" value="patch"/>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">ISP</h2>
                                        <p className="mt-1 text-sm text-gray-600">Update your company information.</p>
                                    </div>

                                    <div>
                                        <div>
                                            <label className="block font-medium text-sm text-gray-700 mt-4"
                                                   htmlFor="name">
                                                ISP name <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                id="name" name="name" type="text"
                                                value={data.name}
                                                placeholder="Tech Solutions"
                                                required/>
                                        </div>

                                        <div>
                                            <label className="block font-medium text-sm text-gray-700 mt-4"
                                                   htmlFor="address">
                                                Address <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                id="address" name="address"
                                                value={data.address}
                                                type="text" placeholder="1234 Tech Avenue"
                                                required/>
                                        </div>

                                        <div>
                                            <label className="block font-medium text-sm text-gray-700 mt-4"
                                                   htmlFor="email">
                                                Email address <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                id="email" name="email"
                                                value={data.email}
                                                type="text" placeholder="info@yourcompany.com"
                                                required/>
                                        </div>

                                        <div>
                                            <label className="block font-medium text-sm text-gray-700 mt-4"
                                                   htmlFor="phone">
                                                Phone number <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                id="phone" name="phone"
                                                value={data.phone}
                                                type="text" placeholder="+254 700000000"
                                                required/>
                                        </div>

                                        <div className="flex items-center gap-4 mt-4">
                                            <button type="submit"
                                                    className="inline-flex gap-2 cursor-pointer items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700  active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                                Save
                                                {loading && <GIcon name={"g-loader"} color={"fill-amber-500"}/>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        :
                        <>

                            <div role="status" className="max-w-sm animate-pulse">
                                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                                <div
                                    className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                                <div
                                    className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
                                <div
                                    className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                                <span className="sr-only">Loading...</span>
                            </div>


                            <div role="status" className="w-full mt-10 animate-pulse">
                                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                                <div
                                    className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                                <div
                                    className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
                                <div
                                    className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                                <span className="sr-only">Loading...</span>
                            </div>


                        </>
                }
            </Layout>
        </>
    )
}