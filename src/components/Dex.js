import { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import { useDexStateContext } from '../dexstate';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import CoinItem from './CoinItem';
import VerticialDivider from './VerticalDivider';
import { useTezos, useAccountPkh, useReady } from '../dapp';
import { dexContract, network } from '../settings';
import { OpKind, TezosToolkit } from '@taquito/taquito';

const Tezos = new TezosToolkit('https://'+network+'-tezos.giganode.io');

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: '100%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const getBalanceFor = (dexState, coin) => {
  if (coin in dexState.balances) {
    return dexState.balances[coin];
  } else {
    return '';
  }
}

const LeftEx = (props) => {
  const { dexState, setLeftCoin, setLeftAmount, switchMax } = useDexStateContext();
  const xtzbalance = dexState.balance;
  const classes = useStyles();
  const coin = dexState.left.coin;
  const balance = (coin === 'XTZ')?xtzbalance:getBalanceFor(dexState,coin);
  const handleChange = (event) => {
    setLeftCoin(event.target.value);
  };
  const handleCheckChange = (event) => {
    switchMax(balance);
  }
  const handleAmountChange = (event) => {
    setLeftAmount(event.target.value);
  }
  const cities = ['XTZ'].concat(Object.keys(dexState.token)).filter(c => { return (c === 'XTZ' || dexState.token[c].totalqty > 0)});
  return (
    <Grid container direction='row' spacing={4} style={{ paddingLeft: '24px' }}>
      <Grid item xs={12}>
        <Typography style={{ fontWeight: 'bold', paddingLeft: '12px', paddingTop: '24px' }} >From</Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel color='secondary' id="demo-simple-select-outlined-label">Crypto asset</InputLabel>
          <Select
            color='secondary'
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={coin}
            onChange={handleChange}
            label="Crypto asset"
            labelWidth='200'
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            { cities.filter(city => city !== dexState.right.coin).map(city =>
              <MenuItem value={city}><CoinItem name={city} show={true}/></MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: 0 }}>
        <Grid container direction='row' alignItems="center">
          <Grid item xs={10}>
            <Typography color='textSecondary' style={{ paddingLeft: '12px' }}>Balance: {balance} {coin}</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>Max</Typography>
          </Grid>
          <Grid item xs={1} style={{ textAlign: 'right' }}>
            <Switch
              checked={dexState.left.max}
              onChange={handleCheckChange}
              color="secondary"
              name="max"
              disabled={ balance === '0' }
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} style={{ paddingTop: 0 }}>
        <TextField InputProps={{
            readOnly: dexState.left.max,
          }}
          onChange={handleAmountChange}
          value={dexState.left.amount}
          disabled={ balance === '0' } type={(coin === 'XTZ')?"text":"number"} color='secondary' className={classes.formControl}
          id="outlined-basic"
          label="Amount"
          variant="outlined"
          error={parseInt(dexState.left.amount) > parseInt(balance)}
          helperText={parseInt(dexState.left.amount) > parseInt(balance)?'Cannot spend more than balance':''}
        />
      </Grid>
    </Grid>
  )
}

const RightEx = (props) => {
  const { dexState, setRightCoin } = useDexStateContext();
  const classes = useStyles();
  const handleChange = (event) => {
    setRightCoin(event.target.value);
  };
  const coin = dexState.right.coin;
  const sent = (coin === 'XTZ')?parseInt(dexState.right.amount)/1000000:dexState.right.amount;
  var exbalance = 0;
  if (coin !== '') {
    if (coin === 'XTZ') {
      exbalance = dexState.token[dexState.left.coin].poolvalue / 1000000;
    } else {
      exbalance = dexState.token[coin].totalqty;
    }
  };
  var balance = '';
  if (coin !== '') {
    if (coin === 'XTZ') {
      balance = dexState.balance;
    } else {
      balance = getBalanceFor(dexState,coin);
    }
  }
  var fee = (coin === 'XTZ' && dexState.right.fee !== '')?parseInt(dexState.right.fee)/1000000:dexState.right.fee;
  const cities = ['XTZ'].concat(Object.keys(dexState.token)).filter(c => { return (c === 'XTZ' || dexState.token[c].totalqty > 0)});
  return (
    <Grid container direction='row' spacing={4} style={{ paddingRight: '24px' }}>
      <Grid item xs={12}>
        <Typography style={{ fontWeight: 'bold', paddingTop: '24px' }} >To</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingLeft: 0, paddingRight: '34px', paddingBottom: 0 }}>
        <FormControl variant="outlined" className={classes.formControl} style={{ paddingLeft: 0 }}>
          <InputLabel color='secondary' id="demo-simple-select-outlined-label">Crypto asset</InputLabel>
          <Select
            color='secondary'
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={coin}
            onChange={handleChange}
            label="Crypto asset"
            labelWidth='200'
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            { cities.filter(city => city !== dexState.left.coin).map(city =>
              <MenuItem value={city}><CoinItem name={city} show={true}/></MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ paddingTop: 0, paddingBottom: 20 }}>
        <Typography color='textSecondary' variant='caption'>Exchange balance: {exbalance} {coin}</Typography>
      </Grid>
      <Grid item xs={6} style={{ paddingBottom: '6px', paddingTop: '0px'}}>
      <Typography color='textSecondary' style={{ paddingLeft: '0' }}>Balance: {balance} {coin}</Typography>
      </Grid>
      <Grid item xs={6} style={{ paddingBottom: '6px', paddingTop: '0px'}}>
      <Typography color='textSecondary' style={{ paddingLeft: '0' }}>Fee: {fee} {coin}</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingTop: 0, paddingLeft: 0, paddingRight: '34px' }}>
        <TextField InputProps={{
            readOnly: true,
          }}
          value={sent}
          type="number"
          color='secondary'
          className={classes.formControl}
          id="outlined-basic"
          label="Received amount"
          variant="outlined"
          error={parseInt(sent) > parseInt(exbalance)/2}
          helperText={parseInt(sent) > parseInt(exbalance)/2?'Cannot exceed 50% of exchange balance':''} />
      </Grid>
    </Grid>
  )
}

