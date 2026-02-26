const axios = require('axios');
const NEWS_FLASH_URL = 'https://baoer-api.xuangubao.com.cn/api/v6/message/newsflash?limit=20&subj_ids=56&platform=pcweb';
// const NEWS_FLASH_URL = 'https://baoer-api.xuangubao.com.cn/api/v6/message/newsflash';
async function test() {
  const res = await axios.get(NEWS_FLASH_URL, {
    // params: {
    //   limit: 20,
    //   subj_ids: '56',
    //   // has_explain: true,
    //   platform: 'pcweb',
    // },
     "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Google Chrome\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "x-appgo-platform": "device=pc",
    "x-track-info": "{\"AppId\":\"com.xuangutong.web\",\"AppVersion\":\"1.0.0\"}",
    "Referer": "https://xuangutong.com.cn/live"
  },
  });
  return res
}

test().then(res=>console.log(res.data.data));