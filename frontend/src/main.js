import './style.css';
import { PriceListApp } from './components/PriceListApp.js';

document.querySelector('#app').innerHTML = `
  <div id="price-list-app"></div>
`;

// Initialize the app
const app = new PriceListApp();
app.init();
