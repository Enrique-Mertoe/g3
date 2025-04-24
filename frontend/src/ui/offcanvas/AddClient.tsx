import {FormEvent, useCallback, useState, useEffect} from "react";
import OffCanvas from "./OffCanvas";
import request, {$} from "../../build/request.ts";
import GIcon from "../components/Icons.tsx";
// import bootstrap from "bootstrap";

export default function AddClient() {
    const [showPassword, setShowPassword] = useState(true);
    const [loading, setLoading] = useState(false);
    const [packages, setPackages] = useState<NetPackage[]>([]);
    const [msg, setMsg] = useState('');
    const fetchPackages = async () => {
        try {
            const response = await request.post("/api/pkgs/");
            if (response.data.pkgs) {
                console.log(response.data.pkgs);
                setPackages(response.data.pkgs);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
        }
    };
    useEffect(() => {

        fetchPackages().then();
    }, []);

    const validate = (obj: Record<string, unknown>) => {
        for (const e in obj) {
            if (!obj[e]) return false
        }
        return true
    }

    const onSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {

            const formData = new FormData(e.target as HTMLFormElement);

            // Create the client data object
            const clientData = {
                user_type: formData.get('user_type'),
                full_name: formData.get('full_name'),
                username: formData.get('username'),
                password: formData.get('password'),
                package: formData.get('package'),
                expiry_date: formData.get('expiry-date'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                address: formData.get('address'),
                comment: formData.get('comment') || `${formData.get('user_type')} client`
            };
            if (!validate(clientData))
                return setMsg("All fields required");
            setLoading(true);
            $.post<object>({
                url: "/api/user/create/",
                data: clientData
            }).done(() => {
                setLoading(false);
            }).then(() => {
                setMsg("Client added successfully!");
                (e.target as HTMLFormElement).reset();
            }).catch(err => {
                setMsg(err.message)
            })

            // const response = await request.post("/api/user/create/", clientData);
            // setLoading(false);
            //
            // if (response.status === 201) {
            //     alert("Client added successfully!");
            //     // Close the offcanvas
            //     // const offcanvas = document.getElementById('drawer-add-package');
            //     // if (offcanvas) {
            //     //     const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
            //     //     if (bsOffcanvas) {
            //     //         bsOffcanvas.hide();
            //     //     }
            //     // }
            //     // Reset the form
            //     (e.target as HTMLFormElement).reset();
            // } else if (response.data.error) {
            //     alert(response.data.error);
            // }
        } catch (error: any) {
            const msg = error?.response?.data?.error | error?.essage || "Failed to create client.";
            setLoading(false);
            alert(msg);
        }
    }, []);
    const togglePassword = () => setShowPassword(!showPassword);
    return (
        <>
            <OffCanvas
                id="drawer-add-package"
            >
                <div className="offcanvas-header border-bottom py-5 bg-surface-secondary">
                    <h3 className="text-xl font-semibold">Create User</h3>
                    <button type="button" className="btn-close text-reset text-xs" data-bs-dismiss="offcanvas"
                            aria-label="Close"></button>
                </div>
                <div className="offcanvas-body vstack gap-5">
                    <div className="pb-4">
                        <p className="text-gray-500">Create a new user by filling out the form below.</p>
                        <form className="mt-4 space-y-4"
                              onSubmit={onSubmit}
                        >
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Type <span className="text-red-600">*</span>
                                </label>
                                <select
                                    name={"user_type"}
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    <option value="">Select an option</option>
                                    {packages.length > 0 && (
                                        <>
                                            <option value="pppoe">PPPOE</option>
                                            <option value="hotspot">Hotspot</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">Full
                                    Name</label>
                                <input
                                    type="text"
                                    name={"full_name"}
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Full name"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Username <span className="text-red-600">*</span>
                                </label>
                                <input
                                    name={"username"}
                                    type="text"
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Username"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Password <span className="text-red-600">*</span>
                                </label>
                                <div className="flex rounded-md shadow-sm mt-1">
                                    <input
                                        name={"password"}
                                        type={showPassword ? 'text' : 'password'}
                                        className="flex-1 block w-full rounded-l-md border border-gray-300 dark:border-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePassword}
                                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 dark:border-gray-100 rounded-r-md text-sm text-gray-700 dark:text-white hover:bg-gray-200"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            {/* Package */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                                    Package <span className="text-red-600">*</span>
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                    <select
                                        name={"package"}
                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                        <option value="">Select an option</option>
                                        {packages.map((pkg) => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.name} ({pkg.router.name})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="p-2 rounded-md border border-gray-300 dark:border-gray-100 hover:bg-gray-100"
                                    >
                                        <i className="bi bi-plus-lg"></i>
                                    </button>
                                </div>
                                <small className="text-gray-500 block mt-1">
                                    If the package is not available, create a new one by clicking the plus icon
                                </small>
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">Expiry
                                    Date</label>
                                <div className="flex items-center rounded-md shadow-sm mt-1">
                    <span
                        className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-100 bg-gray-50 text-gray-500 text-sm">
                      <i className="bi bi-calendar"></i>
                    </span>
                                    <input
                                        name={"expiry-date"}
                                        type="date"
                                        className="flex-1 block w-full rounded-r-md border-gray-300 dark:border-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                        placeholder="mm/dd/yyyy, --:--:-- --"
                                    />
                                </div>
                                <small className="text-gray-500 block mt-1">
                                    The date the package for this user will expire
                                </small>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">Phone
                                    Number</label>
                                <input
                                    type="text"
                                    name={"phone"}
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g. +254712345678"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-white">Email
                                    Address</label>
                                <input
                                    type="email"
                                    name={"email"}
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label
                                    className="block text-sm font-medium text-gray-700 dark:text-white">Address</label>
                                <input
                                    name={"address"}
                                    type="text"
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="123 Main St, City, Country"
                                />
                            </div>

                            {/* Comment */}
                            <div>
                                <label
                                    className="block text-sm font-medium text-gray-700 dark:text-white">Comment</label>
                                <textarea
                                    name={"comment"}
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Optional comment"
                                />
                            </div>
                            {
                                msg && <span className="text-red-500 text-sm">{msg}</span>
                            }
                            {/* Buttons */}
                            <div className="flex justify-between pt-4">
                                <button
                                    type="submit"
                                    className="px-4 hstack gap-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create User
                                    {loading && <GIcon name={"g-loader"} color={"fill-amber-500"}/>}
                                </button>
                                <button
                                    type="button"
                                    data-bs-dismiss="offcanvas"
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </OffCanvas>
        </>
    )
}