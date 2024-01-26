import './index.less';

const srcUrl = `https://eminfo.eastmoney.com/pc_news/research/index?color=b`;
export default function DataPage() {

  return (
    <iframe
      title="研报中心"
      className="dark-background-theme"
      src={srcUrl}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '900px',
      }}
    ></iframe>
  );
}
