import { convertGender, FORMATE_DATE_TIME_VN, FORMATE_DATE_VN } from "@/config/utils";
import { IUser } from "@/types/backend";
import { Badge, Descriptions, Drawer, Tag } from "antd";
import dayjs from 'dayjs';

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IUser | null;
    setDataInit: (v: any) => void;
}
const ViewDetailUser = (props: IProps) => {
    const { onClose, open, dataInit, setDataInit } = props;

    const roleName = dataInit?.role?.name || "USER";
    const color = roleName === "SUPER_ADMIN" ? "blue" : (dataInit?.role === null ? "" : "purple");

    return (
        <>
            <Drawer
                title="Thông Tin User"
                placement="right"
                onClose={() => { onClose(false); setDataInit(null) }}
                open={open}
                width={"60vw"}
                maskClosable={true}
            >
                <Descriptions title="" bordered column={2} layout="horizontal">
                    <Descriptions.Item label="Tên thánh">{dataInit?.christianName}</Descriptions.Item>
                    <Descriptions.Item label="Họ và tên">{dataInit?.fullName}</Descriptions.Item>

                    <Descriptions.Item label="Ngày sinh">{dataInit?.birth ? dayjs(dataInit?.birth).format(FORMATE_DATE_VN) : ""}</Descriptions.Item>
                    <Descriptions.Item label="Giới Tính">{convertGender(dataInit?.gender)}</Descriptions.Item>

                    <Descriptions.Item label="Địa chỉ email">{dataInit?.email}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{dataInit?.phone}</Descriptions.Item>

                    <Descriptions.Item label="Tổ">{dataInit?.team}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{dataInit?.address}</Descriptions.Item>

                    <Descriptions.Item label="Tên cha">{dataInit?.fatherName}</Descriptions.Item>
                    <Descriptions.Item label="SĐT cha">{dataInit?.fatherPhone}</Descriptions.Item>

                    <Descriptions.Item label="Tên mẹ">{dataInit?.motherName}</Descriptions.Item>
                    <Descriptions.Item label="SĐT mẹ">{dataInit?.motherPhone}</Descriptions.Item>

                    <Descriptions.Item label="Giáo xứ">{dataInit?.parish}</Descriptions.Item>
                    <Descriptions.Item label="Giáo hạt">{dataInit?.deanery}</Descriptions.Item>

                    <Descriptions.Item label="Cha bảo trợ">{dataInit?.spiritualDirectorName}</Descriptions.Item>
                    <Descriptions.Item label="Cha linh hướng">{dataInit?.sponsoringPriestName}</Descriptions.Item>

                    <Descriptions.Item label="Trường đại học">{dataInit?.university}</Descriptions.Item>
                    <Descriptions.Item label="Ngành học">{dataInit?.major}</Descriptions.Item>


                    <Descriptions.Item label="Vai trò" >
                        <Tag color={color}>{roleName}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái" >
                        <Tag color={dataInit?.active === true ? "green" : "red"}>{dataInit?.active === true ? "ACTIVE" : "INACTIVE"}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo">{dataInit && dataInit.createdAt ? dayjs(dataInit.createdAt).format(FORMATE_DATE_TIME_VN) : ""}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sửa">{dataInit && dataInit.updatedAt ? dayjs(dataInit.updatedAt).format(FORMATE_DATE_TIME_VN) : ""}</Descriptions.Item>

                </Descriptions>
            </Drawer>
        </>
    )
}

export default ViewDetailUser;