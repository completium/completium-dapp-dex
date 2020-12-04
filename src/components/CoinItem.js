import { useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { useDexStateContext } from '../dexstate';
import { getCityName } from '../settings';

const CoinItem = (props) => {
  const { dexState, getXTZFor } = useDexStateContext();
  const theme = useTheme();
  const icon = (props.name === 'XTZ')?(
    process.env.PUBLIC_URL + "/icons/" + 'tezos_' + ((theme.palette.type === 'dark')?'white':'black') + '.svg'
  ):(
    dexState.token[props.name].iconurl
  );
  const name = (props.name === 'XTZ')?(
    'Tezos'
  ):(
    dexState.token[props.name].name
  );
  return (
    <Grid container direction='row' justify="flex-start" alignItems="center" spacing={0}>
      <Grid item xs={1}>
      <img src={icon} style={{ height: '35px', width: '35px' }}></img>
      </Grid>
      <Grid item xs={2} style={{ paddingLeft: (props.show)?'12px':'24px' }}>
        <Typography style={{ textTransform: 'uppercase' }}>{props.name}</Typography>
      </Grid>
      <Grid item xs={3} style={{ paddingLeft: (props.show)?'0px':'24px' }}>
        <Typography color='textSecondary'>{name}</Typography>
      </Grid>
      { (props.name !== 'XTZ' && props.show)? (
        <Grid item xs={6} style={{ textAlign: 'right' }}>
          <Typography color='textSecondary'>({
            new Intl.NumberFormat('en-IN',{maximumFractionDigits : 6}).format(getXTZFor(props.name,1)) + ' XTZ'
          })</Typography>
        </Grid>
      ) : (
        <Grid item></Grid>
      ) }
    </Grid>
  );
}

  export default CoinItem;