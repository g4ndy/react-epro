import "./App.css";
import Epro from "./Epro";
import Epro2 from "./Epro2";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/test">
          <Epro2 />
        </Route>
        <Route path="/">
          <Epro />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
