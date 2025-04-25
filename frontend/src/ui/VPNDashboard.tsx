import React, {useState, useEffect} from "react";
import {
    Activity,
    ArrowUpRight,
    Download,
    ExternalLink,
    Info,
    Loader,
    Plus,
    RefreshCw,
    Trash2,
    Wifi,
    WifiOff
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {$} from "../build/request";

// Define TypeScript interfaces
interface VPNClient {
    name: string;
    connected: boolean;
    created: string;
    ip: string;
    last_seen: string;
    transferUp: string;
    transferDown: string;
    bandwidth: string;
    device: string;
    has_ovpn_file: boolean;
}

interface DashboardStats {
    totalClients: number;
    connectedClients: number;
    disconnectedClients: number;
}


const SkeletonStatCard = () => (
    <div className="rounded-lg shadow-md p-4 bg-white animate-pulse">
        <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/4 mt-2"></div>
    </div>
);

const SkeletonClientCard = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 animate-pulse">
        <div className="p-4">
            <div className="flex justify-between items-center mb-3">
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded-full w-1/4"></div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-100 p-2 rounded">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
);

// Card component for statistics
const StatCard = ({title, value, color, icon}: any) => (
    <div className={`rounded-lg shadow-md p-4 bg-${color} text-white`}>
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
            {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

// Client card component
const ClientCard = ({client, onViewDetails, onDownloadConfig, onRevokeClient, onOpenDetailPage}: any) => {
    console.log(onOpenDetailPage)
    const statusColor = client.connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    const statusIcon = client.connected ? <Wifi size={16}/> : <WifiOff size={16}/>;

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-800 truncate">{client.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${statusColor}`}>
            {statusIcon}
                        {client.connected ? "Connected" : "Disconnected"}
          </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p>Created: {client.created}</p>
                    {client.connected && <p>IP: {client.ip}</p>}
                    <p>Last seen: {client.last_seen}</p>
                    <p>Device: {client.device}</p>
                </div>

                {client.connected && (
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                        <div className="bg-blue-50 p-2 rounded">
                            <div className="text-blue-600 font-medium">Upload</div>
                            <div>{client.transferUp}</div>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded">
                            <div className="text-indigo-600 font-medium">Download</div>
                            <div>{client.transferDown}</div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => onViewDetails(client)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center justify-center gap-1 transition-colors">
                        <Info size={16}/>
                        Details
                    </button>
                    <button
                        onClick={() => onDownloadConfig(client)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center justify-center gap-1 transition-colors">
                        <Download size={16}/>
                        Config
                    </button>
                    <button
                        onClick={() => onRevokeClient(client)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1.5 rounded-md text-sm flex items-center justify-center transition-colors">
                        <Trash2 size={16}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Empty state component
const EmptyState = ({searchActive, onClearFilters}: any) => {
    const navigate = useNavigate()
    return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex flex-col items-center justify-center">
                {searchActive ? (
                    <>
                        <div className="text-gray-400 mb-4 p-4 bg-gray-50 rounded-full">
                            <WifiOff size={48}/>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No clients found</h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                            No clients match your current search or filter criteria. Try adjusting your search
                            parameters.
                        </p>
                        <button
                            onClick={onClearFilters}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Clear Filters
                        </button>
                    </>
                ) : (
                    <>
                        <div className="mb-6 relative">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                                <Wifi size={48} className="text-blue-500"/>
                            </div>
                            <div
                                className="absolute top-0 right-0 animate-ping w-6 h-6 bg-green-400 rounded-full opacity-75"></div>
                            <div
                                className="absolute bottom-0 left-0 animate-ping delay-300 w-4 h-4 bg-blue-400 rounded-full opacity-75"></div>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No VPN clients yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                            Get started by creating your first VPN client. Once created, you'll be able to manage all
                            your
                            clients from this dashboard.
                        </p>
                        <button
                            onClick={() => {
                                navigate("/clients/create")
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                            <Plus size={18}/>
                            Create Your First Client
                        </button>
                    </>
                )}
            </div>
        </div>
    )
};

// Search and filter component
const SearchAndFilter = ({onSearch, onFilterChange, filter}: any) => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
            <input
                type="text"
                placeholder="Search clients..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => onSearch(e.target.value)}
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"/>
                </svg>
            </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => onFilterChange('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                All
            </button>
            <button
                onClick={() => onFilterChange('connected')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'connected' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Connected
            </button>
            <button
                onClick={() => onFilterChange('disconnected')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'disconnected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Disconnected
            </button>
        </div>
    </div>
);

// Main dashboard component
const VPNDashboard = () => {
    const [clients, setClients] = useState<VPNClient[]>([]);
    const [filteredClients, setFilteredClients] = useState<VPNClient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<VPNClient | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading data from API
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            $.post<VPNClient[]>({
                url: "/api/client_list", data: {}
            }).then(response => {
                console.log(response)
                setClients(response.data);
                setFilteredClients(response.data);
            }).done(() => setIsLoading(false));


        };

        loadData().then();
    }, []);

    // Calculate dashboard stats
    const stats: DashboardStats = {
        totalClients: clients.length,
        connectedClients: clients.filter(client => client.connected).length,
        disconnectedClients: clients.filter(client => !client.connected).length
    };

    // Apply search and filters
    useEffect(() => {
        let result = [...clients];

        if (searchTerm) {
            result = result.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.device.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filter === 'connected') {
            result = result.filter(client => client.connected);
        } else if (filter === 'disconnected') {
            result = result.filter(client => !client.connected);
        }

        setFilteredClients(result);
    }, [clients, searchTerm, filter]);

    // Handle client actions
    const handleViewDetails = (client: React.SetStateAction<VPNClient | null>) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };
    const navigate = useNavigate()

    const handleOpenDetailPage = (client: VPNClient) => {
        navigate(`/client/${client.name}`);
        setIsModalOpen(false);
    };

    const handleDownloadConfig = (client: VPNClient) => {
        // if (client.has_ovpn_file)
            location.href = "/download/" + client.name
    };

    const handleRevokeClient = (client: VPNClient) => {
        // Mock revocation with confirmation
        if (window.confirm(`Are you sure you want to revoke access for ${client.name}?`)) {
            setClients(clients.filter(c => c.name !== client.name));
        }
    };

    const handleRefresh = () => {
        // Mock refresh action
        setIsLoading(true);
        setTimeout(() => {
            setLastUpdated(new Date());
            setIsLoading(false);
        }, 1000);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilter('all');
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-6">
                {/* Header Section */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">VPN Clients Dashboard</h1>
                        <p className="text-gray-500 text-sm">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                            {isLoading ? <Loader size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
                            Refresh
                        </button>
                        <button
                            disabled={isLoading}
                            onClick={() => {
                                navigate("/clients/create")
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                            <Plus size={16}/>
                            Add Client
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {isLoading ? (
                        <>
                            <SkeletonStatCard/>
                            <SkeletonStatCard/>
                            <SkeletonStatCard/>
                            <SkeletonStatCard/>
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Total Clients"
                                value={stats.totalClients}
                                color="blue-600"
                                icon={<Activity size={20}/>}
                            />
                            <StatCard
                                title="Connected Clients"
                                value={stats.connectedClients}
                                color="green-600"
                                icon={<Wifi size={20}/>}
                            />
                            <StatCard
                                title="Disconnected Clients"
                                value={stats.disconnectedClients}
                                color="red-600"
                                icon={<WifiOff size={20}/>}
                            />
                            <div
                                className="rounded-lg shadow-md p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium opacity-90">Total Bandwidth</h3>
                                    <Activity size={20}/>
                                </div>
                                <div className="text-2xl font-bold">6.8 Mbps</div>
                            </div>
                        </>
                    )}
                </div>

                {/* Search and Filter - only show if not loading and has clients */}
                {!isLoading && clients.length > 0 && (
                    <SearchAndFilter
                        onSearch={setSearchTerm}
                        onFilterChange={setFilter}
                        filter={filter}
                    />
                )}

                {/* Client Cards Grid or Loading State */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonClientCard/>
                        <SkeletonClientCard/>
                        <SkeletonClientCard/>
                    </div>
                ) : clients.length === 0 ? (
                    <EmptyState searchActive={false} onClearFilters={clearFilters}/>
                ) : filteredClients.length === 0 ? (
                    <EmptyState searchActive={true} onClearFilters={clearFilters}/>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.map(client => (
                            <ClientCard
                                key={client.name}
                                client={client}
                                onViewDetails={handleViewDetails}
                                onDownloadConfig={handleDownloadConfig}
                                onRevokeClient={handleRevokeClient}
                                onOpenDetailPage={handleOpenDetailPage}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedClient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-full overflow-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Client Details</h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleOpenDetailPage(selectedClient)}
                                        title="Open in full page"
                                        className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-full transition-colors">
                                        <ExternalLink size={18}/>
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className={`w-3 h-3 rounded-full ${selectedClient.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <h3 className="text-lg font-medium">{selectedClient.name}</h3>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${selectedClient.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {selectedClient.connected ? 'Connected' : 'Disconnected'}
                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Created</p>
                                        <p className="font-medium">{selectedClient.created}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Last Seen</p>
                                        <p className="font-medium">{selectedClient.last_seen}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">IP Address</p>
                                        <p className="font-medium">{selectedClient.ip}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Device</p>
                                        <p className="font-medium">{selectedClient.device}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Current Bandwidth</p>
                                        <p className="font-medium">{selectedClient.bandwidth}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-md font-medium mb-3">Transfer Statistics</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-blue-600 font-medium">Upload</span>
                                            <span
                                                className="text-sm text-blue-800 font-bold">{selectedClient.transferUp}</span>
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '40%'}}></div>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-indigo-600 font-medium">Download</span>
                                            <span
                                                className="text-sm text-indigo-800 font-bold">{selectedClient.transferDown}</span>
                                        </div>
                                        <div className="w-full bg-indigo-200 rounded-full h-2">
                                            <div className="bg-indigo-600 h-2 rounded-full"
                                                 style={{width: '75%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                    Close
                                </button>
                                <button
                                    onClick={() => handleOpenDetailPage(selectedClient)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                                    <ArrowUpRight size={16}/>
                                    Open Full Page
                                </button>
                                <button
                                    onClick={() => handleDownloadConfig(selectedClient)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                                    <Download size={16}/>
                                    Download Config
                                </button>
                                <button
                                    onClick={() => {
                                        handleRevokeClient(selectedClient);
                                        setIsModalOpen(false);
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                                    <Trash2 size={16}/>
                                    Revoke Access
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VPNDashboard;