// NetworkSettings.tsx
import React, {useState, useEffect, ChangeEvent, FormEvent} from 'react';
import {useConfig} from "../providers/ConfigContext";
import {HelpCircle, PlusCircle, X} from "lucide-react";

// Define the interface for the form data
interface NetworkFormData {
    server_network: string;
    netmask: string;
    dns_servers: string[];
    push_dns: boolean;
    duplicate_cn: boolean;
}

const NetworkSettings: React.FC = () => {
    const {settings, updateSection, loading} = useConfig();
    const [formData, setFormData] = useState<NetworkFormData>({
        server_network: '10.8.0.0',
        netmask: '255.255.255.0',
        dns_servers: ['8.8.8.8', '8.8.4.4'],
        push_dns: true,
        duplicate_cn: false
    });

    useEffect(() => {
        if (settings.network) {
            // setFormData(settings.network);
        }
    }, [settings.network]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddDns = (dns: string): void => {
        setFormData(prev => ({
            ...prev,
            dns_servers: [...prev.dns_servers, dns]
        }));
    };

    const handleRemoveDns = (index: number): void => {
        setFormData(prev => ({
            ...prev,
            dns_servers: prev.dns_servers.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        await updateSection('network', formData);
    };

    return (
        <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Network Settings Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Network Configuration</h4>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <label className="col-span-3 flex items-center">VPN Subnet</label>
                        <div className="col-span-7">
                            <input type="text"
                                   name="server_network"
                                   value={formData.server_network}
                                   onChange={handleChange}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <label className="col-span-3 flex items-center">Subnet Mask</label>
                        <div className="col-span-7">
                            <input type="text"
                                   name="netmask"
                                   value={formData.netmask}
                                   onChange={handleChange}
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                    </div>

                    <DNSServersSection
                        dnsServers={formData.dns_servers}
                        onAddDns={handleAddDns}
                        onRemoveDns={handleRemoveDns}
                    />
                </div>

                {/* Traffic Control Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Traffic Control</h4>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <label className="col-span-7 flex items-center">Allow duplicate clients (same
                            certificate)</label>
                        <div className="col-span-3">
                            <label className="inline-flex relative items-center cursor-pointer">
                                <input type="checkbox"
                                       name="duplicate_cn"
                                       checked={formData.duplicate_cn}
                                       onChange={handleChange}
                                       className="sr-only peer"/>
                                <div
                                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <label className="col-span-7 flex items-center">Push DNS to clients</label>
                        <div className="col-span-3">
                            <label className="inline-flex relative items-center cursor-pointer">
                                <input type="checkbox"
                                       name="push_dns"
                                       checked={formData.push_dns}
                                       onChange={handleChange}
                                       className="sr-only peer"/>
                                <div
                                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                      clipRule="evenodd"/>
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
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <label className="col-span-3 flex items-center">Client IP Assignment</label>
                        <div className="col-span-7">
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {/* options go here */}
                            </select>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <button className={"rounded bg-blue-300 text-white px-2 py-1 cursor-pointer"} type="submit"
                        disabled={loading}>
                    {loading ? 'Saving...' : 'Save Network Settings'}
                </button>
            </form>

        </div>
    );
};

interface DNSServersProps {
    dnsServers: string[];
    onAddDns: (dns: string) => void;
    onRemoveDns: (index: number) => void;
}

const DNSServersSection: React.FC<DNSServersProps> = ({dnsServers, onAddDns, onRemoveDns}) => {
    const [dnsInput, setDnsInput] = useState<string>('');

    const handleAddDns = () => {
        if (dnsInput && dnsInput.trim() !== '') {
            onAddDns(dnsInput.trim());
            setDnsInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddDns();
        }
    };

    return (
        <div className="grid grid-cols-12 items-start gap-4 mb-6">
            <label className="col-span-3 flex items-center font-medium text-gray-700">
                DNS Servers
            </label>
            <div className="col-span-7">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    {/* DNS Items Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {dnsServers.length > 0 ? (
                            dnsServers.map((dns, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md text-blue-700 border border-blue-100"
                                >
                                    <span className="font-medium">{dns}</span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveDns(index)}
                                        className="text-blue-500 hover:text-blue-700 focus:outline-none"
                                        aria-label="Remove DNS server"
                                    >
                                        <X size={16}/>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-gray-500 italic text-sm">
                                No DNS servers configured
                            </div>
                        )}
                    </div>

                    {/* Input Field with Add Button */}
                    <div className="flex mt-2">
                        <input
                            type="text"
                            value={dnsInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setDnsInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add DNS server (e.g. 8.8.8.8)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={handleAddDns}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <PlusCircle size={16} className="mr-1"/>
                            Add
                        </button>
                    </div>

                    {/* Helper Text */}
                    <div className="mt-2 text-xs text-gray-500 flex items-start">
                        <HelpCircle size={14} className="mr-1 flex-shrink-0 mt-0.5"/>
                        <span>Add DNS servers that will be pushed to VPN clients when they connect</span>
                    </div>
                </div>
            </div>

            <div className="col-span-2 flex items-center">
                <div
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-help">
                    <HelpCircle size={16}/>
                </div>
            </div>
        </div>
    );
};

export default NetworkSettings;
