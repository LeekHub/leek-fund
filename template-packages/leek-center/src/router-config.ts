import MyStock from '@/view/my-stocks';
import DataCenter from '@/view/DataCenter';
import FlashNewsView from '@/view/flash-news';
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
  {
    path: '/news',
    component: FlashNewsView,
  },
];
export default routes;
