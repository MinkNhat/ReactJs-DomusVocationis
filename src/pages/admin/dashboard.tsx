import { callFetchStats } from "@/config/api";
import { IStats } from "@/types/backend";
import { Card, Col, Row, Statistic } from "antd";
import { useEffect, useState } from "react";
import CountUp from 'react-countup';

const DashboardPage = () => {
    const [stats, setStats] = useState<IStats>();

    useEffect(() => {
        const fetchStats = async () => {
            let res = await callFetchStats();
            setStats(res.data)
        }

        fetchStats();
    }, [])

    const formatter = (value: number | string) => {
        return (
            <CountUp end={Number(value)} separator="," />
        );
    };

    return (
        <Row gutter={[20, 20]}>
            <Col span={24} md={8}>
                <Card title="" bordered={false} >
                    <Statistic
                        title="Số User đang hoạt động"
                        value={stats?.totalActiveUser || 0}
                        formatter={formatter}
                    />

                </Card>
            </Col>
            <Col span={24} md={8}>
                <Card title="" bordered={false} >
                    <Statistic
                        title="Tổng số hoạt động"
                        value={stats?.totalPeriod || 0}
                        formatter={formatter}
                    />
                </Card>
            </Col>
            <Col span={24} md={8}>
                <Card title="" bordered={false} >
                    <Statistic
                        title="Tổng số bài viết"
                        value={stats?.totalPost || 0}
                        formatter={formatter}
                    />
                </Card>
            </Col>

        </Row>
    )
}

export default DashboardPage;