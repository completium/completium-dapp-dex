import { useState } from 'react';
import { useTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import { cities } from '../settings';
import { useDexStateContext } from '../dexstate';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';

const getCoinLabel = (city) => {
  switch(city) {
    case 'tezos'   : return 'XTZ';
    case 'paris'   : return 'XPA';
    case 'london'  : return 'XLD';
    case 'moscow'  : return 'XMO';
    case 'nyc'     : return 'XNY';
    case 'tokyo'   : return 'XTK';
    case 'sydney'  : return 'XSD';
    case 'athenes' : return 'XAT';
    case 'rio'     : return 'XRI';
    case 'rome'    : return 'XRO';
    default : return '';
  }
}

const getCityName = (city) => {
  switch(city) {
    case 'tezos'   : return 'Tezos';
    case 'paris'   : return 'Paris';
    case 'london'  : return 'London';
    case 'moscow'  : return 'Moscow';
    case 'nyc'     : return 'New York City';
    case 'tokyo'   : return 'Tokyo';
    case 'sydney'  : return 'Sydney';
    case 'athenes' : return 'Athens';
    case 'rio'     : return 'Rio de Janeiro';
    case 'rome'    : return 'Rome';
    default : return '';
  }
}

const CoinItem = (props) => {
  const { getXTZFor } = useDexStateContext();
  const theme = useTheme();
  const svg = props.name + '_' + ((theme.palette.type === 'dark')?'white':'black') + '.svg';
  return (
    <Grid container direction='row' justify="flex-start" alignItems="center" spacing={0}>
      <Grid item xs={1}>
      <img src={process.env.PUBLIC_URL + "/icons/" + svg} style={{ height: '35px', width: '35px' }}></img>
      </Grid>
      <Grid item xs={2} style={{ paddingLeft: '12px' }}>
        <Typography style={{ textTransform: 'uppercase' }}>{getCoinLabel(props.name)}</Typography>
      </Grid>
      <Grid item xs={3}>
        <Typography color='textSecondary'>{getCityName(props.name)}</Typography>
      </Grid>
      { (props.name !== 'tezos')? (
        <Grid item xs={6} style={{ textAlign: 'right' }}>
          <Typography color='textSecondary'>({
            new Intl.NumberFormat('en-IN',{maximumFractionDigits : 6}).format(getXTZFor(getCoinLabel(props.name),1)) + ' XTZ'
          })</Typography>
        </Grid>
      ) : (
        <Grid item></Grid>
      ) }
    </Grid>
  );
}

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
  const { dexState, getBalanceFor, setLeftCoin, setLeftAmount, switchMax } = useDexStateContext();
  const classes = useStyles();
  const handleChange = (event) => {
    setLeftCoin(event.target.value);
  };
  const handleCheckChange = (event) => {
    switchMax();
  }
  const handleAmountChange = (event) => {
    setLeftAmount(event.target.value);
  }
  const coin = dexState.left.coin;
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
            { cities.filter(city => getCoinLabel(city) !== dexState.right.coin && dexState.balance[getCoinLabel(city)] !== '0').map(city =>
              <MenuItem value={getCoinLabel(city)}><CoinItem name={city} /></MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: 0 }}>
        <Grid container direction='row' alignItems="center">
          <Grid item xs={10}>
            <Typography color='textSecondary' style={{ paddingLeft: '12px' }}>Balance: {getBalanceFor(coin)} {coin}</Typography>
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
              disabled={ dexState.balance[coin] === '0' }
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} style={{ paddingTop: 0 }}>
        <TextField InputProps={{
            readOnly: dexState.left.max,
          }} onChange={handleAmountChange} value={dexState.left.amount} disabled={ dexState.balance[coin] === '0' } type="number" color='secondary' className={classes.formControl} id="outlined-basic" label="Amount" variant="outlined" />
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
  return (
    <Grid container direction='row' spacing={4} style={{ paddingRight: '24px' }}>
      <Grid item xs={12}>
        <Typography style={{ fontWeight: 'bold', paddingTop: '24px' }} >To</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingLeft: 0, paddingRight: '34px' }}>
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
              <MenuItem value={getCoinLabel(city)}><CoinItem name={city} /></MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '6px', paddingTop: '24px'}}>
      <Typography color='textSecondary' style={{ paddingLeft: '0' }}>Fee: {(coin === 'XTZ')?parseInt(dexState.right.fee)/1000000:dexState.right.fee} {coin}</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingTop: 0, paddingLeft: 0, paddingRight: '34px' }}>
        <TextField InputProps={{
            readOnly: true,
          }} value={(coin === 'XTZ')?parseInt(dexState.right.amount)/1000000:dexState.right.amount} type="number" color='secondary' className={classes.formControl} id="outlined-basic" label="Received amount" variant="outlined" />
      </Grid>
    </Grid>
  )
}

const VerticialDivider = (props) => {
  const theme = useTheme();
  return (
    <Grid container direction='column' justify="center" alignItems="center" style={{ height: '350px' }}>
      <Grid item xs={5}>
        <Divider orientation="vertical" flexItem style={{ height: '100%' }}></Divider>
      </Grid>
      <Grid item>
        <div color='disabled' style= {{
          borderStyle: 'solid',
          borderWidth: '1px',
          borderRadius: '90px',
          height: '31px',
          width: '31px',
          borderColor : theme.palette.divider,
        }}>
          <ArrowRightAltIcon style={{
            position : 'relative',
            top : '3px'
          }} color="secondary"/>
        </div>
      </Grid>
      <Grid item xs={5}>
        <Divider orientation="vertical" flexItem style={{ height: '100%' }} ></Divider>
      </Grid>
    </Grid>
  )
}

const Exchange = (props) => {
  const { dexState } = useDexStateContext();
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
          <Button disabled={dexState.right.amount === ''} variant='contained' color='secondary' disableElevation>exchange</Button>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default Exchange;