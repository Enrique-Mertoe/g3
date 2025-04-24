// Types for OpenVPN settings
import request, {$} from "../../build/request.ts";

interface OpenVPNSettings {
    // Performance Tuning
    compression: 'none' | 'lz4' | 'lz4-v2' | 'lzo';
    mtu: number;
    fragmentSize: number;
    tcpMssFix: boolean;

    // Process Management
    user: string;
    group: string;
    persistKey: boolean;
    persistTun: boolean;

    // Logging & Debugging
    verbosity: number;
    statusFile: string;
    logFile: string;

    // Custom Configuration
    additionalConfig: string;
}

// API service for OpenVPN
class OpenVPNService {
    private baseUrl = '/api';

    async getSettings(): Promise<OpenVPNSettings> {
        const response = await request.get(`${this.baseUrl}/vpn/settings`);
        if (!response.data.error) {
            throw new Error('Failed to fetch OpenVPN settings');
        }
        return response.data;
    }

    async updateSettings(settings: OpenVPNSettings): Promise<{ success: boolean }> {
        return new Promise((resolve, reject) => {
            $.post<{ success: boolean }>({
                url: `${this.baseUrl}/vpn/settings`, data: Object.create(settings)
            })
                .then(res => {
                    resolve(res.data)
                }).catch(() => {
                reject({success:false,message:'Failed to update OpenVPN settings'})
            })
        })
    }

    async restartServer(): Promise<{ success: boolean }> {
        const response = await fetch(`${this.baseUrl}/restart_server`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to restart OpenVPN server');
        }

        return response.json();
    }

    async stopServer(): Promise<{ success: boolean }> {
        const response = await fetch(`${this.baseUrl}/stop_server`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to stop OpenVPN server');
        }

        return response.json();
    }

    async startServer(): Promise<{ success: boolean }> {
        const response = await fetch(`${this.baseUrl}/start_server`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to start OpenVPN server');
        }

        return response.json();
    }
}

// OpenVPN Settings Component
import React, {useState, useEffect} from 'react';
import {HelpCircle, RefreshCw, Save} from 'lucide-react';

// Create an instance of the service
const vpnService = new OpenVPNService();

