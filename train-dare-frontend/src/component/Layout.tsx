import { Layout as AntLayout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';

const { Header, Content } = AntLayout;

const Layout = () => {
  const location = useLocation();

  const menuItems = [
    { key: '/', label: 'Accueil' },
    { key: '/apropos', label: 'À propos' },
    { key: '/programmes', label: 'Programmes' },
    { key: '/coaching', label: 'Coaching' },
    { key: '/temoignages', label: 'Témoignages' }
  ];

  return (
    <AntLayout>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', background: '#fff' }}>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => ({
            key: item.key,
            label: <Link to={item.key}>{item.label}</Link>
          }))}
        />
      </Header>
      <Content style={{ padding: '64px 0 0', minHeight: '100vh' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
};

export default Layout;
