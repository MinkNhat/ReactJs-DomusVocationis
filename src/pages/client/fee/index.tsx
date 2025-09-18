import React, { useEffect, useState } from 'react';
import {
    Card,
    Button,
    Row,
    Col,
    Tag,
    Typography,
    message,
    Tabs
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { IFeeType, IRegistrationFee } from '@/types/backend';
import { FEE_FREQUENCY_LIST, formatCurrency, FORMATE_DATE_VN, PAYMENT_STATUS_LIST } from '@/config/utils';
import dayjs from 'dayjs';
import { callCreateFeeRegister, callFetchFeeType, callFetchRegisteredFeeByUserId, callUpdateFeeRegister } from '@/config/api';
import { sfEqual } from "spring-filter-query-builder";
import { useAppSelector } from '@/redux/hooks';
import RegisteredFeeTab from './registered-fee.tab';
import PaymentTab from './payment.tab';
import DetailFeeModal from './detail.modal';

const { Title, Text } = Typography;

const FeePage = () => {
    const [availableFees, setAvailableFees] = useState<IFeeType[]>([]);
    const [registeredFees, setRegisteredFees] = useState<IRegistrationFee[]>([]);
    const [activeTab, setActiveTab] = useState('1');

    const [openModal, setOpenModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState<IFeeType | null>(null);
    const userId = useAppSelector(state => state.account.user).id;

    useEffect(() => {
        fetchAvailableFees();
        if (userId) fetchRegisteredFees();
    }, [userId]);

    const fetchAvailableFees = async () => {
        let query = `filter=${sfEqual("active", "true")}`;
        let res = await callFetchFeeType(query);

        if (res && res.data) {
            setAvailableFees(res.data.result);
        }
    }

    const fetchRegisteredFees = async () => {
        let query = `filter=${sfEqual("active", "true")}`;
        let res = await callFetchRegisteredFeeByUserId(query, userId);

        if (res && res.data) {
            setRegisteredFees(res.data.result);
        }
    }

    const handleRegisterFee = async (fee: IFeeType) => {
        const isAlreadyRegistered = registeredFees.some(registered => registered.feeType.id === fee.id);

        if (isAlreadyRegistered) {
            message.error('Phí này đã được đăng ký!');
            return;
        }

        const registration: IRegistrationFee = {
            feeType: fee,
            active: true,
            registrationDate: dayjs().format('DD-MM-YYYY'),
        }

        let res = await callCreateFeeRegister(registration);
        if (res && res.statusCode === 201) {
            message.success(`Đã đăng ký thành công phí: ${fee.name}`);
            fetchRegisteredFees();
        }
    };

    const handleTabChange = (key: string) => {
        setActiveTab(key);
        if (key === '1') {
            fetchRegisteredFees();
        } else if (key === '2') {
            // Payment history tab
        }
    };

    return (
        <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Card
                title="Các loại phí có thể đăng ký"
                style={{ marginBottom: '24px' }}
            >
                <Row gutter={[16, 16]}>
                    {availableFees.map((fee) => {
                        const isRegistered = registeredFees.some(registered => registered.feeType.id === fee.id);
                        const freq = FEE_FREQUENCY_LIST.find(item => item.value === fee.frequency);

                        return (
                            <Col xs={24} sm={12} lg={8} xl={6} key={fee.id}>
                                <Card
                                    size="small"
                                    hoverable
                                    style={{
                                        height: '100%',
                                        opacity: !fee.active ? 0.6 : 1,
                                        border: isRegistered ? '2px solid #52c41a' : undefined
                                    }}
                                    actions={[
                                        <Button
                                            type="link"
                                            icon={<EyeOutlined />}
                                            onClick={() => {
                                                setSelectedFee(fee);
                                                setOpenModal(true);
                                            }}
                                            size="small"
                                        >
                                            Chi tiết
                                        </Button>,
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleRegisterFee(fee)}
                                            size="small"
                                            disabled={!fee.active || isRegistered}
                                        >
                                            {isRegistered ? 'Đã đăng ký' : 'Đăng ký'}
                                        </Button>
                                    ]}
                                >
                                    <Card.Meta
                                        title={
                                            <div>
                                                {fee.name}
                                                {isRegistered && <Tag color="green" style={{ marginLeft: 8 }}>✓</Tag>}
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <Text ellipsis style={{ display: 'block', marginBottom: 8 }}>
                                                    {fee.description || 'Không có mô tả'}
                                                </Text>
                                                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                                    {formatCurrency(fee.amount)} / <Tag color={freq?.color}> {freq?.label} </Tag>
                                                </Text>
                                            </div>
                                        }
                                    />
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </Card>

            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={[
                    {
                        key: '1',
                        label: 'Các phí đã đăng ký',
                        children:
                            <RegisteredFeeTab
                                registeredFees={registeredFees}
                                fetchRegisteredFees={fetchRegisteredFees}
                            />,
                    },
                    {
                        key: '2',
                        label: 'Lịch sử thanh toán',
                        children: <PaymentTab
                            key={activeTab} // Force re-render when tab changes
                            reloadPayments={fetchRegisteredFees} // Optional: có thể pass callback nếu cần
                        />,
                    },

                ]}
            />

            <DetailFeeModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={selectedFee}
            />
        </div>
    );
};

export default FeePage;