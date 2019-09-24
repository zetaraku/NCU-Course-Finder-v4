import React from 'react';
import ReactDOM from 'react-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import * as fontAwesomeLib from 'res/fontAwesomeLib';
import App from './App';
import ReactGA from 'react-ga';
import { ga_tracking_id } from 'res/_settings';
import * as serviceWorker from './serviceWorker';
import './style.scss';

// Add Google Analytics
ReactGA.initialize(ga_tracking_id);
ReactGA.pageview(window.location.pathname + window.location.search);

// Add icons used from Font Awesome
library.add(...Object.values(fontAwesomeLib));

// Render the App
ReactDOM.render(
	React.createElement(App),
	document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
