import { useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { useDexStateContext } from '../dexstate';
import { getCityName, getCoinLabel } from '../settings';

const CoinItem = (props) => {
  const { getXTZFor } = useDexStateContext();
  const theme = useTheme();
  const svg = props.name + '_' + ((theme.palette.type === 'dark')?'white':'black') + '.svg';
  return (
    <Grid container direction='row' justify="flex-start" alignItems="center" spacing={0}>
      <Grid item xs={1}>
      <img src={process.env.PUBLIC_URL + "/icons/" + svg} style={{ height: '35px', width: '35px' }}></img>
      </Grid>
      <Grid item xs={2} style={{ paddingLeft: (props.show)?'12px':'24px' }}>
        <Typography style={{ textTransform: 'uppercase' }}>{getCoinLabel(props.name)}</Typography>
      </Grid>
      <Grid item xs={3} style={{ paddingLeft: (props.show)?'0px':'24px' }}>
        <Typography color='textSecondary'>{getCityName(props.name)}</Typography>
      </Grid>
      { (props.name !== 'tezos' && props.show)? (
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

  export default CoinItem;