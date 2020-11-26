import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import AddIcon from '@material-ui/icons/Add';
import { useTheme } from '@material-ui/core/styles';

const PlusDivider = (props) => {
  const theme = useTheme();
  return (
    <Grid container direction='row' justify="center" alignItems="center" style={{ marginLeft: '8px' }}>
      <Grid item style={{ width: '47%' }}>
        <Divider></Divider>
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
          <AddIcon style={{
            position : 'relative',
            top : '3px',
            left : '3px'
          }} color="secondary"/>
        </div>
      </Grid>
      <Grid item style={{ width: '47%' }}>
        <Divider></Divider>
      </Grid>
    </Grid>
  );
}

export default PlusDivider;