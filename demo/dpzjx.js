const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const { decode } = require('iconv-lite');

function request() {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    axios
      .get('http://data.eastmoney.com/zjlx/dpzjlx.html', {
        responseType: 'arraybuffer',
        transformResponse: [
          (data) => {
            const body = decode(data, 'GB18030');
            return body;
          },
        ],
      })
      .then((response) => {
        const htmlIdx = response.data.indexOf('</html>') + 7;
        const htmlStr = response.data.slice(0, htmlIdx);
        const $ = cheerio.load(htmlStr);
        const framecontent = $('div.framecontent');

        fs.writeFileSync(
          './demo/1.html',
          `<div class="framecontent">${framecontent.html()}</div>`
        );
        resolve(1);
      })
      .catch((err) => console.log(err));
  });
}

request().then((res) => {
  console.log(res);
});
