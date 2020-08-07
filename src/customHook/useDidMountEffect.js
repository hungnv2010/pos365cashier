import React, { useEffect, useRef } from 'react';

const useDidMountEffect = (func, deps) => {
    const didMount = useRef(false);

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            return
        }
        else {
            func();
        }

        return () => {
            didMount.current = false;
            func && func();
        }
    }, deps);
}

export default useDidMountEffect;