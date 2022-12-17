import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RouterGuardProps {
    condition: () => boolean;
    redirectTo: string;
    children: JSX.Element;
}

/**
 * Creates a wrapper guard component for our allowed routes.
 * If the `condition` given is satisfied, the children passed to this component will be rendered.
 * Otherwise, the user will be redirected to the path given into the `redirectTo` property.
 */
export function RouterGuard({ condition, redirectTo, children }: RouterGuardProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!condition()) {
            navigate(redirectTo);
        }
    }, []);

    return <>{children}</>;
}
