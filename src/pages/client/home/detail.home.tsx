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
    Alert,
    Progress,
    App,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    MessageOutlined,
    RightOutlined,
    CheckCircleOutlined,
    FormOutlined,
} from "@ant-design/icons";
import { callCreateAnswer, callDeletePost, callFetchPostById } from "@/config/api";
import { IPost, IQuestion, IOption, IAnswer } from "@/types/backend";
import NotFound from "@/components/share/not.found";
import { getRelativeTime } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
import PostModal from "./modal.home";

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
    const [loading, setLoading] = useState<boolean>(true);
    const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
    const [comments, setComments] = useState<CommentData[]>([]);
    const [commentLoading, setCommentLoading] = useState<boolean>(false);
    const [commentForm] = Form.useForm();
    const [surveyForm] = Form.useForm();
    const { message, notification } = App.useApp();


    // Survey states
    // const [surveyAnswers, setSurveyAnswers] = useState<IAnswer[]>([]);
    // const [surveySubmitted, setSurveySubmitted] = useState<boolean>(false);
    const [surveyLoading, setSurveyLoading] = useState<boolean>(false);

    const userEmail = useAppSelector(state => state.account.user).email;

    useEffect(() => {
        if (id) {
            fetchPostDetail(id);
        }
    }, [id]);

    const fetchPostDetail = async (postId: string) => {
        setLoading(true);
        try {
            const res = await callFetchPostById(postId);
            if (res && res.data) {
                setPostDetail(res.data);
                // Check if user already submitted survey
                // checkSurveySubmission(postId);
            }
            console.log(postDetail);
        } catch (error) {
            message.error("Không thể tải chi tiết bài viết");
        } finally {
            setLoading(false);
        }
    };

    const checkSurveySubmission = async (postId: string) => {
        // TODO: Implement API call to check if user already submitted
        // For now, check localStorage as a temporary solution
        const submitted = localStorage.getItem(`survey_${postId}_${userEmail}`);
        // setSurveySubmitted(!!submitted);
    };

    const handleDelete = async (): Promise<void> => {
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

    const handleComment = async (values: { comment: string }): Promise<void> => {
        // Implementation for comments
    };

    const handleSurveySubmit = async (values: any) => {
        setSurveyLoading(true);
        try {
            const answers: IAnswer[] = [];

            postDetail?.questions?.forEach((question: IQuestion) => {
                const fieldValue = values[`question_${question.id}`];

                if (question.type === 'MULTIPLE_CHOICE') {
                    if (fieldValue && fieldValue.length > 0) {
                        answers.push({
                            question: {
                                id: question.id!
                            },
                            selectedOptions: fieldValue.map((optionId: string) => ({ id: optionId }))
                        });
                    }
                } else if (question.type === 'TEXT') {
                    // Text answer
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

            // TODO: Call API to submit survey
            const result = await Promise.allSettled(answers.map(ans => callCreateAnswer(ans)));
            // console.log(result);
            const success = result.filter(r => r.status === 'fulfilled' && r.value.statusCode === 201);
            if (success.length === answers.length) {
                message.success("Gửi khảo sát thành công!");
                if (id) fetchPostDetail(id);
                // setSurveyAnswers(answers);
                // setSurveySubmitted(true);
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
                                                value={[option.id]}
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
                            {
                                min: 10,
                                message: 'Câu trả lời phải có ít nhất 10 ký tự'
                            }
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
        // console.log(postDetail)

        const totalQuestions = postDetail.questions.length;
        const requiredQuestions = postDetail.questions.filter((q: IQuestion) => q.required).length;

        if (postDetail.submitted) {
            return (
                <Card style={{ marginTop: '24px' }}>
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <CheckCircleOutlined
                            style={{
                                fontSize: '64px',
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

        return (
            <Card
                title={
                    <div>
                        <FormOutlined style={{ marginRight: '8px' }} />
                        Khảo sát
                    </div>
                }
                style={{ marginTop: '24px' }}
            >
                {/* <Alert
                    message={
                        <div>
                            <Text strong>Thông tin khảo sát:</Text>
                            <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                                <li>Tổng số câu hỏi: {totalQuestions}</li>
                                <li>Câu hỏi bắt buộc: {requiredQuestions}</li>
                                <li>Thời gian ước tính: {Math.ceil(totalQuestions * 0.5)} phút</li>
                            </ul>
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: '24px' }}
                /> */}

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
                        <Space>
                            <RightOutlined />
                            <Text>{postDetail.category.name}</Text>
                            <RightOutlined />
                            <Text>{postDetail.title}</Text>
                        </Space>

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

                            {postDetail.createdBy === userEmail && (
                                <Space>
                                    <Button
                                        type="primary"
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

                    {/* Survey Section - Only show for SURVEY type */}
                    {postDetail.type === 'SURVEY' && renderSurveySection()}

                    <Divider />

                    {/* Comments Section - Only show for ANNOUNCEMENT type */}
                    {postDetail.type === 'ANNOUNCEMENT' && (
                        <div>
                            <Title level={5}>
                                <MessageOutlined /> Bình luận ({comments.length})
                            </Title>

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
                                    <MessageOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
                                    <Paragraph style={{ color: "#999" }}>Chưa có bình luận nào</Paragraph>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                <PostModal
                    openModal={openUpdateModal}
                    setOpenModal={setOpenUpdateModal}
                    dataInit={postDetail}
                    setDataInit={setPostDetail}
                    onSuccess={() => {
                        if (id) fetchPostDetail(id);
                    }}
                />
            </div>
        </div>
    );
};

export default ClientPostPageDetail;