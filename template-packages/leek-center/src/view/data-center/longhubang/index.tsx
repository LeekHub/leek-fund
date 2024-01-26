// import { useParams } from 'react-router-dom';
import './index.less';

// interface ParamsType {
//   bkCode?: String;
// }

const srcUrl = `https://datapc.eastmoney.com/emdatacenter/Ranking/Index?color=b`;
export default function DataPage() {
  // let params: ParamsType = useParams();

  // let bkCode:String = 'bk0815'
  // if (params.bkCode?.indexOf('bk')===0) {
  //   bkCode = params.bkCode
  // }


  return (
    <iframe
      title="龙虎榜数据全览"
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