const Exchange = (props) => {
  const [initialized, setInititialized] = useState(false);
  const { dexState, loadDexTokens, resetDexCoins, forceRetrieveTokenBalance, setBalance } = useDexStateContext();
  const tezos = useTezos();
  const account = useAccountPkh();
  const ready = useReady();
  const cannotExchange = () => {
    const lcoin = dexState.left.coin;
    const rcoin = dexState.right.coin;
    if (lcoin === '' || rcoin === '') {
      return !ready;
    } else {
      const lbalance = dexState.balances[lcoin];
      const rbalance = (rcoin === 'XTZ')?dexState.token[lcoin].poolvalue:dexState.token[rcoin].totalqty;
      const sent = (rcoin === 'XTZ')?parseInt(dexState.right.amount)/1000000:dexState.right.amount;
      return (
        dexState.right.amount === '' ||
        parseInt(sent) > parseInt(rbalance)/2 ||
        parseInt(dexState.left.amount) > parseInt(lbalance) ||
        !ready
      );
    }
  }
  if (!initialized) {
    loadDexTokens();
    setInititialized(true);
  }
  async function handleExchange() {
    const lcoin = dexState.left.coin;
    const rcoin = dexState.right.coin;
    const dex = await tezos.wallet.at(dexContract);
    if (lcoin === 'XTZ') {
      /* one transaction to dex */
      const dex = await tezos.wallet.at(dexContract);
      const op = await dex.methods.exchange(
        dexState.left.coin,
        dexState.left.amount * 1000000,
        dexState.right.coin,
        dexState.right.amount).send({ amount: dexState.left.amount });
      props.openSnack();
      resetDexCoins();
      op.receipt().then(() => {
        props.closeSnack();
        loadDexTokens();
        forceRetrieveTokenBalance(rcoin);
        Tezos.tz
        .getBalance(account)
        .then((balance) => { setBalance(balance / 1000000) })
        .catch((error) => console.log(JSON.stringify(error)));
      })
    } else {
      const fa12 = await tezos.wallet.at(dexState.token[lcoin].addr);
      const fa12params = fa12.methods.approve(dexContract,dexState.left.amount).toTransferParams();
      fa12params.kind = OpKind.TRANSACTION;
      const dexparams = dex.methods.exchange(
        dexState.left.coin,
        dexState.left.amount,
        dexState.right.coin,
        dexState.right.amount).toTransferParams();
      dexparams.kind = OpKind.TRANSACTION;
      const batch = await tezos.wallet.batch([fa12params, dexparams]);
      const op = await batch.send();
      props.openSnack();
      resetDexCoins();
      op.receipt().then(() => {
        props.closeSnack();
        loadDexTokens();
        forceRetrieveTokenBalance(lcoin);
        if (rcoin != 'XTZ') {
          forceRetrieveTokenBalance(rcoin);
        }
        Tezos.tz
        .getBalance(account)
        .then((balance) => { setBalance(balance / 1000000) })
        .catch((error) => console.log(JSON.stringify(error)));
      })
    }
  }
  return (
    <Paper style={{ marginTop: '8px', minWidth: '1000px' }}>
      <Grid container direction='row' spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Grid container direction='row' style={{ width: '100%' }}>
            <Grid item style={{ width: '45%' }}>
              <LeftEx/>
            </Grid>
            <Grid item style={{ textAlign: '-webkit-center', width: '10%' }}>
              <VerticialDivider></VerticialDivider>
            </Grid>
            <Grid item style={{ width: '45%' }}>
              <RightEx/>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider></Divider>
        </Grid>
        <Grid item xs={12} style={{ textAlign: 'right', paddingRight : 24, paddingBottom : 16 }}>
          <Button onClick={handleExchange} disabled={cannotExchange()} variant='contained' color='secondary' disableElevation>exchange</Button>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default Exchange;