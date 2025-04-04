import * as ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import SabaGamesGroup from './index';
import Preview from './preview';

const ErrorFallback = ({ error }) => {
    console.error('Error in application:', error);
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre>{error.message}</pre>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const isDevelopment = process.env.NODE_ENV === 'development';
console.log('isDevelopment', isDevelopment);
const App = isDevelopment ? Preview : SabaGamesGroup;

// const App = Preview;

// Pass empty props in both development and production modes
const props = {};

root.render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
        <App {...props} />
    </ErrorBoundary>
);
