import Register from "./components/Register";
import ipConfig from "./ipConfig.json";
import { Route, Switch, Link } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";
import { ThemeProvider } from "@mui/system";
import theme from "./theme";

export const config = {
  endpoint: `https://${ipConfig.workspaceIp}/api/v1`,
};

function App() {
  return (
    <ThemeProvider theme = {theme}>
      <div className="App">
        <Switch>
          <Route exact path="/"><Products /></Route>
          <Route path="/login"><Login /></Route>
          <Route path="/register"><Register /></Route>
          <Route path="/checkout"><Checkout /></Route>
          <Route path="/thanks"><Thanks /></Route>
        </Switch>
      </div>
    </ThemeProvider>
  );
}

export default App;
