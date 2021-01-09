import MyStock from '@/view/my-stocks';
import DataCenter from '@/view/DataCenter';
import { RouteProps } from 'react-router-dom';

const routes: RouteProps[] = [
  {
    path: ['/my-stocks'],
    exact: true,
    component: MyStock,
  },
  {
    path: '/data-center',
    component: DataCenter,
  },
];
export default routes;
