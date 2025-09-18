import React, { useEffect, useState } from 'react';
import {
    Modal,
    Button,
    Card,
    Typography,
    Radio,
    Space,
    App,
    Input,
    Select,
    Form,
    Row,
    Col,
    Switch,
    Segmented,
    Steps,
    Divider,
    Checkbox,
    InputNumber,
    Tooltip,
    Popconfirm
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    PlusOutlined,
    DeleteOutlined,
    QuestionCircleOutlined,
    EditOutlined,
    OrderedListOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ICategory, IPeriod, IPost, IQuestion, IOption } from '@/types/backend';
import { PERIOD_SESSION_LIST } from '@/config/utils';
import { callCreatePost, callCreateSurveyBulk, callFetchCategory, callRegisterSession, callUpdatePost } from '@/config/api';
import TextArea from 'antd/es/input/TextArea';
import { ModalForm } from '@ant-design/pro-components';
import { sfEqual, sfGe, sfLe, sfLike } from "spring-filter-query-builder";
import { useAppSelector } from '@/redux/hooks';

const { Title, Text } = Typography;

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IPost | null;
    setDataInit?: (v: any) => void;
    onSuccess?: () => void;
    postType?: 'ANNOUNCEMENT' | 'SURVEY';
}

interface IQuestionForm {
    id?: string;
    questionText: string;
    type: 'MULTIPLE_CHOICE' | 'TEXT';
    required: boolean;
    allowMultiple?: boolean;
    orderDisplay: number;
    options?: IOptionForm[];
}

interface IOptionForm {
    id?: string;
    optionText: string;
    orderDisplay: number;
}

