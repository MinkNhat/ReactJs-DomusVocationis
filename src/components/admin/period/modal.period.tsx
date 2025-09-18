import { ModalForm, ProFormDateRangePicker, ProFormDateTimeRangePicker, ProFormDependency, ProFormDigit, ProFormRadio, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { App, Button, Card, Col, Divider, Form, Input, InputNumber, Row, Space, Switch, Typography } from "antd";
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { isMobile } from 'react-device-detect';
import { callCreatePeriod, callCreateSession, callFetchSessionsByPeriod, callUpdatePeriod } from "@/config/api";
import { IPeriod, ISession } from "@/types/backend";
import { convertToUTC, FORMATE_DATE_TIME_VN, FORMATE_DATE_VN, getValidDatesInRange, groupSessionsBySessionTime, PERIOD_DAY_OF_WEEK_LIST, PERIOD_SESSION_LIST, PERIOD_STATUS_LIST, PERIOD_TYPE_LIST } from "@/config/utils";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
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

export interface IActivity {
    id: string;
    activity: string;
    totalSlot: number;
}

export interface ISessionConfig {
    sessionTime: string;
    activities: IActivity[];
    enabled: boolean;
}

const ModalPeriod = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [isStartDateDisabled, setIsStartDateDisabled] = useState(false);
    const [isEndDateDisabled, setIsEndDateDisabled] = useState(false);
    const [sessionConfigs, setSessionConfigs] = useState<{ [key: string]: ISessionConfig }>({});
    const { notification, message } = App.useApp();
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            callFetchSessionsByPeriod(dataInit.id).then(periodData => {
                if (periodData.data) {
                    const res = groupSessionsBySessionTime(periodData.data as any);
                    setSessionConfigs(res);
                }
            });
        } else {
            const initialConfigs: { [key: string]: ISessionConfig } = {};
            PERIOD_SESSION_LIST.forEach(session => {
                initialConfigs[session.value] = {
                    sessionTime: session.value,
                    activities: [{
                        id: `${session.value}_0`,
                        activity: '',
                        totalSlot: 0
                    }],
                    enabled: false
                };
            });
            setSessionConfigs(initialConfigs);
        }
    }, [dataInit]);

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
            excludedDaysOfWeek: dataInit.excludedDaysOfWeek?.map((d) => ({
                label: PERIOD_DAY_OF_WEEK_LIST.find((item) => item.value === String(d))?.label || d,
                value: String(d),
            })),
        }
        : {};

    const submitPeriod = async (valuesForm: any) => {
        const { name, status, type, notes, dateRange: [startDate, endDate] } = valuesForm;
        let { excludedDaysOfWeek, regisDateRange: [registrationStartTime, registrationEndTime] } = valuesForm;

        const allowedSessions = Object.keys(sessionConfigs).filter(key => sessionConfigs[key].enabled);
        if (allowedSessions.length === 0) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Vui lòng chọn ít nhất một buổi'
            });
            return;
        }

        const hasValidActivities = allowedSessions.every(sessionKey => {
            const session = sessionConfigs[sessionKey];
            return session.activities.some(activity =>
                activity.activity.trim() !== '' && activity.totalSlot > 0
            );
        });

        if (!hasValidActivities) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Vui lòng nhập đầy đủ thông tin hoạt động và số lượng cho các buổi đã chọn'
            });
            return;
        }

        if (excludedDaysOfWeek != null)
            excludedDaysOfWeek = excludedDaysOfWeek.map((s: TSelect) => Number(s.value));

        registrationStartTime = convertToUTC(registrationStartTime, FORMATE_DATE_TIME_VN);
        registrationEndTime = convertToUTC(registrationEndTime, FORMATE_DATE_TIME_VN);

        if (dataInit?.id) {
            //update
            const period = {
                id: dataInit.id, name, status, type, startDate, endDate, notes,
                registrationStartTime, registrationEndTime, excludedDaysOfWeek, allowedSessions
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
                name, status, type, startDate, endDate, notes,
                registrationStartTime, registrationEndTime, excludedDaysOfWeek, allowedSessions
            }

            try {
                const res = await callCreatePeriod(period);
                if (res.data && res.data.id) {
                    const periodId = res.data.id;
                    const validDates = getValidDatesInRange(startDate, endDate, excludedDaysOfWeek);
                    const sessionPromises: Promise<any>[] = [];

                    validDates.forEach(date => {
                        allowedSessions.forEach(sessionTime => {
                            const sessionConfig = sessionConfigs[sessionTime];

                            sessionConfig.activities.forEach(activity => {
                                if (activity.activity.trim() !== '' && activity.totalSlot > 0) {
                                    const sessionData: ISession = {
                                        registrationDate: date,
                                        totalSlot: activity.totalSlot,
                                        activity: activity.activity,
                                        sessionTime: sessionTime,
                                        period: {
                                            id: periodId,
                                            name: '',
                                        },
                                    };
                                    sessionPromises.push(callCreateSession(sessionData));
                                }
                            });
                        });
                    });

                    await Promise.allSettled(sessionPromises);
                    message.success(`Tạo phiên thành công`);

                    handleReset();
                    reloadTable();
                } else {
                    const descriptionText = typeof res.message === 'object' ? Object.values(res.message).join(", ") : res.message;
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: descriptionText || 'Vui lòng kiểm tra lại thông tin'
                    });
                }
            } catch (error) {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: 'Không thể tạo phiên. Vui lòng thử lại.'
                });
            }
        }
    }

    const handleSessionToggle = (sessionKey: string, enabled: boolean) => {
        setSessionConfigs(prev => ({
            ...prev,
            [sessionKey]: {
                ...prev[sessionKey],
                enabled
            }
        }));
    };

    const handleActivityChange = (sessionKey: string, activityId: string, field: keyof IActivity, value: any) => {
        setSessionConfigs(prev => ({
            ...prev,
            [sessionKey]: {
                ...prev[sessionKey],
                activities: prev[sessionKey].activities.map(activity =>
                    activity.id === activityId ? { ...activity, [field]: value } : activity
                )
            }
        }));
    };

    const addActivity = (sessionKey: string) => {
        const newActivityId = `${sessionKey}_${Date.now()}`;
        setSessionConfigs(prev => ({
            ...prev,
            [sessionKey]: {
                ...prev[sessionKey],
                activities: [
                    ...prev[sessionKey].activities,
                    {
                        id: newActivityId,
                        activity: '',
                        totalSlot: 0
                    }
                ]
            }
        }));
    };

    const removeActivity = (sessionKey: string, activityId: string) => {
        setSessionConfigs(prev => ({
            ...prev,
            [sessionKey]: {
                ...prev[sessionKey],
                activities: prev[sessionKey].activities.filter(activity => activity.id !== activityId)
            }
        }));
    };

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);

        setIsStartDateDisabled(false);
        setIsEndDateDisabled(false);

        const resetConfigs: { [value: string]: ISessionConfig } = {};
        PERIOD_SESSION_LIST.forEach(session => {
            resetConfigs[session.value] = {
                sessionTime: session.value,
                activities: [{
                    id: `${session.value}_0`,
                    activity: '',
                    totalSlot: 0
                }],
                enabled: false
            };
        });
        setSessionConfigs(resetConfigs);
    }

    const renderSessionCards = () => {
        return (
            <div style={{ marginBottom: 24 }}>
                <Typography.Title level={5} style={{ marginBottom: 16 }}>
                    Chọn các buổi thực hiện
                </Typography.Title>

                <div style={{
                    overflowX: 'auto',
                    padding: '8px 0',
                    marginBottom: 16
                }}>
                    <div style={{
                        display: 'flex',
                        gap: 16,
                        minWidth: 'max-content',
                        paddingBottom: 8
                    }}>
                        {PERIOD_SESSION_LIST.map(session => (
                            <div key={session.value} style={{
                                minWidth: '320px',
                                maxWidth: '320px',
                                flexShrink: 0
                            }}>
                                <Card
                                    size="small"
                                    title={
                                        <Space>
                                            <div
                                                style={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    backgroundColor: session.color
                                                }}
                                            />
                                            {session.label}
                                        </Space>
                                    }
                                    extra={
                                        <Switch
                                            checked={sessionConfigs[session.value]?.enabled || false}
                                            onChange={(checked) => handleSessionToggle(session.value, checked)}
                                            disabled={dataInit?.id ? true : false}
                                            size="small"
                                        />
                                    }
                                    style={{
                                        opacity: sessionConfigs[session.value]?.enabled ? 1 : 0.5,
                                        border: sessionConfigs[session.value]?.enabled ? `1px solid ${session.color}` : undefined,
                                        height: '100%'
                                    }}
                                >
                                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                        {sessionConfigs[session.value]?.activities?.map((activity, index) => (
                                            <div key={activity.id} style={{
                                                marginBottom: 12,
                                                padding: 8,
                                                border: '1px solid #f0f0f0',
                                                borderRadius: 4,
                                                backgroundColor: '#fafafa'
                                            }}>
                                                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography.Text strong style={{ fontSize: 12 }}>
                                                        Công việc {index + 1}
                                                    </Typography.Text>
                                                    {sessionConfigs[session.value]?.activities.length > 1 && (
                                                        <Button
                                                            type="text"
                                                            danger
                                                            size="small"
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => removeActivity(session.value, activity.id)}
                                                            disabled={!sessionConfigs[session.value]?.enabled || (dataInit?.id ? true : false)}
                                                            style={{ padding: '2px 4px' }}
                                                        />
                                                    )}
                                                </div>

                                                <div style={{ marginBottom: 8 }}>
                                                    <Typography.Text style={{ fontSize: 11 }}>
                                                        Tên công việc:
                                                    </Typography.Text>
                                                    <Input
                                                        placeholder="Nhập tên công việc"
                                                        value={activity.activity}
                                                        onChange={(e) => handleActivityChange(session.value, activity.id, 'activity', e.target.value)}
                                                        disabled={!sessionConfigs[session.value]?.enabled || (dataInit?.id ? true : false)}
                                                        size="small"
                                                        style={{ marginTop: 2 }}
                                                    />
                                                </div>

                                                <div>
                                                    <Typography.Text style={{ fontSize: 11 }}>
                                                        Số lượng:
                                                    </Typography.Text>
                                                    <InputNumber
                                                        placeholder="Nhập số lượng"
                                                        value={activity.totalSlot}
                                                        onChange={(value) => handleActivityChange(session.value, activity.id, 'totalSlot', value || 0)}
                                                        disabled={!sessionConfigs[session.value]?.enabled || (dataInit?.id ? true : false)}
                                                        min={0}
                                                        style={{ width: '100%', marginTop: 2 }}
                                                        size="small"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        {sessionConfigs[session.value]?.enabled && !dataInit?.id && (
                                            <Button
                                                type="dashed"
                                                onClick={() => addActivity(session.value)}
                                                icon={<PlusOutlined />}
                                                size="small"
                                                style={{ width: '100%', marginTop: 8 }}
                                            >
                                                Thêm hoạt động
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật phiên" : "Tạo mới phiên"}</>}
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
                    style: { top: '3vh' }
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitPeriod}
                initialValues={initialValues}
            >
                <Row gutter={24}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Tên phiên"
                            name="name"
                            placeholder="Nhập tên phiên"
                        />
                    </Col>

                    <Col lg={6} md={6} sm={24} xs={24}>
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

                    <Col lg={6} md={6} sm={24} xs={24}>
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
                        <ProFormSelect.SearchSelect
                            label="Thứ bị loại bỏ trong tuần"
                            name="excludedDaysOfWeek"
                            placeholder="Chọn những thứ bị loại bỏ trong tuần"
                            mode="multiple"
                            options={PERIOD_DAY_OF_WEEK_LIST}
                            disabled={dataInit?.id ? true : false}
                        />
                    </Col>

                    <Col lg={11} md={11} sm={24} xs={24}>
                        <ProFormText
                            label="Ghi chú"
                            name="notes"
                            placeholder="Nhập ghi chú"
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
                </Row>

                <Divider />

                {renderSessionCards()}
            </ModalForm>
        </>
    )
}

export default ModalPeriod;