import React, { useEffect, useState } from 'react';
import {
    Layout,
    Badge,
    Avatar,
    Typography,
    Button,
    Row,
    Col,
    Input,
    message,
    Pagination,
    Spin,
    List,
    Card,
    Carousel,
    Flex,
    Space,
    GetProps,
    Tag
} from 'antd';
import {
    PlusOutlined,
    UserOutlined,
    ClockCircleOutlined,
    HourglassOutlined
} from '@ant-design/icons';
import styles from '@/styles/client.module.scss';
import { ICategory, IPost } from '@/types/backend';
import { callFetchCategory, callFetchPost } from '@/config/api';
import { sfEqual, sfLike } from "spring-filter-query-builder";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import { getNowUTC, getRelativeTime } from '@/config/utils';
import { useAppSelector } from '@/redux/hooks';
import AnnouncementModal from './modal.announcement';
import SurveyModal from './modal.survey';
import { useNavigate, useParams } from 'react-router-dom';

dayjs.extend(relativeTime);
const { Header, Content } = Layout;
const { Title, Text } = Typography;

type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

interface IPaginationMeta {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
}

const HomePage = () => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [posts, setPosts] = useState<IPost[]>([]);
    const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
    const [loading, setLoading] = useState({
        categories: false,
        posts: false,
        initializing: true
    });
    const [openAnnouncementModal, setOpenAnnouncementModal] = useState<boolean>(false);
    const [openSurveyModal, setOpenSurveyModal] = useState<boolean>(false);
    const navigate = useNavigate();
    const { id: cateId } = useParams<{ id: string }>();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const userRole = useAppSelector(state => state.account.user).role?.name;

    const carouselImages = [
        {
            id: 1,
            url: 'https://cdn.pixabay.com/photo/2018/08/04/11/30/draw-3583548_1280.png',
            title: ''
        },
        {
            id: 2,
            url: 'https://png.pngtree.com/thumb_back/fh260/background/20240522/pngtree-abstract-cloudy-background-beautiful-natural-streaks-of-sky-and-clouds-red-image_15684333.jpg',
            title: ''
        },
        {
            id: 3,
            url: 'https://media.istockphoto.com/id/843408508/photo/photography-camera-lens-concept.jpg?s=612x612&w=0&k=20&c=-tm5TKrPDMakrT1vcOE-4Rlyj-iBVdzKuX4viFkd7Vo=',
            title: ''
        }
    ];

    useEffect(() => {
        fetchCategory();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            if (cateId) {
                const categoryExists = categories.find(cate => cate.id?.toString() === cateId);

                if (categoryExists) {
                    setSelectedCategory(cateId);
                } else {
                    navigate('/', { replace: true });
                }
            } else {
                setSelectedCategory(null); //show carousel
            }
            setLoading(prev => ({ ...prev, initializing: false }));
        }
    }, [categories, cateId]);


    useEffect(() => {
        if (selectedCategory) {
            fetchPost(selectedCategory, 1);
        }
    }, [selectedCategory, isAuthenticated]);


    const fetchCategory = async () => {
        setLoading(prev => ({ ...prev, categories: true }));
        try {
            const query = `filter=${sfEqual("active", "true")}`;
            const res = await callFetchCategory(query);
            if (res && res.data) {
                setCategories(res.data.result);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh mục');
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    };

    const fetchPost = async (cateId: string, page: number = 1, search: string = "") => {
        setLoading(prev => ({ ...prev, posts: true }));
        const pageSize = 10;

        try {
            let query = `page=${page}&size=${pageSize}&filter=${sfEqual("category.id", cateId)}`;
            if (search.trim() !== "") {
                query += ` and ${sfLike("title", search)}`;
            }
            query += `&sort=createdAt,desc`;

            const res = await callFetchPost(query);
            if (res && res.data) {
                setPosts(res.data.result);
                setPagination(res.data.meta);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách bài viết');
        } finally {
            setLoading(prev => ({ ...prev, posts: false }));
        }
    };

    const handlePageChange = async (page: number) => {
        if (selectedCategory) {
            await fetchPost(selectedCategory, page);
        }
    };

    const renderCategoryList = () => (
        <Card
            title="Danh mục bài đăng"
            style={{
                height: '100%',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{ padding: '16px 0' }}
        >
            <List
                dataSource={categories}
                loading={loading.categories}
                renderItem={(category) => {
                    const isSelected = selectedCategory === category.id?.toString();
                    return (
                        <List.Item
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => {
                                if (category.id) navigate(`/cate/${category.id.toString()}`);
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <Text strong style={{ fontSize: '14px' }}>
                                        {category.name}
                                    </Text>
                                    <Badge count={0} style={{ backgroundColor: '#1890ff' }} />
                                </div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {category.description}
                                </Text>
                            </div>
                        </List.Item>
                    );
                }}
            />
        </Card>
    );

    const renderPostList = () => {
        if (!selectedCategory) {
            return (
                <Card style={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Carousel
                        autoplay
                        style={{ borderRadius: '8px', overflow: 'hidden' }}
                        dotPosition="bottom"
                    >
                        {carouselImages.map((image) => (
                            <div key={image.id}>
                                <div
                                    style={{
                                        height: '600px',
                                        backgroundImage: `url(${image.url})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <Title level={2} style={{ color: '#fff', textAlign: 'center', margin: 0 }}>
                                        {image.title}
                                    </Title>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </Card>
            );
        }

        if (loading.initializing) {
            return (
                <Card style={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Spin size="large" />
                    </div>
                </Card>
            );
        }

        const selectedCategoryName = categories.find(cat => cat.id?.toString() === selectedCategory)?.name || '';
        return (
            <Card
                title={`Bài viết - ${selectedCategoryName}`}
                style={{
                    height: '100%',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                bodyStyle={{ padding: 0 }}
                extra={
                    <Search placeholder="Nhập từ khoá" onSearch={onSearch} enterButton />
                }
            >
                {loading.posts ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Spin size="large" />
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            Chưa có bài viết nào trong danh mục này
                        </Text>
                    </div>
                ) : (
                    <>
                        <List
                            dataSource={posts}
                            renderItem={(post) => {
                                let isExpired = true;
                                const now = dayjs();

                                if (post.type === "SURVEY") {
                                    if (post.expiresAt !== null) {
                                        if (dayjs(post.expiresAt).isAfter(now)) {
                                            isExpired = false;
                                        }
                                    }
                                }


                                const itemContent = (
                                    <List.Item
                                        style={{
                                            padding: '16px 24px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f0f0f0',
                                            transition: 'background-color 0.2s ease',
                                        }}
                                        onClick={() => navigate(`/post/${post.id}`)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#fafafa';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    size="default"
                                                    src={post.user?.avatar}
                                                    icon={<UserOutlined />}
                                                />
                                            }
                                            title={
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Title
                                                        level={5}
                                                        style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}
                                                        ellipsis
                                                    >
                                                        {post.title}
                                                        {post.type === "SURVEY" && <Tag color="gold" style={{ marginLeft: '8px' }}>Khảo sát</Tag>}
                                                    </Title>
                                                </div>
                                            }
                                            description={
                                                <>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        fontSize: '13px',
                                                        marginTop: 4,
                                                        justifyContent: 'space-between',
                                                        width: '100%'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <Text type="secondary" style={{ display: 'flex', alignItems: 'center' }}>
                                                                <UserOutlined style={{ marginRight: 4 }} />
                                                                {post.user?.full_name || 'Unknown'}
                                                            </Text>

                                                            <Text type="secondary" style={{ margin: '0 8px' }}>•</Text>

                                                            <Text type="secondary" style={{ display: 'flex', alignItems: 'center' }}>
                                                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                                {getRelativeTime(post.createdAt)}
                                                            </Text>
                                                        </div>

                                                        <div>
                                                            {post.type === "SURVEY" && !isExpired ? (
                                                                <Text type="danger" style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <HourglassOutlined style={{ marginRight: 4 }} />
                                                                    {dayjs(post.expiresAt).format("HH:mm DD/MM/YYYY")}
                                                                </Text>
                                                            )
                                                                :
                                                                (<Text type="secondary" style={{ display: 'flex', alignItems: 'center' }}>
                                                                    {post.expiresAt !== null ? "Hết hạn khảo sát" : ""}
                                                                </Text>)}
                                                        </div>
                                                    </div>
                                                </>

                                            }
                                        />
                                    </List.Item>
                                );

                                return post.publicPost === false ? (
                                    <Badge.Ribbon text="Private" color="blue">
                                        {itemContent}
                                    </Badge.Ribbon>
                                ) : (
                                    itemContent
                                );
                            }}
                        />

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    current={pagination.page}
                                    pageSize={pagination.pageSize}
                                    total={pagination.total}
                                    showSizeChanger={false}
                                    showQuickJumper={false}
                                    onChange={handlePageChange}
                                    disabled={loading.posts}
                                />
                            </div>
                        )}
                    </>
                )}
            </Card>
        );
    };

    const handleCreatedPostSuccess = () => {
        if (selectedCategory) {
            fetchPost(selectedCategory, pagination?.page);
        }
    };

    const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
        console.log(info?.source, value);
        if (selectedCategory) {
            fetchPost(selectedCategory, 1, value);
        }
    }

    return (
        <Layout style={{ background: '#f5f5f5' }}>
            <Header style={{
                background: '#fff',
                padding: '0 24px',
                margin: '0 24px',
                boxShadow: '0 2px 8px #f0f1f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '3px'
            }}>
                <Flex align='center' justify='space-between' flex={1}>
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                        Diễn đàn trao đổi
                    </Title>

                    {isAuthenticated && (
                        <Space size="large">
                            {userRole !== undefined && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setOpenSurveyModal(true)}
                                >
                                    Tạo bài khảo sát mới
                                </Button>
                            )}

                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setOpenAnnouncementModal(true)}
                            >
                                Tạo bài viết mới
                            </Button>
                        </Space>
                    )}
                </Flex>
            </Header>

            <Content style={{ padding: '24px' }}>
                <Row gutter={24} >
                    <Col span={17}>
                        {renderPostList()}
                    </Col>

                    <Col span={7}>
                        {renderCategoryList()}
                    </Col>
                </Row>

                <AnnouncementModal
                    openModal={openAnnouncementModal}
                    setOpenModal={setOpenAnnouncementModal}
                    onSuccess={handleCreatedPostSuccess}
                />

                <SurveyModal
                    openModal={openSurveyModal}
                    setOpenModal={setOpenSurveyModal}
                    onSuccess={handleCreatedPostSuccess}
                />
            </Content>
        </Layout>
    );
};

export default HomePage;