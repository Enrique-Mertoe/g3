import Layout from "./home-components/Layout.tsx";
import React, {JSX, useEffect, useState} from "react";
import {$} from "../build/request.ts";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend, LineElement, Filler, PointElement
} from 'chart.js';
import {Line} from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Legend, Tooltip);

export default function HomePage() {
    const [cardsData, setCardsData] = useState<HTopData | null>(null);
    useEffect(() => {
        $.post<HTopData>({url: "/api/basic-info", data: {}})
            .then(res => {
                setCardsData(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);
    return (
        <>
            <Layout>
                <div className="flex-1 overflow-y-auto p-2 bg-gray-100">
                    <HTop info={cardsData}/>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        <Traffic/>

                        <ResourceUsage/>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        <ActiveConnections/>

                        <RecentLogs/>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg">
                                    <i className="fas fa-sync text-2xl mb-2"></i>
                                    <span className="text-sm">Restart Server</span>
                                </button>
                                <button
                                    className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg">
                                    <i className="fas fa-user-plus text-2xl mb-2"></i>
                                    <span className="text-sm">Add Client</span>
                                </button>
                                <button
                                    className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg">
                                    <i className="fas fa-download text-2xl mb-2"></i>
                                    <span className="text-sm">Backup Config</span>
                                </button>
                                <button
                                    className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg">
                                    <i className="fas fa-shield-alt text-2xl mb-2"></i>
                                    <span className="text-sm">Security Check</span>
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Connection Locations</h3>
                            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                <img src="/api/placeholder/640/320" alt="World Map with Connection Points"
                                     className="max-h-full rounded-lg"/>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}


const HTop = ({info}: { info: HTopData | null }) => {
    const isLoading = !info;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Card 1: Server Status */}
            <div className={`bg-white rounded-lg shadow-md p-6 flex items-center ${isLoading && 'animate-pulse'}`}>
                <div className="rounded-full p-3 bg-green-100">
                    <i className="fas fa-server text-green-600 text-2xl"></i>
                </div>
                <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Server Status</h3>
                    <div className="flex items-center">
                        {isLoading ? (
                            <div className="w-20 h-5 bg-gray-200 rounded-md"></div>
                        ) : (
                            <>
                                <span className="text-xl font-bold text-gray-800">{info?.server.status}</span>
                                <span className="ml-2 inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">
                        {isLoading ?
                            <div className="w-28 h-3 bg-gray-200 mt-1 rounded-md"></div> : `Uptime: ${info?.server.uptime}`}
                    </p>
                </div>
            </div>

            {/* Card 2: Active Users */}
            <div className={`bg-white rounded-lg shadow-md p-6 flex items-center ${isLoading && 'animate-pulse'}`}>
                <div className="rounded-full p-3 bg-blue-100">
                    <i className="fas fa-users text-blue-600 text-2xl"></i>
                </div>
                <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Active Users</h3>
                    <div className="flex items-center">
                        {isLoading ? (
                            <div className="w-20 h-5 bg-gray-200 rounded-md"></div>
                        ) : (
                            <>
                                <span
                                    className="text-xl font-bold text-gray-800">{info?.active_users.active_count}</span>
                                <span className="ml-2 text-green-500 text-sm">+${info?.active_users.change}</span>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">
                        {isLoading ?
                            <div
                                className="w-28 h-3 bg-gray-200 mt-1 rounded-md"></div> : `From ${info?.active_users.total_count} registered`}
                    </p>
                </div>
            </div>

            {/* Card 3: Data Transfer */}
            <div className={`bg-white rounded-lg shadow-md p-6 flex items-center ${isLoading && 'animate-pulse'}`}>
                <div className="rounded-full p-3 bg-purple-100">
                    <i className="fas fa-exchange-alt text-purple-600 text-2xl"></i>
                </div>
                <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Data Transfer</h3>
                    <div className="flex items-center">
                        {isLoading ? (
                            <div className="w-24 h-5 bg-gray-200 rounded-md"></div>
                        ) : (
                            <span className="text-xl font-bold text-gray-800">{info?.data_transfer.total}</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">
                        {isLoading ? <div
                            className="w-24 h-3 bg-gray-200 mt-1 rounded-md"></div> : `Today: ${info?.data_transfer.today}`}
                    </p>
                </div>
            </div>

            {/* Card 4: Security Alerts */}
            <div className={`bg-white rounded-lg shadow-md p-6 flex items-center ${isLoading && 'animate-pulse'}`}>
                <div className="rounded-full p-3 bg-red-100">
                    <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                </div>
                <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Security Alerts</h3>
                    <div className="flex items-center">
                        {isLoading ? (
                            <div className="w-12 h-5 bg-gray-200 rounded-md"></div>
                        ) : (
                            <>
                                <span className="text-xl font-bold text-gray-800">{info?.security.count}</span>
                                <span className="ml-2 text-red-500 text-sm">+{info?.security.change}</span>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">
                        {isLoading ? <div
                            className="w-24 h-3 bg-gray-200 mt-1 rounded-md"></div> : `Last: ${info?.security.latest}`}
                    </p>
                </div>
            </div>
        </div>
    );
};

const Traffic = () => {
    const [chartData, setChartData] = useState<any>(null);
    useEffect(() => {
        $.post<TrafficData>({url: "/api/traffic_data", data: {period: "day"}})
            .then(res => {
                const {labels, datasets} = res.data;

                // Enhance the backend datasets with visual styles
                const styledDatasets = datasets.map((ds: any) => {
                    const isDownload = ds.label.toLowerCase() === "download";
                    return {
                        ...ds,
                        borderColor: isDownload ? 'rgb(59, 130, 246)' : 'rgb(139, 92, 246)',
                        backgroundColor: isDownload ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    };
                });

                setChartData({
                    labels,
                    datasets: styledDatasets
                });
            })
            .catch(err => console.error("Failed to fetch traffic data:", err));
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'GB'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top' as const
            }
        }
    };
    return (
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Network Traffic</h3>
                <div className="flex space-x-2">
                    <button
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm active">Today
                    </button>
                    <button
                        className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-md text-sm">Week
                    </button>
                    <button
                        className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-md text-sm">Month
                    </button>
                </div>
            </div>
            <div className="h-64">
                {chartData && <Line style={{
                    display: "block",
                    boxSizing: "border-box",
                    height: "256px",
                    width: "390px"
                }} data={chartData} options={options}/>}
            </div>
        </div>
    )
}


type LogType = "error" | "success" | "config" | "user_add" | "server";

interface LogEntry {
    type: LogType;
    message: string;
    details: string;
    time_ago: string;
}

const iconMap: Record<LogType, { icon: string; color: string }> = {
    error: {icon: "fas fa-exclamation-triangle", color: "red"},
    success: {icon: "fas fa-user-check", color: "green"},
    config: {icon: "fas fa-cog", color: "blue"},
    user_add: {icon: "fas fa-user-plus", color: "green"},
    server: {icon: "fas fa-server", color: "yellow"},
};

const RecentLogs: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        $.post<LogEntry[]>({url: "/api/recent_logs?limit=5", data: {}})
            .then(res => setLogs(res.data))
            .catch((err) => console.error("Error fetching logs:", err));
    }, []);

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Recent Logs</h3>
                <button className="text-blue-500 hover:text-blue-700 text-sm flex items-center">
                    <span>View All</span>
                    <i className="fas fa-chevron-right ml-1"></i>
                </button>
            </div>
            <div className="space-y-3">
                {logs.map((log, index) => {
                    const iconData = iconMap[log.type] || iconMap["config"];
                    return (
                        <div
                            key={index}
                            className="flex items-start p-2 rounded-lg hover:bg-gray-50"
                        >
                            <div
                                className={`flex-shrink-0 rounded-full p-2 bg-${iconData.color}-100 text-${iconData.color}-600`}
                            >
                                <i className={`${iconData.icon} text-sm`}></i>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-800">{log.message}</p>
                                <p className="text-xs text-gray-500">
                                    {log.details} - {log.time_ago}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface UsageData {
    cpu: number;
    memory: number;
    disk: number;
    bandwidth: number;
}

const ResourceUsage: React.FC = () => {
    const [usage, setUsage] = useState<UsageData | null>(null);

    useEffect(() => {
        $.post<UsageData>({url: "/api/resource_usage", data: {}})
            .then(res => setUsage(res.data))
            .catch((err) => console.error("Failed to fetch resource usage", err));
    }, []);

    const renderBar = (
        label: string,
        value: number,
        colorClass: string
    ): JSX.Element => (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-medium text-gray-700">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={`${colorClass} h-2.5 rounded-full`}
                    style={{width: `${value}%`}}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Resource Usage</h3>
            {usage ? (
                <div className="space-y-4">
                    {renderBar("CPU", usage.cpu, "bg-blue-600")}
                    {renderBar("Memory", usage.memory, "bg-purple-600")}
                    {renderBar("Disk", usage.disk, "bg-green-600")}
                    {renderBar("Bandwidth", usage.bandwidth, "bg-yellow-600")}
                </div>
            ) : (
                <p className="text-sm text-gray-500">Loading...</p>
            )}
        </div>
    );
};

interface ActiveConnection {
    username: string;
    fullName: string;
    ipAddress: string;
    connectedSince: string; // could be a timestamp or formatted string
    download: string; // e.g., "4.2 GB"
    upload: string;   // e.g., "1.7 GB"
}

const ActiveConnections = () => {
    const [connections, setConnections] = useState<ActiveConnection[]>([]);

    useEffect(() => {
        $.post<ActiveConnection[]>({ url: "/api/active_connections", data: {} })
            .then(res => setConnections(res.data))
            .catch((err) => console.error("Failed to fetch active connections", err));
    }, []);

    return (
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Active Connections</h3>
                <button className="text-blue-500 hover:text-blue-700 text-sm flex items-center">
                    <span>View All</span>
                    <i className="fas fa-chevron-right ml-1"></i>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connected Since</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Transfer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {connections.map((conn, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-8 w-8 rounded-full" src="/api/placeholder/32/32" alt="User"/>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{conn.username}</div>
                                            <div className="text-xs text-gray-500">{conn.fullName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{conn.ipAddress}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{conn.connectedSince}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <span className="mr-1">↓</span>{conn.download}
                                        <span className="mx-1">|</span>
                                        <span className="mr-1">↑</span>{conn.upload}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                                        <i className="fas fa-info-circle"></i>
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                        <i className="fas fa-times-circle"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};