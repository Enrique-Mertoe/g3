import React, {FormEvent, useCallback, useState} from "react";
import OffCanvas from "./OffCanvas.tsx";
import GIcon from "../components/Icons.tsx";
import request from "../../build/request.ts";
import Config from "../../assets/config.ts";

type RouterForm = {
    routerName: string;
    location: string;
    ip: string;
    username: string;
    password: string;
};

export default function AddMikrotik() {
    // const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // const togglePassword = () => setShowPassword(!showPassword);
    const [form, setForm] = useState<RouterForm>({
        routerName: "",
        location: "",
        ip: "",
        username: "",
        password: ""
    });
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    const onSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMsg('')
        try {
            setLoading(true)
            const formData = new FormData();
            formData.append("name", form.routerName);
            formData.append("location", form.location);
            formData.append("ip", form.ip);
            formData.append("username", form.username);
            formData.append("password", form.password);
            const response = await request.post(Config.baseURL + "/api/routers/create/", formData);
            setLoading(false)

            if (response.status === 201) {
                setMsg("Router added successfully!");
                setForm({
                    routerName: "",
                    location: "",
                    ip: "",
                    username: "",
                    password: ""
                });
            }
        } catch (err: any) {
            setLoading(false)
            const errMsg =
                err.response?.data?.error ||
                err.message ||
                "Failed to save router.";
            setMsg(errMsg);
        }
    }, [form]);

    return (
        <>
            <OffCanvas
                id="drawer-link-mikrotik"
            >
                <div className="offcanvas-header border-bottom py-5 bg-surface-secondary">
                    <h3 className="text-lg font-semibold">Add Mikrotik Router Details</h3>
                    <button type="button" className="btn-close text-reset text-xs" data-bs-dismiss="offcanvas"
                            aria-label="Close"></button>
                </div>
                <div className="offcanvas-body vstack gap-5">
                    <div className="py-4">

                        <p className="text-sm text-gray-500 dark:text-gray-200">Enter the router information below to register a new
                            Mikrotik device.</p>
                        <form className="mt-4 space-y-4"
                              onSubmit={onSubmit}
                        >
                            {/* Router Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Router Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    onChange={handleChange}
                                    type="text"
                                    name={"routerName"}
                                    value={form.routerName}
                                    placeholder="Router name"
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">Location</label>
                                <input
                                    name={"location"}
                                    value={form.location}
                                    type="text"
                                    onChange={handleChange}
                                    placeholder="e.g. Office, Main Branch"
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Router IP */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Router IP <span className="text-red-500">*</span>
                                </label>
                                <input
                                    onChange={handleChange}
                                    type="text"
                                    name={"ip"}
                                    value={form.ip}
                                    placeholder="e.g. 192.168.88.1"
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Router Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Router Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    onChange={handleChange}
                                    value={form.username}
                                    name={"username"}
                                    type="text"
                                    placeholder="e.g. admin"
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Router Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Router Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    onChange={handleChange}
                                    type="password"
                                    value={form.password}
                                    name={"password"}
                                    placeholder="Password"
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            {
                                msg && <span className="text-red-500 text-sm">{msg}</span>
                            }
                            {/* Buttons */}
                            <div className="flex justify-between pt-2">
                                <button
                                    type="submit"
                                    className="inline-flex gap-2 items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                >
                                    Save
                                    {loading && <GIcon name={"g-loader"} color={"fill-amber-500"}/>}
                                </button>
                                <button
                                    data-bs-dismiss={"offcanvas"}
                                    type="button"
                                    className="inline-flex items-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                    {/*            <div className="py-4">*/}
                    {/*                <h3 className="text-xl font-semibold">Create User</h3>*/}
                    {/*                <p className="text-gray-500">Create a new user by filling out the form below.</p>*/}
                    {/*                <form className="mt-4 space-y-4">*/}
                    {/*                    /!* Type *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">*/}
                    {/*                            Type <span className="text-red-600">*</span>*/}
                    {/*                        </label>*/}
                    {/*                        <select*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">*/}
                    {/*                            <option value="">Select an option</option>*/}
                    {/*                            <option>PPOE</option>*/}
                    {/*                            <option>Hotspot</option>*/}
                    {/*                        </select>*/}
                    {/*                    </div>*/}

                    {/*                    /!* First Name *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">First Name</label>*/}
                    {/*                        <input*/}
                    {/*                            type="text"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="First name"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Last Name *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">Last Name</label>*/}
                    {/*                        <input*/}
                    {/*                            type="text"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="Last name"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Username *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">*/}
                    {/*                            Username <span className="text-red-600">*</span>*/}
                    {/*                        </label>*/}
                    {/*                        <input*/}
                    {/*                            type="text"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="Username"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Password *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">*/}
                    {/*                            Password <span className="text-red-600">*</span>*/}
                    {/*                        </label>*/}
                    {/*                        <div className="flex rounded-md shadow-sm mt-1">*/}
                    {/*                            <input*/}
                    {/*                                type={showPassword ? 'text' : 'password'}*/}
                    {/*                                className="flex-1 block w-full rounded-l-md border border-gray-300 dark:border-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                                placeholder="Enter password"*/}
                    {/*                            />*/}
                    {/*                            <button*/}
                    {/*                                type="button"*/}
                    {/*                                onClick={togglePassword}*/}
                    {/*                                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 dark:border-gray-100 rounded-r-md text-sm text-gray-700 dark:text-white hover:bg-gray-200"*/}
                    {/*                            >*/}
                    {/*                                {showPassword ? 'Hide' : 'Show'}*/}
                    {/*                            </button>*/}
                    {/*                        </div>*/}
                    {/*                    </div>*/}

                    {/*                    /!* Package *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">*/}
                    {/*                            Package <span className="text-red-600">*</span>*/}
                    {/*                        </label>*/}
                    {/*                        <div className="flex items-center gap-2 mt-1">*/}
                    {/*                            <select*/}
                    {/*                                className="block w-full rounded-md border-gray-300 dark:border-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">*/}
                    {/*                                <option value="">Select an option</option>*/}
                    {/*                                <option>Basic</option>*/}
                    {/*                                <option>Premium</option>*/}
                    {/*                            </select>*/}
                    {/*                            <button*/}
                    {/*                                type="button"*/}
                    {/*                                className="p-2 rounded-md border border-gray-300 dark:border-gray-100 hover:bg-gray-100"*/}
                    {/*                            >*/}
                    {/*                                <i className="bi bi-plus-lg"></i>*/}
                    {/*                            </button>*/}
                    {/*                        </div>*/}
                    {/*                        <small className="text-gray-500 block mt-1">*/}
                    {/*                            If the package is not available, create a new one by clicking the plus icon*/}
                    {/*                        </small>*/}
                    {/*                    </div>*/}

                    {/*                    /!* Expiry Date *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">Expiry Date</label>*/}
                    {/*                        <div className="flex items-center rounded-md shadow-sm mt-1">*/}
                    {/*<span*/}
                    {/*    className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-100 bg-gray-50 text-gray-500 text-sm">*/}
                    {/*  <i className="bi bi-calendar"></i>*/}
                    {/*</span>*/}
                    {/*                            <input*/}
                    {/*                                type="text"*/}
                    {/*                                className="flex-1 block w-full rounded-r-md border-gray-300 dark:border-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                                placeholder="mm/dd/yyyy, --:--:-- --"*/}
                    {/*                            />*/}
                    {/*                        </div>*/}
                    {/*                        <small className="text-gray-500 block mt-1">*/}
                    {/*                            The date the package for this user will expire*/}
                    {/*                        </small>*/}
                    {/*                    </div>*/}

                    {/*                    /!* Phone Number *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">Phone Number</label>*/}
                    {/*                        <input*/}
                    {/*                            type="text"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="e.g. +254712345678"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Email *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">Email Address</label>*/}
                    {/*                        <input*/}
                    {/*                            type="email"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="you@example.com"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Address *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">Address</label>*/}
                    {/*                        <input*/}
                    {/*                            type="text"*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="123 Main St, City, Country"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Comment *!/*/}
                    {/*                    <div>*/}
                    {/*                        <label className="block text-sm font-medium text-gray-700 dark:text-white">Comment</label>*/}
                    {/*                        <textarea*/}
                    {/*                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"*/}
                    {/*                            placeholder="Optional comment"*/}
                    {/*                        />*/}
                    {/*                    </div>*/}

                    {/*                    /!* Buttons *!/*/}
                    {/*                    <div className="flex justify-between pt-4">*/}
                    {/*                        <button*/}
                    {/*                            type="submit"*/}
                    {/*                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"*/}
                    {/*                        >*/}
                    {/*                            Create User*/}
                    {/*                        </button>*/}
                    {/*                        <button*/}
                    {/*                            type="button"*/}
                    {/*                            data-bs-dismiss="offcanvas"*/}
                    {/*                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"*/}
                    {/*                        >*/}
                    {/*                            Cancel*/}
                    {/*                        </button>*/}
                    {/*                    </div>*/}
                    {/*                </form>*/}
                    {/*            </div>*/}
                </div>
            </OffCanvas>

        </>
    )
}