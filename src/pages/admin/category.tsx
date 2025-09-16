import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ICategory } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Badge, Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfGe, sfLe, sfLike } from "spring-filter-query-builder";
import { dateRangeValidate, FORMATE_DATE_TIME_VN, PERIOD_SESSION_LIST, PERIOD_STATUS_LIST, PERIOD_TYPE_LIST } from "@/config/utils";
import { callDeleteCategory } from "@/config/api";
import { fetchCategory } from "@/redux/slice/categorySlide";
import ModalCategory from "@/components/admin/category/modal.category";

const CategoryPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<ICategory | null>(null);
    // const [openViewDetail, setOpenViewDetail] = useState(false);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.category.isFetching);
    const meta = useAppSelector(state => state.category.meta);
    const categories = useAppSelector(state => state.category.result);
    const dispatch = useAppDispatch();

    const handleDeleteCategory = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteCategory(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa Category thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<ICategory>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <a onClick={() => {
                        // setOpenViewDetail(true);
                        // setDataInit(record);
                    }}>
                        <Badge color="#c3c3c3" count={(index + 1) + (meta.page - 1) * (meta.pageSize)}></Badge>
                    </a>)
            },
            hideInSearch: true,
        },

        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            width: 250,
        },

        {
            title: 'Mô tả',
            dataIndex: 'description',
            hideInSearch: true,
        },

        {
            title: 'Trạng thái',
            dataIndex: 'active',
            hideInSearch: true,
            width: 140,
            render: (text, record, index, action) => {
                return (
                    <span>
                        {record.active ? (
                            <Tag color="green" >ACTIVE</Tag>
                        ) : (
                            <Tag color="red" >INACTIVE</Tag>
                        )}
                    </span>
                )
            },
            filters: [
                {
                    text: 'Đang hoạt động',
                    value: true,
                },
                {
                    text: 'Không hoạt động',
                    value: false,
                }
            ],
            onFilter: (value, record) => record.active === value,
        },

        {
            title: 'Cho phép người dùng đăng bài',
            dataIndex: 'allowPost',
            hideInSearch: true,
            width: 180,
            render: (text, record, index, action) => {
                return (
                    <span>
                        {record.allowPost ? (
                            <Tag color="green" >ALLOW</Tag>
                        ) : (
                            <Tag color="red" >NOT ALLOW</Tag>
                        )}
                    </span>
                )
            },
            filters: [
                {
                    text: 'Cho phép đăng bài',
                    value: true,
                },
                {
                    text: 'Không cho phép đăng bài',
                    value: false,
                }
            ],
            onFilter: (value, record) => record.allowPost === value,
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format(FORMATE_DATE_TIME_VN) : ""}</>
                )
            },
            hideInSearch: true,
        },

        {
            title: 'Ngày chỉnh sửa',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format(FORMATE_DATE_TIME_VN) : ""}</>
                )
            },
            hideInSearch: true,
        },

        {

            title: 'Actions',
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access
                        permission={ALL_PERMISSIONS.CATEGORIES.UPDATE}
                        hideChildren
                    >
                        <EditOutlined
                            style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            type=""
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access >
                    <Access
                        permission={ALL_PERMISSIONS.CATEGORIES.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa danh mục"}
                            description={"Bạn có chắc chắn muốn xóa danh mục này ?"}
                            onConfirm={() => handleDeleteCategory(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ff4d4f',
                                    }}
                                />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space >
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const q: any = {
            page: params.current,
            size: params.pageSize,
        }

        const filters: string[] = [];
        if (params.name) {
            filters.push(`${sfLike("name", params.name)}`);
        }

        if (filters.length > 0) {
            q.filter = filters.join(" and ");
        } else {
            delete q.filter;
        }
        let temp = queryString.stringify(q);


        let sortBy = "";
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

        //mặc định sort theo createdAt
        Object.keys(sortBy).length === 0 ? temp = `${temp}&sort=createdAt,desc` : temp = `${temp}&${sortBy}`;

        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE}
            >
                <DataTable<ICategory>
                    actionRef={tableRef}
                    headerTitle="Danh sách Công Ty"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={categories}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchCategory({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Access
                                permission={ALL_PERMISSIONS.CATEGORIES.CREATE}
                                hideChildren
                            >
                                <Button
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    onClick={() => setOpenModal(true)}
                                >
                                    Thêm mới
                                </Button>
                            </Access>
                        );
                    }}
                    options={{ setting: true }}
                    columnsState={{
                        persistenceKey: 'category-table',
                        persistenceType: 'localStorage',
                        defaultValue: { // hide in table, show in setting
                            createdAt: { show: false },
                            updatedAt: { show: false },
                        },
                    }}
                />
            </Access>

            <ModalCategory
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default CategoryPage;