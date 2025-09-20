import React, { useEffect, useState } from 'react';
import {
    Modal,
    Button,
    Card,
    Typography,
    Space,
    App,
    Input,
    Select,
    Row,
    Col,
    Steps,
    Checkbox,
    Tooltip,
    Popconfirm,
    Segmented
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    QuestionCircleOutlined,
    EditOutlined,
    OrderedListOutlined
} from '@ant-design/icons';
import { ICategory, IPost } from '@/types/backend';
import { callCreateSurveyBulk, callFetchCategory } from '@/config/api';
import TextArea from 'antd/es/input/TextArea';
import { sfEqual } from "spring-filter-query-builder";
import { useAppSelector } from '@/redux/hooks';

const { Title, Text } = Typography;

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IPost | null;
    setDataInit?: (v: any) => void;
    onSuccess?: () => void;
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

const SurveyModal: React.FC<IProps> = ({
    openModal,
    setOpenModal,
    dataInit,
    setDataInit,
    onSuccess
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [questions, setQuestions] = useState<IQuestionForm[]>([]);
    const [formData, setFormData] = useState<any>({
        publicPost: true // Set default value
    });
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

        if (openModal) {
            fetchCategory();
        }
    }, [openModal, userRole]);

    useEffect(() => {
        if (dataInit?.id) {
            setFormData({
                title: dataInit.title,
                content: dataInit.content,
                publicPost: dataInit.publicPost,
                categoryId: dataInit.category?.id
            });

            // Load questions if updating
            if (dataInit.questions) {
                const formattedQuestions: IQuestionForm[] = dataInit.questions.map(q => ({
                    id: q.id,
                    questionText: q.questionText,
                    type: q.type,
                    required: q.required,
                    allowMultiple: q.allowMultiple || false,
                    orderDisplay: q.orderDisplay,
                    options: q.options?.map(opt => ({
                        id: opt.id,
                        optionText: opt.optionText,
                        orderDisplay: opt.orderDisplay
                    })) || []
                }));
                setQuestions(formattedQuestions);
            }
        }
    }, [dataInit]);

    const handleReset = async () => {
        setCurrentStep(0);
        setQuestions([]);
        setFormData({});
        setOpenModal(false);
        if (setDataInit) {
            setDataInit(null);
        }
    }

    const handleNextStep = async () => {
        // Validate step 1 data
        if (!formData.title?.trim()) {
            notification.error({
                message: 'Thiếu thông tin',
                description: 'Vui lòng nhập tiêu đề bài khảo sát'
            });
            return;
        }

        if (!formData.content?.trim()) {
            notification.error({
                message: 'Thiếu thông tin',
                description: 'Vui lòng nhập mô tả về bài khảo sát'
            });
            return;
        }

        if (!formData.categoryId) {
            notification.error({
                message: 'Thiếu thông tin',
                description: 'Vui lòng chọn danh mục'
            });
            return;
        }

        console.log('Step 1 values saved:', formData);
        setCurrentStep(1);
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

    const handleSurveySubmit = async () => {
        try {
            if (!validateSurveyData()) {
                return;
            }

            setLoading(true);

            const surveyData = {
                title: formData.title,
                content: formData.content,
                type: 'SURVEY',
                status: 'PUBLISHED',
                publicPost: formData.publicPost,
                categoryId: formData.categoryId,
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

            console.log('Survey data:', surveyData);

            const res = await callCreateSurveyBulk(surveyData);
            if (res.data) {
                message.success('Tạo khảo sát thành công');
                handleReset();
                onSuccess?.();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message || 'Không thể tạo khảo sát'
                });
            }
        } catch (error) {
            console.error('Submit error:', error);
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Vui lòng thử lại sau'
            });
        } finally {
            setLoading(false);
        }
    };

    const renderSurveyStep1 = () => (
        <div>
            <Row gutter={24}>
                <Col xs={16}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                            Tiêu đề bài khảo sát <span style={{ color: '#ff4d4f' }}>*</span>
                        </label>
                        <Input
                            placeholder="Nhập tiêu đề bài khảo sát"
                            value={formData.title || ''}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                        />
                    </div>
                </Col>
                <Col xs={8}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                            Phạm vi <span style={{ color: '#ff4d4f' }}>*</span>
                        </label>
                        <Segmented
                            options={[
                                { label: "Công khai", value: true },
                                { label: "Nội bộ", value: false },
                            ]}
                            value={formData.publicPost ?? true}
                            onChange={(value) => setFormData((prev: any) => ({ ...prev, publicPost: value }))}
                            style={{ backgroundColor: "#ccc" }}
                        />
                    </div>
                </Col>
            </Row>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    Mô tả <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <TextArea
                    rows={4}
                    placeholder="Nhập mô tả về bài khảo sát"
                    value={formData.content || ''}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, content: e.target.value }))}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    Danh mục <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <Select
                    placeholder="Chọn danh mục"
                    style={{ width: '100%' }}
                    value={formData.categoryId || undefined}
                    onChange={(value) => setFormData((prev: any) => ({ ...prev, categoryId: value }))}
                >
                    {categories.map(category => (
                        <Select.Option key={category.id} value={category.id}>
                            {category.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>
        </div>
    );

    const renderSurveyStep2 = () => {
        return (
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
    };

    return (
        <Modal
            title="Tạo bài khảo sát mới"
            open={openModal}
            onCancel={handleReset}
            footer={null}
            width={800}
            destroyOnClose
            keyboard={false}
            maskClosable={true}
        >
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

            <div style={{ minHeight: 300 }}>
                {currentStep === 0 && renderSurveyStep1()}
                {currentStep === 1 && renderSurveyStep2()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 8 }}>
                <Button onClick={handleReset}>
                    Hủy
                </Button>

                {currentStep === 1 && (
                    <Button onClick={handlePrevStep}>
                        Quay lại
                    </Button>
                )}

                {currentStep === 0 && (
                    <Button type="primary" onClick={handleNextStep}>
                        Tiếp theo
                    </Button>
                )}

                {currentStep === 1 && (
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={handleSurveySubmit}
                    >
                        Tạo khảo sát
                    </Button>
                )}
            </div>
        </Modal>
    );
};

export default SurveyModal;