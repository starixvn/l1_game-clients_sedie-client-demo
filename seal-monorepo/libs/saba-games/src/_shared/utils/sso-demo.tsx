import React, { useState } from 'react';
import { requestSSO, requestSSOWithRedirectUrl, getDynamicDomain } from './sso-helper';

interface SSODemoProps {
    className?: string;
}

const SSODemo: React.FC<SSODemoProps> = ({ className = '' }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRequestSSO = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const ssoResult = await requestSSO();
            setResult({
                type: 'Original SSO',
                data: ssoResult
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSSOWithRedirect = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const ssoResult = await requestSSOWithRedirectUrl();
            setResult({
                type: 'SSO with Dynamic Redirect URL',
                data: ssoResult
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGetDynamicDomain = () => {
        setError(null);
        const domain = getDynamicDomain();
        setResult({
            type: 'Dynamic Domain',
            data: { domain }
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy to clipboard');
        });
    };

    return (
        <div className={`sso-demo ${className}`} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>SSO Helper Demo</h2>

            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#666', marginBottom: '15px' }}>Available Functions</h3>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleRequestSSO}
                        disabled={loading}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Loading...' : 'Request SSO (Original)'}
                    </button>

                    <button
                        onClick={handleRequestSSOWithRedirect}
                        disabled={loading}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Loading...' : 'Request SSO with Dynamic Redirect'}
                    </button>

                    <button
                        onClick={handleGetDynamicDomain}
                        disabled={loading}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        Get Dynamic Domain
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '5px',
                    marginBottom: '20px'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '5px',
                    marginBottom: '20px'
                }}>
                    <h4 style={{ color: '#495057', marginBottom: '15px' }}>
                        {result.type} Result
                    </h4>

                    <div style={{ marginBottom: '15px' }}>
                        <button
                            onClick={() => copyToClipboard(JSON.stringify(result.data, null, 2))}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Copy JSON
                        </button>
                    </div>

                    {result.type === 'SSO with Dynamic Redirect URL' && result.data.redirectUrl && (
                        <div style={{ marginBottom: '15px' }}>
                            <h5 style={{ color: '#495057', marginBottom: '10px' }}>Redirect URL:</h5>
                            <div style={{
                                padding: '10px',
                                backgroundColor: '#e9ecef',
                                border: '1px solid #ced4da',
                                borderRadius: '3px',
                                wordBreak: 'break-all',
                                fontSize: '12px',
                                fontFamily: 'monospace'
                            }}>
                                {result.data.redirectUrl}
                            </div>
                            <button
                                onClick={() => copyToClipboard(result.data.redirectUrl)}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    marginTop: '5px'
                                }}
                            >
                                Copy URL
                            </button>
                        </div>
                    )}

                    <pre style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '3px',
                        padding: '15px',
                        overflow: 'auto',
                        fontSize: '12px',
                        maxHeight: '400px'
                    }}>
                        {JSON.stringify(result.data, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{
                padding: '15px',
                backgroundColor: '#d1ecf1',
                border: '1px solid #bee5eb',
                borderRadius: '5px',
                fontSize: '14px'
            }}>
                <h4 style={{ color: '#0c5460', marginBottom: '10px' }}>Key Benefits:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c5460' }}>
                    <li><strong>Dynamic Domain:</strong> No more hardcoded domains - changes automatically based on configuration</li>
                    <li><strong>Complete Redirect URL:</strong> Returns a fully formatted URL ready for immediate use</li>
                    <li><strong>Backward Compatibility:</strong> Original function still works for existing implementations</li>
                    <li><strong>Flexible Configuration:</strong> Easy to switch between environments without code changes</li>
                </ul>
            </div>
        </div>
    );
};

export default SSODemo; 