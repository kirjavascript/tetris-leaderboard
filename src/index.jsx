/* @refresh reload */
import { render } from 'solid-js/web';

import './index.scss';
import App from './App';

console.log(1)

render(() => <App />, document.body.appendChild(document.createElement('div')));
