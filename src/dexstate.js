import { useState } from 'react';
import constate from 'constate';

export function useDexState() {
  const fee = 0.003;
  const [dexState, setDexState] = useState({
    token     : {
      'XLD' : { addr: 'KT1', poolvalue: '1976', totalqty: '1923300', totallqt: '1000000' },
      'XPA' : { addr: 'KT1', poolvalue: '1288', totalqty: '1756020', totallqt: '1000000' },
      'XNY' : { addr: 'KT1', poolvalue: '1852', totalqty: '1360000', totallqt: '1000000' },
      'XRO' : { addr: 'KT1', poolvalue: '447',  totalqty: '1006540', totallqt: '1000000' },
      'XTK' : { addr: 'KT1', poolvalue: '1348', totalqty: '998510',  totallqt: '1000000' },
      'XAT' : { addr: 'KT1', poolvalue: '162',  totalqty: '572840',  totallqt: '1000000' },
      'XMO' : { addr: 'KT1', poolvalue: '94',   totalqty: '551000',  totallqt: '1000000' },
      'XSD' : { addr: 'KT1', poolvalue: '640',  totalqty: '409060',  totallqt: '1000000' },
      'XRI' : { addr: 'KT1', poolvalue: '97',   totalqty: '227830',  totallqt: '1000000' },
    },
    liquidity : [],
    balance   : {
      'XLD' : '3450',
      'XPA' : '1230',
      'XNY' : '560',
      'XRO' : '0',
      'XTK' : '0',
      'XAT' : '0',
      'XMO' : '0',
      'XSD' : '0',
      'XRI' : '0',
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
    }
  });
  const isReady = () => {
    return !(dexState.token === []);
  }
  const computeAmounts = (state) => {
    if (state.left.coin !== '' && state.left.amount !== '' && state.right.coin !== '') {
      const srctotalqty = (state.left.coin === "XTZ")?(parseInt(dexState.token[state.right.coin].poolvalue) * 1000000) : (parseInt(dexState.token[state.left.coin].totalqty));
      const dsttotalqty = (state.right.coin === "XTZ")?(parseInt(dexState.token[state.left.coin].poolvalue) * 1000000) : (parseInt(dexState.token[state.right.coin].totalqty));

      var K = srctotalqty * dsttotalqty;
      var leftamount = (dexState.left.coin === "XTZ") ? parseInt(state.left.amount) * 1000000 : parseInt(state.left.amount);
      var qtywithfee = dsttotalqty - K / (srctotalqty + (1 - fee) * leftamount);
      var qty        = dsttotalqty - K / (srctotalqty + leftamount);
      var qtyint     = Math.floor(qtywithfee);
      var feeqty     = Math.ceil(qty-qtywithfee);
      console.log(`qtywithfee: ${qtywithfee}`);
      console.log(`feeqty: ${feeqty}`);
      return {
        token: dexState.token,
        liquidity: dexState.liquidity,
        balance: dexState.balance,
        left : state.left,
        right : { coin: state.right.coin, amount : qtyint, fee : feeqty },
      }
    }
    else return state;
  }
  const getXTZFor = (city,qty) => {

    var srctotalqty = dexState.token[city].totalqty;
    var dsttotalqty = dexState.token[city].poolvalue;
    var K = srctotalqty * dsttotalqty * 1000000;
    var expecteddstqty = dsttotalqty - K / (srctotalqty + (1 - fee) * qty * 1000000);
    return expecteddstqty;
  }
  const getBalanceFor = (city) => { return dexState.balance[city]; }
  const setLeftCoin = (coin) => { setDexState({
    token: dexState.token,
    liquidity: dexState.liquidity,
    balance: dexState.balance,
    left : { coin: coin, amount : '', max: false },
    right : { coin: dexState.right.coin, amount : '', fee : '' }
  })};
  const setRightCoin = (coin) => { setDexState(computeAmounts({
    token: dexState.token,
    liquidity: dexState.liquidity,
    balance: dexState.balance,
    left : dexState.left,
    right : { coin: coin, amount : '', fee : '' },
  }))};
  const setLeftAmount = (amount) => { setDexState (computeAmounts({
    token: dexState.token,
    liquidity: dexState.liquidity,
    balance: dexState.balance,
    left : { coin: dexState.left.coin, amount : amount, max: dexState.left.max },
    right : { coin: dexState.right.coin, amount : '', fee : '' }
  }))};
  const switchMax = () => { setDexState (computeAmounts({
    token: dexState.token,
    liquidity: dexState.liquidity,
    balance: dexState.balance,
    left : { coin: dexState.left.coin, amount : dexState.left.max?'':dexState.balance[dexState.left.coin], max: !(dexState.left.max) },
    right : { coin: dexState.right.coin, amount : '', fee : '' }
  }))};
  return { dexState, setDexState, isReady, getXTZFor, getBalanceFor, setLeftCoin, setRightCoin, setLeftAmount, switchMax };
}

export const [ DexProvider, useDexStateContext ] = constate(useDexState);