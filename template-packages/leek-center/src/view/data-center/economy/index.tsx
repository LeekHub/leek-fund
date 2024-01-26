import './index.less';

const srcUrl = `https://datapc.eastmoney.com/emdatacenter/economy/Index?color=b`;
export default function DataPage() {

  return (
    <iframe
      title="新股申购"
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
