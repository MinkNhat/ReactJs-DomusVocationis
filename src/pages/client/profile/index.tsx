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
    notification,
    Spin,
    Image
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
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
import { callChangeUserPassword, callFetchUserById, callLogout, callUpdateAvatar, callUploadSingleFile } from '@/config/api';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { IUser } from '@/types/backend';

const { Title, Text } = Typography;

type FileType = Parameters<NonNullable<UploadProps['beforeUpload']>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const ProfilePage = () => {
    const [userInfo, setUserInfo] = useState<IUser | null>(null);
    const user = useAppSelector(state => state.account.user);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
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

    const handleAvatarChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
        const filesWithPreview = await Promise.all(
            newFileList.map(async (file) => {
                if (!file.url && !file.preview && file.originFileObj) {
                    file.preview = await getBase64(file.originFileObj as FileType);
                }
                return file;
            })
        );
        setFileList(filesWithPreview);
    };

    const handleBeforeUpload = (file: FileType) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Chỉ chấp nhận định dạng JPEG/PNG');
            return Upload.LIST_IGNORE;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Kích thước file lớn hơn 5MB');
            return Upload.LIST_IGNORE;
        }

        return false; // Prevent auto upload
    };

    const handleConfirmUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Vui lòng chọn ảnh');
            return;
        }

        try {
            setUploadingAvatar(true);

            const file = fileList[0].originFileObj;
            const uploadRes = await callUploadSingleFile(file, 'avatar');

            if (uploadRes && uploadRes.data) {
                const avatarUrl = uploadRes.data.fileName;

                await callUpdateAvatar(user.id, { fileName: avatarUrl });
                setUserInfo(prev => prev ? { ...prev, avatar: avatarUrl } : null);

                message.success('Cập nhật avatar thành công');
                handleCancelAvatarModal();
                fetchUserInfo();
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi upload avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleCancelAvatarModal = () => {
        setAvatarModalVisible(false);
        setFileList([]);
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
                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/${userInfo?.avatar}`}
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

            {/* Modal đổi mật khẩu */}
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

            {/* Modal đổi avatar */}
            <Modal
                title="Thay đổi avatar"
                open={avatarModalVisible}
                onCancel={handleCancelAvatarModal}
                onOk={handleConfirmUpload}
                okText={uploadingAvatar ? 'Đang upload...' : 'Xác nhận'}
                cancelText="Hủy"
                confirmLoading={uploadingAvatar}
                okButtonProps={{ disabled: fileList.length === 0 }}
                width={400}
            >
                <div style={{ display: "flex", justifyContent: "center" }}>
                    {fileList.length >= 1 ? (
                        <div
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: "50%",
                                overflow: "hidden",
                                position: "relative",
                                border: "2px solid #d9d9d9",
                            }}
                        >
                            <Image
                                src={fileList[0].preview || fileList[0].url || fileList[0].thumbUrl}
                                alt="avatar"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                                preview={{
                                    mask: (
                                        <Space>
                                            <span style={{ color: 'white' }}>Xem</span>
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFileList([]);
                                                }}
                                                style={{ color: 'white' }}
                                            >
                                                Xóa
                                            </Button>
                                        </Space>
                                    )
                                }}
                            />
                        </div>
                    ) : (
                        <Upload
                            fileList={fileList}
                            onChange={handleAvatarChange}
                            beforeUpload={handleBeforeUpload}
                            accept="image/png,image/jpeg"
                            maxCount={1}
                            showUploadList={false}
                        >
                            <div
                                style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: "50%",
                                    border: "2px dashed #d9d9d9",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <CameraOutlined style={{ fontSize: 48, color: "#999" }} />
                                <div style={{ marginTop: 8, fontSize: 16 }}>Chọn ảnh</div>
                            </div>
                        </Upload>
                    )}
                </div>
            </Modal>

        </div>
    );
};

export default ProfilePage;