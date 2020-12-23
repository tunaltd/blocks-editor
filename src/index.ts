"use strict";

import { App } from "./App";
//import * as _ from 'lodash';

document.addEventListener("DOMContentLoaded", function(event) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('in development mode!');
  }
  const app = new App("app");
  app.render();
});
