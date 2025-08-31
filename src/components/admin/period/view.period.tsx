import { FORMATE_DATE_TIME_VN, FORMATE_DATE_VN, groupSessionsBySessionTime, PERIOD_SESSION_LIST, PERIOD_STATUS_LIST, PERIOD_TYPE_LIST } from "@/config/utils";
import { IPeriod } from "@/types/backend";
import { Card, Col, Descriptions, Divider, Drawer, Row, Space, Switch, Tag, Typography } from "antd";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { ISessionConfig } from "./modal.period";
import { callFetchSessionsByPeriod } from "@/config/api";
import { Link } from "react-router-dom";
import { DoubleRightOutlined } from "@ant-design/icons";

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IPeriod | null;
    setDataInit: (v: any) => void;
}

const ViewDetailPeriod = (props: IProps) => {
    const { onClose, open, dataInit, setDataInit } = props;
    const [sessionConfigs, setSessionConfigs] = useState<{ [key: string]: ISessionConfig }>({});


    useEffect(() => {
        if (dataInit?.id) {
            callFetchSessionsByPeriod(dataInit.id).then(periodData => {
                if (periodData.data) {
                    const res = groupSessionsBySessionTime(periodData.data as any);
                    setSessionConfigs(res);
                }
            });
        }
    }, [dataInit]);

    const renderSessionCards = () => {
        return (
            <div style={{ marginBottom: 24 }}>
                <Typography.Title level={5} style={{ marginBottom: 16 }}>
                    Chi tiết các buổi thực hiện
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
                        {PERIOD_SESSION_LIST.map(session => dataInit?.allowedSessions?.includes(session.value) && (
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
                                            disabled={true}
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
                                        {sessionConfigs[session.value]?.enabled && (
                                            sessionConfigs[session.value].activities?.map((activity, index) => (
                                                <div key={activity.id} style={{
                                                    marginBottom: 12,
                                                    padding: 8,
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: 4,
                                                    backgroundColor: '#fafafa'
                                                }}>
                                                    <div style={{ marginBottom: 8 }}>
                                                        <Typography.Text strong style={{ fontSize: 12 }}>
                                                            Hoạt động {index + 1}
                                                        </Typography.Text>
                                                    </div>

                                                    <div style={{ marginBottom: 8 }}>
                                                        <Typography.Text style={{ fontSize: 11, color: '#666' }}>
                                                            Tên hoạt động:
                                                        </Typography.Text>
                                                        <div style={{
                                                            marginTop: 2,
                                                            padding: '4px 8px',
                                                            backgroundColor: '#fff',
                                                            border: '1px solid #d9d9d9',
                                                            borderRadius: '4px',
                                                            minHeight: '24px',
                                                            fontSize: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            {activity.activity || '-'}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Typography.Text style={{ fontSize: 11, color: '#666' }}>
                                                            Số lượng:
                                                        </Typography.Text>
                                                        <div style={{
                                                            marginTop: 2,
                                                            padding: '4px 8px',
                                                            backgroundColor: '#fff',
                                                            border: '1px solid #d9d9d9',
                                                            borderRadius: '4px',
                                                            minHeight: '24px',
                                                            fontSize: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            {activity.totalSlot || 0}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
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
            <Drawer
                title="Thông Tin Phiên Đăng Ký"
                placement="right"
                onClose={() => { onClose(false); setDataInit(null) }}
                open={open}
                width={"70vw"}
                maskClosable={true}
            >
                <Descriptions
                    title="Thông tin phiên đăng ký "
                    bordered column={2} layout="horizontal"
                    extra={
                        <Link to={`/admin/period/${dataInit?.id}/registration`}>
                            <Typography.Title level={5} style={{ color: "#108ee9" }} ><DoubleRightOutlined /> Thông tin chi tiết các lượt đăng ký</Typography.Title>
                        </Link>
                    }
                >
                    <Descriptions.Item label="Tên phiên" span={2}>{dataInit?.name}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú" span={2}>{dataInit?.notes}</Descriptions.Item>

                    <Descriptions.Item label="Trạng thái">
                        <Tag color={PERIOD_STATUS_LIST.find(s => s.value === dataInit?.status)?.color}>
                            {PERIOD_STATUS_LIST.find(s => s.value === dataInit?.status)?.label}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại">
                        <Tag color={PERIOD_TYPE_LIST.find(t => t.value === dataInit?.type)?.color}>
                            {PERIOD_TYPE_LIST.find(t => t.value === dataInit?.type)?.label}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày thực hiện">
                        {dataInit && dataInit.startDate ? dayjs(dataInit.startDate, FORMATE_DATE_VN).format(FORMATE_DATE_VN) : ""}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">
                        {dataInit && dataInit.endDate ? dayjs(dataInit.endDate, FORMATE_DATE_VN).format(FORMATE_DATE_VN) : ""}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày đăng ký">
                        {dataInit && dataInit.registrationStartTime ? dayjs(dataInit.registrationStartTime).format(FORMATE_DATE_TIME_VN) : ""}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc đăng ký">
                        {dataInit && dataInit.registrationEndTime ? dayjs(dataInit.registrationEndTime).format(FORMATE_DATE_TIME_VN) : ""}
                    </Descriptions.Item>

                    <Descriptions.Item label="Các ngày bị bỏ qua trong tuần">
                        {dataInit?.excludedDaysOfWeek?.map((d, index) => (
                            <Tag key={index} color="orange">{d === 0 ? "CN" : `T${d + 1}`}</Tag>
                        ))}
                    </Descriptions.Item>
                    <Descriptions.Item label="Các buổi được phép đăng ký">
                        {dataInit?.allowedSessions?.map((s, index) => (
                            <Tag key={index} color="geekblue">
                                Buổi {PERIOD_SESSION_LIST.find(ss => ss.value === s)?.label}
                            </Tag>
                        ))}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo">
                        {dataInit && dataInit.createdAt ? dayjs(dataInit.createdAt).format(FORMATE_DATE_TIME_VN) : ""}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày sửa">
                        {dataInit && dataInit.updatedAt ? dayjs(dataInit.updatedAt).format(FORMATE_DATE_TIME_VN) : ""}
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                {renderSessionCards()}
            </Drawer>
        </>
    )
}

export default ViewDetailPeriod;