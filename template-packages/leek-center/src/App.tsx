import { Layout } from 'antd';
import LHeader from './components/layout/Header';
import LFooter from './components/layout/Footer';
import routes from './router-config';
import { Switch, Route, Redirect } from 'react-router-dom';
const { Content } = Layout;

function App() {
  return (
    <Layout>
      <LHeader></LHeader>
      <Content style={{ marginTop: 50, minHeight: 'calc(100vh - 86px)' }}>
        <Switch>
          {routes.map((routeConfig) => (
            <Route
              key={
                Array.isArray(routeConfig.path)
                  ? routeConfig.path.join(',')
                  : routeConfig.path
              }
              {...routeConfig}
            ></Route>
          ))}
          <Redirect from="/" to="/my-stocks"></Redirect>
        </Switch>
      </Content>
      <LFooter></LFooter>
    </Layout>
  );
}

export default App;
