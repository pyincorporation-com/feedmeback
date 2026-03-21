import React from 'react';
import { BrowserRouter } from 'react-router-dom';

const ClientRouter = ({ children }: { children: React.ReactNode }) => {
    return <BrowserRouter>{children}</BrowserRouter>;
};

const Router = ({ children }: { children: React.ReactNode }) => {
    const isClient = typeof window !== 'undefined';

    if (isClient) {
        return ClientRouter({ children });
    }

    return <>{children}</>;
};

export default Router;