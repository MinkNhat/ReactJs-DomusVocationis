import { FEE_FREQUENCY_LIST, formatCurrency } from "@/config/utils";
import { IFeeType } from "@/types/backend";
import { Badge, Descriptions, Modal, Tag, Typography } from "antd";

const { Title, Text } = Typography;

interface IProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    dataInit: IFeeType | null;
}

const DetailFeeModal: React.FC<IProps> = ({
    openModal,
    setOpenModal,
    dataInit,
}) => {
    return (
        <Modal
            title="Chi tiết phí dịch vụ"
            open={openModal}
            onCancel={() => setOpenModal(false)}
            footer={null}
            width={600}
        >
            {dataInit && (
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Tên phí">
                        {dataInit.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                        {dataInit.description || 'Không có mô tả'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Badge
                            status={dataInit.active ? 'success' : 'error'}
                            text={dataInit.active ? 'Hoạt động' : 'Không hoạt động'}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="Tần suất">
                        <Tag color={FEE_FREQUENCY_LIST.find(item => item.value === dataInit.frequency)?.color}>
                            {FEE_FREQUENCY_LIST.find(item => item.value === dataInit.frequency)?.label}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số tiền">
                        <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                            {formatCurrency(dataInit.amount)}
                        </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">
                        {dataInit.startDate}
                    </Descriptions.Item>
                </Descriptions>
            )}
        </Modal>
    );
};
export default DetailFeeModal;