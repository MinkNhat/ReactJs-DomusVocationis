import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchPeriod } from "@/redux/slice/periodSlide";
import { IPeriod } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Badge, Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeletePeriod } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfGe, sfLe, sfLike } from "spring-filter-query-builder";
import { dateRangeValidate, FORMATE_DATE_TIME_VN, PERIOD_SESSION_LIST, PERIOD_STATUS_LIST, PERIOD_TYPE_LIST } from "@/config/utils";
import ModalPeriod from "@/components/admin/period/modal.period";
import ViewDetailPeriod from "@/components/admin/period/view.period";

const PeriodPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IPeriod | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState(false);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.period.isFetching);
    const meta = useAppSelector(state => state.period.meta);
    const periods = useAppSelector(state => state.period.result);
    const dispatch = useAppDispatch();

    const handleDeletePeriod = async (id: string | undefined) => {
        if (id) {
            const res = await callDeletePeriod(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa Period thành công');
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

    const columns: ProColumns<IPeriod>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <a onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        <Badge color="#c3c3c3" count={(index + 1) + (meta.page - 1) * (meta.pageSize)}></Badge>
                    </a>)
            },
            hideInSearch: true,
        },

        {
            title: 'Tên phiên',
            dataIndex: 'name',
        },

        {
            title: 'Trạng thái',
            dataIndex: 'status',
            hideInSearch: true,
            filters: PERIOD_STATUS_LIST.map(item => ({
                text: item.label,
                value: item.value,
            })),
            renderText(text, record, index, action) {
                const status = PERIOD_STATUS_LIST.find(item => item.value === record.status);
                return (
                    <Tag color={status?.color}>{status ? status.label : record.status}</Tag>
                );
            },
            onFilter: (value, record) => record.status === value,
        },

        {
            title: 'Loại',
            dataIndex: 'type',
            hideInSearch: true,
            filters: PERIOD_TYPE_LIST.map(item => ({
                text: item.label,
                value: item.value
            })),
            renderText(text, record, index, action) {
                const type = PERIOD_TYPE_LIST.find(item => item.value === record.type);
                return (
                    <Tag color={type?.color}>{type ? type.label : record.type}</Tag>
                );
            },
            onFilter: (value, record) => record.type === value,
        },

        {
            title: 'Ngày đăng ký',
            dataIndex: 'registrationStartTime',
            hideInSearch: true,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.registrationStartTime ? dayjs(record.registrationStartTime).format(FORMATE_DATE_TIME_VN) : ""}</>
                )
            },
        },

        {
            title: 'Ngày kết thúc đăng ký',
            dataIndex: 'registrationEndTime',
            hideInSearch: true,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.registrationEndTime ? dayjs(record.registrationEndTime).format(FORMATE_DATE_TIME_VN) : ""}</>
                )
            },
        },

        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            hideInSearch: true,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.startDate}</>
                )
            },
        },
        {
            title: 'Ngày B.Đầu',
            dataIndex: 'startDateRange',
            valueType: 'dateRange',
            hideInTable: true,
        },

        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            hideInSearch: true,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.endDate}</>
                )
            },
        },
        {
            title: 'Ngày K.Thúc',
            dataIndex: 'endDateRange',
            valueType: 'dateRange',
            hideInTable: true,
        },

        {
            title: 'Thứ loại bỏ trong tuần',
            dataIndex: "excludedDaysOfWeek",
            hideInSearch: true,
            width: 130,
            render: (text, record, index, action) => (
                <>
                    {record.excludedDaysOfWeek?.map((s) => (
                        s === 0 ?

                            (<Tag key={s} color="orange" style={{ marginBottom: 3, marginTop: 3 }} >
                                CN
                            </Tag>) :

                            (<Tag key={s} color="orange" style={{ marginBottom: 3, marginTop: 3 }}>
                                {s + 1}
                            </Tag>)
                    ))}
                </>
            ),
        },

        {
            title: 'Buổi được phép đăng ký',
            dataIndex: 'allowedSessions',
            hideInSearch: true,

            filters: PERIOD_SESSION_LIST.map(item => ({
                text: item.label,
                value: item.value
            })),
            renderText(text, record, index, action) {
                return (
                    <>
                        {record.allowedSessions?.map(s => {
                            const session = PERIOD_SESSION_LIST.find(item => item.value === s);
                            return (
                                <Tag key={s} color={session?.color} style={{ marginBottom: 3, marginTop: 3 }}>{session?.label}</Tag>
                            )
                        })}
                    </>
                );
            },
            onFilter: (value, record) => !!record.allowedSessions?.includes(value as string),
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
            title: 'Ghi chú',
            dataIndex: 'notes',
            width: 200,
            hideInSearch: true,
        },

        {

            title: 'Actions',
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access
                        permission={ALL_PERMISSIONS.COMPANIES.UPDATE}
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
                        permission={ALL_PERMISSIONS.PERIODS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa phiên"}
                            description={"Bạn có chắc chắn muốn xóa phiên này ?"}
                            onConfirm={() => handleDeletePeriod(entity.id)}
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

        const startDateRange = dateRangeValidate(params.startDateRange);
        if (startDateRange) {
            filters.push(`${sfGe("startDate", startDateRange[0])} and ${sfLe("startDate", startDateRange[1])}`);
        }

        const endDateRange = dateRangeValidate(params.endDateRange);
        if (endDateRange) {
            filters.push(`${sfGe("endDate", endDateRange[0])} and ${sfLe("endDate", endDateRange[1])}`);
        }

        if (filters.length > 0) {
            q.filter = filters.join(" and ");
        } else {
            delete q.filter;
        }
        let temp = queryString.stringify(q);


        let sortBy = "";
        if (sort && sort.startDate) {
            sortBy = sort.startDate === 'ascend' ? "sort=startDate,asc" : "sort=startDate,desc";
        }

        if (sort && sort.endDate) {
            sortBy = sort.endDate === 'ascend' ? "sort=endDate,asc" : "sort=endDate,desc";
        }

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
                permission={ALL_PERMISSIONS.PERIODS.GET_PAGINATE}
            >
                <DataTable<IPeriod>
                    actionRef={tableRef}
                    headerTitle="Danh sách Công Ty"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={periods}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchPeriod({ query }))
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
                                permission={ALL_PERMISSIONS.PERIODS.CREATE}
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
                        persistenceKey: 'period-table',
                        persistenceType: 'localStorage',
                        defaultValue: { // hide in table, show in setting
                            excludedDaysOfWeek: { show: false },
                            allowedSessions: { show: false },
                            createdAt: { show: false },
                            updatedAt: { show: false },
                            notes: { show: false },
                        },
                    }}
                />
            </Access>

            <ModalPeriod
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

            <ViewDetailPeriod
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default PeriodPage;