const PostModal: React.FC<IProps> = ({
    openModal,
    setOpenModal,
    dataInit,
    setDataInit,
    onSuccess,
    postType = 'ANNOUNCEMENT'
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [questions, setQuestions] = useState<IQuestionForm[]>([]);
    const [form] = Form.useForm();
    const [questionForm] = Form.useForm();
    const { message, notification } = App.useApp();
    const userRole = useAppSelector(state => state.account.user).role?.name;

    useEffect(() => {
        const fetchCategory = async () => {
            let query = `filter=${sfEqual("active", "true")}`;
            if (userRole === undefined)
                query += ` and ${sfEqual("allowPost", "true")}`;

            let res = await callFetchCategory(query);
            if (res && res.data) {
                setCategories(res.data.result);
            }
        }

        fetchCategory();
    }, [openModal]);

    useEffect(() => {
        if (dataInit?.id && dataInit.questions) {
            const formattedQuestions: IQuestionForm[] = dataInit.questions.map((q: IQuestion, index: number) => ({
                id: q.id,
                questionText: q.questionText,
                type: q.type,
                required: q.required || false,
                allowMultiple: q.allowMultiple || false,
                orderDisplay: q.orderDisplay || index + 1,
                options: q.options?.map((opt: IOption, optIndex: number) => ({
                    id: opt.id,
                    optionText: opt.optionText,
                    orderDisplay: opt.orderDisplay || optIndex + 1
                })) || []
            }));
            setQuestions(formattedQuestions);
        }
    }, [dataInit]);

    const handleReset = async () => {
        form.resetFields();
        questionForm.resetFields();
        setCurrentStep(0);
        setQuestions([]);
        setOpenModal(false);
    }

    const handleNextStep = async () => {
        try {
            await form.validateFields();
            setCurrentStep(1);
        } catch (error) {
            console.log('Validation failed:', error);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(0);
    };

    const addQuestion = () => {
        const newQuestion: IQuestionForm = {
            questionText: '',
            type: 'MULTIPLE_CHOICE',
            required: false,
            allowMultiple: false,
            orderDisplay: questions.length + 1,
            options: [
                { optionText: '', orderDisplay: 1 },
                { optionText: '', orderDisplay: 2 }
            ]
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        // Reorder remaining questions
        const reorderedQuestions = newQuestions.map((q, i) => ({
            ...q,
            orderDisplay: i + 1
        }));
        setQuestions(reorderedQuestions);
    };

    const updateQuestion = (index: number, field: keyof IQuestionForm, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };

        // If changing to TEXT type, remove options
        if (field === 'type' && value === 'TEXT') {
            newQuestions[index].options = [];
            newQuestions[index].allowMultiple = false;
        }
        // If changing to MULTIPLE_CHOICE and no options exist, add default options
        else if (field === 'type' && value === 'MULTIPLE_CHOICE' && !newQuestions[index].options?.length) {
            newQuestions[index].options = [
                { optionText: '', orderDisplay: 1 },
                { optionText: '', orderDisplay: 2 }
            ];
        }

        setQuestions(newQuestions);
    };

    const addOption = (questionIndex: number) => {
        const newQuestions = [...questions];
        const currentOptions = newQuestions[questionIndex].options || [];
        const newOption: IOptionForm = {
            optionText: '',
            orderDisplay: currentOptions.length + 1
        };
        newQuestions[questionIndex].options = [...currentOptions, newOption];
        setQuestions(newQuestions);
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        const newQuestions = [...questions];
        const currentOptions = newQuestions[questionIndex].options || [];
        const filteredOptions = currentOptions.filter((_, i) => i !== optionIndex);

        // Reorder 
        const reorderedOptions = filteredOptions.map((opt, i) => ({
            ...opt,
            orderDisplay: i + 1
        }));
        newQuestions[questionIndex].options = reorderedOptions;
        setQuestions(newQuestions);
    };

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        const newQuestions = [...questions];
        if (!newQuestions[questionIndex].options) return;
        newQuestions[questionIndex].options![optionIndex].optionText = value;
        setQuestions(newQuestions);
    };

    const validateSurveyData = () => {
        if (questions.length === 0) {
            notification.error({
                message: 'Lỗi khi tạo bài khảo sát',
                description: 'Vui lòng thêm ít nhất một câu hỏi'
            });
            return false;
        }

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            if (!question.questionText.trim()) {
                notification.error({
                    message: 'Lỗi khi tạo bài khảo sát',
                    description: `Câu hỏi ${i + 1} không được để trống`
                });
                return false;
            }

            if (question.type === 'MULTIPLE_CHOICE') {
                if (!question.options || question.options.length < 2) {
                    notification.error({
                        message: 'Lỗi khi tạo bài khảo sát',
                        description: `Câu hỏi ${i + 1} phải có ít nhất 2 lựa chọn`
                    });
                    return false;
                }

                for (let j = 0; j < question.options.length; j++) {
                    if (!question.options[j].optionText.trim()) {
                        notification.error({
                            message: 'Lỗi khi tạo bài khảo sát',
                            description: `Lựa chọn ${j + 1} của câu hỏi ${i + 1} không được để trống`
                        });
                        return false;
                    }
                }
            }
        }

        return true;
    };

    // Updated handleSubmit
    const handleSubmit = async (valuesForm: any) => {
        if (postType === 'SURVEY' && !validateSurveyData()) {
            return;
        }

        setLoading(true);

        try {
            if (postType === 'SURVEY') {
                const surveyData = {
                    title: valuesForm.title,
                    content: valuesForm.content,
                    type: 'SURVEY',
                    status: 'PUBLISHED',
                    publicPost: valuesForm.publicPost,
                    categoryId: valuesForm.categoryId,
                    questions: questions.map((q, index) => ({
                        questionText: q.questionText,
                        type: q.type,
                        required: q.required,
                        allowMultiple: q.allowMultiple || false,
                        orderDisplay: index + 1,
                        options: q.type === 'MULTIPLE_CHOICE' ? q.options?.map((opt, optIndex) => ({
                            optionText: opt.optionText,
                            orderDisplay: optIndex + 1
                        })) : []
                    }))
                };

                const res = await callCreateSurveyBulk(surveyData);
                if (res.data) {
                    message.success('Tạo khảo sát thành công');
                    handleReset();
                    onSuccess?.();
                }
            } else {
                const { title, content, categoryId, publicPost } = valuesForm;

                const postData: any = {
                    title,
                    content,
                    type: postType,
                    status: "PUBLISHED",
                    publicPost: publicPost,
                    category: {
                        id: categoryId
                    }
                };
                let res;
                if (dataInit?.id) {
                    postData.id = dataInit.id;
                    res = await callUpdatePost(postData);
                    if (res.data) {
                        message.success('Cập nhật thành công');
                        handleReset();
                        onSuccess?.();
                    } else {
                        notification.error({
                            message: 'Có lỗi xảy ra',
                            description: res.message
                        });
                    }
                } else {
                    res = await callCreatePost(postData);
                    if (res.data) {
                        message.success('Đăng bài thành công');
                        handleReset();
                        onSuccess?.();
                    } else {
                        notification.error({
                            message: 'Có lỗi xảy ra',
                            description: res.message
                        });
                    }
                }
            }
        } catch (error) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Vui lòng thử lại sau'
            });
        }

        setLoading(false);
    };

    const renderForm = () => (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ ...dataInit, publicPost: dataInit?.publicPost ?? true }}
        >
            <Row gutter={24}>
                <Col xs={16}>
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết' }]}
                    >
                        <Input placeholder="Nhập tiêu đề bài viết" />
                    </Form.Item>

                </Col>
                <Col xs={8}>
                    <Form.Item
                        label="Phạm vi"
                        name="publicPost"
                        rules={[{ required: true, message: 'Vui lòng chọn phạm vi' }]}
                    >
                        <Segmented
                            options={[
                                { label: "Công khai", value: true },
                                { label: "Nội bộ", value: false },
                            ]}
                            style={{ backgroundColor: "#ccc" }}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                label="Nội dung"
                name="content"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết' }]}
            >
                <TextArea rows={6} placeholder="Nhập nội dung bài viết" />
            </Form.Item>

            <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                initialValue={dataInit?.category?.id}
            >
                <Select placeholder="Chọn danh mục" disabled={dataInit?.id ? true : false}>
                    {categories.map(category => (
                        <Select.Option key={category.id} value={category.id}>
                            {category.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    );

    const renderSurveyStep1 = () => (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ ...dataInit, publicPost: dataInit?.publicPost ?? true }}
        >
            <Row gutter={24}>
                <Col xs={16}>
                    <Form.Item
                        label="Tiêu đề bài khảo sát"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài khảo sát' }]}
                    >
                        <Input placeholder="Nhập tiêu đề bài khảo sát" />
                    </Form.Item>
                </Col>
                <Col xs={8}>
                    <Form.Item
                        label="Phạm vi"
                        name="publicPost"
                        rules={[{ required: true, message: 'Vui lòng chọn phạm vi' }]}
                    >
                        <Segmented
                            options={[
                                { label: "Công khai", value: true },
                                { label: "Nội bộ", value: false },
                            ]}
                            style={{ backgroundColor: "#ccc" }}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                label="Mô tả"
                name="content"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
                <TextArea rows={4} placeholder="Nhập mô tả về bài khảo sát" />
            </Form.Item>

            <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                initialValue={dataInit?.category?.id}
            >
                <Select placeholder="Chọn danh mục">
                    {categories.map(category => (
                        <Select.Option key={category.id} value={category.id}>
                            {category.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    );

    const renderSurveyStep2 = () => (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5} style={{ margin: 0 }}>
                    Danh sách câu hỏi ({questions.length})
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addQuestion}
                >
                    Thêm câu hỏi
                </Button>
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {questions.map((question, questionIndex) => (
                    <Card
                        key={questionIndex}
                        style={{ marginBottom: 16 }}
                        size="small"
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>
                                    <OrderedListOutlined style={{ marginRight: 8 }} />
                                    Câu hỏi {questionIndex + 1}
                                </span>
                                <Popconfirm
                                    title="Xóa câu hỏi"
                                    description="Bạn có chắc chắn muốn xóa câu hỏi này?"
                                    onConfirm={() => removeQuestion(questionIndex)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <Button
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                    />
                                </Popconfirm>
                            </div>
                        }
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Input
                                placeholder="Nhập câu hỏi..."
                                value={question.questionText}
                                onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                            />

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Select
                                        value={question.type}
                                        onChange={(value) => updateQuestion(questionIndex, 'type', value)}
                                        style={{ width: '100%' }}
                                    >
                                        <Select.Option value="MULTIPLE_CHOICE">Trắc nghiệm</Select.Option>
                                        <Select.Option value="TEXT">Tự luận</Select.Option>
                                    </Select>
                                </Col>
                                <Col span={12}>
                                    <Space>
                                        <Checkbox
                                            checked={question.required}
                                            onChange={(e) => updateQuestion(questionIndex, 'required', e.target.checked)}
                                        >
                                            Bắt buộc
                                        </Checkbox>
                                        {question.type === 'MULTIPLE_CHOICE' && (
                                            <Checkbox
                                                checked={question.allowMultiple}
                                                onChange={(e) => updateQuestion(questionIndex, 'allowMultiple', e.target.checked)}
                                            >
                                                Nhiều lựa chọn
                                            </Checkbox>
                                        )}
                                    </Space>
                                </Col>
                            </Row>

                            {question.type === 'MULTIPLE_CHOICE' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <Text strong>Các lựa chọn:</Text>
                                        <Button
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => addOption(questionIndex)}
                                        >
                                            Thêm lựa chọn
                                        </Button>
                                    </div>
                                    {question.options?.map((option, optionIndex) => (
                                        <div key={optionIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                            <Text style={{ marginRight: 8, minWidth: 20 }}>
                                                {String.fromCharCode(65 + optionIndex)}.
                                            </Text>
                                            <Input
                                                placeholder={`Lựa chọn ${optionIndex + 1}`}
                                                value={option.optionText}
                                                onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                                style={{ flex: 1, marginRight: 8 }}
                                            />
                                            {question.options && question.options.length > 2 && (
                                                <Button
                                                    size="small"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeOption(questionIndex, optionIndex)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Space>
                    </Card>
                ))}
            </div>

            {questions.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                    <QuestionCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>Chưa có câu hỏi nào</div>
                </div>
            )}
        </div>
    );

    return (
        <Modal
            title={<>{dataInit?.id ? "Cập nhật bài viết" : "Tạo mới bài viết"}</>}
            open={openModal}
            onCancel={handleReset}
            footer={null}
            width={800}
            destroyOnClose
            keyboard={false}
            maskClosable={true}
        >
            {postType === 'SURVEY' && (
                <Steps
                    current={currentStep}
                    items={[
                        {
                            title: 'Thông tin bài viết',
                            icon: <EditOutlined />
                        },
                        {
                            title: 'Câu hỏi khảo sát',
                            icon: <QuestionCircleOutlined />
                        }
                    ]}
                    style={{ padding: '28px 48px' }}
                />
            )}

            <div style={{ minHeight: 300 }}>
                {postType === 'ANNOUNCEMENT' && renderForm()}
                {postType === 'SURVEY' && currentStep === 0 && renderSurveyStep1()}
                {postType === 'SURVEY' && currentStep === 1 && renderSurveyStep2()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 8 }}>
                <Button onClick={handleReset}>
                    Hủy
                </Button>

                {postType === 'SURVEY' && currentStep === 1 && (
                    <Button onClick={handlePrevStep}>
                        Quay lại
                    </Button>
                )}

                {postType === 'ANNOUNCEMENT' && (
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={() => form.submit()}
                    >
                        {dataInit?.id ? "Cập nhật" : "Đăng bài"}
                    </Button>
                )}

                {postType === 'SURVEY' && currentStep === 0 && (
                    <Button type="primary" onClick={handleNextStep}>
                        Tiếp theo
                    </Button>
                )}

                {postType === 'SURVEY' && currentStep === 1 && (
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={() => form.submit()}
                    >
                        {dataInit?.id ? "Cập nhật khảo sát" : "Tạo khảo sát"}
                    </Button>
                )}
            </div>

            {/* Hidden form for final submission */}
            <div style={{ display: 'none' }}>
                <Form
                    form={form}
                    onFinish={handleSubmit}
                />
            </div>
        </Modal>
    );
};

export default PostModal;