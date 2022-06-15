import { useParams } from 'react-router-dom';
interface ParamsType {
  bkCode?: String;
}
export default function BkhqPage() {
  let params: ParamsType = useParams();
  return (
    <iframe
      title="板块详情"
      src={
        'https://quote.eastmoney.com/basic/full.html?mcid=90.' + params.bkCode
      }
      style={{
        width: '100%',
        height: '100%',
        filter: 'invert(100%) hue-rotate(180deg)',
      }}
    ></iframe>
  );
}
