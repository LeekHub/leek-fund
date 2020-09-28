/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2020-08-30 00:29:29
 * @description: 雪球用户动态
 */

import { ViewColumn } from 'vscode';
import { NewsService } from '../explorer/newsService';
import globalState from '../globalState';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import { formatDateTime } from '../utils';

async function openNews(
  newsService: NewsService,
  userId: string,
  userName: string,
  hideAvatar = false
) {
  const panel = ReusedWebviewPanel.create('newsWebview', `News(${userName})`, ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });

  const updateWebview = async () => {
    const newsList: any | never = await newsService.getNewsData(userId);
    const newsListHTML = xuqiuArticleTemp(newsList, hideAvatar);
    panel.webview.html = getWebviewContent(newsListHTML);
    console.log('updateWebview');
  };
  updateWebview();

  // And schedule updates to the content every 20 seconds
  if (globalState.newsIntervalTimer) {
    clearInterval(globalState.newsIntervalTimer);
    globalState.newsIntervalTimer = null;
  }
  globalState.newsIntervalTimer = setInterval(updateWebview, globalState.newsIntervalTime);

  panel.onDidDispose(() => {
    // When the panel is closed, cancel any future updates to the webview content
    clearInterval(globalState.newsIntervalTimer);
    globalState.newsIntervalTimer = null;
  }, null);
}

function getWebviewContent(newsListHTML: string[] = []) {
  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>News</title>
    <style>
      html {
        font-family: sans-serif;
        line-height: 1.15;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      body {
        margin: 0;
      }
      .profiles__timeline__container {
        margin-bottom: 50px;
      }

      .timeline__item {
        border-bottom: 1px solid #424344;
        padding: 15px 0 5px;
        position: relative;
        -webkit-animation: fadeIn 0.5s linear;
        animation: fadeIn 0.5s linear;
      }

      .timeline__item:after {
        content: '';
        display: table;
        clear: both;
      }

      .timeline__item > .avatar {
        float: left;
      }

      .timeline__item:last-child {
        border: 0;
      }

      .timeline__item .fake-anchor {
        display: none;
      }

      .timeline__item:hover .timeline__item__stock__unlike {
        display: block;
      }

      .timeline__item__main {
        position: relative;
        margin-left: 58px;
      }

      .comment__wrap {
        margin-bottom: 5px;
      }

      .timeline__item__info {
        margin-bottom: 6px;
      }

      .timeline__item__info .user-name {
        font-size: 15px;
        font-weight: 700;
      }

      .timeline__item__info .date-and-source {
        font-size: 13px;
        color: #666c72;
      }

      .timeline__item__info .date-and-source:hover {
        color: #a5a2a2;
      }

      .timeline__item__info .user-auth {
        margin-left: 4px;
        width: 15px;
        height: 15px;
        vertical-align: middle;
        vertical-align: -2px;
      }

      .timeline__item__content .ke_img,
      .timeline__item__forward .ke_img {
        display: block;
        max-width: 100%;
        margin: 24px auto;
      }

      .timeline__item__content .content,
      .timeline__item__forward .content {
        line-height: 1.6;
        word-break: break-all;
        color: #a5a2a2;
        font-size: 15px;
      }

      .timeline__item__content .content a,
      .timeline__item__forward .content a {
        color: #06c;
        margin: 0 2px;
      }

      .timeline__item__content .content a:hover,
      .timeline__item__forward .content a:hover {
        color: #07d;
      }

      .timeline__item__content .content--description > div,
      .timeline__item__forward .content--description > div {
        display: inline;
        word-break: break-word;
      }

      .timeline__item__content .content--detail .ke_img,
      .timeline__item__forward .content--detail .ke_img {
        cursor: -webkit-zoom-out;
        cursor: zoom-out;
      }
      .timeline__item__comment .lite-editor--comment {
        margin-top: 5px;
      }

      .timeline__item__comment
        position: relative;
        margin-left: 58px;
      }

      .timeline__item__content .content--detail > div,
      .timeline__item__forward .content--detail > div {
        display: inline-block;
      }

      .timeline__item__content .fund-visible-tag,
      .timeline__item__forward .fund-visible-tag {
        color: #d6b785;
        margin-left: 4px;
      }

      .timeline__item__bd .content__addition {
        margin-top: 10px;
        margin-bottom: 10px;
      }

      .timeline__item__content + .timeline__item__forward,
      .timeline__item__content + .timeline__item__quote {
        margin-top: 10px;
      }

      .timeline__item__ft {
        margin-top: 10px;
        color: #666c72;
        font-size: 13px;
      }
      .timeline__item > .avatar {
        float: left;
      }
      a.avatar {
        display: inline-block;
        overflow: hidden;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        line-height: 1;
      }
      a.avatar img {
        width: 100%;
        height: 100%;
        vertical-align: middle;
      }
      .avatar.avatar-md {
        width: 48px;
        height: 48px;
      }
      .timer{
        position: fixed;
        top:10px;
        right:10px;
        font-size:12px;
        color:#888;
      }
    </style>
  </head>
  <body>
    <div class="profiles__timeline__bd">
      <span class="timer">数据时间：${formatDateTime(new Date())}</span>
      ${newsListHTML.join('\n')}
    </div>
    <div style="width: 230px; margin: 10px auto">
        <p style="color:#888">----最新10条信息(每20s自动刷新)----</p>
      </div>
  </body>
</html>
`;
}

function xuqiuArticleTemp(newsList = [], hideAvatar = false) {
  const htmlArr = [];
  for (let article of newsList) {
    const info = article as any;
    info.userId = info.user.id;
    const images = info.user.profile_image_url.split(',');
    const img = `https:${info.user.photo_domain}${images[images.length - 1]}`;
    const description = info.description.replace(/\/\/assets/g, 'https://assets');

    let articleStr = `
    <article class="timeline__item">
        ${
          hideAvatar
            ? ''
            : `<a
        href="https://xueqiu.com/${info.userId}"
        target="_blank"
        data-tooltip="${info.userId}"
        class="avatar avatar-md"
        ><img
          src="${img}"
      /></a>`
        }
        <div class="timeline__item__top__right"></div>
        <div class="timeline__item__main" ${hideAvatar ? 'style="margin-left:0;"' : ''}>
          <div class="timeline__item__info">
            <div>
              <a
                href="https://xueqiu.com/${info.userId}"
                target="_blank"
                data-tooltip="${info.userId}"
                class="user-name"
                >${info.user.screen_name}</a
              >
            </div>
            <a
              href="https://xueqiu.com/${info.userId}/${info.id}"
              target="_blank"
              data-id="157971116"
              class="date-and-source"
              >${info.timeBefore} · 来自${info.source}</a
            >
          </div>
          <div class="timeline__item__bd">
            <div class="timeline__item__content">
              <!---->
              <div class="content content--description">
                <!---->
                <div class="">
                  ${description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
      `;
    htmlArr.push(articleStr);
  }
  return htmlArr;
}

export default openNews;
