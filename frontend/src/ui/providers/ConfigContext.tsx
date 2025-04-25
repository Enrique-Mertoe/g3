// ConfigContext.ts - For global state management
import React, {createContext, useState, useEffect, useContext, ReactNode} from 'react';
import request from "../../build/request.ts";

// Define types for our state
interface GeneralSettings {
    // Add specific properties as needed
    [key: string]: any;
}

interface NetworkSettings {
    server_network: string;
    netmask: string;
    dns_servers: string[];
    push_dns: boolean;
    duplicate_cn: boolean;
}
interface RoutingSettings {
    // Add specific properties as needed
    [key: string]: any;
}

interface AdvancedSettings {
    // Add specific properties as needed
    [key: string]: any;
}

interface Settings {
    general: GeneralSettings;
    network: NetworkSettings;
    routing: RoutingSettings;
    advanced: AdvancedSettings;
}
interface Template {
  name: string;
  description: string;
  compatible_clients: string[];
}
interface ServiceStatus {
    is_running: boolean;

    [key: string]: any;
}

interface ApiResponse {
    status: string;
    message?: string;

    [key: string]: any;
}

// Context interface
interface ConfigContextType {
    settings: Settings;
    templates: Template[];
    loading: boolean;
    error: string | null;
    serviceStatus: ServiceStatus;
    updateSection: (section: keyof Settings, newSettings: any) => Promise<ApiResponse>;
    applyTemplate: (templateName: string) => Promise<ApiResponse>;
    applyAndRestart: () => Promise<ApiResponse>;
    fetchSettings: () => Promise<void>;
    fetchServiceStatus: () => Promise<void>;
}

interface ConfigProviderProps {
    children: ReactNode;
}

const ConfigContext = createContext<ConfigContextType>({} as ConfigContextType);

export const ConfigProvider: React.FC<ConfigProviderProps> = ({children}) => {
    const [settings, setSettings] = useState<Settings>({
        general: {},
        network: {} as NetworkSettings,
        routing: {},
        advanced: {}
    });
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({is_running: false});

    // Fetch all settings
    const fetchSettings = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await request.get<Settings>('/api/settings');
            setSettings(response.data);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError('Failed to load settings: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all templates
    const fetchTemplates = async (): Promise<void> => {
        try {
            const response = await request.get<{ templates: Template[] }>('/api/templates');
            setTemplates(response.data.templates);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError('Failed to load templates: ' + errorMessage);
        }
    };

    // Fetch service status
    const fetchServiceStatus = async (): Promise<void> => {
        try {
            const response = await request.get<ServiceStatus>('/api/service/status');
            setServiceStatus(response.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError('Failed to check service status: ' + errorMessage);
        }
    };

    // Update a specific settings section
    const updateSection = async (section: keyof Settings, newSettings: any): Promise<ApiResponse> => {
        try {
            setLoading(true);
            const response = await request.put<ApiResponse>(`/api/settings/${section}`, newSettings);
            if (response.data.status === 'success') {
                // Update local state with new settings
                setSettings(prev => ({
                    ...prev,
                    [section]: newSettings
                }));
            }
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError('Failed to update settings: ' + errorMessage);
            return {status: 'error', message: errorMessage};
        } finally {
            setLoading(false);
        }
    };

    // Apply configuration template
    const applyTemplate = async (templateName: string): Promise<ApiResponse> => {
        try {
            setLoading(true);
            const response = await request.post<ApiResponse>(`/api/templates/apply/${templateName}`);
            if (response.data.status === 'success') {
                // Reload settings after template is applied
                await fetchSettings();
            }
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError('Failed to apply template: ' + errorMessage);
            return {status: 'error', message: errorMessage};
        } finally {
            setLoading(false);
        }
    };

    // Apply configuration and restart service
    const applyAndRestart = async (): Promise<ApiResponse> => {
        try {
            setLoading(true);
            const response = await request.post<ApiResponse>('/api/apply');
            if (response.data.status === 'success') {
                await fetchServiceStatus();
            }
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError('Failed to apply configuration: ' + errorMessage);
            return {status: 'error', message: errorMessage};
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchSettings().then();
        fetchTemplates().then();
        fetchServiceStatus().then();

        // Poll service status every 10 seconds
        const statusInterval = setInterval(fetchServiceStatus, 10000);

        return () => clearInterval(statusInterval);
    }, []);

    const value: ConfigContextType = {
        settings,
        templates,
        loading,
        error,
        serviceStatus,
        updateSection,
        applyTemplate,
        applyAndRestart,
        fetchSettings,
        fetchServiceStatus
    };

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfig = (): ConfigContextType => {
    const context = useContext(ConfigContext);
    if (!context)
        throw new Error("useConfig hook must be used inside ConfigContext provider")
    return context
};