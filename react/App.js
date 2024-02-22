import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './Navbar';
import AddCardForm from './AddCardForm';
import CardList from './CardList';
import FolderSection from './FolderSection';
import LoginForm from './LoginForm';
import About from './About';
import Download from './Download';
import './longbox.css'; // Assuming you've moved longbox.css to the src folder

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Switch>
          <Route path="/" exact component={CardList} />
          <Route path="/about" component={About} />
          <Route path="/download" component={Download} />
          {/* Add other routes here */}
        </Switch>
      </div>
    </Router>
  );
}

export default App;
