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
import { cities, getCoinLabel, getBalanceFor } from '../settings';
import { useDexStateContext } from '../dexstate';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import CoinItem from './CoinItem';
import VerticialDivider from './VerticalDivider';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: '100%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const LeftEx = (props) => {
  const { dexState, setLeftCoin, setLeftAmount, switchMax } = useDexStateContext();
  const classes = useStyles();
  const coin = dexState.left.coin;
  const balance = getBalanceFor(coin);
  const handleChange = (event) => {
    setLeftCoin(event.target.value);
  };
  const handleCheckChange = (event) => {
    switchMax(balance);
  }
  const handleAmountChange = (event) => {
    setLeftAmount(event.target.value);
  }
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
            { cities.filter(city => getCoinLabel(city) !== dexState.right.coin && balance !== '0').map(city =>
              <MenuItem value={getCoinLabel(city)}><CoinItem name={city} show={true}/></MenuItem>
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
          disabled={ balance === '0' } type="number" color='secondary' className={classes.formControl}
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
  const exbalance = (coin === 'XTZ')?dexState.token[dexState.left.coin].poolvalue:(coin==='')?'0':dexState.token[coin].totalqty;
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
            { cities.filter(city => getCoinLabel(city) !== dexState.left.coin).map(city =>
              <MenuItem value={getCoinLabel(city)}><CoinItem name={city} show={true}/></MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ paddingTop: 0 }}>
        <Typography color='textSecondary'>Exchange balance: {exbalance} {coin}</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '6px', paddingTop: '0px'}}>
      <Typography color='textSecondary' style={{ paddingLeft: '0' }}>Fee: {(coin === 'XTZ')?parseInt(dexState.right.fee)/1000000:dexState.right.fee} {coin}</Typography>
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
  const { dexState } = useDexStateContext();
  const cannotExchange = () => {
    const lcoin = dexState.left.coin;
    const rcoin = dexState.right.coin;
    if (lcoin === '' || rcoin === '') {
      return true;
    } else {
      const lbalance = getBalanceFor(lcoin);
      const rbalance = (rcoin === 'XTZ')?dexState.token[lcoin].poolvalue:dexState.token[rcoin].totalqty;
      const sent = (rcoin === 'XTZ')?parseInt(dexState.right.amount)/1000000:dexState.right.amount;
      return (
        dexState.right.amount === '' ||
        parseInt(sent) > parseInt(rbalance)/2 ||
        parseInt(dexState.left.amount) > parseInt(lbalance)
      );
    }
  }
  return (
    <Paper style={{ marginTop: '8px' }}>
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
          <Button disabled={cannotExchange()} variant='contained' color='secondary' disableElevation>exchange</Button>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default Exchange;