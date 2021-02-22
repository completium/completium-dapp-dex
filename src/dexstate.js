import { useState } from 'react';
import constate from 'constate';
import { useAccountPkh, useReady } from './dapp';
import { endpoint, dexContract } from './settings';
import { TezosToolkit } from '@taquito/taquito';

const Tezos = new TezosToolkit(endpoint);

export function useDexState() {
  const account = useAccountPkh();
  const ready = useReady();
  const fee = 0.003;
  const [dexState, setDexState] = useState({
    balance : '',
    balances : {},
    token     : {
      'XLD' : { addr: 'KT1MePDQK3VQooqSEwN3sN1WqyMiiGBKGkNX', poolvalue: '1976000000', totalqty: '1923300', totallqt: '1000000' },
      'XPA' : { addr: 'KT1H8JUiFbvEMycCuG5sZfCGHkN7vgfLAs3n', poolvalue: '1288000000', totalqty: '1756020', totallqt: '1000000' },
      'XNY' : { addr: 'KT1', poolvalue: '1852000000', totalqty: '1360000', totallqt: '1000000' },
      'XRO' : { addr: 'KT1', poolvalue: '447000000',  totalqty: '1006540', totallqt: '1000000' },
      'XTK' : { addr: 'KT1', poolvalue: '1348000000', totalqty: '998510',  totallqt: '1000000' },
      'XAT' : { addr: 'KT1', poolvalue: '162000000',  totalqty: '572840',  totallqt: '1000000' },
      'XMO' : { addr: 'KT1', poolvalue: '94000000',   totalqty: '551000',  totallqt: '1000000' },
      /* 'XSD' : { addr: 'KT1', poolvalue: '640',  totalqty: '409060',  totallqt: '1000000' }, */
      'XSD' : { addr: 'KT1', poolvalue: '0',  totalqty: '0',  totallqt: '0' },
      'XRI' : { addr: 'KT1', poolvalue: '97000000',   totalqty: '227830',  totallqt: '1000000' },
    },
    liquidity : {
      'XLD' : 1000000,
      'XPA' : 1000000,
    },
    left : {
      coin : '',
      amount : '',
      max : false
    },
    right : {
      coin : '',
      amount : '',
      fee : ''
    },
    provider : {
      coin: '',
      amount: '',
      maxb: false,
      xtzamount: '',
      maxxtzb: false,
      liqtoken: ''
    },
    redeemer : {
      coin: '',
      liqtoken: '',
      max: false,
      amount: '',
      xtzamount: '',
    }
  });
  const isReady = () => {
    return !(dexState.token === []);
  }
  const loadLiquidity = () => {
    Tezos.contract.at(dexContract)
      .then(c => {
        return c.storage()
      .then (s => {
        var liquidity = {};
        s.liquidity.forEach((l,k,m) => {
          /* k = {0: 'XPA', 1: 'tz1Lc2qBKEWCBeDU8npG6zCeCqpmaegRi6Jg'} */
          if (k[1] === account) {
            liquidity[k[0]] = l.toString()
          }
        });
        console.log('loaded liquidity:', liquidity);
        setDexState(state => { return {
          ...state,
          liquidity: liquidity,
        }})
      })})
      .catch(error => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
  }
  const loadDexTokens = () => {
    Tezos.contract.at(dexContract)
      .then(c => {
        return c.storage()
      .then (s => {
        var token = {};
        s.token.forEach((l,k,m) => {
          token[k] = {
            addr: l.addr,
            name: l.name,
            iconurl: l.iconurl,
            poolvalue: l.poolvalue.toString(),
            totalqty: l.totalqty.toString(),
            totallqt: l.totallqt.toString()
          }
        });
        console.log('loaded tokens:', token);
        setDexState(state => {
          return {
            ...state,
            token: token,
        }})
      })})
      .catch(error => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
  }
  /* compute amount of token B and fee when providing qA amount of token A */
  const computeAmount = (aA,qA,qB,f) => {
    const g = 1 - f;
    return qB * g * aA / (qA + g * aA);
  }
  const computeFee = (aA,qA,qB,f) => {
    const aB      = computeAmount(aA,qA,qB,f);
    const aBnofee = computeAmount(aA,qA,qB,0);
    const fee     = Math.ceil(aBnofee-aB);
    return fee;
  }
  const computeTok2TokAmount = (aA,qA,qB,f,qTA,qTB) => {
    const g = 1 - f;
    const alpha = qTB / (qTA * g * g);
    return qB * aA / (alpha * qA + aA * (1 + alpha * g));
  }
  const computeTok2TokFee = (aA,qA,qB,f,qTA,qTB) => {
    const aB      = computeTok2TokAmount(aA,qA,qB,f,qTA,qTB);
    const aBnofee = computeTok2TokAmount(aA,qA,qB,0,qTA,qTB);
    const fee     = Math.ceil(aBnofee-aB);
    return fee;
  }
  const computeAmounts = (state) => {
    if (state.left.coin !== '' && state.left.amount !== '' && state.right.coin !== '') {
      var [ tA, aA, qA, tB, qB ] = [ state.left.coin, parseFloat(state.left.amount), 0, state.right.coin, 0 ];
      var aB = 0;
      var aF = 0;
      if (tA === 'XTZ') {
        aA = aA * 1000000;
        qA = parseInt(state.token[tB].poolvalue);
        qB = parseInt(state.token[tB].totalqty);
        aB = Math.floor(computeAmount(aA,qA,qB,fee));
        aF = computeFee(aA,qA,qB,fee);
      } else if (tB === 'XTZ') {
        qA = parseInt(state.token[tA].totalqty);
        qB = parseInt(state.token[tA].poolvalue);
        aB = Math.floor(computeAmount(aA,qA,qB,fee));
        aF = computeFee(aA,qA,qB,fee);
      } else {
        qA   = parseInt(state.token[tA].totalqty);
        const qTA  = parseInt(state.token[tA].poolvalue);
        const qTB  = parseInt(state.token[tB].poolvalue);
        qB   = parseInt(state.token[tB].totalqty);
        aB   = Math.floor(computeTok2TokAmount(aA,qA,qB,fee,qTA,qTB));
        aF   = computeTok2TokFee(aA,qA,qB,fee,qTA,qTB);
      };
      console.log(`aB: ${aB}`);
      console.log(`aF: ${aF}`);
      return {
        ...state,
        right: { coin: state.right.coin, amount : aB, fee : aF },
      }
    }
    else return state;
  };
  const isPoolEmpty = (coin) => {
    if (coin !== '') {
      const totalqty = dexState.token[coin].totalqty;
      const poolvalue = dexState.token[coin].poolvalue;
      return totalqty === '0' && poolvalue === '0';
    } else {
      return true;
    }
  };
  const computeMintedLQT = (state) => {
    if (isPoolEmpty(state.provider.coin)) {
      var xlq = 0;
      if (state.provider.amount !== '' && state.provider.xtzamount !== '') {
        xlq = 1000000;
      };
      return {
        ...state,
        provider: {
          coin:   state.provider.coin,
          amount: state.provider.amount,
          maxb:   state.provider.maxb,
          xtzamount: state.provider.xtzamount,
          maxxtzb: state.provider.maxxtzb,
          liqtoken: xlq
        },
      }
    } else {
      var tA = '';
      var aA = 0;
      var qA = 0;
      var tB = '';
      var qB = 0;
      var aB = 0;
      if (state.provider.amount !== '') {
        tA = state.provider.coin;
        aA = state.provider.amount;
        qA = parseInt(state.token[tA].totalqty);
        qB = parseInt(state.token[tA].poolvalue);
        aB = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 6 }).format(computeAmount(aA, qA, qB, 0) / 1000000);
        const xlq = Math.floor(state.token[tA].totallqt * aB * 1000000 / state.token[tA].poolvalue);
        return {
          ...state,
          provider: {
            coin:   state.provider.coin,
            amount: state.provider.amount,
            maxb:   state.provider.maxb,
            xtzamount: aB,
            maxxtzb: state.provider.maxxtzb,
            liqtoken: xlq
          },
        }
      } else if (state.provider.xtzamount !== '') {
        tB = state.provider.coin;
        aA = parseFloat(state.provider.xtzamount) * 1000000;
        console.log(`aA: ${aA}`);
        console.log(`xtzamount: ${state.provider.xtzamount}`);
        qA = parseInt(state.token[tB].poolvalue);
        qB = parseInt(state.token[tB].totalqty);
        aB = Math.floor(computeAmount(aA,qA,qB,0));
        const xlq = Math.floor(state.token[tB].totallqt * parseInt(state.provider.xtzamount) / state.token[tB].poolvalue);
        return {
          ...state,
          provider: {
            coin:   state.provider.coin,
            amount: aB,
            maxb:   state.provider.maxb,
            xtzamount: state.provider.xtzamount,
            maxxtzb: state.provider.maxxtzb,
            liqtoken: xlq
          },
        }
      } else {
        return state;
      };
    }
  };
  const computeRedeemedLQT = (state) => {
    const liqamount = state.redeemer.liqtoken;
    const coin = state.redeemer.coin;
    if (liqamount !== '' && coin !== '') {
      const poolvalue = state.token[coin].poolvalue;
      const totalqty = state.token[coin].totalqty;
      const totallqt = state.token[coin].totallqt;
      const ratio = liqamount / totallqt;
      const amount    = Math.floor(ratio * totalqty);
      const xtzamount = new Intl.NumberFormat({ maximumSignificantDigits: 6 }).format(ratio * poolvalue / 1000000);
      return {
        ...state,
        redeemer: {
          coin: state.redeemer.coin,
          liqtoken: liqamount,
          max: state.redeemer.max,
          amount: amount,
          xtzamount: xtzamount,
        },
      }
    } else {
      return state;
    }
  };
  const getXTZFor = (city,qty) => {
    var srctotalqty = dexState.token[city].totalqty;
    var dsttotalqty = dexState.token[city].poolvalue;
    return computeAmount(1000000,srctotalqty,dsttotalqty,fee) / 1000000;
  }
  const forceRetrieveTokenBalance = (coin) => {
    const address = dexState.token[coin].addr;
      Tezos.contract.at(address)
      .then( myContract => {
        return myContract.storage()
      .then ( myStorage => {
        //When called on a map, the get method returns the value directly
        myStorage['ledger'].get(account).then(value => {
          if (value === undefined) {
            setDexState(state => {
              var balances = state.balances;
              balances[coin] = '0';
              return {
                ...state,
                balances : balances,
              }
            });
          } else {
            setDexState(state => {
              var balances = state.balances;
              balances[coin] = value.toString();
              return {
                ...state,
                balances : balances,
              }
            });
          }
        });
      })})
      .catch(error => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
  }
  const retrieveTokenBalance = (coin) => {
    if (ready && coin !== '' && coin !== 'XTZ' && !(coin in dexState.balances)) {
      forceRetrieveTokenBalance(coin);
    }
  }
  const setLeftCoin = (coin) => { setDexState(state => {
    return computeAmounts({
      ...state,
      left: { coin: coin, amount : '', max: false },
      right: { coin: state.right.coin, amount : '', fee : '' },
    })});
    retrieveTokenBalance(coin);
  };
  const setRightCoin = (coin) => { setDexState(state => {
    return computeAmounts({
      ...state,
      right : { coin: coin, amount : '', fee : '' },
    })});
    retrieveTokenBalance(coin);
  };
  const resetDexCoins = () => {
    setDexState(state => {
      return {
        ...state,
        left: { ...state.left, amount : '', max: false },
        right : { ...state.right, amount : '', fee : '' },
      }
    });
  }
  const resetProvider = () => {
    setDexState(state => {
      return {
        ...state,
        provider : {
          ...state.provider,
          amount: '',
          maxb: false,
          xtzamount: '',
          maxxtzb: false,
          liqtoken: ''
        },
      }
    });
  }
  const resetRedeemer = () => {
    setDexState(state => {
      return {
        ...state,
        redeemer : {
          ...state.redeemer,
          amount: '',
          xtzamount: '',
          liqtoken: '',
          max: false,
          maxxtzb: false,
        },
      }
    });
  }
  const setLeftAmount = (amount) => {
    if (isNaN(amount)) {
      setDexState(state => {
        return {
          ...state,
          left : { coin: state.left.coin, amount : '', max: state.left.max },
          right : { coin: state.right.coin, amount : '', fee : '' },
      }})
    } else {
      setDexState (state => {
        return computeAmounts({
          ...state,
          left : { coin: state.left.coin, amount : (parseFloat(amount)>0)?amount:'0', max: state.left.max },
          right : { coin: state.right.coin, amount : '', fee : '' },
      })})};
    }
  const switchMax = (balance) => { setDexState (state => {
    return computeAmounts({
      ...state,
      left : { coin: state.left.coin, amount : state.left.max?'':balance, max: !(state.left.max) },
      right : { coin: state.right.coin, amount : '', fee : '' },
  })})};
  const setProviderCoin = (coin) => {
    setDexState(state => {
      return {
        ...state,
        provider: {
          coin: coin,
          amount: '',
          maxb: false,
          xtzamount: '',
          maxxtzb: false,
          liqtoken: ''
        }
      }
    });
    retrieveTokenBalance(coin);
  };
  const setProviderAmount = (a) => { setDexState(state => {
    return computeMintedLQT({  /* todo compute xtzbalance and liqtoken */
      ...state,
      provider: {
        coin: state.provider.coin,
        amount: Math.max(0,a),
        maxb: false,
        xtzamount: (isPoolEmpty(state.provider.coin)?state.provider.xtzamount:''),
        maxxtzb: false,
        liqtoken: ''
      },
  })})};
  const setProviderXTZAmount = (a) => {
    if(isNaN(parseFloat(a)) || a.charAt(a.length - 1) === '.') {
      setDexState(state => {
        return {
          ...state,
          provider: {
            coin: state.provider.coin,
            amount: (isPoolEmpty(state.provider.coin)?state.provider.amount:''),
            maxb: false,
            xtzamount: a,
            maxxtzb: false,
            liqtoken: ''
          }
      }});
    } else {
      setDexState(state => {
        return computeMintedLQT({
          ...state,
          provider: {
            coin: state.provider.coin,
            amount: (isPoolEmpty(state.provider.coin)?state.provider.amount:''),
            maxb: false,
            xtzamount: (parseFloat(a)>0?a:'0'),
            maxxtzb: false,
            liqtoken: ''
          }
    })})};
  }
  const switchProviderMax = (balance) => { setDexState (state => {
    return computeMintedLQT({
      ...state,
      provider: {
        coin: state.provider.coin,
        amount : state.provider.maxb?'':balance,
        maxb: !state.provider.maxb,
        xtzamount: '',
        maxxtzb: false,
        liqtoken: ''
      },
  })})};
  const switchProviderXTZMax = (balance) => { setDexState (state => {
    return computeMintedLQT({
      ...state,
      provider: {
        coin: state.provider.coin,
        amount : '',
        maxb: false,
        xtzamount: state.provider.maxxtzb?'':balance,
        maxxtzb: !state.provider.maxxtzb,
        liqtoken: ''
      },
  })})};
  const setRedeemerCoin = (coin) => {
    setDexState(state => {
      return {
        ...state,
        redeemer: {
          coin: coin,
          max: false,
          liqtoken: '',
          amount: '',
          xtzamount: '',
        }
    }});
    retrieveTokenBalance(coin);
  };
  const setRedeemerMax = (balance) => {setDexState(state => {
    return computeRedeemedLQT({
      ...state,
      redeemer: {
        coin: state.redeemer.coin,
        max: !state.redeemer.max,
        liqtoken: state.redeemer.max?'':balance,
        amount: '',
        xtzamount: '',
      }
  })})};
  const setRedeemerAmount = (value) => {setDexState(state => {
    return computeRedeemedLQT({
      ...state,
      redeemer: {
        coin: state.redeemer.coin,
        max: state.redeemer.max,
        liqtoken: Math.max(0,value),
        amount: '',
        xtzamount: '',
      }
  })})};
  const setBalance = (value) => {setDexState(state => {
    return {
      ...state,
      balance : value,
  }})};
  return { dexState, setDexState,
    setBalance, isReady, loadDexTokens, loadLiquidity, forceRetrieveTokenBalance,
    resetDexCoins, resetProvider, resetRedeemer,
    getXTZFor, setLeftCoin, setRightCoin, setLeftAmount, switchMax,
    setProviderCoin, setProviderAmount, setProviderXTZAmount, switchProviderMax, switchProviderXTZMax,
    setRedeemerCoin, setRedeemerMax, setRedeemerAmount };
}

export const [ DexProvider, useDexStateContext ] = constate(useDexState);