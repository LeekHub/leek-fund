
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
import { setEastmoneyPort, getEastmoneyPort } from './proxyConfig';
import { findAvailablePort } from '../../shared/findAvailablePort';
import axios from 'axios';
const cheerio = require('cheerio'); // 或 const { load } = require('cheerio');

// 启动 eastmoney.com 的代理服务器
export async function startProxyServer(
  target?: string,
  middleware?: (req: any, res: any) => void
) {
  const availablePort = await findAvailablePort(16100); // 从16100端口开始寻找

  const targetBase = target || 'https://quote.eastmoney.com';
  const proxy = createProxyMiddleware({
    target: targetBase,
    changeOrigin: true,
    onProxyReq(proxyReq: any, req: any) {
      try {
        proxyReq.setHeader('referer', targetBase);
        if (req?.headers?.origin) {
          proxyReq.setHeader('origin', targetBase);
        }
      } catch {}
    },
    onProxyRes(proxyRes: any, req: any) {
      try {
        const reqOrigin = (req && req.headers && req.headers.origin) || '*';
        proxyRes.headers['access-control-allow-origin'] = reqOrigin === 'null' ? '*' : String(reqOrigin);
        proxyRes.headers['access-control-allow-credentials'] = 'true';
        proxyRes.headers['access-control-allow-methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
        proxyRes.headers['access-control-allow-headers'] =
          (req && req.headers && (req.headers['access-control-request-headers'] as any)) || '*, Authorization, Content-Type, X-Requested-With';

        delete proxyRes.headers['content-security-policy'];
        delete proxyRes.headers['content-security-policy-report-only'];
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['frame-ancestors'];
      } catch {}
    },
  });

  const server = http.createServer(async (req: any, res: any) => {
    try {
      if (req.method === 'OPTIONS') {
        const origin = (req.headers && req.headers.origin) || '*';
        res.writeHead(204, {
          'access-control-allow-origin': origin === 'null' ? '*' : String(origin),
          'access-control-allow-credentials': 'true',
          'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'access-control-allow-headers': (req.headers && (req.headers['access-control-request-headers'] as any)) || '*',
          'access-control-max-age': '86400',
        });
        return res.end();
      }
      if (req.url && req.url.endsWith('/zhuti/') 
        || req.url && req.url.endsWith('.html') 
        || req.url && req.url.includes('/zhuti/subject/') 
        || req.url && req.url.includes('/a/')) {
        await handleZhutiRewrite(req, res, targetBase);
        return;
      }
      if (req.url && req.url.endsWith('main.js')) {
        await handleJsRewrite(req, res, targetBase);
        return;
      }
      proxy(req, res);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy rewrite error');
    }
  });

  server.listen(availablePort, () => {
    const address = server.address();
    const port = typeof address === 'string' ? 0 : address?.port;

    if (port) {
      setEastmoneyPort(port); // 设置端口号
      console.log(`🚀 ~ Proxy server running at http://localhost:${port}`);
    } else {
      console.log(`🚀 ~ Proxy server running at http://localhost:${availablePort}`);
    }

  });
}


async function handleJsRewrite(req: any, res: any, targetBase: string) {
  const url = `${targetBase}${req.url}`;
  const r = await axios.get(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      'accept-encoding': 'identity'
    },
  });
  const rawCt: string = (r.headers['content-type'] as any) || 'application/javascript; charset=utf-8';
  const js: string = typeof r.data === 'string' ? r.data : String(r.data || '');
  const port = getEastmoneyPort();
  const replaced = js.replace(/quote\.eastmoney\.com/gi, `localhost:${port ?? 16100}`);
  res.statusCode = (r.status as number) || 200;
  res.setHeader('content-type', rawCt);
  res.end(replaced);
}


