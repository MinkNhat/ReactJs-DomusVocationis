import { FEE_FREQUENCY_LIST, formatCurrency, FORMATE_DATE_VN } from "@/config/utils";
import { IFeeType, IRegistrationFee } from "@/types/backend";
import { DeleteOutlined, ExclamationCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { Badge, Button, Card, message, Modal, Space, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import DetailFeeModal from "./detail.modal";
import { useState } from "react";
import { callUpdateFeeRegister } from "@/config/api";

const { Title, Text } = Typography;
const { confirm } = Modal;

interface IProps {
    registeredFees: IRegistrationFee[];
    fetchRegisteredFees: () => void;
}

const RegisteredFeeTab: React.FC<IProps> = ({
    registeredFees,
    fetchRegisteredFees
}) => {
    const [openModal, setOpenModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState<IFeeType | null>(null);

    const registeredColumns = [
        {
            title: 'Tên phí',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (_: any, record: IRegistrationFee) => record.feeType.name,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (_: any, record: IRegistrationFee) => record.feeType.description,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            width: 150,
            render: (_: any, record: IRegistrationFee) => <Text strong>{formatCurrency(record.feeType.amount)}</Text>,
        },
        {
            title: 'Kỳ hạn',
            dataIndex: 'frequency',
            key: 'frequency',
            width: 120,
            render: (_: any, record: IRegistrationFee) => {
                const freq = FEE_FREQUENCY_LIST.find(item => item.value === record.feeType.frequency);
                return (
                    <Tag color={freq?.color}>{freq?.label}</Tag>
                );
            },
        },
        {
            title: 'Ngày đăng ký',
            dataIndex: 'registeredAt',
            key: 'registeredAt',
            width: 130,
            render: (date: string) => dayjs(date).format(FORMATE_DATE_VN),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (record: IRegistrationFee) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedFee(record.feeType as IFeeType);
                            setOpenModal(true);
                        }}
                        size="small"
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            if (record.id) handleUnregisterFee(record.id, record.feeType.name);
                        }}
                        size="small"
                    />
                </Space>
            ),
        },
    ];

    const handleUnregisterFee = async (feeRegisId: string, feeName: string) => {
        confirm({
            title: 'Xác nhận hủy đăng ký',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn hủy đăng ký phí "${feeName}"?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            async onOk() {
                let res = await callUpdateFeeRegister({
                    id: feeRegisId,
                    active: false,
                    feeType: { id: '' } as IFeeType,
                })

                if (res && res.statusCode === 200) {
                    fetchRegisteredFees();
                    message.success(`Đã hủy đăng ký phí: ${feeName}`);
                }
            }
        });
    };

    return (
        <>
            <Card
                title="Các phí đã đăng ký"
                extra={<Badge count={registeredFees.length} showZero color="blue" />}
            >
                <Table
                    columns={registeredColumns}
                    dataSource={registeredFees}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} phí`,
                    }}
                    scroll={{ x: 800 }}
                    locale={{
                        emptyText: 'Chưa có phí nào được đăng ký'
                    }}
                />
            </Card>

            <DetailFeeModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={selectedFee}
            />
        </>
    );
}

export default RegisteredFeeTab;