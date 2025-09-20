import React, { useEffect, useState } from 'react';
import {
    Modal,
    Button,
    App,
    Input,
    Select,
    Form,
    Row,
    Col,
    Segmented
} from 'antd';
import { ICategory, IPost } from '@/types/backend';
import { callCreatePost, callFetchCategory, callUpdatePost } from '@/config/api';
import TextArea from 'antd/es/input/TextArea';
import { sfEqual } from "spring-filter-query-builder";
import { useAppSelector } from '@/redux/hooks';

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IPost | null;
    setDataInit?: (v: any) => void;
    onSuccess?: () => void;
}

const AnnouncementModal: React.FC<IProps> = ({
    openModal,
    setOpenModal,
    dataInit,
    setDataInit,
    onSuccess
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [form] = Form.useForm();
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
            form.setFieldsValue({
                title: dataInit.title,
                content: dataInit.content,
                publicPost: dataInit.publicPost,
                categoryId: dataInit.category?.id
            });
        }
    }, [dataInit, form]);

    const handleReset = async () => {
        form.resetFields();
        setOpenModal(false);
        if (setDataInit) {
            setDataInit(null);
        }
    }

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const { title, content, categoryId, publicPost } = values;

            const postData: any = {
                title,
                content,
                type: "ANNOUNCEMENT",
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
            <div style={{ minHeight: 300 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        publicPost: true
                    }}
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
                    >
                        <Select
                            placeholder="Chọn danh mục"
                            disabled={!!dataInit?.id} // Disable khi update
                        >
                            {categories.map(category => (
                                <Select.Option key={category.id} value={category.id}>
                                    {category.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 8 }}>
                <Button onClick={handleReset}>
                    Hủy
                </Button>

                <Button
                    type="primary"
                    loading={loading}
                    onClick={() => form.submit()}
                >
                    {dataInit?.id ? "Cập nhật" : "Đăng bài"}
                </Button>
            </div>
        </Modal>
    );
};

export default AnnouncementModal;