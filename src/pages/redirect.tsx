import React, { useEffect } from 'react';
import { history } from 'umi';

export default (): React.ReactNode => {
    useEffect(() => {
        const { query, state } = history.location
        const { redirectPath: pathname } = query as { redirectPath?: string }
        delete query?.redirectPath
        history.replace({
            pathname,
            query,
            state
        })
    }, []);
    return (
        <></>
    );
};
