
import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IPayment } from "@/types/backend";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Badge, Tag, Typography } from "antd";
import { useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import queryString from 'query-string';
import { sfGe, sfLe, sfLike } from "spring-filter-query-builder";
import { dateRangeValidate, formatCurrency, FORMATE_DATE_TIME_VN, FORMATE_DATE_VN, PAYMENT_STATUS_LIST } from "@/config/utils";
import Access from "@/components/share/access";
import { sfEqual } from "spring-filter-query-builder";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { fetchPayment } from "@/redux/slice/paymentSlide";

const { Text } = Typography;

const PaymentHistoryPage = () => {
    const tableRef = useRef<ActionType>();
    const payments = useAppSelector(state => state.payment.result);
    const isFetching = useAppSelector(state => state.payment.isFetching);
    const meta = useAppSelector(state => state.payment.meta);
    const dispatch = useAppDispatch();

    const columns: ProColumns<IPayment>[] = [
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
            title: 'Người nộp',
            dataIndex: 'user',
            key: 'user',
            width: 200,
            render: (_: any, record: IPayment) => record.user.fullName,
        },

        {
            title: 'Tên phí',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            hideInSearch: true,
            render: (_: any, record: IPayment) => record.feeRegistration.feeType.name,
        },

        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (_: any, record: IPayment) => <Text strong>{formatCurrency(record.amount)}</Text>,
            hideInSearch: true,
        },
        {
            title: 'Hạn thanh toán',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (_: any, record: IPayment) => record.dueDate ? dayjs(record.dueDate).format(FORMATE_DATE_VN) : "-",
            hideInSearch: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            hideInSearch: true,
            render: (_: any, record: IPayment) =>
                <Tag color={PAYMENT_STATUS_LIST.find(item => item.value === record.status)?.color} >
                    {PAYMENT_STATUS_LIST.find(item => item.value === record.status)?.label}
                </Tag>
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'method',
            key: 'method',
            hideInSearch: true,
            render: (_: any, record: IPayment) => record.method
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            hideInSearch: true,
            render: (_: any, record: IPayment) => record.paymentDate ? dayjs(record.paymentDate).format(FORMATE_DATE_TIME_VN) : "-",
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'paymentDateRange',
            valueType: 'dateRange',
            hideInTable: true,
        },
        // {

        //     title: 'Actions',
        //     hideInSearch: true,
        //     width: 50,
        //     render: (_value, entity, _index, _action) => (
        //         <Space>

        //             <EditOutlined
        //                 style={{
        //                     fontSize: 20,
        //                     color: '#ffa500',
        //                 }}
        //                 type=""
        //                 onClick={() => {
        //                     setOpenModal(true);
        //                     setDataInit(entity);
        //                 }}
        //             />

        //             <Popconfirm
        //                 placement="leftTop"
        //                 title={"Xác nhận xóa loại chi phí"}
        //                 description={"Bạn có chắc chắn muốn xóa loại chi phí này ?"}
        //                 onConfirm={() => handleDeleteFeeType(entity.id)}
        //                 okText="Xác nhận"
        //                 cancelText="Hủy"
        //             >
        //                 <span style={{ cursor: "pointer", margin: "0 10px" }}>
        //                     <DeleteOutlined
        //                         style={{
        //                             fontSize: 20,
        //                             color: '#ff4d4f',
        //                         }}
        //                     />
        //                 </span>
        //             </Popconfirm>
        //         </Space>
        //     ),

        // },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const q: any = {
            page: params.current,
            size: params.pageSize,
        }

        const filters: string[] = [];
        //default
        filters.push(`${sfEqual('active', 'true')}`);
        filters.push(`(${sfEqual('status', 'COMPLETED')} or ${sfEqual('status', 'FAILED')})`);

        if (params.user) {
            filters.push(`${sfLike("user.fullName", params.user)}`);
        }

        const paymentDateRange = dateRangeValidate(params.paymentDateRange);
        if (paymentDateRange) {
            filters.push(`${sfGe("paymentDate", paymentDateRange[0])} and ${sfLe("paymentDate", paymentDateRange[1])}`);
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
                permission={ALL_PERMISSIONS.PAYMENTS.GET_PAGINATE}
            >
                <DataTable<IPayment>
                    actionRef={tableRef}
                    headerTitle="Danh sách các thanh toán đã thực hiện"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={payments}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchPayment({ query }))
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
                />
            </Access>
        </div>
    )
}

export default PaymentHistoryPage;