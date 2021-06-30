require('dotenv').config();
const fetch = require('node-fetch');

const headers = { Authorization: 'Bearer ' + process.env.lichessToken };

console.log(process.argv);
