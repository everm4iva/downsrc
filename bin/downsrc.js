#!/usr/bin/env node

/**
 * ☆=========================================☆
 * Downsrc CLI Entry Point
 * ☆=========================================☆
 */

import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {run} from '../resources/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ☆ Run downsrc ☆ //
run(process.argv.slice(2));
