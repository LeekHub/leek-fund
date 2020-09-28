const axios = require('axios');
const fs = require('fs');
const { decode } = require('iconv-lite');

function request() {
  return new Promise((resolve, reject) => {
    axios
      .get('https://xueqiu.com/u/5124430882', {
        responseType: 'arraybuffer',
        transformResponse: [
          (data) => {
            const body = decode(data, 'GB18030');
            return body;
          },
        ],
      })
      .then((response) => {
        const html = response.data;
        fs.writeFileSync('./demo/xueqiu11.html', html);
        resolve(1);
      })
      .catch((err) => console.log(err));
  });
}

request().then((res) => {
  console.log(res);
});
