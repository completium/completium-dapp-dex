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
import { cities, getCoinLabel } from '../settings';
import { useDexStateContext } from '../dexstate';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import CoinItem from './CoinItem';
import VerticialDivider from './VerticalDivider';
import InputAdornment from '@material-ui/core/InputAdornment';
import { useTheme } from '@material-ui/core/styles';
import PlusDivider from './PlusDivider';

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
  const { dexState, setProviderAmount, setProviderXTZAmount, switchProviderMax, switchProviderXTZMax, isPoolEmpty } = useDexStateContext();
  const theme = useTheme();
  const svg = 'tezos' + '_' + ((theme.palette.type === 'dark')?'white':'black') + '.svg';
  const classes = useStyles();
  const coin = dexState.provider.coin;
  const balance = getBalanceFor(dexState,coin);
  const xtzbalance = dexState.balance;
  const handleMaxChange = (event) => {
    switchProviderMax(balance);
  }
  const handleMaxXTZChange = (event) => {
    switchProviderXTZMax(xtzbalance);
  }
  const handleAmountChange = (event) => {
    setProviderAmount(event.target.value);
  }
  const handleXTZAmountChange = (event) => {
    setProviderXTZAmount(event.target.value);
  }
  const errorAmount = parseInt(dexState.provider.amount) > ((coin !== '')?parseInt(balance):0);
  return (
    <Grid container direction='row' spacing={4} style={{ paddingLeft: '24px' }}>
      <Grid item xs={12} style={{ paddingBottom: 0, marginTop: '16px' }}>
        <Grid container direction='row' alignItems="center">
          <Grid item xs={10}>
            <Typography color='textSecondary' style={{ paddingLeft: '12px' }}>Balance: {balance} {coin}</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>Max</Typography>
          </Grid>
          <Grid item xs={1} style={{ textAlign: 'right' }}>
            <Switch
              disabled={coin === ''}
              checked={dexState.provider.maxb}
              onChange={handleMaxChange}
              color="secondary"
              name="max"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}  style={{ paddingTop: 0 }}>
        <TextField InputProps={{
            readOnly: dexState.provider.maxb,
          }}
          value={dexState.provider.amount}
          onChange={handleAmountChange}
          type="number" color='secondary' className={classes.formControl}
          id="outlined-basic"
          label="Amount"
          variant="outlined"
          error={errorAmount}
          disabled={coin === ''}
          helperText={errorAmount?'Cannot spend more than balance':''}
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
          <Grid item xs={1}>
            <Typography>Max</Typography>
          </Grid>
          <Grid item xs={1} style={{ textAlign: 'right' }}>
            <Switch
              checked={dexState.provider.maxxtzb}
              onChange={handleMaxXTZChange}
              color="secondary"
              name="max"
              disabled={ balance === '0' }
            />
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
            readOnly: dexState.provider.maxxtzb,
          }}
          onChange={handleXTZAmountChange}
          on
          value={dexState.provider.xtzamount}
          disabled={ balance === '0' || coin ==='' } color='secondary' className={classes.formControl}
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
  const { dexState } = useDexStateContext();
  const classes = useStyles();
  const coin = dexState.provider.coin;
  const balance = (coin in dexState.liquidity)?dexState.liquidity[coin]:0;
  return (
    <Grid container direction='row' alignItems="center" spacing={4} style={{ paddingLeft: '0px', paddingRight: '44px', marginTop: '0px' }}>
      <Grid item xs={12}>
        <Typography style={{ fontWeight: 'bold', paddingLeft: '12px', paddingTop: '8px' }} >Liquidity Token</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: 0, marginTop: '36px' }}>
        <Grid container direction='row' alignItems="center">
          <Grid item xs={10}>
            <Typography color='textSecondary' style={{ paddingLeft: '12px' }}>Balance: {balance} LQT</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}  style={{ paddingTop: 0 }}>
      <TextField InputProps={{
            readOnly: true,
          }}
          value={dexState.provider.liqtoken}
          type="number" color='secondary' className={classes.formControl}
          id="outlined-basic"
          label="Received Amount"
          variant="outlined"
        />
      </Grid>
    </Grid>
  )
}

const Provider = (props) => {
    const { dexState, setProviderCoin } = useDexStateContext();
    const classes = useStyles();
    const coin = dexState.provider.coin;
    const handleChange = (event) => {
      setProviderCoin(event.target.value);
    };
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
              { cities.filter(city => getCoinLabel(city) !== 'XTZ').map(city =>
                <MenuItem value={getCoinLabel(city)}><CoinItem name={city} show={false}/></MenuItem>
              )}
            </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5} style={{ marginLeft: '24px', marginTop: '12px' }}>
            <Paper variant="outlined" disableElevation>
              <Grid container direction='row' alignItems="center" spacing={3} style={{ padding: '13px', paddingLeft: '34px' }}>
                <Grid item xs={6}>
                  <Typography color='textSecondary'>Pool Token balance:</Typography>
                  <Typography> {(coin !== '')?dexState.token[coin].totalqty:''} {coin}</Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography color='textSecondary'>Pool XTZ balance:</Typography>
                  <Typography> {(coin !== '')?dexState.token[coin].poolvalue / 1000000 + ' XTZ':''}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
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
            <Button disabled={dexState.provider.liqtoken === ''} variant='contained' color='secondary' disableElevation>provide liquidiy</Button>
          </Grid>
        </Grid>
      </Paper>
    )
  }

  export default Provider;