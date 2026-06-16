import { initShell } from './app/shell.js';
import { initTool20Off } from './tools/20off.js';
import { initToolWeightOver } from './tools/weight-over.js';

document.addEventListener('DOMContentLoaded', () => {
    initShell();
    initTool20Off();
    initToolWeightOver();
});