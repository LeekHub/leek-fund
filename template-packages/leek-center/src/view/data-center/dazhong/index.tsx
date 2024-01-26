import './index.less';

const srcUrl = `http://datapc.eastmoney.com/emdatacenter/dzjy/index?color=b`;
export default function DataPage() {

  return (
    <iframe
      title="DataPage"
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
