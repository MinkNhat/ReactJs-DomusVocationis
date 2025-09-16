import { ModalForm, ProFormDatePicker, ProFormMoney, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { App, Col, Form, Row } from "antd";
import { isMobile } from 'react-device-detect';
import { IFeeType } from "@/types/backend";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useEffect, useState } from "react";
import { callCreateFeeType, callUpdateFeeType } from "@/config/api";
import { FEE_FREQUENCY_LIST } from "@/config/utils";

dayjs.extend(utc);
dayjs.extend(timezone);

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable: () => void;
    dataInit?: IFeeType | null;
    setDataInit: (v: any) => void;
}

const ModalFeeType = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const { notification, message } = App.useApp();
    const [form] = Form.useForm();
    const initialValues = dataInit?.id ? { ...dataInit, startDate: dayjs(dataInit.startDate, "DD-MM-YYYY") } : {};

    const submitFeeType = async (valuesForm: any) => {
        const { name, description, active, frequency, amount, startDate } = valuesForm;


        if (dataInit?.id) {
            //update
            const feeType = {
                id: dataInit.id,
                name,
                description,
                active,
                frequency,
                amount,
                startDate
            }

            const res = await callUpdateFeeType(feeType);
            if (res.data) {
                message.success("Cập nhật loại phí thành công");
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
            const feeType = {
                name,
                description,
                active,
                frequency,
                amount,
                startDate
            }

            const res = await callCreateFeeType(feeType);
            if (res.data) {
                message.success("Tạo mới loại phí thành công");
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
                title={<>{dataInit?.id ? "Cập nhật loại phí" : "Tạo mới loại phí"}</>}
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
                onFinish={submitFeeType}
                initialValues={initialValues}
            >
                <Row gutter={36}>
                    <Col lg={16} md={16} sm={24} xs={24}>
                        <ProFormText
                            label="Tên loại phí"
                            name="name"
                            placeholder="Nhập tên loại phí"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col lg={8} md={8} sm={12} xs={12}>
                        <ProFormSwitch
                            label="Trạng thái"
                            name="active"
                            checkedChildren="active"
                            unCheckedChildren="inactive"
                            initialValue={true}
                        />
                    </Col>

                    <Col lg={8} md={8} sm={24} xs={24}>
                        <ProFormSelect
                            label="Kỳ hạn"
                            name="frequency"
                            placeholder="Nhập Mô tả"
                            options={
                                FEE_FREQUENCY_LIST.map(item => {
                                    return { label: item.label, value: item.value }
                                })
                            }
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col lg={8} md={8} sm={24} xs={24}>
                        <ProFormMoney
                            label="Số tiên / kỳ hạn"
                            name="amount"
                            placeholder="Nhập Mô tả"
                            addonAfter="VND"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                        />
                    </Col>

                    <Col lg={8} md={8} sm={24} xs={24}>
                        <ProFormDatePicker
                            name="startDate"
                            fieldProps={{
                                format: 'DD-MM-YYYY',
                            }}
                            label="Ngày bắt đầu"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
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

export default ModalFeeType;