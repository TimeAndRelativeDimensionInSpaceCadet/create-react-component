#!/usr/bin/env node

/* require = require('esm-wallaby')(module);
require('../src/cli').cli(process.argv); */
import cli from '../index.js';

cli(process.argv);
