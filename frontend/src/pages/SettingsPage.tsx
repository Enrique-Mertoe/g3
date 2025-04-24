import Layout from "./home-components/Layout.tsx";
import {useState} from "react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    const handleTabClick = (tabId:string) => {
        setActiveTab(tabId);
    };
    return (
        <Layout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <i className="fas fa-cogs"></i>Settings
                    </h2>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        <i className="fas fa-save mr-2"></i>Save All Changes
                    </button>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
                    <div className="p-4">
                        {/* Tab Navigation */}
                        <div className="flex justify-center space-x-2 bg-white border rounded-xl p-2 shadow-sm">
                            {[
                                {
                                    id: 'general', label: 'General', icon: (
                                        <path
                                            d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/>
                                    )
                                },
                                {
                                    id: 'network', label: 'Network', icon: (
                                        <path fillRule="evenodd" clipRule="evenodd"
                                              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/>
                                    )
                                },
                                {
                                    id: 'routing', label: 'Routing', icon: (
                                        <path
                                            d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z"/>
                                    )
                                },
                                {
                                    id: 'advanced', label: 'Advanced', icon: (
                                        <path fillRule="evenodd"
                                              d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                                              clipRule="evenodd"/>
                                    )
                                }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-blue-500 text-white shadow'
                                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                                    }`}
                                    onClick={() => handleTabClick(tab.id)}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor"
                                         viewBox="0 0 20 20">{tab.icon}</svg>
                                    {tab.label}
                                </button>
                            ))}
                        </div>


                        {/* Tab Content */}
                        <div className="p-4">
                            {/* General Tab Content */}
                            <div
                                className={`transition-opacity duration-300 ${activeTab === 'general' ? 'opacity-100' : 'hidden opacity-0'}`}>
                                <form className="space-y-6">
                                    {/* Server Settings Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Server Configuration</h4>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Server Mode</label>
                                            <div className="col-span-7">
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="tun">TUN (Layer 3, routed)</option>
                                                    <option value="tap">TAP (Layer 2, bridged)</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Protocol</label>
                                            <div className="col-span-7">
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="udp">UDP (recommended)</option>
                                                    <option value="tcp">TCP</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Port</label>
                                            <div className="col-span-7">
                                                <input type="number" defaultValue="1194"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Device</label>
                                            <div className="col-span-7">
                                                <input type="text" defaultValue="tun0"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Settings Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Service Configuration</h4>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Service Name</label>
                                            <div className="col-span-7">
                                                <input type="text" defaultValue="openvpn"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Config Directory</label>
                                            <div className="col-span-7">
                                                <input type="text" defaultValue="/etc/openvpn"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4">
                                            <label className="col-span-3 flex items-center">Auto-start Service</label>
                                            <div className="col-span-7">
                                                <label className="inline-flex relative items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer"/>
                                                    <div
                                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Controls */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Service Control</h4>

                                        <div className="flex space-x-4 justify-center">
                                            <button type="button"
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                                Start Service
                                            </button>
                                            <button type="button"
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                                Stop Service
                                            </button>
                                            <button type="button"
                                                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                                Restart Service
                                            </button>
                                        </div>

                                        <div className="mt-4">
                                            <div className="bg-gray-200 p-3 rounded-md">
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                                    <p className="text-sm font-medium">Service Status: Running (PID:
                                                        12345)</p>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">Uptime: 3 days, 5 hours, 27
                                                    minutes</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end space-x-4">
                                        <button type="button"
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
                                            Cancel
                                        </button>
                                        <button type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>


                            {/* Network Tab Content */}
                            <div
                                className={`transition-opacity duration-300 ${activeTab === 'network' ? 'opacity-100' : 'hidden opacity-0'}`}>
                                <form className="space-y-6">
                                    {/* Network Settings Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Network Configuration</h4>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">VPN Subnet</label>
                                            <div className="col-span-7">
                                                <input type="text" defaultValue="10.8.0.0"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Subnet Mask</label>
                                            <div className="col-span-7">
                                                <input type="text" defaultValue="255.255.255.0"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Push DNS Servers</label>
                                            <div className="col-span-7">
                                                <input type="text" defaultValue="8.8.8.8, 8.8.4.4"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Traffic Control Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Traffic Control</h4>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Client-to-Client</label>
                                            <div className="col-span-7">
                                                <label className="inline-flex relative items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer"/>
                                                    <div
                                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Redirect Gateway</label>
                                            <div className="col-span-7">
                                                <label className="inline-flex relative items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer"/>
                                                    <div
                                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Max Clients</label>
                                            <div className="col-span-7">
                                                <input type="number" defaultValue="100"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4">
                                            <label className="col-span-3 flex items-center">Client IP Assignment</label>
                                            <div className="col-span-7">
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="dynamic">Dynamic</option>
                                                    <option value="static">Static (from client config)</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end space-x-4">
                                        <button type="button"
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
                                            Cancel
                                        </button>
                                        <button type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>


                            {/* Routing Tab Content */}
                            <div
                                className={`transition-opacity duration-300 ${activeTab === 'routing' ? 'opacity-100' : 'hidden opacity-0'}`}>
                                <form className="space-y-6">
                                    {/* Traffic Routing */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Traffic Routing</h4>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">NAT Masquerade</label>
                                            <div className="col-span-7">
                                                <label className="inline-flex relative items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer"/>
                                                    <div
                                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Push Default Gateway</label>
                                            <div className="col-span-7">
                                                <label className="inline-flex relative items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer"/>
                                                    <div
                                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Route Management */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Route Management</h4>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Push Routes</label>
                                            <div className="col-span-9">
                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <input type="text" placeholder="Network (e.g. 192.168.1.0)"
                                                               className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                                                        <input type="text" placeholder="Netmask (e.g. 255.255.255.0)"
                                                               className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                                        <button type="button"
                                                                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                                                            <svg className="w-5 h-5" fill="currentColor"
                                                                 viewBox="0 0 20 20">
                                                                <path fillRule="evenodd"
                                                                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                                                      clipRule="evenodd"></path>
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <div className="border rounded-md bg-white">
                                                        <div className="p-2 max-h-40 overflow-y-auto">
                                                            <div
                                                                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                                                                <span
                                                                    className="text-sm">192.168.1.0/255.255.255.0</span>
                                                                <button type="button"
                                                                        className="text-red-500 hover:text-red-700">
                                                                    <svg className="w-5 h-5" fill="currentColor"
                                                                         viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd"
                                                                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                              clipRule="evenodd"></path>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            <div
                                                                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                                                                <span className="text-sm">10.0.0.0/255.0.0.0</span>
                                                                <button type="button"
                                                                        className="text-red-500 hover:text-red-700">
                                                                    <svg className="w-5 h-5" fill="currentColor"
                                                                         viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd"
                                                                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                              clipRule="evenodd"></path>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Firewall Settings */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Firewall Settings</h4>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Enable Firewall
                                                Rules</label>
                                            <div className="col-span-7">
                                                <label className="inline-flex relative items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer"/>
                                                    <div
                                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Default Forward
                                                Policy</label>
                                            <div className="col-span-7">
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="accept">ACCEPT</option>
                                                    <option value="reject">REJECT</option>
                                                    <option value="drop">DROP</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4">
                                            <label className="col-span-3 flex items-center">Custom Firewall
                                                Script</label>
                                            <div className="col-span-7">
                                                <textarea
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Custom iptables rules (will be executed after OpenVPN starts)"></textarea>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Route Visualizer */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Route Visualization</h4>

                                        <div className="bg-white p-4 border rounded-md">
                                            <div className="flex justify-center">
                                                <div className="w-full max-w-xl">
                                                    <div
                                                        className="bg-gray-100 p-4 rounded-lg flex flex-col items-center">
                                                        <div
                                                            className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2">
                                                            <svg className="w-10 h-10" fill="currentColor"
                                                                 viewBox="0 0 20 20">
                                                                <path fillRule="evenodd"
                                                                      d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                                                      clipRule="evenodd"></path>
                                                            </svg>
                                                        </div>
                                                        <div className="text-center font-medium">OpenVPN Server</div>
                                                        <div className="text-xs text-gray-500">10.8.0.1</div>
                                                    </div>

                                                    <div className="h-8 flex justify-center">
                                                        <div className="border-l-2 border-gray-400 h-full"></div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div
                                                            className="bg-gray-100 p-2 rounded-lg flex flex-col items-center">
                                                            <div
                                                                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-1">
                                                                <svg className="w-6 h-6" fill="currentColor"
                                                                     viewBox="0 0 20 20">
                                                                    <path d="M13 7H7v6h6V7z"/>
                                                                    <path fillRule="evenodd"
                                                                          d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                                                                          clipRule="evenodd"/>
                                                                </svg>
                                                            </div>
                                                            <div className="text-center text-xs font-medium">Client 1
                                                            </div>
                                                            <div className="text-xs text-gray-500">10.8.0.2</div>
                                                        </div>

                                                        <div
                                                            className="bg-gray-100 p-2 rounded-lg flex flex-col items-center">
                                                            <div
                                                                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-1">
                                                                <svg className="w-6 h-6" fill="currentColor"
                                                                     viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd"
                                                                          d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                                                                          clipRule="evenodd"/>
                                                                </svg>
                                                            </div>
                                                            <div className="text-center text-xs font-medium">Client 2
                                                            </div>
                                                            <div className="text-xs text-gray-500">10.8.0.3</div>
                                                        </div>

                                                        <div
                                                            className="bg-gray-100 p-2 rounded-lg flex flex-col items-center">
                                                            <div
                                                                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-1">
                                                                <svg className="w-6 h-6" fill="currentColor"
                                                                     viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd"
                                                                          d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                                                                          clipRule="evenodd"/>
                                                                </svg>
                                                            </div>
                                                            <div className="text-center text-xs font-medium">Client 3
                                                            </div>
                                                            <div className="text-xs text-gray-500">10.8.0.4</div>
                                                        </div>
                                                    </div>

                                                    <div className="text-center mt-4">
                                                        <button type="button"
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                            View Active Connections
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end space-x-4">
                                        <button type="button"
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
                                            Cancel
                                        </button>
                                        <button type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Advanced Tab Content */}
                            <div
                                className={`transition-opacity duration-300 ${activeTab === 'advanced' ? 'opacity-100' : 'hidden opacity-0'}`}>
                                <form className="space-y-6">
                                    {/* Performance Tuning Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Performance Tuning</h4>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Compression</label>
                                            <div className="col-span-7">
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="none">None (recommended)</option>
                                                    <option value="lz4">LZ4</option>
                                                    <option value="lz4-v2">LZ4-v2</option>
                                                    <option value="lzo">LZO (legacy)</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">MTU</label>
                                            <div className="col-span-7">
                                                <input type="number" defaultValue="1500"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Fragment Size</label>
                                            <div className="col-span-7">
                                                <input type="number" defaultValue="1400"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4">
                                            <label className="col-span-3 flex items-center">TCP MSS Fix</label>
                                            <div className="col-span-7">
                                                <label className="inline-flex relative items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer"/>
                                                    <div
                                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Process Management Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Process Management</h4>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">User/Group</label>
                                            <div className="col-span-4">
                                                <input type="text" defaultValue="nobody" placeholder="User"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-3">
                                                <input type="text" defaultValue="nogroup" placeholder="Group"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4">
                                            <label className="col-span-3 flex items-center">Persist Options</label>
                                            <div className="col-span-7">
                                                <div className="mb-2">
                                                    <label className="flex items-center">
                                                        <input type="checkbox" defaultChecked
                                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"/>
                                                        <span className="ml-2">Persist Key</span>
                                                    </label>
                                                </div>
                                                <div>
                                                    <label className="flex items-center">
                                                        <input type="checkbox" defaultChecked
                                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"/>
                                                        <span className="ml-2">Persist TUN</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logging & Debugging Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Logging & Debugging</h4>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Verbosity</label>
                                            <div className="col-span-7">
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="0">0 - Quiet (errors only)</option>
                                                    <option value="1">1 - Minimal</option>
                                                    <option value="2">2 - Normal</option>
                                                    <option value="3" selected>3 - Verbose</option>
                                                    <option value="4">4 - Debug</option>
                                                    <option value="5">5 - Maximum Debug</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 mb-4">
                                            <label className="col-span-3 flex items-center">Status File</label>
                                            <div className="col-span-7">
                                                <input type="text" defaultValue="/var/log/openvpn-status.log"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4">
                                            <label className="col-span-3 flex items-center">Log File</label>
                                            <div className="col-span-7">
                                                <input type="text" defaultValue="/var/log/openvpn.log"
                                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Configuration Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-4">Custom Configuration</h4>

                                        <div className="grid grid-cols-12 gap-4">
                                            <label className="col-span-3 flex items-center">Additional Config</label>
                                            <div className="col-span-7">
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                        placeholder="Enter additional OpenVPN configuration directives here (one per line)"

                    ></textarea>
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                          clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end space-x-4">
                                        <button type="button"
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
                                            Cancel
                                        </button>
                                        <button type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}


// import { useState } from 'react';
//
// export default function OpenVPNSettings() {
//   const [activeTab, setActiveTab] = useState('general');
//
//   const handleTabClick = (tabId) => {
//     setActiveTab(tabId);
//   };
//
//   return (
//     <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
//       <div className="p-4">
//         {/* Tab Navigation */}
//         <div className="flex border-b">
//           <button
//             className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
//               activeTab === 'general'
//                 ? 'bg-blue-500 text-white'
//                 : 'hover:bg-gray-100 text-gray-600'
//             }`}
//             onClick={() => handleTabClick('general')}
//           >
//             <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//               <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path>
//             </svg>
//             General
//           </button>
//           <button
//             className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
//               activeTab === 'network'
//                 ? 'bg-blue-500 text-white'
//                 : 'hover:bg-gray-100 text-gray-600'
//             }`}
//             onClick={() => handleTabClick('network')}
//           >
//             <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//               <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path>
//             </svg>
//             Network
//           </button>
//           <button
//             className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
//               activeTab === 'security'
//                 ? 'bg-blue-500 text-white'
//                 : 'hover:bg-gray-100 text-gray-600'
//             }`}
//             onClick={() => handleTabClick('security')}
//           >
//             <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//               <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//             </svg>
//             Security
//           </button>
//           <button
//             className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
//               activeTab === 'routing'
//                 ? 'bg-blue-500 text-white'
//                 : 'hover:bg-gray-100 text-gray-600'
//             }`}
//             onClick={() => handleTabClick('routing')}
//           >
//             <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//               <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z"></path>
//             </svg>
//             Routing
//           </button>
//           <button
//             className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
//               activeTab === 'advanced'
//                 ? 'bg-blue-500 text-white'
//                 : 'hover:bg-gray-100 text-gray-600'
//             }`}
//             onClick={() => handleTabClick('advanced')}
//           >
//             <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//               <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
//             </svg>
//             Advanced
//           </button>
//         </div>
//
//         {/* Tab Content */}
//         <div className="p-4">
//           {/* General Tab Content */}
//           <div className={`transition-opacity duration-300 ${activeTab === 'general' ? 'opacity-100' : 'hidden opacity-0'}`}>
//             <form className="space-y-6">
//               {/* Server Settings Section */}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h4 className="text-lg font-medium mb-4">Server Configuration</h4>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">Server Mode</label>
//                   <div className="col-span-7">
//                     <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
//                       <option value="tun">TUN (Layer 3, routed)</option>
//                       <option value="tap">TAP (Layer 2, bridged)</option>
//                     </select>
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">Protocol</label>
//                   <div className="col-span-7">
//                     <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
//                       <option value="udp">UDP (recommended)</option>
//                       <option value="tcp">TCP</option>
//                     </select>
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">Port</label>
//                   <div className="col-span-7">
//                     <input type="number" defaultValue="1194" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">Device</label>
//                   <div className="col-span-7">
//                     <input type="text" defaultValue="tun0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//
//               {/* Service Settings Section */}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h4 className="text-lg font-medium mb-4">Service Configuration</h4>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">Service Name</label>
//                   <div className="col-span-7">
//                     <input type="text" defaultValue="openvpn" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">Config Directory</label>
//                   <div className="col-span-7">
//                     <input type="text" defaultValue="/etc/openvpn" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//
//                 <div className="grid grid-cols-12 gap-4">
//                   <label className="col-span-3 flex items-center">Auto-start Service</label>
//                   <div className="col-span-7">
//                     <label className="inline-flex relative items-center cursor-pointer">
//                       <input type="checkbox" defaultChecked className="sr-only peer" />
//                       <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                     </label>
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//
//               {/* Service Controls */}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h4 className="text-lg font-medium mb-4">Service Control</h4>
//
//                 <div className="flex space-x-4 justify-center">
//                   <button type="button" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center">
//                     <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
//                     </svg>
//                     Start Service
//                   </button>
//                   <button type="button" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center">
//                     <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd"></path>
//                     </svg>
//                     Stop Service
//                   </button>
//                   <button type="button" className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center">
//                     <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"></path>
//                     </svg>
//                     Restart Service
//                   </button>
//                 </div>
//
//                 <div className="mt-4">
//                   <div className="bg-gray-200 p-3 rounded-md">
//                     <div className="flex items-center">
//                       <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
//                       <p className="text-sm font-medium">Service Status: Running (PID: 12345)</p>
//                     </div>
//                     <p className="text-xs text-gray-600 mt-1">Uptime: 3 days, 5 hours, 27 minutes</p>
//                   </div>
//                 </div>
//               </div>
//
//               {/* Submit Button */}
//               <div className="flex justify-end space-x-4">
//                 <button type="button" className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
//                   Cancel
//                 </button>
//                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//
//           {/* Network Settings Tab Content */}
//           <div className={`transition-opacity duration-300 ${activeTab === 'network' ? 'opacity-100' : 'hidden opacity-0'}`}>
//             <form className="space-y-6">
//               {/* VPN Network Configuration */}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h4 className="text-lg font-medium mb-4">VPN Network Configuration</h4>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">VPN Subnet</label>
//                   <div className="col-span-7">
//                     <input type="text" defaultValue="10.8.0.0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">Subnet Mask</label>
//                   <div className="col-span-7">
//                     <input type="text" defaultValue="255.255.255.0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">Server IP</label>
//                   <div className="col-span-7">
//                     <input type="text" defaultValue="10.8.0.1" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//
//                 <div className="grid grid-cols-12 gap-4">
//                   <label className="col-span-3 flex items-center">Topology</label>
//                   <div className="col-span-7">
//                     <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
//                       <option value="subnet">Subnet (recommended)</option>
//                       <option value="net30">net30 (legacy)</option>
//                       <option value="p2p">Point-to-Point</option>
//                     </select>
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//
//               {/* DNS Settings */}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h4 className="text-lg font-medium mb-4">DNS Settings</h4>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">Primary DNS</label>
//                   <div className="col-span-7">
//                     <input type="text" defaultValue="8.8.8.8" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                     </svg>
//                   </div>
//                 </div>
//
//                 <div className="grid grid-cols-12 gap-4 mb-4">
//                   <label className="col-span-3 flex items-center">Secondary DNS</label>
//                   <div className="col-span-7">
//                     <input type="text" defaultValue="8.8.4.4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                   </div>
//                   <div className="col-span-2 flex items-center">
//                     <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1