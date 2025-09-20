
import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IFeeType } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Badge, Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteFeeType } from "@/config/api";
import queryString from 'query-string';
import { sfLike } from "spring-filter-query-builder";
import { fetchFeeType } from "@/redux/slice/feeTypeSlide";
import { FEE_FREQUENCY_LIST } from "@/config/utils";
import ModalFeeType from "@/components/admin/fee/modal.fee";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";

const FeeTypePage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IFeeType | null>(null);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.feeType.isFetching);
    const meta = useAppSelector(state => state.feeType.meta);
    const feeTypes = useAppSelector(state => state.feeType.result);
    const dispatch = useAppDispatch();

    const handleDeleteFeeType = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteFeeType(id);
            if (res && res.statusCode === 200) {
                message.success('Xóa FeeType thành công');
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

    const columns: ProColumns<IFeeType>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        <Badge color="#c3c3c3" count={(index + 1) + (meta.page - 1) * (meta.pageSize)}></Badge>
                    </>)
            },
            hideInSearch: true,
        },

        {
            title: 'Tên loại chi phí',
            dataIndex: 'name',
            sorter: true,
        },

        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: false,
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
            title: 'Kỳ hạn',
            dataIndex: 'frequency',
            hideInSearch: true,
            filters: FEE_FREQUENCY_LIST.map(item => ({
                text: item.label,
                value: item.value
            })),
            renderText(text, record, index, action) {
                const frequency = FEE_FREQUENCY_LIST.find(item => item.value === record.frequency);
                return (
                    <Tag color={frequency?.color}>{frequency ? frequency.label : record.frequency}</Tag>
                );
            },
            onFilter: (value, record) => record.frequency === value,
        },

        {
            title: 'Số tiền / kỳ hạn',
            dataIndex: 'amount',
            sorter: true,
            hideInSearch: true,
        },

        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            sorter: true,
            hideInSearch: true,
        },

        {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'UpdatedAt',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
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
                        permission={ALL_PERMISSIONS.FEE_TYPES.UPDATE}
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
                        permission={ALL_PERMISSIONS.FEE_TYPES.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa loại phí"}
                            description={"Bạn có chắc chắn muốn xóa loại phí này ?"}
                            onConfirm={() => handleDeleteFeeType(entity.id)}
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
                </Space>
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }

        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
        if (!q.filter) delete q.filter;

        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }

        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

        //mặc định sort theo updatedAt
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.FEE_TYPES.GET_PAGINATE}
            >
                <DataTable<IFeeType>
                    actionRef={tableRef}
                    headerTitle="Danh sách các loại phí"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={feeTypes}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchFeeType({ query }))
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
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => setOpenModal(true)}
                            >
                                Thêm mới
                            </Button>
                        );
                    }}
                    columnsState={{
                        persistenceKey: 'fee-type-table',
                        persistenceType: 'localStorage',
                        defaultValue: {
                            createdAt: { show: false },
                            updatedAt: { show: false },
                        },
                    }}
                />

                <ModalFeeType
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    reloadTable={reloadTable}
                    dataInit={dataInit}
                    setDataInit={setDataInit}
                />
            </Access>
        </div>
    )
}

export default FeeTypePage;