import './index.less';

const srcUrl = `http://datapc.eastmoney.com/emdatacenter/rzrq/index?market=sh&color=b`;
export default function DataPage() {

  return (
    <iframe
      title="融资融券"
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
