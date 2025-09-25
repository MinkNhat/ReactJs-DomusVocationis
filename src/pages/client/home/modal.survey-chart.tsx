import React, { useEffect, useRef, useState } from 'react';
import { Modal, Card, Typography, Row, Col, Space, Statistic, Divider } from 'antd';
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
        fetchSurveyData();

        if (dataInit.questions && dataInit.questions.length > 0) {
            console.log(dataInit.questions[1].allowMultiple);
        }
    }, [dataInit])

    const fetchSurveyData = async () => {
        if (dataInit.id) {
            let res = await callFetchSurveyResult(dataInit?.id);
            if (res && res.data) {
                setSurveyData(res.data);
                console.log(res);
            }
        }
    }

    const generateColors = (count: number) => {
        const colors = [
            '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
            '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
        ];

        const shuffledColors = [...colors].sort(() => Math.random() - 0.5);

        // Nếu cần nhiều màu hơn số màu có sẵn, tạo thêm màu random
        if (count > colors.length) {
            const additionalColors = [];
            for (let i = colors.length; i < count; i++) {
                const hue = Math.floor(Math.random() * 360);
                const saturation = 60 + Math.floor(Math.random() * 30);
                const lightness = 45 + Math.floor(Math.random() * 20);
                additionalColors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
            }
            return [...shuffledColors, ...additionalColors].slice(0, count);
        }

        return shuffledColors.slice(0, count);
    };

    // Kiểm tra xem câu hỏi có cho phép nhiều lựa chọn không
    const isMultipleChoice = (questionId: string) => {
        const question = dataInit.questions?.find(q => q.id === questionId);
        return question?.allowMultiple || false;
    };

    const createChart = (canvasId: string, questionData: IQuestionStats) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Destroy nếu đã tồn tại chart id
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
                                const value = context.parsed;
                                const percentage = allowMultiple
                                    ? ((value / totalResponses) * 100)
                                    : questionData.chartData[context.dataIndex]?.percentage || 0;

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

        // Tính tổng phản hồi thực tế cho việc hiển thị percentage
        const totalResponses = allowMultiple
            ? question.chartData.reduce((sum, item) => sum + item.count, 0)
            : question.totalAnswers;

        return (
            <Card
                key={question.questionId}
                className="mb-6 shadow-sm"
                title={
                    <Space>
                        <Text strong>Câu hỏi {index + 1}: {question.questionText}</Text>
                        {allowMultiple && (
                            <Text type="secondary" className="text-xs bg-blue-100 px-2 py-1 rounded">
                                Nhiều lựa chọn
                            </Text>
                        )}
                    </Space>
                }
                extra={
                    <Space>
                        <Text type="secondary">
                            {allowMultiple
                                ? `Tổng lượt chọn: ${totalResponses}`
                                : `Tổng phản hồi: ${question.totalAnswers}`
                            }
                        </Text>
                    </Space>
                }
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <div className={`${allowMultiple ? 'h-96' : 'h-80'} flex items-center justify-center`}>
                            <canvas
                                id={`chart-${question.questionId}`}
                                className="max-w-full max-h-full"
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="space-y-4">
                            <Title level={5} className="text-gray-700">Chi tiết kết quả:</Title>
                            {question.chartData.map((option, idx) => (
                                <div
                                    key={option.optionId}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: generateColors(question.chartData.length)[idx] }}
                                        />
                                        <Text>{option.label}</Text>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-lg">{option.count}</div>
                                        <Text type="secondary" className="text-sm">
                                            {allowMultiple
                                                ? ((option.count / totalResponses) * 100).toFixed(1)
                                                : option.percentage.toFixed(1)}%
                                        </Text>
                                    </div>
                                </div>
                            ))}
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
                    <span>Kết quả khảo sát: {surveyData?.title}</span>
                </Space>
            }
            open={openModal}
            onCancel={() => setOpenModal(false)}
            width={1200}
            footer={null}
            className="survey-results-modal"
        >
            <div className="max-h-96 overflow-y-auto">
                {/* Summary Statistics */}
                <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <Row gutter={24}>
                        <Col span={8}>
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

                <Divider orientation="left">
                    <Text strong className="text-lg">Chi tiết từng câu hỏi</Text>
                </Divider>

                {/* Questions Results */}
                {surveyData?.questionsStats?.map((question, index) =>
                    renderQuestionCard(question, index)
                )}
            </div>
        </Modal>
    );
};

export default SurveyResultsModal;