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
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Exchange from './components/Dex';

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
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  var connect = useConnect();
  const prefersDarkMode = false; /* useMediaQuery('(prefers-color-scheme: dark)'); */
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
          <Tab label="Liquidity" disabled/>
          <Tab label="History" disabled />
        </Tabs>
        <Exchange />
      </Container>
      <SnackMsg open={viewSnack} theme={theme} />
    </ThemeProvider>
  )
}

export default App;