async function handleZhutiRewrite(req: any, res: any, targetBase: string) {
  const url = `${targetBase}${req.url}`;
  const r = await axios.get(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      'accept-encoding': 'identity'
    },
    maxRedirects: 5,
    responseType: 'text'
  });

  // 仅处理 HTML
  const rawCt: string = (r.headers['content-type'] as any) || '';
  const ct = String(rawCt).toLowerCase();
  const isHtml = ct.includes('text/html') || ct.includes('html');
  const body: string = typeof r.data === 'string' ? r.data : String(r.data || '');

  res.statusCode = (r.status as number) || 200;
  if (!isHtml) {
    // 非 HTML：原样返回
    res.setHeader('content-type', rawCt || 'text/plain; charset=utf-8');
    return res.end(body);
  }

  // HTML 改写
  const $ = cheerio.load(body);
  // 放宽 CSP，避免注入脚本被拦截；移除会影响链接行为的 <base>；移除自动刷新
  $('meta[http-equiv="Content-Security-Policy"]').remove();
  $('meta[http-equiv="content-security-policy"]').remove();
  $('meta[http-equiv="refresh"]').remove();
  $('base').remove();
  // 统一设置默认 target 行为
  $('head').prepend('<base target="_self">');
  $('body > div').each((_: any, el: any) => {
    const keep = $(el).hasClass('main') || $(el).hasClass('breadwrap') || $(el).attr('id') === 'marketstyle' || $(el).attr('id') === 'app' ;
    if (!keep) $(el).remove();
  });
  // 进一步精简：仅在 #marketstyle 下，删除 #mar_main 内的 #marketstyle_top 与 #color_bottom
  const marketstyle = $('#marketstyle');
  if (marketstyle && marketstyle.length) {
    const marMain = marketstyle.find('#mar_main');
    if (marMain && marMain.length) {
      marMain.find('#marketstyle_top').remove();
      marMain.find('#color_bottom').remove();
    }
  }
  const breadwrap = $('#breadwrap');
  if (breadwrap && breadwrap.length) {
    breadwrap.find('.bwmain').find('left').remove();
  }
  const main = $('.main');
  if (main && main.length) {
    main.find('.footer2016').remove();
  }
  const container = $('#app .container');
  if (container.length) {
    const keepSelector = '.quote2l, .layout_smm, .guba_kcb_title, .astockzjltab, .zjl_charts';
    container
      .children('div')
      .filter((_: any, el: any) => !$(el).is(keepSelector))
      .attr('hidden', 'hidden');
  }

  // 统一处理所有链接：强制当前窗口打开；将指向 quote.eastmoney.com 的绝对链接改为相对路径
  $('a').each((_: any, el: any) => {
    const $el = $(el);
    $el.attr('target', '_self');
    const rel = $el.attr('rel');
    if (rel) {
      $el.attr('rel', String(rel).replace(/noopener|noreferrer/gi, '').trim());
    }
    const hrefRaw = ($el.attr('href') || '').trim();
    if (!hrefRaw) return;
    try {
      if (/^\/\//i.test(hrefRaw)) {
        const u = new URL('https:' + hrefRaw);
        if (u.hostname === 'quote.eastmoney.com') {
          $el.attr('href', u.pathname + u.search + u.hash);
        }
      } else if (/^https?:\/\//i.test(hrefRaw)) {
        const u = new URL(hrefRaw);
        if (u.hostname === 'quote.eastmoney.com') {
          $el.attr('href', u.pathname + u.search + u.hash);
        }
      }
    } catch {}
  });

  // 注入脚本隐藏页面顶部导航 .top-nav-wrap
  const hideNavJS = `;(function(){try{var el=document.querySelector('.top-nav-wrap');if(el){el.style.display='none';}var mo=new MutationObserver(function(){var e=document.querySelector('.top-nav-wrap');if(e){e.style.display='none';}});mo.observe(document.body||document.documentElement,{childList:true,subtree:true});}catch(e){}})();`;
  $('body').append(`<script>${hideNavJS}</script>`);

  // 注入脚本：设置 #marketstyle 高度为 180px，并监听 DOM 变化保持样式
  const setMarketstyleHeightJS = `;(function(){try{var apply=function(){var ms=document.getElementById('marketstyle');if(ms){ms.style.height='180px';ms.style.marginTop='-40px';}};apply();var mo=new MutationObserver(function(){apply();});mo.observe(document.body||document.documentElement,{childList:true,subtree:true});}catch(e){}})();`;
  $('body').append(`<script>${setMarketstyleHeightJS}</script>`);
  
  // 注入脚本：强制所有链接在当前窗口打开，并拦截 window.open；回传地址给父页面
  const preventNewWindowJS = `;(function(){try{
    function retargetLinks(root){
      var links=(root||document).querySelectorAll('a');
      for(var i=0;i<links.length;i++){
        links[i].setAttribute('target','_self');
        if(links[i].rel){links[i].rel = links[i].rel.replace(/noopener|noreferrer/gi,'').trim();}
      }
    }
    retargetLinks(document);
    // 移除点击事件拦截，因为链接已经设置 target="_self"，让浏览器正常处理导航
    
    // 覆盖 window.open，改为当前窗口跳转，但不触发 window.location.href 避免循环
    try{ var _open = window.open; }catch(_){ }
    window.open = function(url){ 
      try{ 
        if(url && window.parent){ 
          try{ 
            window.parent.postMessage({ __leekWindVane:'location', href: String(url) }, '*'); 
          }catch(_){} 
        } 
      }catch(err){} 
      return null; 
    };
    // 监听单页路由变化
    try{
      var _ps = history.pushState; var _rs = history.replaceState;
      history.pushState = function(){ 
        try{ 
          var result = _ps.apply(history, arguments); 
          window.parent && window.parent.postMessage({ __leekWindVane:'location', href: location.href }, '*'); 
          return result;
        }catch(_){} 
      };
      history.replaceState = function(){ 
        try{ 
          var result = _rs.apply(history, arguments); 
          window.parent && window.parent.postMessage({ __leekWindVane:'location', href: location.href }, '*'); 
          return result;
        }catch(_){} 
      };
      window.addEventListener('popstate', function(){ 
        try{ window.parent && window.parent.postMessage({ __leekWindVane:'location', href: location.href }, '*'); }catch(_){} 
      });
      window.addEventListener('hashchange', function(){ 
        try{ window.parent && window.parent.postMessage({ __leekWindVane:'location', href: location.href }, '*'); }catch(_){} 
      });
    }catch(_e){}
    // 监听 DOM 变化，持续移除 _blank 等
    var mo=new MutationObserver(function(muts){
      for(var i=0;i<muts.length;i++){
        var nodes=muts[i].addedNodes||[];
        for(var j=0;j<nodes.length;j++){
          var n=nodes[j];
          if(n && n.querySelectorAll){ retargetLinks(n); }
          else if(n && n.tagName && String(n.tagName).toLowerCase()==='a'){ n.setAttribute('target','_self'); }
        }
      }
    });
    mo.observe(document.documentElement||document.body,{childList:true,subtree:true});
    // 初次上报
    try{ if(window.parent){ window.parent.postMessage({ __leekWindVane:'location', href: location.href }, '*'); } }catch(_err){}
  }catch(err){}})();`;
  $('body').append(`<script>${preventNewWindowJS}</script>`);
  
  // 注入脚本：设置深色背景主题
  const darkThemeJS = `;(function(){try{
    // 设置页面背景色为深色
    var applyDarkTheme = function(){
      document.body.style.backgroundColor = '#1e1e1e';
      document.body.style.color = '#d4d4d4';
      document.documentElement.style.backgroundColor = '#1e1e1e';
      
      // 查找并修改主要内容区域的背景色
      var mainContainers = document.querySelectorAll('.main, #app, .container, body > div');
      for(var i=0; i<mainContainers.length; i++){
        mainContainers[i].style.backgroundColor = '#1e1e1e';
      }
      
      // 修改表格和卡片背景
      var cards = document.querySelectorAll('.quote2l, .layout_smm, table, .astockzjltab');
      for(var j=0; j<cards.length; j++){
        cards[j].style.backgroundColor = '#252526';
        cards[j].style.color = '#d4d4d4';
      }
    };
    
    // 立即应用
    applyDarkTheme();
    
    // 监听 DOM 变化,持续应用深色主题
    var observer = new MutationObserver(function(){
      applyDarkTheme();
    });
    observer.observe(document.body||document.documentElement, {childList:true, subtree:true});
  }catch(e){}})();`;
  $('body').append(`<script>${darkThemeJS}</script>`);
  
  // 注入 CSS 样式强制深色背景
  const darkThemeCSS = `
    <style>
      body, html {
        background-color: #1e1e1e !important;
        color: #d4d4d4 !important;
      }
      .main, #app, .container {
        background-color: #1e1e1e !important;
      }
      .quote2l, .layout_smm, table, .astockzjltab {
        background-color: #252526 !important;
        color: #d4d4d4 !important;
      }
      table th, table td {
        background-color: #252526 !important;
        color: #d4d4d4 !important;
        border-color: #3e3e42 !important;
      }
      a {
        color: #4fc3f7 !important;
      }
    </style>
  `;
  $('head').append(darkThemeCSS);
  
  const out = $.html();
  // 添加 CORS 头，允许 iframe 嵌入
  const origin = (req.headers && req.headers.origin) || '*';
  res.setHeader('access-control-allow-origin', origin === 'null' ? '*' : String(origin));
  res.setHeader('access-control-allow-credentials', 'true');
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('access-control-allow-headers', (req.headers && (req.headers['access-control-request-headers'] as any)) || '*');
  // 删除可能阻止 iframe 嵌入的头
  res.removeHeader('x-frame-options');
  res.removeHeader('content-security-policy');
  res.removeHeader('content-security-policy-report-only');
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(out);
}


export default startProxyServer;