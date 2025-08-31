import React, { useState } from 'react';
import { Modal, Button, Card, Typography, Radio, Space, App } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { IPeriod } from '@/types/backend';
import { PERIOD_SESSION_LIST } from '@/config/utils';
import { callRegisterSession } from '@/config/api';

const { Text } = Typography;

interface SessionData {
    id: string;
    date: string;
    sessionTime: string;
    activity: string;
    totalSlot: number;
    currentRegistrations: number;
    users: {
        id: string;
        full_name: string;
    }[];
    isAvailable: boolean;
}

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: SessionData[] | null;
    setDataInit: (v: any) => void;
    onRegistrationSuccess?: () => void;
}

const RegistrationModal: React.FC<IProps> = ({
    openModal,
    setOpenModal,
    dataInit,
    setDataInit,
    onRegistrationSuccess
}) => {
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [isRegistering, setIsRegistering] = useState(false);
    const { message, notification } = App.useApp();

    const getSessionTimeDisplay = (sessionTime: string) => {
        return `Buổi ${PERIOD_SESSION_LIST.find(s => s.value === sessionTime)?.label}`;
    };

    const selectedSessionData = dataInit?.find(session => session.id === selectedSession);

    const handleCancel = () => {
        setOpenModal(false);
        setSelectedSession('');
        setDataInit(null);
    };

    const handleRegistration = async () => {
        setIsRegistering(true);

        const res = await callRegisterSession(selectedSession);
        if (res.data && res.statusCode === 200) {
            message.success('Đăng ký thành công');
            handleCancel();
            onRegistrationSuccess?.();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }

        setIsRegistering(false);
    };

    return (
        <Modal
            open={openModal}
            title="Đăng ký hoạt động"
            onCancel={handleCancel}
            width={700}
            footer={[
                <Button key="back" size="large" onClick={handleCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    size="large"
                    loading={isRegistering}
                    onClick={handleRegistration}
                    disabled={!selectedSession}
                >
                    Đăng ký
                </Button>
            ]}
        >
            <div style={{ padding: '16px 0' }}>
                {dataInit && dataInit.length > 0 && (
                    <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f8f9fa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <CalendarOutlined style={{ color: '#1890ff' }} />
                            <Text strong>
                                Ngày {dataInit[0].date}
                            </Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ClockCircleOutlined style={{ color: '#1890ff' }} />
                            <Text strong>
                                {getSessionTimeDisplay(dataInit[0].sessionTime)}
                            </Text>
                        </div>
                    </Card>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <Text strong style={{ marginBottom: '12px', display: 'block' }}>
                        Chọn hoạt động:
                    </Text>
                    <Radio.Group
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {dataInit?.map((session) => (
                                <Radio key={session.id} value={session.id} style={{ width: '100%' }}>
                                    <Card
                                        size="small"
                                        style={{
                                            margin: '4px 0',
                                            border: selectedSession === session.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <Text strong>{session.activity}</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        Số lượng: {session.currentRegistrations}/{session.totalSlot}
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                </div>

                {selectedSessionData && (
                    <div>
                        <div style={{ marginBottom: '8px' }}>
                            <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <Text>Danh sách người đã đăng ký:</Text>
                        </div>

                        {selectedSessionData.users && selectedSessionData.users.length > 0 ? (
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {selectedSessionData.users.map((user, index) => (
                                    <Card key={user.id} size="small" style={{ marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#1890ff',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <Text strong>{user.full_name}</Text>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    border: '2px dashed #d9d9d9'
                                }}
                            >
                                <TeamOutlined style={{ fontSize: '24px', color: '#bfbfbf', marginBottom: '8px' }} />
                                <div>
                                    <Text type="secondary">
                                        Chưa có ai đăng ký hoạt động này
                                    </Text>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default RegistrationModal;