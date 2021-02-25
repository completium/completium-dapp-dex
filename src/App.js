import './App.css';
import React, { useState } from 'react';
import { DAppProvider, useConnect, useAccountPkh, useReady } from './dapp.js';
import { DexProvider, useDexStateContext } from './dexstate';
import { appName, appTitle, network, endpoint } from './settings';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import HeaderBar from './components/HeaderBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import SnackMsg from './components/SnackMsg';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Exchange from './components/Dex';
import Provider from './components/Provider';
import Redeemer from './components/Redeemer';
import { TezosToolkit } from '@taquito/taquito';

const Tezos = new TezosToolkit(endpoint);

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

const getComponent = (value, openSnack, closeSnack) => {
  switch (value) {
    case 0: return <Exchange openSnack={openSnack} closeSnack={closeSnack}/>;
    case 1: return <Provider openSnack={openSnack} closeSnack={closeSnack}/>;
    case 2: return <Redeemer openSnack={openSnack} closeSnack={closeSnack}/>;
    default: return <div></div>;
  }
}

const PageRouter = () => {
  const [viewSnack, setViewSnack] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [computeBalance, setComputeBalance] = useState(false);
  const [value, setValue] = React.useState(0);
  const account = useAccountPkh();
  const ready = useReady();
  const { setBalance, loadLiquidity } = useDexStateContext();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  var connect = useConnect();
  const prefersDarkMode = false; /* useMediaQuery('(prefers-color-scheme: dark)'); */
  const handleConnect = React.useCallback(async () => {
    try {
      await connect(network);
      setComputeBalance(true);
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
            light: prefersDarkMode ? '#4b85f2' :'#26457c',
            main: prefersDarkMode ? '#4681f0' : '#162b52',
            dark: prefersDarkMode ? '#3361b8' :'#14233f',
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
  if (account !== null && !initialized) {
    loadLiquidity();
    setInitialized(true);
  }
  if (ready && computeBalance) {
    Tezos.tz
      .getBalance(account)
      .then((balance) => { setBalance(balance / 1000000) })
      .catch((error) => console.log(JSON.stringify(error)));
    setComputeBalance(false);
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <HeaderBar appTitle={appTitle} handleConnect={handleConnect} theme={theme} />
      <Container>
        <Tabs
          value={value}
          indicatorColor="secondary"
          textColor={ prefersDarkMode ? "default" : "secondary"}
          onChange={handleChange}
          aria-label="disabled tabs example"
          style={{ marginTop: '10px' }}
        >
          <Tab label="Exchange" />
          <Tab label="Provide Liquidity"/>
          <Tab label="Redeem Liquidity"/>
          <Tab label="History" disabled />
        </Tabs>
        { getComponent(value, openSnack, closeSnack) }
      </Container>
      <SnackMsg open={viewSnack} theme={theme} />
    </ThemeProvider>
  )
}

export default App;
