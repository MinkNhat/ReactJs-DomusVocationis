import React, { useState, useEffect, useRef } from 'react';
import {
    AppstoreOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ContactsOutlined,
    FireOutlined,
    LogoutOutlined,
    HomeFilled,
    HeartTwoTone,
    InfoCircleOutlined,
    CalendarOutlined,
    ScheduleOutlined,
    FileTextOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button, theme } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { callLogout } from 'config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { isMobile } from 'react-device-detect';
import type { MenuProps } from 'antd';
import { setActiveMenu, setLogoutAction } from '@/redux/slice/accountSlide';
import styles from '@/styles/client.module.scss';
import { getActiveMenuFromPath } from '@/config/utils';

const { Sider, Content, Footer } = Layout;

const LayoutClient = () => {
    const location = useLocation();
    const rootRef = useRef<HTMLDivElement>(null);

    const [collapsed, setCollapsed] = useState(false);
    // const [activeMenu, setActiveMenu] = useState('');
    const user = useAppSelector(state => state.account.user);
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const activeMenu = useAppSelector(state => state.account.activeMenu);

    useEffect(() => {
        if (rootRef && rootRef.current) {
            rootRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        const newActiveMenu = getActiveMenuFromPath(location.pathname);
        dispatch(setActiveMenu(newActiveMenu));
    }, [location, dispatch]);


    const handleMenuClick = (e: { key: string }) => {
        dispatch(setActiveMenu(e.key));
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const itemsDropdown = [
        {
            label: <label
                style={{ cursor: 'pointer' }}
            // onClick={() => setOpenManageAccount(true)}
            >Quản lý tài khoản</label>,
            key: 'manage-account',
            icon: <ContactsOutlined />
        },
        ...(user.role?.permissions?.length ? [{
            label: <Link
                to={"/admin"}
            >Trang Quản Trị</Link>,
            key: 'admin',
            icon: <FireOutlined />
        },] : []),

        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
            icon: <LogoutOutlined />
        },
    ];

    useEffect(() => {
        const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;

        const full = [
            {
                label: <Link to='/'>Dashboard</Link>,
                key: '/',
                icon: <AppstoreOutlined />
            },

            ...(isAuthenticated || ACL_ENABLE === 'false' ? [{
                label: <Link to='/period'>Đăng ký lịch</Link>,
                key: '/period',
                icon: <ScheduleOutlined />
            }] : []),

            ...(isAuthenticated || ACL_ENABLE === 'false' ? [{
                label: <Link to='/fee'>Các dịch vụ</Link>,
                key: '/fee',
                icon: <FileTextOutlined />
            }] : []),

            ...(isAuthenticated || ACL_ENABLE === 'false' ? [{
                label: <Link to='/schedule'>Lịch của tôi</Link>,
                key: '/schedule',
                icon: <CalendarOutlined />
            }] : []),

            ...(isAuthenticated || ACL_ENABLE === 'false' ? [{
                label: <Link to='/profile'>Thông tin cá nhân</Link>,
                key: '/profile',
                icon: <SettingOutlined />
            }] : []),
        ];

        setMenuItems(full);
    }, [isAuthenticated])

    return (
        <>
            <Layout
                style={{ minHeight: '100vh' }}
                className="layout-admin"
            >
                {!isMobile ?
                    <Sider
                        theme='light'
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}>
                        <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
                            <HomeFilled /> HOME
                        </div>
                        <Menu
                            selectedKeys={[activeMenu]}
                            mode="inline"
                            items={menuItems}
                            onClick={handleMenuClick}
                        />
                    </Sider>
                    :
                    <Menu
                        selectedKeys={[activeMenu]}
                        items={menuItems}
                        onClick={handleMenuClick}
                        mode="horizontal"
                    />
                }

                <Layout>
                    {!isMobile &&
                        <div className='admin-header' style={{ display: "flex", justifyContent: "space-between", paddingRight: 20, backgroundColor: "#222831" }}>
                            <Button
                                type="text"
                                icon={collapsed ? React.createElement(MenuUnfoldOutlined) : React.createElement(MenuFoldOutlined)}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                    color: "white"
                                }}
                            />

                            <div className={styles['extra']}>
                                {isAuthenticated === false ?
                                    <Link to={'/login'}>Đăng Nhập</Link>
                                    :
                                    <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                        <Space style={{ cursor: "pointer" }}>
                                            <span>Welcome {user?.name}</span>
                                            <Avatar> {user?.name?.substring(0, 2)?.toUpperCase()} </Avatar>

                                        </Space>
                                    </Dropdown>}
                            </div>
                        </div>
                    }
                    <Content style={{ padding: '15px' }}>
                        <Outlet />
                    </Content>
                    <Footer style={{ padding: 10, textAlign: 'center', backgroundColor: "#222831" }}>
                        <span style={{ color: "white" }}>Nguyen Minh Nhat &copy; 2025 <HeartTwoTone /></span>
                    </Footer>
                </Layout>
            </Layout>

        </>
    )
}

export default LayoutClient;