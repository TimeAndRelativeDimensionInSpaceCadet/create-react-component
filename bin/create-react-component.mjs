#!/usr/bin/env node
import cli from '../index.js';

cli(process.argv).catch(e => {
  const { message } = e;
  console.error(
    `${message} - for more information use the -h or --help option`
  );
});
