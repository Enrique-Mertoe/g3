import React, {FormEvent, useCallback, useEffect, useState} from "react";
import OffCanvas from "./OffCanvas.tsx";
import GIcon from "../components/Icons.tsx";
import request from "../../build/request.ts";
import Config from "../../assets/config.ts";
import {Inbox} from "lucide-react";
import {useNavigate} from "react-router-dom";

type PackageForm = {
    pkgName: string;
    pkgPrice: string;
    uploadSpeed: string;
    downloadSpeed: string;
    type: "hotspot" | "pppoe" | "data_plan";
    router: string;
};


export default function AddPackage() {
    // const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        uploadSpeed: "",
        downloadSpeed: ""
    });
    // const togglePassword = () => setShowPassword(!showPassword);
    const [form, setForm] = useState<PackageForm>({
        pkgName: "",
        pkgPrice: "",
        uploadSpeed: "",
        downloadSpeed: "",
        type: "hotspot",
        router: ""
    });
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };
    const validateSpeed = (value: string): boolean => {
        const regex = /^[0-9]+[MK]$/;
        return regex.test(value);
    };
    const onSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors({
            uploadSpeed: "",
            downloadSpeed: "",
        });

        let valid = true;
        if (!validateSpeed(form.uploadSpeed)) {
            setErrors((prev) => ({
                ...prev,
                uploadSpeed: "Upload Speed must be a number followed by M (Mbps) or K (Kbps)."
            }));
            valid = false;
        }

        if (!validateSpeed(form.downloadSpeed)) {
            setErrors((prev) => ({
                ...prev,
                downloadSpeed: "Download Speed must be a number followed by M (Mbps) or K (Kbps)."
            }));
            valid = false;
        }

        if (!valid) return;
        try {
            setLoading(true)
            const formData = new FormData();
            formData.append("name", form.pkgName);
            formData.append("price", form.pkgPrice);
            formData.append("upload_speed", form.uploadSpeed);
            formData.append("download_speed", form.downloadSpeed);
            formData.append("type", form.type);
            formData.append("router", form.router);

            const response = await request.post(Config.baseURL + "/api/pkgs/create/", formData);
            setLoading(false)

            if (response.status === 201) {
                alert("Package added successfully!");
                setForm({
                    pkgName: "",
                    pkgPrice: "",
                    uploadSpeed: "",
                    downloadSpeed: "",
                    router: "",
                    type: "hotspot",
                });
            }
        } catch (error: unknown) {
            console.error("Error saving router:", error);
            alert("Failed to save router.");
            setLoading(false);
        }
    }, [form]);

    const [routers, setRouters] = useState<Mikrotik[]>([])

    useEffect(() => {
        const fd = new FormData();
        fd.append("load_type", "all")
        request.post(Config.baseURL + "/api/routers/", fd)
            .then(res => {
                const data = res.data as RoutersResponse;
                setRouters(data.routers);
            }).catch(err => {
            console.log(err);
        });
    }, []);

    const navigate = useNavigate();
    return (
        <>
            <OffCanvas
                id="drawer-add-package"
            >
                <div className="offcanvas-header border-bottom py-5 bg-surface-secondary">
                    <h3 className="text-lg font-semibold">Add Package Details</h3>
                    <button type="button" className="btn-close text-reset text-xs" data-bs-dismiss="offcanvas"
                            aria-label="Close"></button>
                </div>
                <div className="offcanvas-body vstack gap-5">
                    {routers.length > 0 ?
                        <div className="py-4">
                            <p className="text-sm text-gray-500 dark:text-gray-200">
                                Enter package information to register a new internet plan.
                            </p>
                            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
                                {/* Router */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">Select Mikrotik</label>
                                    <select
                                        name="router"
                                        value={form.router}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option selected>Select Router</option>
                                        {
                                            routers.map((r, i) => (
                                                <option key={i} value={r.id}>{r.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                {/* Package Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">Package Name</label>
                                    <input
                                        name="pkgName"
                                        type="text"
                                        value={form.pkgName}
                                        onChange={handleChange}
                                        placeholder="e.g. Silver Plan"
                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">Price (KES)</label>
                                    <input
                                        name="pkgPrice"
                                        type="number"
                                        value={form.pkgPrice}
                                        onChange={handleChange}
                                        placeholder="e.g. 1200"
                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Upload Speed */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">Upload Speed</label>
                                    <input
                                        name="uploadSpeed"
                                        type="text"
                                        value={form.uploadSpeed}
                                        onChange={handleChange}
                                        placeholder="e.g. 5Mbps"
                                        className="mt-1 w-full   rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    {errors.uploadSpeed && <p className="text-red-500 text-xs">{errors.uploadSpeed}</p>}
                                </div>

                                {/* Download Speed */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">Download Speed</label>
                                    <input
                                        name="downloadSpeed"
                                        type="text"
                                        value={form.downloadSpeed}
                                        onChange={handleChange}
                                        placeholder="e.g. 10Mbps"
                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    {errors.downloadSpeed &&
                                        <p className="text-red-500 text-xs">{errors.downloadSpeed}</p>}
                                </div>

                                {/* Package Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">Package Type</label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-100 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="hotspot">Hotspot</option>
                                        <option value="pppoe">PPPoE</option>
                                        <option value="data_plan">Data Plan</option>
                                    </select>
                                </div>

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
                                        data-bs-dismiss="offcanvas"
                                        type="button"
                                        className="inline-flex items-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                        :
                        <div className={"h-64 flex flex-col text-amber-600 items-center justify-center w-full h-full"}>
                            <Inbox size={64}/>
                            <p>Add Mikrotiks to start creating packages.</p>
                            <button
                                onClick={() => navigate("/mikrotiks")}
                                className={"px-4 py-1 rounded mt-5 text-white cursor-pointer bg-amber-300 hover:bg-amber-400"}
                            >
                                Create now
                            </button>
                        </div>}
                </div>
            </OffCanvas>

        </>
    )
}