import {useState, useEffect, useRef} from 'react';
import {AlertCircle, Clock, Download, Filter, List, Search, Shield, User, Users, Wifi, Zap} from 'lucide-react';
import Layout from "./home-components/Layout.tsx";
import Config from "../assets/config.ts";

// Log entry interface
interface LogEntry {
    id: string;
    timestamp: string;
    type: 'connection' | 'authentication' | 'error' | 'warning' | 'info' | 'system' | 'network';
    message: string;
    ipAddress?: string;
    username?: string;
}

// OpenVPN Log Viewer Component
export default function LogsPage() {
    // State
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const [eventSource, setEventSource] = useState<EventSource | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

    // Refs
    const logContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Filter options with icon components for log types
    const filterOptions = [
        {value: 'connection', label: 'Connection', icon: Wifi},
        {value: 'authentication', label: 'Authentication', icon: Shield},
        {value: 'error', label: 'Errors', icon: AlertCircle},
        {value: 'warning', label: 'Warnings', icon: AlertCircle},
        {value: 'info', label: 'Info', icon: List},
        {value: 'system', label: 'System', icon: Zap},
        {value: 'network', label: 'Network', icon: Users},
    ];

    const connectToStream = () => {
        // Close existing connection if any
        if (eventSource) {
            eventSource.close();
        }

        try {
            setConnectionStatus('connecting');

            // Create filter parameters for the URL if needed
            let url = Config.baseURL + '/api/openvpn/logs/stream';
            const params = new URLSearchParams();

            if (activeFilters.length > 0) {
                params.append('type', activeFilters.join(','));
            }

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            // Add parameters to URL if there are any
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            // For development/testing, use the mock endpoint
            // url = '/api/openvpn/mock-logs/stream';

            // Create new event source
            const newEventSource = new EventSource(url);

            // Handle connection open
            newEventSource.onopen = () => {
                setConnectionStatus('connected');
                setError(null);
            };

            // Handle messages
            newEventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'initial') {
                        // Replace all logs with initial data
                        setLogs(data.logs);
                        setIsLoading(false);
                    } else if (data.type === 'update') {
                        // Append new logs
                        setLogs(prevLogs => [...prevLogs, ...data.logs]);
                    }
                } catch (err) {
                    console.error('Error parsing SSE message:', err);
                }
            };

            // Handle errors
            newEventSource.onerror = (err) => {
                console.error('SSE connection error:', err);
                setConnectionStatus('disconnected');
                setError('Connection to log stream failed. Reconnecting...');

                // Close the connection
                newEventSource.close();

                // Try to reconnect after a delay
                setTimeout(() => {
                    connectToStream();
                }, 5000);
            };

            // Save the event source
            setEventSource(newEventSource);

        } catch (err) {
            console.error('Failed to connect to log stream:', err);
            setError('Failed to connect to log stream. Will retry automatically.');
            setConnectionStatus('disconnected');

            // Try to reconnect after a delay
            setTimeout(() => {
                connectToStream();
            }, 5000);
        }
    };
    useEffect(() => {
        connectToStream();

        return () => {
            // Clean up event source on unmount
            if (eventSource) {
                eventSource.close();
            }
        };
    }, []);

    // Reconnect when search or filters change
    useEffect(() => {
        // Don't reconnect on the first render
        if (connectionStatus !== 'disconnected') {
            connectToStream();
        }
    }, [searchTerm, activeFilters]);

