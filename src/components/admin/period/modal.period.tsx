import { ModalForm, ProFormDateRangePicker, ProFormDateTimeRangePicker, ProFormDependency, ProFormDigit, ProFormRadio, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { App, Col, Form, Row } from "antd";
import { isMobile } from 'react-device-detect';
import { callCreatePeriod, callUpdatePeriod } from "@/config/api";
import { IPeriod } from "@/types/backend";
import { calcMaxSlots, convertToUTC, FORMATE_DATE_TIME_UTC, FORMATE_DATE_TIME_VN, FORMATE_DATE_VN, PERIOD_DAY_OF_WEEK_LIST, PERIOD_SESSION_LIST, PERIOD_STATUS_LIST, PERIOD_TYPE_LIST } from "@/config/utils";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { now } from "lodash";
import { useEffect, useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable: () => void;
    dataInit?: IPeriod | null;
    setDataInit: (v: any) => void;
}

type TSelect = {
    label: string;
    value: string;
}

const ModalPeriod = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [isStartDateDisabled, setIsStartDateDisabled] = useState(false);
    const [isEndDateDisabled, setIsEndDateDisabled] = useState(false);
    const { notification, message } = App.useApp();
    const [form] = Form.useForm();

    useEffect(() => {
        // reset disable date select
        setIsStartDateDisabled(false);
        setIsEndDateDisabled(false);
    }, [dataInit])

    const initialValues = dataInit?.id
        ? {
            ...dataInit,

            dateRange: [
                dataInit.startDate ? dayjs(dataInit.startDate, FORMATE_DATE_VN) : null,
                dataInit.endDate ? dayjs(dataInit.endDate, FORMATE_DATE_VN) : null,
            ],
            regisDateRange: [
                dataInit.registrationStartTime ? dayjs(dataInit.registrationStartTime) : null,
                dataInit.registrationEndTime ? dayjs(dataInit.registrationEndTime) : null,
            ],

            allowedSessions: dataInit.allowedSessions?.map((s) => ({
                label: PERIOD_SESSION_LIST.find((item) => item.value === s)?.label || s,
                value: s,
            })),

            excludedDaysOfWeek: dataInit.excludedDaysOfWeek?.map((d) => ({
                label: PERIOD_DAY_OF_WEEK_LIST.find((item) => item.value === String(d))?.label || d,
                value: String(d),
            })),

            maxSlots: dataInit.maxSlots,
        }
        : {};

    const submitPeriod = async (valuesForm: any) => {
        const { name, status, maxSlots, type, peoplePerSession, dateRange: [startDate, endDate] } = valuesForm;
        let { excludedDaysOfWeek, allowedSessions, regisDateRange: [registrationStartTime, registrationEndTime] } = valuesForm;

        allowedSessions = allowedSessions.map((s: TSelect) => s.value);
        if (excludedDaysOfWeek != null)
            excludedDaysOfWeek = excludedDaysOfWeek.map((s: TSelect) => Number(s.value));

        registrationStartTime = convertToUTC(registrationStartTime, FORMATE_DATE_TIME_VN);
        registrationEndTime = convertToUTC(registrationEndTime, FORMATE_DATE_TIME_VN);

        if (dataInit?.id) {
            //update
            const period = {
                id: dataInit.id, name, status, maxSlots, type, startDate, endDate,
                registrationStartTime, registrationEndTime,
                peoplePerSession, excludedDaysOfWeek, allowedSessions
            }

            const res = await callUpdatePeriod(period);
            if (res.data) {
                message.success("Cập nhật phiên thành công");
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
            const period = {
                name, status, maxSlots, type, startDate, endDate,
                registrationStartTime, registrationEndTime,
                peoplePerSession, excludedDaysOfWeek, allowedSessions
            }

            const res = await callCreatePeriod(period);
            if (res.data) {
                message.success("Thêm mới phiên thành công");
                handleReset();
                reloadTable();
            } else {
                const descriptionText = typeof res.message === 'object' ? Object.values(res.message).join(", ") : res.message;

                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: descriptionText || 'Vui lòng kiểm tra lại thông tin'
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
                title={<>{dataInit?.id ? "Cập nhật phiên" : "Tạo mới phiên"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => handleReset(),
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 1000,
                    keyboard: false,
                    maskClosable: true,
                    footer: null,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy",
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitPeriod}
                initialValues={initialValues}
            >
                <Row gutter={24}>
                    <Col lg={16} md={16} sm={24} xs={24}>
                        <ProFormText
                            label="Tên phiên"
                            name="name"
                            placeholder="Nhập tên phiên"
                        />
                    </Col>

                    <Col lg={8} md={8} sm={24} xs={24}>
                        <ProFormRadio.Group
                            label="Trạng thái"
                            name="status"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            options={PERIOD_STATUS_LIST.map(s => ({
                                label: s.label,
                                value: s.value,
                            }))}
                            fieldProps={{
                                optionType: 'button',
                                buttonStyle: 'solid',
                                onChange: (e) => {
                                    const currentRegisDateRange = form.getFieldValue('regisDateRange') || [null, null];
                                    const now = dayjs();
                                    if (e.target.value === "OPENING") {
                                        form.setFieldsValue({
                                            regisDateRange: [now, currentRegisDateRange[1]],
                                        });
                                        setIsStartDateDisabled(true);
                                    }
                                    else if (e.target.value === "CLOSED") {
                                        form.setFieldsValue({
                                            regisDateRange: [currentRegisDateRange[0], now],
                                        });
                                        setIsEndDateDisabled(true);
                                    }
                                    else {
                                        form.setFieldsValue({ regisDateRange: [currentRegisDateRange[0], currentRegisDateRange[1]] });
                                        setIsStartDateDisabled(false);
                                        setIsEndDateDisabled(false);
                                    }
                                },
                            }}
                        />
                    </Col>

                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormDateTimeRangePicker
                            label="Thời gian đăng ký"
                            name="regisDateRange"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            fieldProps={{
                                disabledDate: (current: Dayjs) => {
                                    return current && current < dayjs().startOf("day");
                                },
                                disabled: [isStartDateDisabled, isEndDateDisabled],
                                format: (value: Dayjs) => dayjs(value).format(FORMATE_DATE_TIME_VN)
                            }}
                        />
                    </Col>

                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormDateRangePicker
                            label="Thời gian thực hiện"
                            name="dateRange"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            fieldProps={{
                                disabledDate: (current) => {
                                    return current && current < dayjs().startOf("day");
                                },
                                format: (value) => dayjs(value).format(FORMATE_DATE_VN)
                            }}
                            disabled={dataInit?.id ? true : false}
                        />
                    </Col>

                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect.SearchSelect
                            label="Buổi được phép đăng ký"
                            name="allowedSessions"
                            placeholder="Chọn những buổi được phép đăng ký"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            mode="multiple"
                            options={PERIOD_SESSION_LIST.map(s => ({
                                label: s.label,
                                value: s.value,
                            }))}
                            disabled={dataInit?.id ? true : false}
                        />
                    </Col>

                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect.SearchSelect
                            label="Thứ bị loại bỏ trong tuần"
                            name="excludedDaysOfWeek"
                            placeholder="Chọn những thứ bị loại bỏ trong tuần"
                            mode="multiple"
                            options={PERIOD_DAY_OF_WEEK_LIST}
                            disabled={dataInit?.id ? true : false}
                        />
                    </Col>

                    <Col lg={8} md={8} sm={24} xs={24}>
                        <ProFormSelect
                            label="Phân loại"
                            name="type"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Chọn loại phiên"
                            request={async () => PERIOD_TYPE_LIST.map(t => ({
                                label: t.label,
                                value: t.value,
                            }))}
                            disabled={dataInit?.id ? true : false}
                        />
                    </Col>

                    <Col lg={8} md={8} sm={24} xs={24}>
                        <ProFormDependency name={['dateRange', 'allowedSessions']}>
                            {({ dateRange, allowedSessions }) => (
                                <ProFormDigit
                                    label="Số người / buổi"
                                    name="peoplePerSession"
                                    placeholder="Nhập số người / buổi ( tối đa 50 người )"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    min={1}
                                    max={50}
                                    disabled={!(dateRange && Array.isArray(allowedSessions) && allowedSessions.length > 0) || !!dataInit?.id}
                                    fieldProps={{
                                        precision: 0,
                                        onChange: (value) => {
                                            if (value) {
                                                form.setFieldsValue({
                                                    maxSlots: calcMaxSlots(form.getFieldValue('dateRange'), form.getFieldValue('allowedSessions'), form.getFieldValue('excludedDaysOfWeek'), value)
                                                });
                                            }
                                        },
                                    }}
                                />
                            )}
                        </ProFormDependency>

                    </Col>

                    <Col lg={8} md={8} sm={24} xs={24}>
                        {/* re-render mỗi khi peoplePerSession thay đổi */}
                        <ProFormDependency name={['peoplePerSession']}>
                            {({ peoplePerSession }) => (
                                <ProFormDigit
                                    label="Slot tối đa"
                                    name="maxSlots"
                                    placeholder="Nhập số slot tối đa"
                                    min={1}
                                    fieldProps={{ precision: 0 }}
                                    disabled={!peoplePerSession || !!dataInit?.id}
                                />
                            )}
                        </ProFormDependency>
                    </Col>
                </Row>
            </ModalForm>
        </>
    )
}

export default ModalPeriod;
