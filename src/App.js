import React, { useState, useEffect } from "react";
import axios from "axios";

import PushStatus from './components/StatusPush';
import Form from './components/Question'

import "./styles.css";


function App() {

  const [activeScreen, setActiveScreen] = useState(<Form />)

  return(<div>
    <div className="screenHeader">
      <div className="screenHeaderTab">
        
      </div>
    </div>
    {activeScreen}
    </div>)
}

export default App;
