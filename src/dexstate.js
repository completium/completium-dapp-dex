import { useState } from 'react';
import constate from 'constate';
import { useAccountPkh, useReady } from './dapp';
import { getBalanceFor, network, dexContract } from './settings';
import { TezosToolkit } from '@taquito/taquito';

const Tezos = new TezosToolkit('https://'+network+'-tezos.giganode.io');

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
            totalqty: l.totalqty.toString()
          }
        });
        console.log('loaded tokens:', token);
        var liquidity = {};
        s.liquidity.forEach((l,k,m) => {
          console.log(k);
        });
        setDexState({
          balance : dexState.balance,
          balances : dexState.balances,
          token: token,
          left: dexState.left,
          right: dexState.right,
          liquidity: dexState.liquidity,
          provider: dexState.provider,
          redeemer: dexState.redeemer
        })
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
        qA = parseInt(dexState.token[tB].poolvalue);
        qB = parseInt(dexState.token[tB].totalqty);
        aB = Math.floor(computeAmount(aA,qA,qB,fee));
        aF = computeFee(aA,qA,qB,fee);
      } else if (tB === 'XTZ') {
        qA = parseInt(dexState.token[tA].totalqty);
        qB = parseInt(dexState.token[tA].poolvalue);
        aB = Math.floor(computeAmount(aA,qA,qB,fee));
        aF = computeFee(aA,qA,qB,fee);
      } else {
        qA   = parseInt(dexState.token[tA].totalqty);
        const qTA  = parseInt(dexState.token[tA].poolvalue);
        const qTB  = parseInt(dexState.token[tB].poolvalue);
        qB   = parseInt(dexState.token[tB].totalqty);
        aB   = Math.floor(computeTok2TokAmount(aA,qA,qB,fee,qTA,qTB));
        aF   = computeTok2TokFee(aA,qA,qB,fee,qTA,qTB);
      };
      console.log(`aB: ${aB}`);
      console.log(`aF: ${aF}`);
      return {
        balance : dexState.balance,
        balances : dexState.balances,
        token: dexState.token,
        left: state.left,
        right: { coin: state.right.coin, amount : aB, fee : aF },
        liquidity: dexState.liquidity,
        provider: dexState.provider,
        redeemer: dexState.redeemer,
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
        balance : dexState.balance,
        balances : dexState.balances,
        token: dexState.token,
        left:  dexState.left,
        right: dexState.right,
        liquidity: dexState.liquidity,
        provider: {
          coin:   state.provider.coin,
          amount: state.provider.amount,
          maxb:   state.provider.maxb,
          xtzamount: state.provider.xtzamount,
          maxxtzb: state.provider.maxxtzb,
          liqtoken: xlq
        },
        redeemer: dexState.redeemer,
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
        qA = parseInt(dexState.token[tA].totalqty);
        qB = parseInt(dexState.token[tA].poolvalue);
        aB = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 6 }).format(computeAmount(aA, qA, qB, 0) / 1000000);
        const xlq = Math.floor(dexState.token[tA].totallqt * aB / dexState.token[tA].poolvalue);
        return {
          balance : dexState.balance,
          balances : dexState.balances,
          token: dexState.token,
          left:  dexState.left,
          right: dexState.right,
          liquidity: dexState.liquidity,
          provider: {
            coin:   state.provider.coin,
            amount: state.provider.amount,
            maxb:   state.provider.maxb,
            xtzamount: aB,
            maxxtzb: state.provider.maxxtzb,
            liqtoken: xlq
          },
          redeemer: dexState.redeemer,
        }
      } else if (state.provider.xtzamount !== '') {
        tB = state.provider.coin;
        aA = parseFloat(state.provider.xtzamount) * 1000000;
        console.log(`aA: ${aA}`);
        console.log(`xtzamount: ${state.provider.xtzamount}`);
        qA = parseInt(dexState.token[tB].poolvalue);
        qB = parseInt(dexState.token[tB].totalqty);
        aB = Math.floor(computeAmount(aA,qA,qB,0));
        const xlq = Math.floor(dexState.token[tB].totallqt * parseInt(state.provider.xtzamount) / dexState.token[tB].poolvalue);
        return {
          balance : dexState.balance,
          balances : dexState.balances,
          token: dexState.token,
          left:  dexState.left,
          right: dexState.right,
          liquidity: dexState.liquidity,
          provider: {
            coin:   state.provider.coin,
            amount: aB,
            maxb:   state.provider.maxb,
            xtzamount: state.provider.xtzamount,
            maxxtzb: state.provider.maxxtzb,
            liqtoken: xlq
          },
          redeemer: dexState.redeemer,
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
      const poolvalue = dexState.token[coin].poolvalue;
      const totalqty = dexState.token[coin].totalqty;
      const totallqt = dexState.token[coin].totallqt;
      const ratio = liqamount / totallqt;
      const amount    = Math.floor(ratio * totalqty);
      const xtzamount = new Intl.NumberFormat({ maximumSignificantDigits: 6 }).format(ratio * poolvalue / 1000000);
      return {
        balance : dexState.balance,
        balances : dexState.balances,
        token: dexState.token,
        left:  dexState.left,
        right: dexState.right,
        liquidity: dexState.liquidity,
        provider: dexState.provider,
        redeemer: {
          coin: dexState.redeemer.coin,
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
  const retrieveTokenBalance = (state, coin) => {
    if (ready && coin !== '' && !(coin in state.balances)) {
      const address = state.token[coin].addr;
      Tezos.contract.at(address)
      .then( myContract => {
        return myContract.storage()
      .then ( myStorage => {
        //When called on a map, the get method returns the value directly
        myStorage['ledger'].get(account).then(value => {
          var balances = state.balances;
          console.log(`value: ${value.toString()}`);
          balances[coin] = value.toString();
          setDexState({
            balance : state.balance,
            balances : balances,
            token: state.token,
            left: state.left,
            right: state.right,
            liquidity: state.liquidity,
            pool: state.pool,
            provider: state.provider,
            redeemer: state.redeemer,
          })
        });
      })})
      .catch(error => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
    }
  }
  const setLeftCoin = (coin) => {
    const state = {
      balance : dexState.balance,
      balances : dexState.balances,
      token: dexState.token,
      left: { coin: coin, amount : '', max: false },
      right: { coin: dexState.right.coin, amount : '', fee : '' },
      liquidity: dexState.liquidity,
      pool: dexState.pool,
      provider: dexState.provider,
      redeemer: dexState.redeemer,
    };
    setDexState(state);
    retrieveTokenBalance(state,coin);
  };
  const setRightCoin = (coin) => { setDexState(computeAmounts({
    balance : dexState.balance,
    balances : dexState.balances,
    token: dexState.token,
    left : dexState.left,
    right : { coin: coin, amount : '', fee : '' },
    liquidity: dexState.liquidity,
    pool: dexState.pool,
    provider: dexState.provider,
    redeemer: dexState.redeemer,
  }))};
  const setLeftAmount = (amount) => {
    if (isNaN(amount)) {
      setDexState({
        balance : dexState.balance,
        balances : dexState.balances,
        token: dexState.token,
        left : { coin: dexState.left.coin, amount : '', max: dexState.left.max },
        right : { coin: dexState.right.coin, amount : '', fee : '' },
        liquidity: dexState.liquidity,
        pool: dexState.pool,
        provider: dexState.provider,
        redeemer: dexState.redeemer,
      })
    } else {
      setDexState (computeAmounts({
        balance : dexState.balance,
        balances : dexState.balances,
        token: dexState.token,
        left : { coin: dexState.left.coin, amount : (parseFloat(amount)>0)?amount:'0', max: dexState.left.max },
        right : { coin: dexState.right.coin, amount : '', fee : '' },
        liquidity: dexState.liquidity,
        pool: dexState.pool,
        provider: dexState.provider,
        redeemer: dexState.redeemer,
      }))};
    }
  const switchMax = (balance) => { setDexState (computeAmounts({
    balance : dexState.balance,
    balances : dexState.balances,
    token: dexState.token,
    left : { coin: dexState.left.coin, amount : dexState.left.max?'':balance, max: !(dexState.left.max) },
    right : { coin: dexState.right.coin, amount : '', fee : '' },
    liquidity: dexState.liquidity,
    pool: dexState.pool,
    provider: dexState.provider,
    redeemer: dexState.redeemer,
  }))};
  const setProviderCoin = (coin) => {
    const state = {
      balance : dexState.balance,
      balances : dexState.balances,
      token: dexState.token,
      left: dexState.left,
      right: dexState.right,
      liquidity: dexState.liquidity,
      provider: {
        coin: coin,
        amount: '',
        maxb: false,
        xtzamount: '',
        maxxtzb: false,
        liqtoken: ''
      },
      redeemer: dexState.redeemer,
    }
    setDexState(state);
    retrieveTokenBalance(state,coin);
  };
  const setProviderAmount = (a) => { setDexState(computeMintedLQT({  /* todo compute xtzbalance and liqtoken */
    balance : dexState.balance,
    balances : dexState.balances,
    token: dexState.token,
    left: dexState.left,
    right: dexState.right,
    liquidity: dexState.liquidity,
    provider: {
      coin: dexState.provider.coin,
      amount: Math.max(0,a),
      maxb: false,
      xtzamount: (isPoolEmpty(dexState.provider.coin)?dexState.provider.xtzamount:''),
      maxxtzb: false,
      liqtoken: ''
    },
    redeemer: dexState.redeemer,
  }))};
  const setProviderXTZAmount = (a) => {
    if(isNaN(parseFloat(a)) || a.charAt(a.length - 1) === '.') {
      setDexState({
        balance : dexState.balance,
        balances : dexState.balances,
        token: dexState.token,
        left: dexState.left,
        right: dexState.right,
        liquidity: dexState.liquidity,
        provider: {
          coin: dexState.provider.coin,
          amount: (isPoolEmpty(dexState.provider.coin)?dexState.provider.amount:''),
          maxb: false,
          xtzamount: a,
          maxxtzb: false,
          liqtoken: ''
        },
      redeemer: dexState.redeemer,
      });
    } else {
      setDexState(computeMintedLQT({
        balance : dexState.balance,
        balances : dexState.balances,
        token: dexState.token,
        left: dexState.left,
        right: dexState.right,
        liquidity: dexState.liquidity,
        provider: {
          coin: dexState.provider.coin,
          amount: (isPoolEmpty(dexState.provider.coin)?dexState.provider.amount:''),
          maxb: false,
          xtzamount: (parseFloat(a)>0?a:'0'),
          maxxtzb: false,
          liqtoken: ''
        },
        redeemer: dexState.redeemer,
    }))};
  }
  const switchProviderMax = (balance) => { setDexState (computeMintedLQT({
    balance : dexState.balance,
    balances : dexState.balances,
    token: dexState.token,
    left: dexState.left,
    right: dexState.right,
    liquidity: dexState.liquidity,
    provider: {
      coin: dexState.provider.coin,
      amount : dexState.provider.maxb?'':balance,
      maxb: !dexState.provider.maxb,
      xtzamount: '',
      maxxtzb: false,
      liqtoken: ''
    },
    redeemer: dexState.redeemer,
  }))};
  const switchProviderXTZMax = (balance) => { setDexState (computeMintedLQT({
    balance : dexState.balance,
    balances : dexState.balances,
    token: dexState.token,
    left: dexState.left,
    right: dexState.right,
    liquidity: dexState.liquidity,
    provider: {
      coin: dexState.provider.coin,
      amount : '',
      maxb: false,
      xtzamount: dexState.provider.maxxtzb?'':balance,
      maxxtzb: !dexState.provider.maxxtzb,
      liqtoken: ''
    },
    redeemer: dexState.redeemer,
  }))};
  const setRedeemerCoin = (coin) => {
    const state = {
      balance : dexState.balance,
      balances : dexState.balances,
      token: dexState.token,
      left: dexState.left,
      right: dexState.right,
      liquidity: dexState.liquidity,
      provider: dexState.provider,
      redeemer: {
        coin: coin,
        max: false,
        liqtoken: '',
        amount: '',
        xtzamount: '',
      }
    };
    setDexState(state);
    retrieveTokenBalance(state,coin);
  };
  const setRedeemerMax = (balance) => {setDexState(computeRedeemedLQT({
    balance : dexState.balance,
    balances : dexState.balances,
    token: dexState.token,
    left: dexState.left,
    right: dexState.right,
    liquidity: dexState.liquidity,
    provider: dexState.provider,
    redeemer: {
      coin: dexState.redeemer.coin,
      max: !dexState.redeemer.max,
      liqtoken: dexState.redeemer.max?'':balance,
      amount: '',
      xtzamount: '',
    }
  }))};
  const setRedeemerAmount = (value) => {setDexState(computeRedeemedLQT({
    balance : dexState.balance,
    balances : dexState.balances,
    token: dexState.token,
    left: dexState.left,
    right: dexState.right,
    liquidity: dexState.liquidity,
    provider: dexState.provider,
    redeemer: {
      coin: dexState.redeemer.coin,
      max: dexState.redeemer.max,
      liqtoken: Math.max(0,value),
      amount: '',
      xtzamount: '',
    }
  }))};
  const setBalance = (value) => {setDexState({
    balance : value,
    balances : dexState.balances,
    token: dexState.token,
    left: dexState.left,
    right: dexState.right,
    liquidity: dexState.liquidity,
    provider: dexState.provider,
    redeemer: dexState.redeemer
  })};
  return { dexState, setDexState, setBalance, isReady, loadDexTokens,
    getXTZFor, setLeftCoin, setRightCoin, setLeftAmount, switchMax,
    setProviderCoin, setProviderAmount, setProviderXTZAmount, switchProviderMax, switchProviderXTZMax,
    setRedeemerCoin, setRedeemerMax, setRedeemerAmount };
}

export const [ DexProvider, useDexStateContext ] = constate(useDexState);