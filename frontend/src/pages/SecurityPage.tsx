import Layout from "./home-components/Layout.tsx";
import {useEffect, useState} from "react";
import request from "../build/request.ts";

export default function SecurityPage() {
    const [formData, setFormData] = useState({
        caCertPath: '/etc/openvpn/ca.crt',
        serverCertPath: '/etc/openvpn/server.crt',
        serverKeyPath: '/etc/openvpn/server.key',
        dhParamsPath: '/etc/openvpn/dh2048.pem',
        cipher: 'AES-256-GCM',
        authDigest: 'SHA512',
        tlsVersion: '1.2',
        authType: 'cert',
        authScriptPath: '/etc/openvpn/auth-user-pass.sh'
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch current configuration on component mount
    useEffect(() => {
        fetchCurrentConfig().then();
    }, []);
    const fetchCurrentConfig = async () => {
        try {
            setLoading(true);
            const response = await request.get('/api/openvpn/config');
            setFormData(response.data);
            setLoading(false);
        } catch {
            setError('Failed to load configuration. Please try again.');
            setLoading(false);
        }
    };

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const handleFileBrowse = async (fieldName: string) => {
        try {
            const response = await request.get(`/api/openvpn/browse?type=${fieldName}`);
            if (response.data.path) {
                setFormData({
                    ...formData,
                    [fieldName]: response.data.path
                });
            }
        } catch (err) {
            console.error(`Error browsing for ${fieldName}:`, err);
            setError(`Failed to browse for ${fieldName}. Please try again.`);
        }
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            setLoading(true);
            await request.post('/api/openvpn/config', formData);
            setSuccessMessage('Configuration saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            setLoading(false);
        } catch (err) {
            console.error('Error saving OpenVPN configuration:', err);
            setError('Failed to save configuration. Please try again.');
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8">Loading configuration...</div>;
    }
    return (
        <Layout>
            <div
                className={`bg-white p-4`}>
                <h2 className="text-2xl mb-5 font-semibold flex items-center gap-2">
                    <i className="fas fa-shield"></i>Security
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {error}
                            <button className="absolute top-0 right-0 p-2" onClick={() => setError(null)}>
                                ×
                            </button>
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {successMessage}
                            <button className="absolute top-0 right-0 p-2" onClick={() => setSuccessMessage('')}>
                                ×
                            </button>
                        </div>
                    )}

                    {/* Certificate Management */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-medium mb-4">Certificate Management</h4>

                        <div className="grid grid-cols-12 gap-4 mb-4">
                            <label className="col-span-3 flex items-center">CA Certificate</label>
                            <div className="col-span-7">
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        name="caCertPath"
                                        value={formData.caCertPath}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleFileBrowse('caCertPath')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Browse
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 mb-4">
                            <label className="col-span-3 flex items-center">Server Certificate</label>
                            <div className="col-span-7">
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        name="serverCertPath"
                                        value={formData.serverCertPath}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleFileBrowse('serverCertPath')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Browse
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 mb-4">
                            <label className="col-span-3 flex items-center">Server Key</label>
                            <div className="col-span-7">
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        name="serverKeyPath"
                                        value={formData.serverKeyPath}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleFileBrowse('serverKeyPath')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Browse
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <label className="col-span-3 flex items-center">DH Parameters</label>
                            <div className="col-span-7">
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        name="dhParamsPath"
                                        value={formData.dhParamsPath}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleFileBrowse('dhParamsPath')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Browse
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Encryption Settings */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-medium mb-4">Encryption Settings</h4>

                        <div className="grid grid-cols-12 gap-4 mb-4">
                            <label className="col-span-3 flex items-center">Cipher</label>
                            <div className="col-span-7">
                                <select
                                    name="cipher"
                                    value={formData.cipher}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="AES-256-GCM">AES-256-GCM (recommended)</option>
                                    <option value="AES-128-GCM">AES-128-GCM</option>
                                    <option value="AES-256-CBC">AES-256-CBC</option>
                                    <option value="AES-128-CBC">AES-128-CBC</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 mb-4">
                            <label className="col-span-3 flex items-center">Auth Digest</label>
                            <div className="col-span-7">
                                <select
                                    name="authDigest"
                                    value={formData.authDigest}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="SHA512">SHA512</option>
                                    <option value="SHA384">SHA384</option>
                                    <option value="SHA256">SHA256</option>
                                    <option value="SHA1">SHA1 (not recommended)</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <label className="col-span-3 flex items-center">TLS Version Min</label>
                            <div className="col-span-7">
                                <select
                                    name="tlsVersion"
                                    value={formData.tlsVersion}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="1.2">TLSv1.2 (recommended)</option>
                                    <option value="1.3">TLSv1.3</option>
                                    <option value="1.1">TLSv1.1 (legacy)</option>
                                    <option value="1.0">TLSv1.0 (legacy)</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Authentication Method */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-medium mb-4">Authentication Method</h4>

                        <div className="grid grid-cols-12 gap-4 mb-4">
                            <label className="col-span-3 flex items-center">Authentication Type</label>
                            <div className="col-span-7">
                                <select
                                    name="authType"
                                    value={formData.authType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="cert">Certificate</option>
                                    <option value="cert-pass">Certificate + Password</option>
                                    <option value="pass">Username/Password Only</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <label className="col-span-3 flex items-center">Auth Script Path</label>
                            <div className="col-span-7">
                                <input
                                    type="text"
                                    name="authScriptPath"
                                    value={formData.authScriptPath}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="col-span-2 flex items-center">
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={fetchCurrentConfig}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

        </Layout>
    )
}


// import {useState, useEffect} from 'react';
// import axios from 'axios';
//
// function OpenVPNConfigForm() {
//     const [formData, setFormData] = useState({
//         caCertPath: '/etc/openvpn/ca.crt',
//         serverCertPath: '/etc/openvpn/server.crt',
//         serverKeyPath: '/etc/openvpn/server.key',
//         dhParamsPath: '/etc/openvpn/dh2048.pem',
//         cipher: 'AES-256-GCM',
//         authDigest: 'SHA512',
//         tlsVersion: '1.2',
//         authType: 'cert',
//         authScriptPath: '/etc/openvpn/auth-user-pass.sh'
//     });
//
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [successMessage, setSuccessMessage] = useState('');
//
//     // Fetch current configuration on component mount
//     useEffect(() => {
//         fetchCurrentConfig();
//     }, []);
//
//     const fetchCurrentConfig = async () => {
//         try {
//             setLoading(true);
//             const response = await axios.get('/api/openvpn/config');
//             setFormData(response.data);
//             setLoading(false);
//         } catch (err) {
//             console.error('Error fetching OpenVPN configuration:', err);
//             setError('Failed to load configuration. Please try again.');
//             setLoading(false);
//         }
//     };
//
//     const handleInputChange = (e) => {
//         const {name, value} = e.target;
//         setFormData({
//             ...formData,
//             [name]: value
//         });
//     };
//
//     const handleFileBrowse = async (fieldName) => {
//         try {
//             const response = await axios.get(`/api/openvpn/browse?type=${fieldName}`);
//             if (response.data.path) {
//                 setFormData({
//                     ...formData,
//                     [fieldName]: response.data.path
//                 });
//             }
//         } catch (err) {
//             console.error(`Error browsing for ${fieldName}:`, err);
//             setError(`Failed to browse for ${fieldName}. Please try again.`);
//         }
//     };
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             setLoading(true);
//             const response = await axios.post('/api/openvpn/config', formData);
//             setSuccessMessage('Configuration saved successfully!');
//             setTimeout(() => setSuccessMessage(''), 3000);
//             setLoading(false);
//         } catch (err) {
//             console.error('Error saving OpenVPN configuration:', err);
//             setError('Failed to save configuration. Please try again.');
//             setLoading(false);
//         }
//     };
//
//     if (loading) {
//         return <div className="flex justify-center p-8">Loading configuration...</div>;
//     }
//
//     return (
//
//     );
// }
//
// export default OpenVPNConfigForm;