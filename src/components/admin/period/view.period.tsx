import { convertGender, FORMATE_DATE_TIME_VN, FORMATE_DATE_VN, PERIOD_DAY_OF_WEEK_LIST, PERIOD_STATUS_LIST, PERIOD_TYPE_LIST } from "@/config/utils";
import { IPeriod, IUser } from "@/types/backend";
import { Badge, Descriptions, Drawer, Tag } from "antd";
import dayjs from 'dayjs';
import { map } from "lodash";

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IPeriod | null;
    setDataInit: (v: any) => void;
}
const ViewDetailPeriod = (props: IProps) => {
    const { onClose, open, dataInit, setDataInit } = props;

    // const roleName = dataInit?.role?.name || "USER";
    // const color = roleName === "SUPER_ADMIN" ? "blue" : (dataInit?.role === null ? "" : "purple");

    return (
        <>
            <Drawer
                title="Thông Tin Phiên Đăng Ký"
                placement="right"
                onClose={() => { onClose(false); setDataInit(null) }}
                open={open}
                width={"70vw"}
                maskClosable={true}
            >
                <Descriptions title="" bordered column={2} layout="horizontal">
                    <Descriptions.Item label="Tên phiên" span={2}>{dataInit?.name}</Descriptions.Item>

                    <Descriptions.Item label="Số slot tối đa">{dataInit?.maxSlots}</Descriptions.Item>
                    <Descriptions.Item label="Số người / buổi">{dataInit?.peoplePerSession}</Descriptions.Item>

                    <Descriptions.Item label="Trạng thái"><Tag color={PERIOD_STATUS_LIST.find(s => s.value === dataInit?.status)?.color}>{dataInit?.status}</Tag></Descriptions.Item>
                    <Descriptions.Item label="Loại"><Tag color={PERIOD_TYPE_LIST.find(t => t.value === dataInit?.type)?.color}>{dataInit?.type}</Tag></Descriptions.Item>

                    <Descriptions.Item label="Ngày thực hiện">{dataInit && dataInit.startDate ? dayjs(dataInit.startDate).format(FORMATE_DATE_VN) : ""}</Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">{dataInit && dataInit.endDate ? dayjs(dataInit.endDate).format(FORMATE_DATE_VN) : ""}</Descriptions.Item>

                    <Descriptions.Item label="Ngày đăng ký">{dataInit && dataInit.registrationStartTime ? dayjs(dataInit.registrationStartTime).format(FORMATE_DATE_TIME_VN) : ""}</Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc đăng ký">{dataInit && dataInit.registrationEndTime ? dayjs(dataInit.registrationEndTime).format(FORMATE_DATE_TIME_VN) : ""}</Descriptions.Item>

                    <Descriptions.Item label="Các ngày bị bỏ qua trong tuần">{dataInit?.excludedDaysOfWeek?.map(d => <Tag color="orange">{d === 0 ? "CN" : d + 1}</Tag>)}</Descriptions.Item>
                    <Descriptions.Item label="Các buổi được phép đăng ký">{dataInit?.allowedSessions?.map(s => <Tag color="green">{s}</Tag>)}</Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo">{dataInit && dataInit.createdAt ? dayjs(dataInit.createdAt).format(FORMATE_DATE_TIME_VN) : ""}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sửa">{dataInit && dataInit.updatedAt ? dayjs(dataInit.updatedAt).format(FORMATE_DATE_TIME_VN) : ""}</Descriptions.Item>
                </Descriptions>
            </Drawer>
        </>
    )
}

export default ViewDetailPeriod;