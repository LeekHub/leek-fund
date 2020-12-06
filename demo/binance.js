const Axios = require('axios');

function request() {
  return new Promise((resolve, reject) => {
    Axios.get(`https://api.binance.com/api/v1/exchangeInfo`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/3.0 Safari/536.11',
      },
    })
      .then((response) => {
        const data = response.data;

        resolve(data);
      })
      .catch((err) => console.log(err));
  });
}

request().then((res) => {
  console.log(res);
});
