#!/usr/bin/env node
/**
 * Fumotion TUI - Entry Point
 * Terminal User Interface for Fumotion carpooling platform
 */

import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

// Clear console and render the app
console.clear();
render(<App />);
