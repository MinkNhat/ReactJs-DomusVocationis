import { callFetchPaymentsByUser, callVNPayPayment } from "@/config/api";
import { FEE_FREQUENCY_LIST, formatCurrency, FORMATE_DATE_TIME_VN, FORMATE_DATE_VN, PAYMENT_STATUS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
import { IFeeType, IPayment, IRegistrationFee } from "@/types/backend";
import { Badge, Button, Card, message, Select, Space, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { sfEqual } from "spring-filter-query-builder";

const { Title, Text } = Typography;

interface IProps {
    reloadPayments?: () => void;
}

const PaymentTab: React.FC<IProps> = ({
    reloadPayments,
}) => {
    const [payments, setPayments] = useState<IPayment[]>([]);
    const [loading, setLoading] = useState(false);
    const userId = useAppSelector(state => state.account.user).id;
    const [selectedMethod, setSelectedMethod] = useState<string>();

    useEffect(() => {
        if (userId) {
            fetchPayments();
        }
    }, [userId]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            let query = `filter=${sfEqual("active", "true")}`;
            let res = await callFetchPaymentsByUser(query, userId);
            if (res && res.data) {
                setPayments(res.data.result);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            message.error("Không thể tải dữ liệu thanh toán");
        } finally {
            setLoading(false);
        }
    }

    const handlePayment = async (record: IPayment) => {
        if (!selectedMethod) {
            message.error("Vui lòng chọn phương thức thanh toán");
            return;
        } else if (selectedMethod !== "VNPAY") {
            message.error("Chức năng hiện tại chỉ hỗ trợ thanh toán qua VNPAY");
            return;
        }

        try {
            let res = await callVNPayPayment({
                requestId: record.id,
                userId: userId,
                amount: record.amount,
                txnRef: record.id
            })

            if (res && res.data) {
                console.log("res.data", res.data);
                window.open(res.data.paymentUrl, "_blank");
            }
        } catch (error) {
            console.error("Payment error:", error);
            message.error("Có lỗi xảy ra khi tạo thanh toán");
        }
    }

    const columns = [
        {
            title: 'Tên phí',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (_: any, record: IPayment) => record.feeRegistration.feeType.name,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (_: any, record: IPayment) => <Text strong>{formatCurrency(record.amount)}</Text>,
        },
        {
            title: 'Hạn thanh toán',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (_: any, record: IPayment) => record.dueDate ? dayjs(record.dueDate).format(FORMATE_DATE_VN) : "-",
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (_: any, record: IPayment) =>
                <Tag color={PAYMENT_STATUS_LIST.find(item => item.value === record.status)?.color} >
                    {PAYMENT_STATUS_LIST.find(item => item.value === record.status)?.label}
                </Tag>
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'method',
            key: 'method',
            render: (_: any, record: IPayment) => (
                <Select style={{ width: 150 }}
                    value={record.method}
                    options={[
                        { label: "VNPay", value: "VNPAY" },
                        { label: "MoMo", value: "MOMO" },
                        { label: "Tiền mặt", value: "CASH" },
                        { label: "Thẻ ngân hàng", value: "BANK" }
                    ]}
                    onChange={(value) => {
                        record.method = value;
                        setSelectedMethod(value);
                    }}
                />
            ),
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            render: (_: any, record: IPayment) => record.paymentDate ? dayjs(record.paymentDate).format(FORMATE_DATE_TIME_VN) : "-",
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (record: IPayment) => (
                <Button
                    type="link"
                    onClick={() => handlePayment(record)}
                    size="small"
                    disabled={record.status === 'COMPLETED'}
                >
                    {record.status === 'COMPLETED' ? 'Đã thanh toán' : 'Thanh toán'}
                </Button>
            ),
        },
    ];

    return (
        <Card
            title="Lịch sử thanh toán"
            extra={
                <Button
                    type="primary"
                    onClick={fetchPayments}
                    loading={loading}
                    size="small"
                >
                    Làm mới
                </Button>
            }
        >
            <Table
                columns={columns}
                dataSource={payments}
                rowKey="id"
                loading={loading}
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
    );
}

export default PaymentTab;