import {useCallback, useEffect, useRef, useState} from 'react';

// Define error types for better handling
enum ErrorType {
    NETWORK = 'network',
    API = 'api',
    UNKNOWN = 'unknown'
}

interface UsePollingOptions {
    // Function to call on each poll interval
    fetchFn: () => Promise<any>;
    // Polling interval in milliseconds
    interval?: number;
    // Whether polling is initially enabled
    enabled?: boolean;
    // Whether to stop polling when the page is not visible
    respectVisibility?: boolean;
    // Whether to immediately fetch on mount
    fetchOnMount?: boolean;
    // Maximum consecutive error count before backing off
    maxErrorCount?: number;
    // Maximum consecutive network error count before stopping
    maxNetworkErrorCount?: number;
    // Backoff multiplier for errors (extends the interval)
    backoffFactor?: number;
    // Maximum backoff interval
    maxBackoffInterval?: number;
    // Callback for successful fetches
    onSuccess?: <T> (data: T) => void;
    // Callback for fetch errors
    onError?: (error: any, errorType: ErrorType) => void;
    // Callback for network connectivity issues
    onNetworkError?: (error: any) => void;
    // Whether to auto-resume polling when network is restored
    autoResumeOnNetworkRestore?: boolean;
}

export function usePolling({
                               fetchFn,
                               interval = 5000,
                               enabled = true,
                               respectVisibility = true,
                               fetchOnMount = true,
                               maxErrorCount = 3,
                               maxNetworkErrorCount = 3,
                               backoffFactor = 2,
                               maxBackoffInterval = 60000,
                               onSuccess,
                               onError,
                               onNetworkError,
                               autoResumeOnNetworkRestore = true,
                           }: UsePollingOptions) {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [errorType, setErrorType] = useState<ErrorType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isPolling, setIsPolling] = useState<boolean>(enabled);
    const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

    // Refs to avoid dependencies in useEffect
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const errorCountRef = useRef<number>(0);
    const networkErrorCountRef = useRef<number>(0);
    const currentIntervalRef = useRef<number>(interval);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Clear any existing timeout
    const clearPollingTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Cancel any in-flight requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    // Detect error type from caught error
    const detectErrorType = (err: any): ErrorType => {

        if (
            !navigator.onLine ||
            err.message === 'Network Error' ||
            err.message === 'Failed to fetch' ||
            err.message?.includes('ERR_NAME_NOT_RESOLVED') ||
            err.message?.includes('net::ERR_INTERNET_DISCONNECTED') ||
            err.message?.includes('net::ERR_NETWORK_CHANGED') ||
            err.message?.includes('net::ERR_CONNECTION_REFUSED') ||
            err.code === 'ENOTFOUND' ||
            err.name === 'TypeError' && err.message?.includes('Network')
        ) {
            return ErrorType.NETWORK;
        }

        // API errors (server responded with an error)
        if (err.status || err.statusCode || err.response) {
            return ErrorType.API;
        }

        return ErrorType.UNKNOWN;
    };

    // Function to execute the polling
    const executePoll = useCallback(async () => {
        if (!isPolling) return;

        clearPollingTimeout();
        setLoading(true);

        try {
            // Check network status before attempting fetch
            if (!navigator.onLine) {
                throw new Error('ERR_INTERNET_DISCONNECTED');
            }

            // Create a new abort controller for this request
            abortControllerRef.current = new AbortController();

            // Wrap the fetchFn to include the abort signal if needed
            const fetchWithAbort = async () => {
                if (fetchFn.length > 0) {
                    // If fetchFn accepts parameters, assume it can take the signal
                    return await fetchFn();
                } else {
                    return await fetchFn();
                }
            };

            const result = await fetchWithAbort();
            setData(result);
            setError(null);
            setErrorType(null);
            errorCountRef.current = 0;
            networkErrorCountRef.current = 0;
            currentIntervalRef.current = interval; // Reset interval after success

            if (onSuccess) onSuccess(result);
        } catch (err:any) {
            // Only handle errors if we're still polling and it wasn't an abort
            if (isPolling && err.name !== 'AbortError') {
                const currentErrorType = detectErrorType(err);
                setError(err);
                setErrorType(currentErrorType);
                errorCountRef.current += 1;

                // Handle network errors separately
                if (currentErrorType === ErrorType.NETWORK) {
                    networkErrorCountRef.current += 1;

                    // Auto-stop polling after reaching max network error count
                    if (networkErrorCountRef.current >= maxNetworkErrorCount) {
                        if (onNetworkError) onNetworkError(err);
                        setNetworkStatus('offline');
                        stopPolling();
                        return;
                    }
                }

                // Apply backoff strategy if errors are accumulating
                if (errorCountRef.current >= maxErrorCount) {
                    currentIntervalRef.current = Math.min(
                        currentIntervalRef.current * backoffFactor,
                        maxBackoffInterval
                    );
                }

                if (onError) onError(err, currentErrorType);
            }
        } finally {
            setLoading(false);

            // Schedule the next poll if still polling
            if (isPolling) {
                timeoutRef.current = setTimeout(
                    executePoll,
                    currentIntervalRef.current
                );
            }
        }
    }, [
        fetchFn,
        interval,
        isPolling,
        maxErrorCount,
        maxNetworkErrorCount,
        backoffFactor,
        maxBackoffInterval,
        onSuccess,
        onError,
        onNetworkError,
        clearPollingTimeout
    ]);

    // Start polling
    const startPolling = useCallback(() => {
        setIsPolling(true);
    }, []);

    // Stop polling
    const stopPolling = useCallback(() => {
        setIsPolling(false);
        clearPollingTimeout();
    }, [clearPollingTimeout]);

    // Reset any backoff and error counts
    const resetPolling = useCallback(() => {
        errorCountRef.current = 0;
        networkErrorCountRef.current = 0;
        currentIntervalRef.current = interval;
        clearPollingTimeout();

        if (isPolling) {
            executePoll();
        }
    }, [interval, isPolling, executePoll, clearPollingTimeout]);

    // Manually trigger a poll
    const manualPoll = useCallback(() => {
        clearPollingTimeout();
        executePoll();
    }, [executePoll, clearPollingTimeout]);

    // Handle visibility change
    useEffect(() => {
        if (!respectVisibility) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (isPolling) {
                    // Immediately poll when becoming visible again
                    clearPollingTimeout();
                    executePoll();
                }
            } else if (document.visibilityState === 'hidden') {
                // Just clear the timeout when hidden, don't change polling state
                clearPollingTimeout();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isPolling, executePoll, clearPollingTimeout, respectVisibility]);

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => {
            setNetworkStatus('online');
            networkErrorCountRef.current = 0;

            // Auto-resume polling if that option is enabled
            if (autoResumeOnNetworkRestore && !isPolling) {
                startPolling();
            }

            // If already polling, reset and try immediately
            if (isPolling) {
                resetPolling();
            }
        };

        const handleOffline = () => {
            setNetworkStatus('offline');

            if (onNetworkError) {
                onNetworkError(new Error('Browser reported network disconnection'));
            }

            // Optionally stop polling when offline
            if (maxNetworkErrorCount === 0) {
                stopPolling();
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isPolling, autoResumeOnNetworkRestore, resetPolling, stopPolling, startPolling, onNetworkError, maxNetworkErrorCount]);

    // Main effect to control polling
    useEffect(() => {
        // Don't start if we're offline and have network error detection
        if (networkStatus === 'offline' && maxNetworkErrorCount > 0) {
            return;
        }

        // Start polling if enabled and not already polling
        if (isPolling) {
            if (fetchOnMount) {
                executePoll();
            } else {
                timeoutRef.current = setTimeout(executePoll, interval);
            }
        }

        // Cleanup on unmount or when polling is disabled
        return () => {
            clearPollingTimeout();
        };
    }, [isPolling, executePoll, interval, fetchOnMount, clearPollingTimeout, networkStatus, maxNetworkErrorCount]);

    // Update polling state when enabled prop changes
    useEffect(() => {
        if (enabled && !isPolling) {
            startPolling();
        } else if (!enabled && isPolling) {
            stopPolling();
        }
    }, [enabled, isPolling, startPolling, stopPolling]);

    return {
        data,
        error,
        errorType,
        loading,
        isPolling,
        networkStatus,
        startPolling,
        stopPolling,
        resetPolling,
        manualPoll,
    };
}