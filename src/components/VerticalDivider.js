import { useTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';

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

  export default VerticialDivider;