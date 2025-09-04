import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Tag, Spin, Row, Col, Empty, Tooltip } from 'antd';
import { CalendarOutlined, TeamOutlined, DoubleRightOutlined, SwapRightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { IPeriod } from '@/types/backend';
import { PATTERN_IMAGES_LIST, PERIOD_TYPE_LIST } from '@/config/utils';
import { useNavigate } from 'react-router-dom';
import { callFetchOpenPeriod } from '@/config/api';
import styles from '@/styles/client.module.scss';
import { useAppSelector } from '@/redux/hooks';

const { Title, Text } = Typography;

const PeriodPage = () => {
    const [periods, setPeriods] = useState<IPeriod[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchPeriod();
    }, []);

    const fetchPeriod = async () => {
        setIsLoading(true)

        let query = "sort=startDate,asc";
        const res = await callFetchOpenPeriod(query);
        if (res && res.data) {
            setPeriods(res.data.result);
        }
        setIsLoading(false)
    }

    return (
        <div className={styles["registration-section"]}>
            <Spin spinning={isLoading} tip="Loading..." style={{ paddingTop: 20 }}>

                <Row gutter={[20, 24]} style={{ padding: "20px" }}>
                    {periods.map((period, index) => {
                        const img = PATTERN_IMAGES_LIST[index % PATTERN_IMAGES_LIST.length];
                        return (
                            <Col xs={24} sm={12} lg={6} xl={6} key={period.id}>
                                <Card
                                    hoverable
                                    style={{ height: '100%' }}
                                    cover={
                                        <div style={{
                                            backgroundImage: `url(${img})`,
                                            backgroundSize: "cover",
                                            height: 100,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                            <Tag
                                                style={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                }}
                                                color='red'
                                            >
                                                <ClockCircleOutlined style={{ marginRight: '8px' }} />{dayjs(period.registrationEndTime).format("HH:mm DD-MM-YYYY")}
                                            </Tag>
                                        </div>
                                    }
                                    actions={[
                                        <Button
                                            type="primary"
                                            icon={<DoubleRightOutlined />}
                                            onClick={() => navigate(`/period/${period.id}`)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    ]}
                                >
                                    <Card.Meta
                                        title={
                                            <Tooltip title={period.name}>
                                                <Text strong style={{ fontSize: '16px' }} ellipsis>
                                                    {period.name}
                                                </Text>
                                            </Tooltip>
                                        }

                                        description={
                                            <Space direction="vertical" size="small" style={{ width: '100%', gap: '8px', paddingTop: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Tag color={PERIOD_TYPE_LIST.find(t => t.value === period.type)?.color}>
                                                        Phiên {PERIOD_TYPE_LIST.find(t => t.value === period.type)?.label}
                                                    </Tag>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CalendarOutlined />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {dayjs(period.startDate, "DD-MM-YYYY").format("DD/MM/YYYY")}
                                                    </Text>
                                                    <SwapRightOutlined />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {dayjs(period.endDate, "DD-MM-YYYY").format("DD/MM/YYYY")}
                                                    </Text>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <TeamOutlined />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {period.currentUsers}/{period.totalSlot} người
                                                    </Text>
                                                </div>
                                            </Space>
                                        }
                                    />
                                </Card>
                            </Col>
                        )
                    })}
                </Row>

                {(!periods || periods && periods.length === 0)
                    && !isLoading &&
                    <div className={styles["empty"]}>
                        <Empty description="Không có dữ liệu" />
                    </div>
                }
            </Spin>
        </div >
    );
};

export default PeriodPage;