import Layout from "./home-components/Layout.tsx";
import {useEffect, useState} from "react";
import request from "../build/request.ts";
import AdvanceSettings from "../ui/settings/AdvanceSettings.tsx";
import NetworkSettings from "../ui/settings/NetworkSettings.tsx";
import {ConfigProvider} from "../ui/providers/ConfigContext.tsx";
import {useDialog} from "../ui/providers/DialogProvider.tsx";
import ConfigurationTemplates from "../ui/settings/ConfigurationTemplates.tsx";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const dialog = useDialog();
    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };
    return (
        <Layout>
            <ConfigProvider>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <i className="fas fa-cogs"></i>Settings
                        </h2>
                        <div className={"p-2 hstack gap-2"}>
                            Configure from template
                            <span
                                className={"py-2.5 px-5 me-2 mb-2 cursor-pointer text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"}
                                onClick={() => {
                                    dialog.create({
                                        content: <ConfigProvider><ConfigurationTemplates/></ConfigProvider>,
                                        size: "lg"
                                    })
                                }}
                            >
                        Templates
                    </span>
                        </div>
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
                            <div>
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
                                                    <label className="col-span-3 flex items-center">Config
                                                        Directory</label>
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
                                                    <label className="col-span-3 flex items-center">Auto-start
                                                        Service</label>
                                                    <div className="col-span-7">
                                                        <label
                                                            className="inline-flex relative items-center cursor-pointer">
                                                            <input type="checkbox" defaultChecked
                                                                   className="sr-only peer"/>
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
                                            <ServiceControl/>

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
                                        <NetworkSettings/>
                                    </div>


                                    {/* Routing Tab Content */}
                                    <div
                                        className={`transition-opacity duration-300 ${activeTab === 'routing' ? 'opacity-100' : 'hidden opacity-0'}`}>
                                        <form className="space-y-6">
                                            {/* Traffic Routing */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="text-lg font-medium mb-4">Traffic Routing</h4>

                                                <div className="grid grid-cols-12 gap-4 mb-4">
                                                    <label className="col-span-3 flex items-center">NAT
                                                        Masquerade</label>
                                                    <div className="col-span-7">
                                                        <label
                                                            className="inline-flex relative items-center cursor-pointer">
                                                            <input type="checkbox" defaultChecked
                                                                   className="sr-only peer"/>
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
                                                    <label className="col-span-3 flex items-center">Push Default
                                                        Gateway</label>
                                                    <div className="col-span-7">
                                                        <label
                                                            className="inline-flex relative items-center cursor-pointer">
                                                            <input type="checkbox" defaultChecked
                                                                   className="sr-only peer"/>
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
                                                                <input type="text"
                                                                       placeholder="Network (e.g. 192.168.1.0)"
                                                                       className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                                                                <input type="text"
                                                                       placeholder="Netmask (e.g. 255.255.255.0)"
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
                                                                        <span
                                                                            className="text-sm">10.0.0.0/255.0.0.0</span>
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
                                                        <label
                                                            className="inline-flex relative items-center cursor-pointer">
                                                            <input type="checkbox" defaultChecked
                                                                   className="sr-only peer"/>
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
                                                                <div className="text-center font-medium">OpenVPN Server
                                                                </div>
                                                                <div className="text-xs text-gray-500">10.8.0.1</div>
                                                            </div>

                                                            <div className="h-8 flex justify-center">
                                                                <div
                                                                    className="border-l-2 border-gray-400 h-full"></div>
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
                                                                    <div
                                                                        className="text-center text-xs font-medium">Client
                                                                        1
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">10.8.0.2
                                                                    </div>
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
                                                                    <div
                                                                        className="text-center text-xs font-medium">Client
                                                                        2
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">10.8.0.3
                                                                    </div>
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
                                                                    <div
                                                                        className="text-center text-xs font-medium">Client
                                                                        3
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">10.8.0.4
                                                                    </div>
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
                                        <AdvanceSettings/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ConfigProvider>
        </Layout>
    )
}

