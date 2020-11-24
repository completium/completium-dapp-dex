import './App.css';
import React, { useState } from 'react';
import { DAppProvider, useConnect } from './dapp.js';
import { DexProvider, useDexStateContext } from './dexstate';
import { appName, appTitle, network } from './settings';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import HeaderBar from './components/HeaderBar';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import SnackMsg from './components/SnackMsg';
import { Typography } from '@material-ui/core';

function App() {
  return (
    <DAppProvider appName={appName}>
      <DexProvider>
        <React.Suspense fallback={null}>
            <PageRouter />
        </React.Suspense>
      </DexProvider>
    </DAppProvider>
  );
}

const PageRouter = () => {
  const [viewSnack, setViewSnack] = useState(false);
  var connect = useConnect();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const handleConnect = React.useCallback(async () => {
    try {
      await connect(network);
    } catch (err) {
      alert(err.message);
    };
  }, [connect]);
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
          secondary: {
            light: '#26457c',
            main: '#162b52',
            dark: '#14233f',
            contrastText: '#fff',
          }
        },
      }),
    [prefersDarkMode],
  );
  const openSnack = () => {
    setViewSnack(true);
  }
  const closeSnack = () => {
    setViewSnack(false);
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <HeaderBar appTitle={appTitle} handleConnect={handleConnect} theme={theme} />
      <Container>
        <Typography>This is a DEX</Typography>
      </Container>
      <SnackMsg open={viewSnack} theme={theme} />
    </ThemeProvider>
  )
}

export default App;
