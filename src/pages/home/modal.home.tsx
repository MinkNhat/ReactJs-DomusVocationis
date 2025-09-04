import React, { useEffect, useState } from 'react';
import { Modal, Button, Card, Typography, Radio, Space, App, Input, Select, Form, Row, Col, Switch, Segmented } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ICategory, IPeriod, IPost } from '@/types/backend';
import { PERIOD_SESSION_LIST } from '@/config/utils';
import { callCreatePost, callFetchCategory, callRegisterSession, callUpdatePost } from '@/config/api';
import TextArea from 'antd/es/input/TextArea';
import { ModalForm } from '@ant-design/pro-components';
import { sfEqual, sfGe, sfLe, sfLike } from "spring-filter-query-builder";
import { useAppSelector } from '@/redux/hooks';



interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IPost | null;
    setDataInit: (v: any) => void;
    onSuccess?: () => void;
}

const PostModal: React.FC<IProps> = ({
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

        fetchCategory();
    }, [openModal])

    const handleReset = async () => {
        form.resetFields();
        // setDataInit(null);
        setOpenModal(false);
    }

    const handleSubmit = async (valuesForm: any) => {
        setLoading(true);

        const { title, content, categoryId, publicPost } = valuesForm;

        if (dataInit?.id) {
            const post: IPost = {
                id: dataInit.id,
                title,
                content,
                type: "ANNOUNCEMENT",
                status: "PUBLISHED",
                publicPost: publicPost,
                category: {
                    id: categoryId
                }
            }

            const res = await callUpdatePost(post);
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
            const post: IPost = {
                title,
                content,
                type: "ANNOUNCEMENT",
                status: "PUBLISHED",
                publicPost: publicPost,
                category: {
                    id: categoryId
                }
            }

            const res = await callCreatePost(post);
            if (res.data) {
                message.success('Đăng ký thành công');
                handleReset();
                onSuccess?.();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }


        setLoading(false);
    };

    return (
        <ModalForm
            title={<>{dataInit?.id ? "Cập nhật bài viết" : "Tạo mới bài viết"}</>}
            open={openModal}
            modalProps={{
                onCancel: () => handleReset(),
                afterClose: () => handleReset(),
                destroyOnClose: true,
                width: 600,
                keyboard: false,
                maskClosable: true,
                footer: null,
                okText: <>{dataInit?.id ? "Cập nhật" : "Đăng bài viết"}</>,
                cancelText: "Hủy",
            }}
            loading={loading}
            scrollToFirstError={true}
            preserve={false}
            form={form}
            onFinish={handleSubmit}
            initialValues={{ ...dataInit }}
        >

            <Form.Item
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết' }]}
            >
                <Input placeholder="Nhập tiêu đề bài viết" />
            </Form.Item>
            <Row gutter={24}>
                <Col xs={18}>

                </Col>
                <Col xs={8}>
                    <Form.Item
                        label="Phạm vi"
                        name="publicPost"
                        rules={[{ required: true, message: 'Vui lòng chọn phạm vi' }]}
                        initialValue={true}
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
                initialValue={dataInit?.id && dataInit.category.id}
            >
                <Select placeholder="Chọn danh mục" disabled={dataInit?.id ? true : false}>
                    {categories.map(category => (
                        <Select.Option key={category.id} value={category.id}>
                            {category.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </ModalForm>
    );
};

export default PostModal;