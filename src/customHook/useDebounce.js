import React, { useEffect, useState } from 'react';

const useDebounce = (data, delay) => {
    delay = delay || 300;
    const [debounced, setDebounced] = useState(data);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounced(data);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [data, delay]);

    return debounced;
}

export default useDebounce;