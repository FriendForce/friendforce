import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import FullApp from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<FullApp />, document.getElementById('root'));
registerServiceWorker();
