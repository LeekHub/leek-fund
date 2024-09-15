const Axios = require('axios');
Axios.get(`http://xueqiu.com/`,  {headers: {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/3.0 Safari/536.11',
}},).then((response) => {
  const cookiesHeader = response.headers['set-cookie'];
  console.log("🚀 ~ Axios.get ~ response:", response)
  this.cookies +=
    cookiesHeader
      .map((h) => {
        let content = h.split(';')[0];
        return content.endsWith('=') ? '' : content;
      })
      .filter((h) => h !== '')
      .join(';') + ';';
});