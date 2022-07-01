import { useParams } from 'react-router-dom';
import './index.less'

interface ParamsType {
  bkCode?: String;
}
export default function BkhqPage() {
  let params: ParamsType = useParams();
  
  let bkCode:String = 'bk0815'
  if (params.bkCode?.indexOf('bk')===0) {
    bkCode = params.bkCode
  }

  return (
    <iframe
      title="板块详情"
      className='dark-background-theme'
      src={
        'https://quote.eastmoney.com/basic/full.html?mcid=90.' + bkCode
      }
      style={{
        width: '100%',
        height: '100%',
        minHeight: '900px'
      }}
    ></iframe>
  );
}
