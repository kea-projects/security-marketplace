import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RouterGuardProps {
    condition: () => boolean;
    redirectTo: string;
    children: JSX.Element;
}

export function RouterGuard({ condition, redirectTo, children }: RouterGuardProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!condition()) {
            navigate(redirectTo);
        }
    }, []);

    return <>{children}</>;
}
