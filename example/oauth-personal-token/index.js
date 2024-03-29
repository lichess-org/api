require('dotenv').config();

const headers = {
  Authorization: 'Bearer ' + process.env.lichessToken,
};

fetch('https://lichess.org/api/account', { headers })
  .then(res => res.json())
  .then(console.log);