const AdvanceSettings: React.FC = () => {
    const [settings, setSettings] = useState<OpenVPNSettings>({
        compression: 'none',
        mtu: 1500,
        fragmentSize: 1400,
        tcpMssFix: true,
        user: 'nobody',
        group: 'nogroup',
        persistKey: true,
        persistTun: true,
        verbosity: 3,
        statusFile: '/var/log/openvpn/openvpn-status.log',
        logFile: '/var/log/openvpn.log',
        additionalConfig: '',
    });

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings().then();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await vpnService.getSettings();
            setSettings(data);
            setError(null);
        } catch (err) {
            setError('Failed to load OpenVPN settings. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setSettings(prev => ({
                ...prev,
                [name]: checked,
            }));
        } else if (type === 'number') {
            setSettings(prev => ({
                ...prev,
                [name]: parseInt(value, 10),
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await vpnService.updateSettings(settings);
            if (result.success) {
                setSuccess('Settings saved successfully.');

                // Ask user if they want to restart the server
                const shouldRestart = window.confirm(
                    'Settings have been saved. Would you like to restart the OpenVPN server to apply the changes?'
                );

                if (shouldRestart) {
                    setSuccess('Restarting OpenVPN server...');
                    const restartResult = await vpnService.restartServer();
                    if (restartResult.success) {
                        setSuccess('OpenVPN server restarted successfully.');
                    } else {
                        setError('Failed to restart OpenVPN server.');
                    }
                }
            } else {
                setError('Failed to save settings.');
            }
        } catch (err) {
            setError('An error occurred while saving settings.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin"/>
                <span className="ml-2 text-lg">Loading settings...</span>
            </div>
        );
    }

    // Helper component for tooltips
    const InfoTooltip: React.FC<{ text: string }> = ({text}) => (
        <div className="group relative">
            <HelpCircle className="w-5 h-5 text-gray-500"/>
            <div
                className="absolute z-10 invisible group-hover:visible bg-black text-white p-2 rounded text-sm w-64 bottom-full mb-2 left-1/2 transform -translate-x-1/2">
                {text}
                <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-black"></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">OpenVPN Server Settings</h2>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                    <p>{success}</p>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Performance Tuning Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Performance Tuning</h4>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <label htmlFor="compression" className="col-span-3 flex items-center">Compression</label>
                        <div className="col-span-7">
                            <select
                                id="compression"
                                name="compression"
                                value={settings.compression}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="none">None (recommended)</option>
                                <option value="lz4">LZ4</option>
                                <option value="lz4-v2">LZ4-v2</option>
                                <option value="lzo">LZO (legacy)</option>
                            </select>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <InfoTooltip
                                text="Data compression can improve throughput for some types of traffic, but may increase CPU usage and can potentially expose the connection to certain attacks."/>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <label htmlFor="mtu" className="col-span-3 flex items-center">MTU</label>
                        <div className="col-span-7">
                            <input
                                type="number"
                                id="mtu"
                                name="mtu"
                                value={settings.mtu}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-2 flex items-center">
                            <InfoTooltip
                                text="Maximum Transmission Unit (MTU) defines the largest packet size that can be transmitted. Default is 1500 bytes for most networks."/>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <label htmlFor="fragmentSize" className="col-span-3 flex items-center">Fragment Size</label>
                        <div className="col-span-7">
                            <input
                                type="number"
                                id="fragmentSize"
                                name="fragmentSize"
                                value={settings.fragmentSize}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-2 flex items-center">
                            <InfoTooltip
                                text="Fragment size should be set lower than MTU to avoid fragmentation issues. Recommended: MTU - 100."/>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <label htmlFor="tcpMssFix" className="col-span-3 flex items-center">TCP MSS Fix</label>
                        <div className="col-span-7">
                            <label className="inline-flex relative items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="tcpMssFix"
                                    name="tcpMssFix"
                                    checked={settings.tcpMssFix}
                                    onChange={handleInputChange}
                                    className="sr-only peer"
                                />
                                <div
                                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <InfoTooltip
                                text="Prevents TCP fragmentation issues by adjusting the MSS value. Generally recommended to be enabled."/>
                        </div>
                    </div>
                </div>

                {/* Process Management Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Process Management</h4>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <label className="col-span-3 flex items-center">User/Group</label>
                        <div className="col-span-4">
                            <input
                                type="text"
                                id="user"
                                name="user"
                                value={settings.user}
                                onChange={handleInputChange}
                                placeholder="User"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-3">
                            <input
                                type="text"
                                id="group"
                                name="group"
                                value={settings.group}
                                onChange={handleInputChange}
                                placeholder="Group"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-2 flex items-center">
                            <InfoTooltip
                                text="User and group under which OpenVPN runs. For security, it should be a non-privileged account."/>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <label className="col-span-3 flex items-center">Persist Options</label>
                        <div className="col-span-7">
                            <div className="mb-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="persistKey"
                                        name="persistKey"
                                        checked={settings.persistKey}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2">Persist Key</span>
                                </label>
                            </div>
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="persistTun"
                                        name="persistTun"
                                        checked={settings.persistTun}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2">Persist TUN</span>
                                </label>
                            </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <InfoTooltip
                                text="These options keep the TUN/TAP device and encryption keys persistent across restarts, improving reconnection speed."/>
                        </div>
                    </div>
                </div>

                {/* Logging & Debugging Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Logging & Debugging</h4>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <label htmlFor="verbosity" className="col-span-3 flex items-center">Verbosity</label>
                        <div className="col-span-7">
                            <select
                                id="verbosity"
                                name="verbosity"
                                value={settings.verbosity}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={0}>0 - Quiet (errors only)</option>
                                <option value={1}>1 - Minimal</option>
                                <option value={2}>2 - Normal</option>
                                <option value={3}>3 - Verbose</option>
                                <option value={4}>4 - Debug</option>
                                <option value={5}>5 - Maximum Debug</option>
                            </select>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <InfoTooltip
                                text="Controls the detail level of OpenVPN logs. Higher values provide more information but increase log size."/>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <label htmlFor="statusFile" className="col-span-3 flex items-center">Status File</label>
                        <div className="col-span-7">
                            <input
                                type="text"
                                id="statusFile"
                                name="statusFile"
                                value={settings.statusFile}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-2 flex items-center">
                            <InfoTooltip
                                text="Path to the OpenVPN status file that contains runtime statistics and connected clients information."/>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <label htmlFor="logFile" className="col-span-3 flex items-center">Log File</label>
                        <div className="col-span-7">
                            <input
                                type="text"
                                id="logFile"
                                name="logFile"
                                value={settings.logFile}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-2 flex items-center">
                            <InfoTooltip
                                text="Path to the main OpenVPN log file for operational logs and error messages."/>
                        </div>
                    </div>
                </div>

                {/* Custom Configuration Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Custom Configuration</h4>

                    <div className="grid grid-cols-12 gap-4">
                        <label htmlFor="additionalConfig" className="col-span-3 flex items-center">Additional
                            Config</label>
                        <div className="col-span-7">
              <textarea
                  id="additionalConfig"
                  name="additionalConfig"
                  value={settings.additionalConfig}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                  placeholder="Enter additional OpenVPN configuration directives here (one per line)"
              ></textarea>
                        </div>
                        <div className="col-span-2 flex items-center">
                            <InfoTooltip
                                text="Advanced configuration directives that will be added directly to the OpenVPN config file. Each line should contain a single directive."/>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => fetchSettings()}
                        className="px-4 py-2 flex items-center bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        disabled={loading || saving}
                    >
                        <RefreshCw className="w-4 h-4 mr-2"/>
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 flex items-center bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading || saving}
                    >
                        <Save className="w-4 h-4 mr-2"/>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdvanceSettings;