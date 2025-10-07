import React, { useEffect, useRef, useState } from 'react';
import { Modal, Card, Typography, Row, Col, Space, Statistic, Divider, Tag } from 'antd';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    DoughnutController,
    BarElement,
    BarController
} from 'chart.js';
import { callFetchSurveyResult } from '@/config/api';
import { IPost } from '@/types/backend';
import { generateColors } from '@/config/utils';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    DoughnutController,
    BarElement,
    BarController
);

const { Title, Text } = Typography;

interface IQuestionStats {
    questionId: string;
    questionText: string;
    type: string;
    totalAnswers: number;
    chartData: {
        optionId: string;
        label: string;
        count: number;
        percentage: number;
    }[];
}

export interface ISurveyData {
    postId: string;
    title: string;
    totalParticipants: number;
    questionsStats: IQuestionStats[];
}

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit: IPost;
}

const SurveyResultsModal: React.FC<IProps> = ({
    openModal,
    setOpenModal,
    dataInit
}) => {
    const chartRefs = useRef<{ [key: string]: ChartJS }>({});
    const [surveyData, setSurveyData] = useState<ISurveyData | null>(null);

    useEffect(() => {
        const fetchSurveyData = async () => {
            if (dataInit.id) {
                let res = await callFetchSurveyResult(dataInit?.id);
                if (res && res.data) {
                    setSurveyData(res.data);
                }
            }
        }

        fetchSurveyData();
    }, [dataInit])

    const isMultipleChoice = (questionId: string) => {
        const question = dataInit.questions?.find(q => q.id === questionId);
        return question?.allowMultiple || false;
    };

    const createChart = (canvasId: string, questionData: IQuestionStats) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Destroy nếu đã tồn tại
        if (chartRefs.current[questionData.questionId]) {
            chartRefs.current[questionData.questionId].destroy();
        }

        const colors = generateColors(questionData.chartData.length);
        const allowMultiple = isMultipleChoice(questionData.questionId);

        // Tính tổng phản hồi thực tế
        const totalResponses = allowMultiple
            ? questionData.chartData.reduce((sum, item) => sum + item.count, 0)
            : questionData.totalAnswers;

        const chart = new ChartJS(ctx, {
            type: allowMultiple ? 'bar' : 'doughnut',
            data: {
                labels: questionData.chartData.map(item => item.label),
                datasets: [{
                    label: allowMultiple ? 'Số phiếu' : '',
                    data: questionData.chartData.map(item => item.count),
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 2,
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: !allowMultiple, // Ẩn legend cho bar chart
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context: any) {
                                const label = context.label || '';
                                const value = allowMultiple ? context.parsed.y : context.parsed;
                                const percentage = allowMultiple ? ((value / totalResponses) * 100) : questionData.chartData[context.dataIndex]?.percentage || 0;

                                return `${label}: ${value} phiếu (${percentage.toFixed(1)}%)`;
                            }
                        }
                    }
                },
                scales: allowMultiple ? {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                } : {}
            }
        });

        chartRefs.current[questionData.questionId] = chart;
    };

    // delay để chắc chắn DOM đã được tạo
    useEffect(() => {
        if (openModal && surveyData?.questionsStats) {
            setTimeout(() => {
                surveyData.questionsStats.forEach(question => {
                    createChart(`chart-${question.questionId}`, question);
                });
            }, 1000);
        }

        return () => {
            Object.values(chartRefs.current).forEach(chart => {
                if (chart) chart.destroy();
            });
            chartRefs.current = {};
        };
    }, [openModal, surveyData]);

    const renderQuestionCard = (question: IQuestionStats, index: number) => {
        const allowMultiple = isMultipleChoice(question.questionId);
        const totalResponses = allowMultiple ? question.chartData.reduce((sum, item) => sum + item.count, 0) : question.totalAnswers;

        return (
            <Card
                key={question.questionId}
                style={{ marginBottom: '24px' }}
                title={
                    <Space>
                        <Text strong>Câu hỏi: {question.questionText}</Text>
                        {allowMultiple && (
                            <Tag color="blue">
                                Nhiều lựa chọn
                            </Tag>
                        )}
                    </Space>
                }
                extra={
                    <Space>
                        <Text type="secondary">
                            {`Số lượt phản hồi: ${question.totalAnswers}`}
                        </Text>
                    </Space>
                }
            >
                <Row gutter={[32, 32]}>
                    <Col xs={24} md={14}>
                        <div style={{
                            height: allowMultiple ? '384px' : '320px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <canvas
                                id={`chart-${question.questionId}`}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%'
                                }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={10}>
                        <div>
                            <Title level={5} style={{ color: '#555' }}>Chi tiết kết quả:</Title>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {question.chartData.map((option, idx) => (
                                    <div
                                        key={option.optionId}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '6px 24px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Text>{option.label}</Text>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '600', fontSize: '18px' }}>{option.count}</div>
                                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                                {allowMultiple
                                                    ? ((option.count / totalResponses) * 100).toFixed(1)
                                                    : option.percentage.toFixed(1)}%
                                            </Text>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>
        );
    };

    return (
        <Modal
            title={
                <Space>
                    <span>Kết quả khảo sát</span>
                </Space>
            }
            open={openModal}
            onCancel={() => setOpenModal(false)}
            width={1200}
            footer={null}
            className="survey-results-modal"
        >
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <Card
                    style={{
                        marginBottom: '24px',
                        background: '#e6f3ff'
                    }}
                >
                    <Row gutter={24} style={{ textAlign: 'center' }}>
                        <Col span={8} >
                            <Statistic
                                title="Tổng số người tham gia"
                                value={surveyData?.totalParticipants || 0}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Số câu hỏi"
                                value={surveyData?.questionsStats?.length || 0}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Tổng phản hồi"
                                value={surveyData?.questionsStats?.reduce((sum, q) => sum + q.totalAnswers, 0) || 0}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* render questions */}
                {surveyData?.questionsStats?.map((question, index) => renderQuestionCard(question, index))}
            </div>
        </Modal>
    );
};

export default SurveyResultsModal;