const ServiceControl = () => {
    const [serviceData, setServiceData] = useState({
        status: 'unknown',
        uptime: '0d 0h 0m',
        uptime_seconds: 0,
        pid: null,
        loading: false,
        actionInProgress: null
    });

    // Fetch service status on component mount and periodically
    useEffect(() => {
        fetchServiceStatus().then();
        const interval = setInterval(fetchServiceStatus, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchServiceStatus = async () => {
        try {
            const response = await request.get('/api/service_status');

            // Get PID if service is online
            let pid = null;
            if (response.data.status === 'online') {
                try {
                    const pidResponse = await request.get('/api/service_pid');
                    pid = pidResponse.data.pid;
                } catch (error) {
                    console.error('Failed to fetch service PID:', error);
                }
            }

            setServiceData(prev => ({
                ...prev,
                ...response.data,
                pid,
                loading: false
            }));
        } catch (error) {
            console.error('Failed to fetch service status:', error);
            setServiceData(prev => ({
                ...prev,
                loading: false
            }));
        }
    };

    const handleServiceAction = async (action: any) => {
        if (serviceData.actionInProgress) return;

        setServiceData(prev => ({
            ...prev,
            actionInProgress: action,
            loading: true
        }));

        try {
            let endpoint;
            switch (action) {
                case 'start':
                    endpoint = '/api/start_server';
                    break;
                case 'stop':
                    endpoint = '/api/stop_server';
                    break;
                case 'restart':
                    endpoint = '/api/restart_server';
                    break;
                default:
                    throw new Error(`Unknown action: ${action}`);
            }

            const response = await request.post(endpoint);

            if (response.data.success) {
                // Short delay to allow service to fully start/stop/restart before checking status
                setTimeout(fetchServiceStatus, 2000);
            } else {
                console.error(`Service ${action} failed`);
                setServiceData(prev => ({
                    ...prev,
                    actionInProgress: null,
                    loading: false
                }));
            }
        } catch (error) {
            console.error(`Service ${action} error:`, error);
            setServiceData(prev => ({
                ...prev,
                actionInProgress: null,
                loading: false
            }));
        }
    };

    const getStatusColor = () => {
        switch (serviceData.status) {
            case 'online':
                return 'bg-green-500';
            case 'offline':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = () => {
        const {status, pid} = serviceData;
        if (status === 'online') {
            return `Service Status: Running${pid ? ` (PID: ${pid})` : ''}`;
        } else if (status === 'offline') {
            return 'Service Status: Stopped';
        }
        return 'Service Status: Unknown';
    };

    // Determine which buttons should be enabled based on service status
    const canStart = serviceData.status === 'offline' && !serviceData.loading;
    const canStop = serviceData.status === 'online' && !serviceData.loading;
    const canRestart = serviceData.status === 'online' && !serviceData.loading;
    const isDisabled1 = !canStart || !!serviceData.actionInProgress;
    const isDisabled2 = !canStop || !!serviceData.actionInProgress;
    const isDisabled3 = !canRestart || !!serviceData.actionInProgress;


    // Helper to determine button state
    const getButtonClass = (action: string | null) => {
        const baseClass = "px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 flex items-center ";

        if (serviceData.actionInProgress === action) {
            // Action in progress
            return baseClass + "opacity-75 cursor-not-allowed ";
        }

        switch (action) {
            case 'start':
                return baseClass + (canStart ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-green-300 cursor-not-allowed");
            case 'stop':
                return baseClass + (canStop ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" : "bg-red-300 cursor-not-allowed");
            case 'restart':
                return baseClass + (canRestart ? "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500" : "bg-yellow-300 cursor-not-allowed");
            default:
                return baseClass;
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium mb-4">Service Control</h4>

            <div className="flex space-x-4 justify-center">
                <button
                    type="button"
                    className={getButtonClass('start')}
                    onClick={() => handleServiceAction('start')}
                    disabled={isDisabled1}
                >
                    {serviceData.actionInProgress === 'start' ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Starting...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                      clipRule="evenodd"></path>
                            </svg>
                            Start Service
                        </>
                    )}
                </button>

                <button
                    type="button"
                    className={getButtonClass('stop')}
                    onClick={() => handleServiceAction('stop')}
                    disabled={isDisabled2}
                >
                    {serviceData.actionInProgress === 'stop' ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Stopping...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                                      clipRule="evenodd"></path>
                            </svg>
                            Stop Service
                        </>
                    )}
                </button>

                <button
                    type="button"
                    className={getButtonClass('restart')}
                    onClick={() => handleServiceAction('restart')}
                    disabled={isDisabled3}
                >
                    {serviceData.actionInProgress === 'restart' ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Restarting...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                      clipRule="evenodd"></path>
                            </svg>
                            Restart Service
                        </>
                    )}
                </button>
            </div>

            <div className="mt-4">
                <div className="bg-gray-200 p-3 rounded-md">
                    <div className="flex items-center">
                        <div className={`w-3 h-3 ${getStatusColor()} rounded-full mr-2`}></div>
                        <p className="text-sm font-medium">{getStatusText()}</p>
                    </div>
                    {serviceData.status === 'online' && (
                        <p className="text-xs text-gray-600 mt-1">Uptime: {serviceData.uptime}</p>
                    )}
                </div>
            </div>
        </div>
    );
};


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