import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Button,
    Typography,
    Avatar,
    Divider,
    Space,
    Spin,
    Input,
    List,
    Form,
    Flex,
    Popconfirm,
    Radio,
    Checkbox,
    App,
    Breadcrumb,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    MessageOutlined,
    CheckCircleOutlined,
    FormOutlined,
    ExceptionOutlined,
    HourglassOutlined,
    ProjectOutlined,
} from "@ant-design/icons";
import { callCreateAnswer, callDeletePost, callFetchPostById } from "@/config/api";
import { IPost, IQuestion, IOption, IAnswer } from "@/types/backend";
import NotFound from "@/components/share/not.found";
import { getRelativeTime } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
// import PostModal from "./modal.home";
import styles from '@/styles/client.module.scss';
import AnnouncementModal from "./modal.announcement";
import dayjs from "dayjs";
import SurveyResultsModal from "./modal.survey-chart";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface CommentData {
    id: string;
    content: string;
    author: string;
    avatar?: string;
    datetime: string;
}

const ClientPostPageDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [postDetail, setPostDetail] = useState<IPost | null>(null);
    const [loading, setLoading] = useState(true);
    const { message, notification } = App.useApp();
    const user = useAppSelector(state => state.account.user);

    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openSurveyResult, setOpenSurveyResult] = useState(false);

    const [surveyForm] = Form.useForm();
    const [surveyLoading, setSurveyLoading] = useState<boolean>(false);

    const [commentForm] = Form.useForm();
    const [comments, setComments] = useState<CommentData[]>([]);
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPostDetail(id);
        }

        const savedAnswers = localStorage.getItem('answers');
        if (savedAnswers) {
            try {
                const parsedAnswers = JSON.parse(savedAnswers);
                surveyForm.setFieldsValue(parsedAnswers);

                localStorage.removeItem('answers');
            } catch (error) {
                localStorage.removeItem('answers');
            }
        }
    }, [id, surveyForm]);

    const fetchPostDetail = async (postId: string) => {
        setLoading(true);
        try {
            const res = await callFetchPostById(postId);
            if (res && res.data) {
                setPostDetail(res.data);
            }
        } catch (error) {
            message.error("Không thể tải chi tiết bài viết");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (id) {
            let res = await callDeletePost(id);
            if (res.statusCode === 200) {
                message.success("Xóa bài viết thành công");
                navigate(`/cate/${postDetail?.category.id}`);
            } else {
                message.error("Xảy ra lỗi khi xóa bài viết");
            }
        }
    };

    const handleComment = async (values: { comment: string }) => {

    };

    const handleSurveySubmit = async (values: any) => {
        if (user.id === '') {
            localStorage.setItem('answers', JSON.stringify(values));
            navigate(`/login?callback=/post/${id}`);
            return;
        }

        setSurveyLoading(true);
        try {
            const answers: IAnswer[] = [];

            postDetail?.questions?.forEach((question: IQuestion) => {
                const fieldValue = values[`question_${question.id}`];

                if (question.type === 'MULTIPLE_CHOICE') {
                    if (fieldValue) {
                        let selectedOptions: string[] = [];

                        if (question.allowMultiple) {
                            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                                selectedOptions = fieldValue;
                            }
                        } else {
                            if (typeof fieldValue === 'string') {
                                selectedOptions = [fieldValue];
                            }
                            // else if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                            //     selectedOptions = fieldValue;
                            // }
                        }

                        if (selectedOptions.length > 0) {
                            answers.push({
                                question: {
                                    id: question.id!
                                },
                                selectedOptions: selectedOptions.map((optionId: string) => ({ id: optionId }))
                            });
                        }
                    }
                } else if (question.type === 'TEXT') {
                    if (fieldValue && fieldValue.trim()) {
                        answers.push({
                            question: {
                                id: question.id!
                            },
                            answerText: fieldValue.trim()
                        });
                    }
                }
            });

            const result = await Promise.allSettled(answers.map(ans => callCreateAnswer(ans)));
            const success = result.filter(r => r.status === 'fulfilled' && r.value.statusCode === 201);

            if (success.length === answers.length) {
                message.success("Gửi khảo sát thành công!");
                surveyForm.resetFields();
                if (id) fetchPostDetail(id);
            } else {
                result.forEach(r => {
                    if (r.status === 'fulfilled' && r.value.statusCode === 400) {
                        notification.error({
                            message: 'Có lỗi xảy ra',
                            description: r.value.message
                        });
                    }
                });
            }

        } catch (error) {
            message.error("Có lỗi xảy ra khi gửi khảo sát");
        } finally {
            setSurveyLoading(false);
        }
    };

    const renderSurveyQuestion = (question: IQuestion) => {
        const isRequired = question.required;

        return (
            <Card
                key={question.id}
                style={{ marginBottom: '16px' }}
                bodyStyle={{ padding: '20px' }}
            >
                <div style={{ marginBottom: '16px' }}>
                    <Title level={5} style={{ marginBottom: '8px' }}>
                        <FormOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        {question.questionText}
                        {isRequired && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
                    </Title>
                </div>

                {question.type === 'MULTIPLE_CHOICE' ? (
                    <Form.Item
                        name={`question_${question.id}`}
                        rules={[
                            {
                                required: isRequired,
                                message: `Vui lòng ${question.allowMultiple ? 'chọn ít nhất một' : 'chọn một'} lựa chọn`
                            }
                        ]}
                    >
                        {question.allowMultiple ? (
                            <Checkbox.Group style={{ width: '100%' }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {question.options
                                        ?.sort((a, b) => (a.orderDisplay || 0) - (b.orderDisplay || 0))
                                        .map((option: IOption) => (
                                            <Checkbox
                                                key={option.id}
                                                value={option.id}
                                                style={{
                                                    padding: '8px 12px',
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: '6px',
                                                    display: 'block',
                                                    marginLeft: 0
                                                }}
                                            >
                                                {option.optionText}
                                            </Checkbox>
                                        ))
                                    }
                                </Space>
                            </Checkbox.Group>
                        ) : (
                            <Radio.Group style={{ width: '100%' }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {question.options
                                        ?.sort((a, b) => (a.orderDisplay || 0) - (b.orderDisplay || 0))
                                        .map((option: IOption) => (
                                            <Radio
                                                key={option.id}
                                                value={option.id}
                                                style={{
                                                    padding: '8px 12px',
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: '6px',
                                                    display: 'block',
                                                    marginLeft: 0
                                                }}
                                            // onChange={(e) => e.target.value}
                                            >
                                                {option.optionText}
                                            </Radio>
                                        ))
                                    }
                                </Space>
                            </Radio.Group>
                        )}
                    </Form.Item>
                ) : (
                    <Form.Item
                        name={`question_${question.id}`}
                        rules={[
                            {
                                required: isRequired,
                                message: 'Vui lòng nhập câu trả lời'
                            },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập câu trả lời của bạn..."
                            maxLength={1000}
                            showCount
                        />
                    </Form.Item>
                )}
            </Card>
        );
    };


    const renderSurveySection = () => {
        if (!postDetail?.questions || postDetail.questions.length === 0) {
            return null;
        }

        if (postDetail.submitted) {
            return (
                <Card style={{ marginTop: '24px' }}>
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <CheckCircleOutlined
                            style={{
                                fontSize: '32px',
                                color: '#52c41a',
                                marginBottom: '16px'
                            }}
                        />
                        <Title level={4} style={{ color: '#52c41a', marginBottom: '8px' }}>
                            Cảm ơn bạn đã tham gia khảo sát!
                        </Title>
                        <Text type="secondary">
                            Phản hồi của bạn đã được ghi nhận thành công.
                        </Text>
                    </div>
                </Card>
            );
        }

        if (dayjs(postDetail.expiresAt).isBefore(dayjs())) {
            return (
                <Card style={{ marginTop: '24px' }}>
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <ExceptionOutlined
                            style={{
                                fontSize: '32px',
                                color: '#FFB300',
                                marginBottom: '16px'
                            }}
                        />
                        <Title level={4} style={{ color: '#FFB300', marginBottom: '8px' }}>
                            Bài khảo sát đã hết hạn!
                        </Title>
                        <Text type="secondary">
                            Bài khảo sát đã ngừng nhận câu trả lời.
                        </Text>
                    </div>
                </Card>
            )
        }

        return (
            <Card
                title={
                    <div>
                        <FormOutlined style={{ marginRight: '8px' }} />
                        Khảo sát
                    </div>
                }
                extra={
                    <div style={{ color: "red" }}>
                        <HourglassOutlined style={{ marginRight: '8px' }} />
                        {dayjs(postDetail.expiresAt).format("HH:mm DD/MM/YYYY")}
                    </div>
                }
                style={{ marginTop: '24px' }}
            >
                <Form
                    form={surveyForm}
                    onFinish={handleSurveySubmit}
                    layout="vertical"
                >
                    {postDetail.questions
                        ?.sort((a: IQuestion, b: IQuestion) => (a.orderDisplay || 0) - (b.orderDisplay || 0))
                        .map((question: IQuestion) => renderSurveyQuestion(question))
                    }

                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={surveyLoading}
                            size="large"
                            style={{ minWidth: '200px' }}
                        >
                            Gửi khảo sát
                        </Button>
                    </div>
                </Form>
            </Card>
        );
    };


    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!postDetail) {
        return <NotFound />;
    }

    return (
        <div style={{ padding: "0 24px", backgroundColor: "#f5f5f5" }}>
            <div style={{}}>
                <Card>
                    {/* Header */}
                    <div>
                        <Breadcrumb
                            separator=">"
                            className={styles["home-section"]}
                            items={[
                                {
                                    title: <Text>{postDetail.category.name}</Text>,
                                    onClick: () => { navigate(`/cate/${postDetail.category.id}`) },
                                    className: `${styles["pointer-item"]}`

                                },
                                {
                                    title: <Text>{postDetail.title}</Text>,
                                },
                            ]}
                        />

                        <Flex justify="space-between" style={{ marginBottom: "16px", marginTop: '16px' }}>
                            {postDetail.user && (
                                <Flex align="center" gap={12}>
                                    <Avatar
                                        size="default"
                                        src={postDetail.user.avatar}
                                        icon={<UserOutlined />}
                                    />
                                    <Flex vertical>
                                        <Title level={5} style={{ margin: 0 }}>
                                            {postDetail.user.full_name}
                                        </Title>
                                        <Flex align="center" gap={4}>
                                            <Text type="secondary">{getRelativeTime(postDetail.createdAt)}</Text>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            )}

                            {postDetail.createdBy === user.email && (
                                <Space>
                                    {user.role !== undefined && postDetail.type === "SURVEY" && (
                                        <Button
                                            type="primary"
                                            icon={<ProjectOutlined />}
                                            onClick={() => { setOpenSurveyResult(true) }}
                                        >
                                            Xem kết quả khảo sát
                                        </Button>

                                    )}

                                    <Button
                                        color="primary"
                                        variant="outlined"
                                        icon={<EditOutlined />}
                                        onClick={() => { setOpenUpdateModal(true) }}
                                    >
                                        Sửa
                                    </Button>

                                    <Popconfirm
                                        placement="leftTop"
                                        title={"Xác nhận xóa phiên"}
                                        description={"Bạn có chắc chắn muốn xóa phiên này ?"}
                                        onConfirm={() => { handleDelete() }}
                                        okText="Xác nhận"
                                        cancelText="Hủy"
                                    >
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                        >
                                            Xóa
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            )}
                        </Flex>
                    </div>

                    <Divider />

                    {/* Content */}
                    <div style={{ marginBottom: "24px", marginTop: '24px', minHeight: '16vh' }}>
                        <Paragraph style={{ whiteSpace: "pre-wrap", fontSize: "16px", lineHeight: "1.6" }}>
                            {postDetail.content}
                        </Paragraph>
                    </div>

                    {postDetail.type === 'SURVEY' && renderSurveySection()}

                    <Divider />

                    {postDetail.type === 'ANNOUNCEMENT' && (
                        <div>
                            {/* Comments List */}
                            {comments.length > 0 ? (
                                <List
                                    dataSource={comments}
                                    renderItem={(comment) => (
                                        <List.Item key={comment.id}>
                                            <div style={{ width: '100%' }}>
                                                <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                    <Avatar
                                                        src={comment.avatar}
                                                        icon={<UserOutlined />}
                                                        style={{ marginRight: '12px' }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                                            <Text strong style={{ marginRight: '8px' }}>
                                                                {comment.author}
                                                            </Text>
                                                        </div>
                                                        <Paragraph style={{ marginBottom: 0 }}>
                                                            {comment.content}
                                                        </Paragraph>
                                                    </div>
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <div style={{
                                    textAlign: "center",
                                    padding: "48px 0",
                                    color: "#999"
                                }}>
                                    <MessageOutlined style={{ fontSize: "32px", marginBottom: "16px" }} />
                                    <Paragraph style={{ color: "#999" }}>Chưa có bình luận nào</Paragraph>
                                </div>
                            )}

                            {/* Comment Form */}
                            <Form form={commentForm} onFinish={handleComment} style={{ marginBottom: "24px" }}>
                                <Form.Item
                                    name="comment"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập nội dung bình luận" },
                                        { min: 5, message: "Bình luận phải có ít nhất 5 ký tự" }
                                    ]}
                                >
                                    <TextArea
                                        rows={3}
                                        placeholder="Viết bình luận của bạn..."
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={commentLoading}
                                    >
                                        Gửi bình luận
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    )}
                </Card>

                <AnnouncementModal
                    openModal={openUpdateModal}
                    setOpenModal={setOpenUpdateModal}
                    dataInit={postDetail}
                    // setDataInit={setPostDetail}
                    onSuccess={() => {
                        if (id) fetchPostDetail(id)
                    }}
                />

                <SurveyResultsModal
                    openModal={openSurveyResult}
                    setOpenModal={() => setOpenSurveyResult(false)}
                    dataInit={postDetail}
                />
            </div>
        </div>
    );
};

export default ClientPostPageDetail;