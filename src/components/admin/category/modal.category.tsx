import { ModalForm, ProFormSwitch, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { App, Col, Form, Row } from "antd";
import { isMobile } from 'react-device-detect';
import { ICategory } from "@/types/backend";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useEffect, useState } from "react";
import { callCreateCategory, callUpdateCategory } from "@/config/api";

dayjs.extend(utc);
dayjs.extend(timezone);

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable: () => void;
    dataInit?: ICategory | null;
    setDataInit: (v: any) => void;
}

const ModalCategory = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const { notification, message } = App.useApp();
    const [form] = Form.useForm();
    const initialValues = dataInit?.id ? { ...dataInit } : {};

    useEffect(() => {

    }, [dataInit]);

    const submitCategory = async (valuesForm: any) => {
        const { name, description, active, allowPost } = valuesForm;


        if (dataInit?.id) {
            //update
            const category = {
                id: dataInit.id,
                name,
                description,
                active,
                allowPost,
            }

            const res = await callUpdateCategory(category);
            if (res.data) {
                message.success("Cập nhật danh mục thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const category = {
                name,
                description,
                active,
                allowPost
            }

            const res = await callCreateCategory(category);
            if (res.data) {
                message.success("Tạo mới danh mục thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật danh mục" : "Tạo mới danh mục"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => handleReset(),
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 1200,
                    keyboard: false,
                    maskClosable: true,
                    footer: null,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy",
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitCategory}
                initialValues={initialValues}
            >
                <Row gutter={24}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Tên danh mục"
                            name="name"
                            placeholder="Nhập tên danh mục"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col lg={6} md={6} sm={12} xs={12}>
                        <ProFormSwitch
                            label="Cho phép người dùng thường đăng bài?"
                            name="allowPost"
                            checkedChildren="Allow"
                            unCheckedChildren="Not Allow"
                            initialValue={false}
                        />
                    </Col>

                    <Col lg={6} md={6} sm={12} xs={12}>
                        <ProFormSwitch
                            label="Trạng thái hoạt động"
                            name="active"
                            checkedChildren="active"
                            unCheckedChildren="inactive"
                            initialValue={true}
                        />
                    </Col>

                    <Col lg={24} md={24} sm={24} xs={24}>
                        <ProFormTextArea
                            label="Mô tả"
                            name="description"
                            placeholder="Nhập Mô tả"
                        />
                    </Col>
                </Row>
            </ModalForm>
        </>
    )
}

export default ModalCategory;