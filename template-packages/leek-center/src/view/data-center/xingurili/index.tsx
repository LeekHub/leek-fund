import './index.less';

const srcUrl = `https://datapc.eastmoney.com/da/calendar/index?color=b`;
export default function DataPage() {

  return (
    <iframe
      title="新股日历"
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
