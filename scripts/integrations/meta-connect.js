'use strict';
const metaOAuth = require('./meta-oauth');
const args = process.argv.slice(2);
const index = args.indexOf('--slug');
const clientId = index >= 0 ? args[index + 1] : args.find((arg) => !arg.startsWith('--'));
if (!clientId) { console.error('Uso: npm run meta:connect -- --slug <client_id>'); process.exit(1); }
try { console.log(metaOAuth.start(clientId).url); } catch (error) { console.error(error.message); process.exit(1); }
