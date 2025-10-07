import { InboxOutlined } from "@ant-design/icons";
import type { TableColumnsType, UploadProps } from 'antd';
import { App, Modal, Table, Upload } from 'antd';
import { useState } from "react";
import Exceljs from "exceljs";
import { callBulkCreateUser } from "@/config/api";
import { IUser } from "@/types/backend";
import templateFile from "@/assets/template/user-import-template.xlsx?url";
import { convertGender, convertSlug } from "@/config/utils";

const { Dragger } = Upload;

interface IProps {
    openModalImport: boolean;
    setOpenModalImport: (v: boolean) => void;
    reloadTable: () => void;
}

const ImportUser = (props: IProps) => {
    const { openModalImport, setOpenModalImport, reloadTable } = props;
    const [dataImport, setDataImport] = useState<IUser[]>([]);
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const { message, notification } = App.useApp();

    const propsUpload: UploadProps = {
        name: 'file',
        multiple: false,
        maxCount: 1,
        accept: ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",

        customRequest({ file, onSuccess, onError }) {
            // chưa upload, chỉ gọi mô phỏng gọi thành công
            setTimeout(() => {
                if (onSuccess) onSuccess("ok");
            }, 1000);
        },

        async onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                // console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
                if (info.fileList && info.fileList.length > 0) {
                    const file = info.fileList[0].originFileObj!;

                    const workbook = new Exceljs.Workbook();
                    const arrayBuffer = await file.arrayBuffer();
                    await workbook.xlsx.load(arrayBuffer);

                    // convert to json
                    let jsonData: IUser[] = [];
                    workbook.worksheets.forEach(function (sheet) {
                        // first row is header
                        let firstRow = sheet.getRow(9);
                        if (!firstRow.cellCount) return;

                        let keys = firstRow.values as any[];
                        sheet.eachRow((row, rowNumber) => {
                            if (rowNumber <= 9) return;
                            let values = row.values as any;
                            let obj: any = {};
                            for (let i = 1; i < keys.length; i++) {
                                obj[keys[i]] = values[i];
                            }

                            if (obj["fullName"] && obj["email"] && obj["phone"]) {
                                jsonData.push(obj);
                            }
                        })
                    });

                    setDataImport(jsonData);
                }

            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },

        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    const columns: TableColumnsType<IUser> = [
        {
            title: 'STT',
            width: 50,
            render: (value, record, index) => {
                return (
                    <span>
                        {(pagination.current - 1) * pagination.pageSize + index + 1}
                    </span>
                );
            },
            fixed: 'left',
        },
        {
            title: 'Tên thánh',
            dataIndex: 'christianName',
            fixed: 'left',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            fixed: 'left',
        },

        {
            title: 'Email',
            dataIndex: 'email',
            fixed: 'left',
        },

        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            fixed: 'left',
        },

        {
            title: 'Ngày sinh',
            dataIndex: 'birth',
        },

        {
            title: 'Giới tính',
            dataIndex: 'gender',

            render: (value, record, index) => {
                let gender = convertGender(record.gender);
                if (gender === undefined) gender = "-";

                return (
                    <span>{gender}</span>
                )
            },
        },

        {
            title: 'Địa chỉ',
            dataIndex: 'address',
        },

        {
            title: 'Tổ',
            dataIndex: 'team',
        },

        {
            title: 'Tên cha',
            dataIndex: 'fatherName',
        },

        {
            title: 'SĐT cha',
            dataIndex: 'fatherPhone',
        },

        {
            title: 'Tên mẹ',
            dataIndex: 'motherName',
        },

        {
            title: 'SĐT mẹ',
            dataIndex: 'motherPhone',
        },

        {
            title: 'Giáo xứ',
            dataIndex: 'parish',
        },

        {
            title: 'Giáo hạt',
            dataIndex: 'deanery',
        },

        {
            title: 'Cha bảo trợ',
            dataIndex: 'spiritualDirectorName',
        },

        {
            title: 'Cha linh hướng',
            dataIndex: 'sponsoringPriestName',
        },

        {
            title: 'Trường đại học',
            dataIndex: 'university',
        },

        {
            title: 'Ngành học',
            dataIndex: 'major',
        }
    ];

    function generatePassword(fullName: string, phone: string) {
        if (!phone || !fullName) return "";

        const lastPart = convertSlug(fullName).trim().split("-").pop() || "";
        return phone + lastPart.toLowerCase();
    }

    const handleSubmit = async () => {
        setIsSubmit(true);
        const dataSubmit = dataImport.map(item => ({
            ...item,
            password: generatePassword(item.fullName, item.phone),
        }))

        console.log("dataSubmit", dataSubmit);

        const res = await callBulkCreateUser(dataSubmit);
        console.log("res", res);
        if (res.data) {
            notification.info({
                message: "Import users",
                description: `Thành công: ${res.data.successCount}, Thất bại: ${res.data.errorCount}`,
            })

            if (res.data.errorDetails && res.data.errorDetails.length > 0) {
                res.data.errorDetails.forEach((err: any) => {
                    notification.error({
                        duration: 0,
                        message: `Lỗi tại dòng ${err.index + 1}`,
                        description: err.errMessage,
                    });
                });
            }
        }
        setIsSubmit(false);
        setOpenModalImport(false);
        setDataImport([]);
        reloadTable();
    }

    return (
        <>
            <Modal title="Import người dùng"
                width={"80vw"}
                open={openModalImport}
                onOk={() => handleSubmit()}
                onCancel={() => {
                    setOpenModalImport(false);
                    setDataImport([]);
                }}
                okText="Import"
                okButtonProps={{
                    disabled: dataImport.length > 0 ? false : true,
                    loading: isSubmit,
                }}
                maskClosable={false}
                destroyOnClose={true}
            >
                <Dragger {...propsUpload}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Nhấn để chọn hoặc kéo thả file vào vùng chỉ định</p>
                    <p className="ant-upload-hint">
                        Chỉ hỗ trợ file định dạng .csv, .xlsx, .xls
                        &nbsp;
                        <a href={templateFile} onClick={e => e.stopPropagation()} download>Download mẫu file</a>
                    </p>
                </Dragger>

                <div style={{ paddingTop: 20 }}>
                    <Table
                        title={() => <span>Dữ liệu upload</span>}
                        dataSource={dataImport}
                        columns={columns}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            onChange: (page, pageSize) => {
                                setPagination({ current: page, pageSize });
                            },
                        }}
                    />
                </div>
            </Modal>
        </>
    );
}

export default ImportUser;