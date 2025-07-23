import React from 'react';

interface TodayDayDemoProps {
    appEnv?: string;
    language?: string;
    siteId?: string;
}

const TodayDayDemo: React.FC<TodayDayDemoProps> = ({
    appEnv = 'demo',
    language = 'en',
    siteId = 'test'
}) => {
    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: 'Arial, sans-serif',
                padding: '20px',
                boxSizing: 'border-box'
            }}
        >
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '40px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
            >
                <h1 style={{ margin: '0 0 20px 0', fontSize: '2.5rem' }}>
                    🎮 Today Day Demo
                </h1>

                <div style={{ marginBottom: '30px' }}>
                    <p style={{ fontSize: '1.2rem', margin: '10px 0' }}>
                        This is a dummy component for testing tab switching
                    </p>
                    <p style={{ fontSize: '1rem', opacity: 0.8, margin: '10px 0' }}>
                        Component will be destroyed and recreated when switching tabs
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginTop: '30px'
                    }}
                >
                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <h3 style={{ margin: '0 0 10px 0' }}>Environment</h3>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{appEnv}</p>
                    </div>

                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <h3 style={{ margin: '0 0 10px 0' }}>Language</h3>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{language}</p>
                    </div>

                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <h3 style={{ margin: '0 0 10px 0' }}>Site ID</h3>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{siteId}</p>
                    </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                        Component mounted at: {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TodayDayDemo; 