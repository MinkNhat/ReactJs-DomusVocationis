import React, { useEffect, useState } from 'react';
import {
    Card,
    Avatar,
    Button,
    Row,
    Col,
    Typography,
    Divider,
    Tag,
    Space,
    Modal,
    Form,
    Input,
    Upload,
    message,
    Popconfirm,
    Select,
    DatePicker,
    Switch,
    notification,
    Spin
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    LogoutOutlined,
    LockOutlined,
    CameraOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    CalendarOutlined,
    TeamOutlined,
    UserSwitchOutlined,
    SettingOutlined,
    SecurityScanOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { FORMATE_DATE_VN } from '@/config/utils';
import { callChangeUserPassword, callFetchUserById, callLogout } from '@/config/api';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { IUser } from '@/types/backend';
import { set } from 'lodash';

const { Title, Text } = Typography;

const ProfilePage = () => {
    const [userInfo, setUserInfo] = useState<IUser | null>(null);
    const user = useAppSelector(state => state.account.user);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (user && user.id) {
            fetchUserInfo();
        }
    }, [user]);

    const fetchUserInfo = async () => {
        setLoading(true);

        let res = await callFetchUserById(user.id);
        if (res && res.data) {
            setUserInfo(res.data);
        }

        setLoading(false);
    }

    const handleChangePassword = async () => {
        const values = await passwordForm.validateFields();
        let res = await callChangeUserPassword(user.id, {
            oldPassword: values.currentPassword,
            newPassword: values.newPassword
        });

        if (res && +res.statusCode === 200) {
            message.success('Đổi mật khẩu thành công!');
            setChangePasswordVisible(false);
            passwordForm.resetFields();
        } else {
            const descriptionText = typeof res.message === 'object' ? Object.values(res.message).join(", ") : res.message;

            notification.error({
                message: 'Có lỗi xảy ra',
                description: descriptionText || 'Vui lòng kiểm tra lại thông tin'
            });
        }
    };

    const handleAvatarUpload = (info: any) => {
        console.log(info);
        if (info.file.status === 'done') {
            message.success('Cập nhật avatar thành công!');
            setAvatarModalVisible(false);
        } else if (info.file.status === 'error') {
            message.error('Upload avatar thất bại!');
        }
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Row gutter={[24, 24]}>
                {/* Profile */}
                <Col xs={24} lg={10}>
                    <Card
                        style={{ textAlign: 'center', height: 'fit-content' }}
                        actions={[
                            <Button
                                key="edit"
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    message.info("Vui lòng liên hệ quản trị viên để chỉnh sửa thông tin.");
                                }}
                            >
                                Chỉnh sửa
                            </Button>,
                            <Button
                                key="avatar"
                                type="text"
                                icon={<CameraOutlined />}
                                onClick={() => setAvatarModalVisible(true)}
                            >
                                Đổi avatar
                            </Button>,
                        ]}
                    >
                        <Avatar
                            size={160}
                            src={userInfo?.avatar}
                            icon={<UserOutlined />}
                            style={{ marginBottom: '16px' }}
                        />
                        <Title level={3} style={{ marginBottom: '8px' }}>
                            {`${userInfo?.christianName ? userInfo.christianName : ""} ${userInfo?.fullName}`}
                        </Title>

                    </Card>

                    {/* Account Settings */}
                    <Card
                        title={
                            <Space>
                                <SettingOutlined />
                                Cài đặt tài khoản
                            </Space>
                        }
                        style={{ marginTop: '16px' }}
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <Button
                                type="default"
                                icon={<LockOutlined />}
                                block
                                onClick={() => setChangePasswordVisible(true)}
                            >
                                Đổi mật khẩu
                            </Button>

                            <Button
                                type="default"
                                icon={<SecurityScanOutlined />}
                                block
                            >
                                Cài đặt bảo mật
                            </Button>

                            <Button
                                type="default"
                                icon={<UserSwitchOutlined />}
                                block
                            >
                                Quản lý quyền
                            </Button>

                            <Popconfirm
                                title="Bạn có chắc chắn muốn đăng xuất?"
                                onConfirm={handleLogout}
                                okText="Đăng xuất"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="primary"
                                    danger
                                    icon={<LogoutOutlined />}
                                    block
                                >
                                    Đăng xuất
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Card>
                </Col>

                {/* User Information */}
                <Col xs={24} lg={14}>
                    <Card title="Thông tin cá nhân">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>
                                        <MailOutlined /> Email
                                    </Text>
                                    <Text>{userInfo?.email}</Text>
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>
                                        <PhoneOutlined /> Số điện thoại
                                    </Text>
                                    <Text>{userInfo?.phone}</Text>
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>
                                        <CalendarOutlined /> Ngày sinh
                                    </Text>
                                    {userInfo?.birth ? <Text>{dayjs(userInfo?.birth).format(FORMATE_DATE_VN)}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>
                                        <HomeOutlined /> Địa chỉ
                                    </Text>
                                    {userInfo?.address ? <Text>{userInfo.address}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>
                                        <TeamOutlined /> Đội nhóm
                                    </Text>
                                    {userInfo?.team ? <Text>{userInfo.team}</Text> : <Text type='secondary'>{'Chưa có đội nhóm'}</Text>}
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>Vai trò</Text>
                                    <Text>{userInfo?.role?.name || 'Thành viên'}</Text>
                                </Space>
                            </Col>
                        </Row>

                        <Divider />

                        <Title level={5}>Thông tin gia đình</Title>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>Tên cha</Text>
                                    {userInfo?.fatherName ? <Text>{userInfo.fatherName}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>SĐT cha</Text>
                                    {userInfo?.fatherPhone ? <Text>{userInfo.fatherPhone}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>Tên mẹ</Text>
                                    {userInfo?.motherName ? <Text>{userInfo.motherName}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>SĐT mẹ</Text>
                                    {userInfo?.motherPhone ? <Text>{userInfo.motherPhone}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>
                        </Row>

                        <Divider />

                        <Title level={5}>Thông tin tôn giáo</Title>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>Giáo xứ</Text>
                                    {userInfo?.parish ? <Text>{userInfo.parish}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>Giáo hạt</Text>
                                    {userInfo?.deanery ? <Text>{userInfo.deanery}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>Cha đồng hành</Text>
                                    {userInfo?.spiritualDirectorName ? <Text>{userInfo.spiritualDirectorName}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>Cha bảo trợ</Text>
                                    {userInfo?.sponsoringPriestName ? <Text>{userInfo.sponsoringPriestName}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>
                        </Row>

                        <Divider />

                        <Title level={5}>Thông tin học tập</Title>
                        <Row gutter={[16, 16]}>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>Trường đại học</Text>
                                    {userInfo?.university ? <Text>{userInfo.university}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Space direction="vertical" size={4}>
                                    <Text strong>Chuyên ngành</Text>
                                    {userInfo?.major ? <Text>{userInfo.major}</Text> : <Text type='secondary'>{'Chưa cập nhật'}</Text>}
                                </Space>
                            </Col>

                        </Row>
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Đổi mật khẩu"
                open={changePasswordVisible}
                onOk={handleChangePassword}
                onCancel={() => {
                    setChangePasswordVisible(false);
                    passwordForm.resetFields();
                }}
                okText="Đổi mật khẩu"
                cancelText="Hủy"
            >
                <Form form={passwordForm} layout="vertical">
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: 'Mật khẩu phải bao gồm chữ hoa, chữ thường và số' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Thay đổi avatar"
                open={avatarModalVisible}
                onCancel={() => setAvatarModalVisible(false)}
                footer={null}
            >
                <div style={{ textAlign: 'center' }}>
                    <Avatar
                        size={120}
                        src={userInfo?.avatar}
                        icon={<UserOutlined />}
                        style={{ marginBottom: '20px' }}
                    />
                    <br />
                    <Upload
                        name="avatar"
                        showUploadList={false}
                        onChange={handleAvatarUpload}
                        beforeUpload={(file) => {
                            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                            if (!isJpgOrPng) {
                                message.error('Chỉ có thể upload file JPG/PNG!');
                            }
                            const isLt2M = file.size / 1024 / 1024 < 2;
                            if (!isLt2M) {
                                message.error('Kích thước file phải nhỏ hơn 2MB!');
                            }
                            return isJpgOrPng && isLt2M;
                        }}
                    >
                        <Button icon={<CameraOutlined />} type="primary">
                            Chọn ảnh mới
                        </Button>
                    </Upload>
                </div>
            </Modal>
        </div>
    );
};

export default ProfilePage;