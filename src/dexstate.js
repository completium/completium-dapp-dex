import { useState } from 'react';
import constate from 'constate';

export function useDexState() {
    const [dexState, setDexState] = useState({
        token : [],
        liquidity : [],
    });
    const isReady = () => {
        return !(dexState.token === []);
    }
    return { dexState, setDexState, isReady };
}

export const [ DexProvider, useDexStateContext ] = constate(useDexState);