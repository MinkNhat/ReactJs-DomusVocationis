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
    message,
    Flex,
    Popconfirm,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    MessageOutlined,
    RightOutlined,
} from "@ant-design/icons";
import { callDeletePost, callFetchPostById } from "@/config/api";
import { IPost } from "@/types/backend";
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
    const [form] = Form.useForm();
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
            }
        } catch (error) {
            message.error("Không thể tải chi tiết bài viết");
        } finally {
            setLoading(false);
        }
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
        // setCommentLoading(true);
        // try {
        //     // TODO: Implement comment API call
        //     const newComment: CommentData = {
        //         id: Date.now().toString(),
        //         content: values.comment,
        //         author: "Người dùng hiện tại", // Should be from auth context
        //         datetime: new Date().toISOString(),
        //     };

        //     setComments([newComment, ...comments]);
        //     form.resetFields();
        //     message.success("Đã thêm bình luận");
        // } catch (error) {
        //     message.error("Không thể thêm bình luận");
        // } finally {
        //     setCommentLoading(false);
        // }
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
        return (
            <NotFound />
        );
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

                    <Divider />

                    {/* Comments Section */}
                    <div>
                        <Title level={5}>
                            <MessageOutlined /> Bình luận ({comments.length})
                        </Title>

                        {/* Comment Form */}
                        <Form form={form} onFinish={handleComment} style={{ marginBottom: "24px" }}>
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
                                                        {/* <Tooltip title={formatDate(comment.datetime)}>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                {formatDate(comment.datetime)}
                                                            </Text>
                                                        </Tooltip> */}
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