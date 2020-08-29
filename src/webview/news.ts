import { ViewColumn } from 'vscode';
import ReusedWebviewPanel from '../ReusedWebviewPanel';
import { xuqiuArticleTemp } from '../utils';

async function openNews(userName: string, newsList = []) {
  const panel = ReusedWebviewPanel.create('newsWebview', `News(${userName})`, ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  const newsListHTML = xuqiuArticleTemp(newsList);
  panel.webview.html = `
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

      .timeline__item__comment,
      .timeline__item__main {
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
    </style>
  </head>
  <body>
    <div class="profiles__timeline__bd">
      ${newsListHTML.join('\n')}
    </div>
    <div style="width: 200px; margin: 10px auto">
        <p>----只展示最新10条信息----</p>
      </div>
  </body>
</html>
`;
}

export default openNews;
