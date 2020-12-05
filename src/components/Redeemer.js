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
import InputAdornment from '@material-ui/core/InputAdornment';
import { useTheme } from '@material-ui/core/styles';
import PlusDivider from './PlusDivider';
import { TezosToolkit } from '@taquito/taquito';
import { network, dexContract } from '../settings';
import { useTezos, useAccountPkh, useReady } from '../dapp';

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
  const { dexState } = useDexStateContext();
  const theme = useTheme();
  const svg = 'tezos' + '_' + ((theme.palette.type === 'dark')?'white':'black') + '.svg';
  const classes = useStyles();
  const coin = dexState.redeemer.coin;
  const xtzbalance = dexState.balance;
  const balance = getBalanceFor(dexState, coin);
  const xtzamount = dexState.redeemer.xtzamount;
  return (
    <Grid container direction='row' spacing={4} style={{ paddingRight: '44px', marginTop: '2px' }}>
      <Grid item xs={12} style={{ paddingBottom: 0, marginTop: '16px' }}>
        <Grid container direction='row' alignItems="center">
          <Grid item xs={10}>
            <Typography color='textSecondary' style={{ paddingLeft: '12px' }}>Balance: {balance} {coin}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}  style={{ paddingTop: 0 }}>
      <TextField InputProps={{
            readOnly: true,
          }}
          value={dexState.redeemer.amount}
          type="number" color='secondary' className={classes.formControl}
          id="outlined-basic"
          label="Amount"
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12}>
        <PlusDivider />
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: 0 }}>
        <Grid container direction='row' alignItems="center">
          <Grid item xs={10}>
            <Typography color='textSecondary' style={{ paddingLeft: '12px' }}>Balance: {xtzbalance} XTZ</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} style={{ paddingTop: 0 }}>
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img src={process.env.PUBLIC_URL + "/icons/" + svg} style={{ height: '35px', width: '35px' }}></img>
              </InputAdornment>
            ),
            readOnly: true,
          }}
          value={xtzamount}
          disabled={ balance === '0' } color='secondary' className={classes.formControl}
          id="outlined-basic"
          label="Amount"
          variant="outlined"
        />
      </Grid>
    </Grid>
  )
}

const RightEx = (props) => {
  const { dexState, setRedeemerMax, setRedeemerAmount } = useDexStateContext();
  const classes = useStyles();
  const coin = dexState.redeemer.coin;
  const balance = (coin in dexState.liquidity)?dexState.liquidity[coin]:0;
  const handleMaxChange = (event) => {
    setRedeemerMax(balance);
  }
  const handleChange = (event) => {
    setRedeemerAmount(event.target.value);
  }
  return (
    <Grid container direction='row' alignItems="center" spacing={4} style={{ paddingLeft: '24px', paddingRight: '0px', marginTop: '0px' }}>
      <Grid item xs={12}>
        <Typography style={{ fontWeight: 'bold', paddingLeft: '12px', paddingTop: '8px' }} >Liquidity Token</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: 0, marginTop: '24px' }}>
        <Grid container direction='row' alignItems="center">
          <Grid item xs={10}>
            <Typography color='textSecondary' style={{ paddingLeft: '12px' }}>Balance: {balance} LQT</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>Max</Typography>
          </Grid>
          <Grid item xs={1} style={{ textAlign: 'right' }}>
            <Switch
              checked={dexState.redeemer.max}
              onChange={handleMaxChange}
              color="secondary"
              name="max"
              disabled={ balance === '0' }
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}  style={{ paddingTop: 0 }}>
        <TextField
          value={dexState.redeemer.liqtoken}
          onChange={ handleChange }
          type="number" color='secondary' className={classes.formControl}
          id="outlined-basic"
          label="LQT Amount"
          variant="outlined"
          error={dexState.redeemer.liqtoken > balance}
          helperText={dexState.redeemer.liqtoken > balance?'Cannot redeem more than balance':''}
          disabled={coin === ''}
        />
      </Grid>
    </Grid>
  )
}

const Redeemer = (props) => {
  const { dexState, setRedeemerCoin, resetRedeemer, loadDexTokens, loadLiquidity, setBalance } = useDexStateContext();
  const classes = useStyles();
  const account = useAccountPkh();
  const tezos = useTezos();
  const ready = useReady();
  const coin = dexState.redeemer.coin;
  const handleChange = (event) => {
      setRedeemerCoin(event.target.value);
  };
  async function handleRedeem() {
    const dex = await tezos.wallet.at(dexContract);
    const op = await dex.methods.removeLiquidity(coin,dexState.redeemer.amount).send();
    props.openSnack();
    resetRedeemer();
    op.receipt().then(() => {
        props.closeSnack();
        loadDexTokens();
        loadLiquidity();
        Tezos.tz
        .getBalance(account)
        .then((balance) => { setBalance(balance / 1000000) })
        .catch((error) => console.log(JSON.stringify(error)));
    })
  };
  const cities = Object.keys(dexState.token);
  return (
    <Paper style={{ marginTop: '8px', minWidth: '1000px' }}>
      <Grid container direction='row' spacing={2} alignItems="center">
        <Grid item xs={3} style={{ marginLeft: '24px', marginTop: '12px' }}>
          <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel color='secondary' id="demo-simple-select-outlined-label">Crypto asset pool</InputLabel>
          <Select
            color='secondary'
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={coin}
            onChange={handleChange}
            label="Crypto asset pool"
            labelWidth='200'
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            { cities.map(city =>
              <MenuItem value={city}><CoinItem name={city} show={false}/></MenuItem>
            )}
          </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} style={{ marginLeft: '24px', marginTop: '12px' }}>
          <Paper variant="outlined" disableElevation>
            <Grid container direction='row' alignItems="center" spacing={3} style={{ padding: '13px', paddingLeft: '34px' }}>
              <Grid item xs={4}>
                <Typography color='textSecondary'>Pool Token balance:</Typography>
                <Typography> {(coin !== '')?dexState.token[coin].totalqty:''} {coin}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color='textSecondary'>Pool XTZ balance:</Typography>
                <Typography> {(coin !== '')?dexState.token[coin].poolvalue / 1000000 + ' XTZ':''}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color='textSecondary'>Total Liquidity Tokens:</Typography>
                <Typography> {(coin !== '')?dexState.token[coin].totallqt + ' LQT':''}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction='row' style={{ width: '100%' }}>
            <Grid item style={{ width: '45%' }}>
              <RightEx/>
            </Grid>
            <Grid item style={{ textAlign: '-webkit-center', width: '10%' }}>
              <VerticialDivider></VerticialDivider>
            </Grid>
            <Grid item style={{ width: '45%' }}>
              <LeftEx/>
          </Grid>
        </Grid>
      </Grid>
        <Grid item xs={12}>
          <Divider></Divider>
        </Grid>
        <Grid item xs={12} style={{ textAlign: 'right', paddingRight : 24, paddingBottom : 16 }}>
          <Button onClick={handleRedeem} disabled={!ready || dexState.redeemer.amount === ''} variant='contained' color='secondary' disableElevation>redeem liquidiy</Button>
        </Grid>
      </Grid>
    </Paper>
  )
  }

  export default Redeemer;