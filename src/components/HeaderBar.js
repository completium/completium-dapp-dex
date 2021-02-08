import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import '../index.css';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import { useReady, useWallet } from '../dapp';
import WalletButton from './WalletButton';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';


const HeaderBar = (props) => {
  const ready = useReady();
  const wallet = useWallet();
  const minWidth = useMediaQuery('(min-width:600px)');
  var visible = minWidth?'visible':'hidden';
  var dark = props.theme.palette.type === 'dark';
  return (
    <AppBar position="static" color={dark?"default":"secondary"} style={{
      boxShadow: "none",
      opacity: 1,
    }}>
      <Toolbar>
        <Typography variant="h6" style={{ color: 'white', position: 'absolute', fontFamily : 'Alegreya Sans SC, sans-serif' }}>
          Completium
        </Typography>
        <Grid container justify="center" alignItems="center">
          <Grid item>
            <Typography variant="h6" style={{
              visibility: visible,
              textAlign: 'center',
              color: 'white'
              }}>
              {props.appTitle}
            </Typography>
          </Grid>
        </Grid>
        <WalletButton handleConnect={props.handleConnect}/>
        <a href="https://edukera.github.io/completium-landing/docs/dapp-dex/presentation" target="_blank">
          <Button style={{ color: 'white' }} component="span">
            <HelpOutlineIcon/>
          </Button>
        </a>
      </Toolbar>
    </AppBar>
  )
}

export default HeaderBar