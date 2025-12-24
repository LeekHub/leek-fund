import { Layout } from 'antd';
import LHeader from './components/layout/Header';
import LFooter from './components/layout/Footer';
import routes from './router-config';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
const { Content } = Layout;

function App() {
  const location = useLocation();
  const hideLayoutPaths = ['/ai-config', '/xuangubao-news'];
  const isHideLayout = hideLayoutPaths.includes(location.pathname);

  return (
    <Layout>
      {!isHideLayout && <LHeader></LHeader>}
      <Content style={!isHideLayout ? { marginTop: 50, minHeight: 'calc(100vh - 86px)' } : { minHeight: '100vh' }}>
        <Switch>
          {routes.map((routeConfig) => (
            <Route
              key={
                (Array.isArray(routeConfig.path)
                  ? routeConfig.path.join(',')
                  : routeConfig.path) as any
              }
              {...routeConfig}
            ></Route>
          ))}
          <Redirect from="/" to="/my-stocks"></Redirect>
        </Switch>
      </Content>
      {!isHideLayout && <LFooter></LFooter>}
    </Layout>
  );
}

export default App;