// Filter logs when they change or filters change
    useEffect(() => {
        const filtered = [...logs];

        // Sort logs by timestamp (newest first)
        filtered.sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        setFilteredLogs(filtered);
    }, [logs]);

    // Mock function to fetch logs - replace with your actual API call
    // const fetchLogs = async () => {
    //     try {
    //         setIsLoading(true);
    //
    //         // In a real implementation, this would be a fetch call to your Flask backend
    //         // That reads from /var/log/openvpn/openvpn-status.log
    //         // Example: const response = await fetch('/api/openvpn/logs');
    //
    //
    //         // In real implementation, you'd parse the log file data here
    //         setLogs(mockLogs);
    //         setIsLoading(false);
    //     } catch (err) {
    //         setError('Failed to fetch logs. Please try again.');
    //         setIsLoading(false);
    //     }
    // };

    // // Start polling for logs on component mount
    // useEffect(() => {
    //     fetchLogs();
    //
    //     // Poll for new logs every 3 seconds
    //     const interval = setInterval(() => {
    //         fetchLogs();
    //     }, 3000);
    //
    //     return () => clearInterval(interval);
    // }, []);

    // Filter logs when search term or active filters change
    useEffect(() => {
        let filtered = [...logs];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.ipAddress && log.ipAddress.includes(searchTerm))
            );
        }

        // Apply type filters
        if (activeFilters.length > 0) {
            filtered = filtered.filter(log => activeFilters.includes(log.type));
        }

        setFilteredLogs(filtered);
    }, [logs, searchTerm, activeFilters]);

    // Auto-scroll to bottom when new logs arrive, if auto-scroll is enabled
    useEffect(() => {
        if (autoScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [filteredLogs, autoScroll]);

    // Handle scroll events to toggle auto-scroll
    const handleScroll = () => {
        if (!logContainerRef.current) return;

        const {scrollTop, scrollHeight, clientHeight} = logContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

        // Only enable auto-scroll if user has scrolled to the bottom
        setAutoScroll(isAtBottom);
    };

    // Toggle filter
    const toggleFilter = (filter: string) => {
        if (activeFilters.includes(filter)) {
            setActiveFilters(activeFilters.filter(f => f !== filter));
        } else {
            setActiveFilters([...activeFilters, filter]);
        }
    };

    // Download logs as text file
    const downloadLogs = () => {
        const logsText = filteredLogs
            .map(log => `[${log.timestamp}][${log.type}] ${log.message}`)
            .join('\n');

        const blob = new Blob([logsText], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `openvpn-logs-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Get color class based on log type
    const getLogTypeColor = (type: string) => {
        switch (type) {
            case 'error':
                return 'text-red-500';
            case 'warning':
                return 'text-amber-500';
            case 'connection':
                return 'text-emerald-500';
            case 'authentication':
                return 'text-blue-500';
            case 'info':
                return 'text-gray-400';
            case 'system':
                return 'text-purple-500';
            case 'network':
                return 'text-cyan-500';
            default:
                return 'text-gray-300';
        }
    };

    // Get background color for filter buttons
    const getFilterBgColor = (type: string) => {
        if (!activeFilters.includes(type) && activeFilters.length > 0) {
            return 'bg-gray-700 text-gray-400';
        }

        switch (type) {
            case 'error':
                return activeFilters.includes(type) ? 'bg-red-700 text-white' : 'bg-red-500/20 text-red-500';
            case 'warning':
                return activeFilters.includes(type) ? 'bg-amber-700 text-white' : 'bg-amber-500/20 text-amber-500';
            case 'connection':
                return activeFilters.includes(type) ? 'bg-emerald-700 text-white' : 'bg-emerald-500/20 text-emerald-500';
            case 'authentication':
                return activeFilters.includes(type) ? 'bg-blue-700 text-white' : 'bg-blue-500/20 text-blue-500';
            case 'info':
                return activeFilters.includes(type) ? 'bg-gray-600 text-white' : 'bg-gray-500/20 text-gray-400';
            case 'system':
                return activeFilters.includes(type) ? 'bg-purple-700 text-white' : 'bg-purple-500/20 text-purple-500';
            case 'network':
                return activeFilters.includes(type) ? 'bg-cyan-700 text-white' : 'bg-cyan-500/20 text-cyan-500';
            default:
                return 'bg-gray-700 text-gray-300';
        }
    };

    // Get icon component for log type
    const getLogTypeIcon = (type: string) => {
        switch (type) {
            case 'error':
                return <AlertCircle size={16} className={getLogTypeColor(type)}/>;
            case 'warning':
                return <AlertCircle size={16} className={getLogTypeColor(type)}/>;
            case 'connection':
                return <Wifi size={16} className={getLogTypeColor(type)}/>;
            case 'authentication':
                return <Shield size={16} className={getLogTypeColor(type)}/>;
            case 'info':
                return <List size={16} className={getLogTypeColor(type)}/>;
            case 'system':
                return <Zap size={16} className={getLogTypeColor(type)}/>;
            case 'network':
                return <Users size={16} className={getLogTypeColor(type)}/>;
            default:
                return <List size={16} className={getLogTypeColor(type)}/>;
        }
    };

    // @ts-ignore
    // @ts-ignore
    return (
        <Layout>
            <div
                className="bg-gray-900 text-white rounded-lg shadow-xl flex flex-col h-full w-full overflow-hidden border border-gray-800">
                {/* Header with controls */}
                <div
                    className="bg-gray-800 p-4 flex flex-col sm:flex-row gap-3 justify-between border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <List className="text-blue-500" size={20}/>
                        <h2 className="text-lg font-semibold">OpenVPN Server Logs</h2>

                        {/* Auto-scroll indicator */}
                        <div
                            className={`ml-4 flex items-center gap-1 px-2 py-1 rounded-full text-xs ${autoScroll ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-700 text-gray-400'}`}>
                            <div
                                className={`w-2 h-2 rounded-full ${autoScroll ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></div>
                            <span>{autoScroll ? 'Live' : 'Paused'}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        {/* Search input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-md pl-8 pr-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Search size={16}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        </div>

                        {/* Filter button */}
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition-all relative"
                        >
                            <Filter size={16}/>
                            {activeFilters.length > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 bg-blue-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilters.length}
              </span>
                            )}
                        </button>

                        {/* Download button */}
                        <button
                            onClick={downloadLogs}
                            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition-all"
                            title="Download logs"
                        >
                            <Download size={16}/>
                        </button>
                    </div>
                </div>

                {/* Filter menu (conditionally rendered) */}
                {showFilterMenu && (
                    <div className="bg-gray-800 p-3 border-b border-gray-700 flex flex-wrap gap-2 animate-fadeIn">
                        {filterOptions.map((filter) => {
                            const FilterIcon = filter.icon;
                            return (
                                <button
                                    key={filter.value}
                                    onClick={() => toggleFilter(filter.value)}
                                    className={`${getFilterBgColor(filter.value)} flex items-center gap-1 text-xs py-1 px-2 rounded-md transition-all`}
                                >
                                    <FilterIcon size={12}/>
                                    {filter.label}
                                </button>
                            );
                        })}
                        {activeFilters.length > 0 && (
                            <button
                                onClick={() => setActiveFilters([])}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs py-1 px-2 rounded-md ml-auto"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Log content */}
                <div
                    ref={logContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-auto p-4 font-mono text-sm bg-gray-900 relative"
                    style={{scrollBehavior: 'smooth'}}
                >
                    {isLoading && logs.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div
                                className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/20 text-red-400 p-4 rounded-md">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16}/>
                                <span>{error}</span>
                            </div>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No logs match your filters
                        </div>
                    ) : (
                        <>
                            {filteredLogs.map((log) => {
                                return (
                                    <div
                                        key={log.id}
                                        className="mb-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded border-l-4 animate-fadeIn transition-colors"
                                        style={{
                                            borderLeftColor: log.type === 'error' ? '#ef4444' :
                                                log.type === 'warning' ? '#f59e0b' :
                                                    log.type === 'connection' ? '#10b981' :
                                                        log.type === 'authentication' ? '#3b82f6' :
                                                            log.type === 'system' ? '#a855f7' :
                                                                log.type === 'network' ? '#06b6d4' : '#6b7280'
                                        }}
                                    >
                                        <div className="flex items-start gap-2">
                                            {getLogTypeIcon(log.type)}

                                            <div className="flex-1">
                                                <div
                                                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12}/>
                            {log.timestamp}
                        </span>

                                                    <span
                                                        className={`text-xs ${getLogTypeColor(log.type)} uppercase font-semibold`}>
                          {log.type}
                        </span>

                                                    {log.username && (
                                                        <span
                                                            className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <User size={10}/>
                                                            {log.username}
                          </span>
                                                    )}

                                                    {log.ipAddress && (
                                                        <span
                                                            className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                            {log.ipAddress}
                          </span>
                                                    )}
                                                </div>

                                                <p className="text-gray-200 break-all">
                                                    {log.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef}/>
                        </>
                    )}

                    {/* Scroll to bottom indicator (shown when auto-scroll is disabled) */}
                    {!autoScroll && (
                        <button
                            onClick={() => {
                                bottomRef.current?.scrollIntoView({behavior: 'smooth'});
                                setAutoScroll(true);
                            }}
                            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110"
                            title="Scroll to bottom"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Status footer */}
                <div
                    className="bg-gray-800 px-4 py-2 text-xs text-gray-400 flex justify-between items-center border-t border-gray-700">
                    <div>
                        Displaying {filteredLogs.length} {filteredLogs.length === 1 ? 'log entry' : 'log entries'}
                        {logs.length !== filteredLogs.length && ` (filtered from ${logs.length})`}
                    </div>
                    <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
              {isLoading ? 'Refreshing...' : 'Updated just now'}
          </span>
                    </div>
                </div>
            </div>
        </Layout>
    );
}