import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUser } from "@/redux/slice/userSlide";
import { IUser } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined, ExportOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { App, Badge, Button, Popconfirm, Space, Tag, notification } from "antd";
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { callDeleteUser, callFetchRole } from "@/config/api";
import queryString from 'query-string';
import ModalUser from "@/components/admin/user/modal.user";
import ViewDetailUser from "@/components/admin/user/view.user";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfGe, sfLe, sfLike } from "spring-filter-query-builder";
import { convertGender, dateRangeValidate, FORMATE_DATE_TIME_VN } from "@/config/utils";
import ImportUser from "@/components/admin/user/import.user";
import { CSVLink } from "react-csv";

const UserPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openModalImport, setOpenModalImport] = useState<boolean>(false);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IUser | null>(null);
    const [roles, setRoles] = useState<IRoleSelect[]>([]);
    const [currentDataTable, setCurrentDataTable] = useState<IUser[]>([]); // for export data

    const tableRef = useRef<ActionType>();
    const { message } = App.useApp();

    const isFetching = useAppSelector(state => state.user.isFetching);
    const meta = useAppSelector(state => state.user.meta);
    const users = useAppSelector(state => state.user.result);
    const dispatch = useAppDispatch();

    type TSearch = {
        fullName?: string;
        email?: string;
        createdAt: string;
        createdAtRange?: string;
    }

    interface IRoleSelect {
        text: string;
        value: string;
        key?: string;
    }

    useEffect(() => {
        fetchRoleList();
    }, []);

    useEffect(() => {
        setCurrentDataTable(users || []);
    }, [users]);

    const handleDeleteUser = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteUser(id);
            if (+res.statusCode === 200) {
                message.success('Xóa User thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const fetchRoleList = async () => {
        const res = await callFetchRole(`page=1&size=100`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    text: item.name as string,
                    value: item.name as string
                }
            })

            setRoles(temp);
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IUser>[] = [
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
            hideInSetting: true,
        },
        {
            title: 'Tên thánh',
            dataIndex: 'christianName',
            hideInSearch: true,
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            sorter: true,
        },

        {
            title: 'Email',
            dataIndex: 'email',
            copyable: true,
        },

        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            copyable: true,
        },

        {
            title: 'Ngày sinh',
            dataIndex: 'birth',
            hideInSearch: true,
        },

        {
            title: 'Giới tính',
            dataIndex: 'gender',
            hideInSearch: true,
            render: (text, record, index, action) => {
                let gender = convertGender(record.gender);
                if (gender === undefined) gender = "-";

                return (
                    <span>{gender}</span>
                )
            },
            filters: [
                {
                    text: 'Nam',
                    value: 'MALE',
                },
                {
                    text: 'Nữ',
                    value: 'FEMALE',
                },
                {
                    text: 'Khác',
                    value: 'OTHER',
                },
            ],
            onFilter: (value, record) => {
                if (value === 'OTHER') {
                    return record.gender === 'OTHER' || record.gender === null;
                } else {
                    return record.gender === value;
                }
            }
        },

        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            hideInSetting: false,
            hideInSearch: true,

        },

        {
            title: 'Tổ',
            dataIndex: 'team',
            key: 'team',
            hideInSetting: false,
            hideInSearch: true,

        },

        {
            title: 'Tên cha',
            dataIndex: 'fatherName',
            key: 'fatherName',
            hideInSetting: false,
            hideInSearch: true,

        },

        {
            title: 'SĐT cha',
            dataIndex: 'fatherPhone',
            key: 'fatherPhone',
            hideInSetting: false,
            hideInSearch: true,
            copyable: true,

        },

        {
            title: 'Tên mẹ',
            dataIndex: 'motherName',
            key: 'motherName',
            hideInSetting: false,
            hideInSearch: true,

        },

        {
            title: 'SĐT mẹ',
            dataIndex: 'motherPhone',
            key: 'motherPhone',
            hideInSetting: false,
            hideInSearch: true,
            copyable: true,
        },

        {
            title: 'Giáo xứ',
            dataIndex: 'parish',
            key: 'parish',
            hideInSetting: false,
            hideInSearch: true,
        },

        {
            title: 'Giáo hạt',
            dataIndex: 'deanery',
            key: 'deanery',
            hideInSetting: false,
            hideInSearch: true,
        },

        {
            title: 'Cha bảo trợ',
            dataIndex: 'spiritualDirectorName',
            key: 'spiritualDirectorName',
            hideInSetting: false,
            hideInSearch: true,
        },

        {
            title: 'Cha linh hướng',
            dataIndex: 'sponsoringPriestName',
            key: 'sponsoringPriestName',
            hideInSetting: false,
            hideInSearch: true,
        },

        {
            title: 'Trường đại học',
            dataIndex: 'university',
            key: 'university',
            hideInSetting: false,
            hideInSearch: true,
        },

        {
            title: 'Ngành học',
            dataIndex: 'major',
            key: 'major',
            hideInSetting: false,
            hideInSearch: true,
        },

        {
            title: 'Trạng thái',
            dataIndex: 'active',
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <span>
                        {record.active ? (
                            <Tag color="green" style={{ display: 'flex', justifyContent: 'center' }}>ACTIVE</Tag>
                        ) : (
                            <Tag color="red" style={{ display: 'flex', justifyContent: 'center' }}>INACTIVE</Tag>
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
            title: 'Role',
            dataIndex: ["role", "name"],
            hideInSearch: true,
            render: (text, record, index, action) => {
                const roleName = record.role?.name || "USER";
                const color = roleName === "SUPER_ADMIN" ? "blue" : (record.role === null ? "" : "purple");
                return <Tag color={color} style={{ display: 'flex', justifyContent: 'center' }}>{roleName}</Tag>;
            },
            filters: [
                ...roles,
                {
                    text: 'USER',
                    value: 'NO_ROLE',
                },
            ],
            onFilter: (value, record) => {
                if (value === 'NO_ROLE') {
                    return record.role === null;
                }
                return record.role?.name === value;
            }
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            valueType: 'date',
            width: 180,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format(FORMATE_DATE_TIME_VN) : ""}</>
                )
            },
            hideInSearch: true,
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createdAtRange',
            valueType: 'dateRange',
            hideInTable: true,
        },

        {
            title: 'Ngày chỉnh sửa',
            dataIndex: 'updatedAt',
            width: 180,
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
            hideInSetting: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access
                        permission={ALL_PERMISSIONS.USERS.UPDATE}
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
                        permission={ALL_PERMISSIONS.USERS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa user"}
                            description={"Bạn có chắc chắn muốn xóa user này ?"}
                            onConfirm={() => handleDeleteUser(entity.id)}
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
        if (params.fullName) {
            filters.push(`${sfLike("fullName", params.fullName)}`);
        }
        if (params.email) {
            filters.push(`${sfLike("email", params.email)}`);
        }
        const createDateRange = dateRangeValidate(params.createdAtRange);
        if (createDateRange) {
            filters.push(`${sfGe("createdAt", createDateRange[0])} and ${sfLe("createdAt", createDateRange[1])}`);
        }

        if (filters.length > 0) {
            q.filter = filters.join(" and ");
        } else {
            delete q.filter;
        }
        let temp = queryString.stringify(q);


        let sortBy = "";
        if (sort && sort.fullName) {
            sortBy = sort.fullName === 'ascend' ? "sort=fullName,asc" : "sort=fullName,desc";
        }
        if (sort && sort.email) {
            sortBy = sort.email === 'ascend' ? "sort=email,asc" : "sort=email,desc";
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
                permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}
            >
                <DataTable<IUser, TSearch>
                    actionRef={tableRef}
                    headerTitle="Danh sách người dùng"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={users}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchUser({ query }))
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
                    toolBarRender={(_action, _rows): any => [
                        <Button
                            icon={<ExportOutlined />}
                            type="primary"
                        >
                            <CSVLink data={currentDataTable} filename="user-data.csv">
                                Export
                            </CSVLink>
                        </Button>,

                        <Button
                            icon={<CloudUploadOutlined />}
                            type="primary"
                            onClick={() => setOpenModalImport(true)}
                        >
                            Import
                        </Button>,

                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => setOpenModal(true)}
                        >
                            Thêm mới
                        </Button>
                    ]}
                    options={{ setting: true }}
                    columnsState={{
                        persistenceKey: 'user-table',
                        persistenceType: 'localStorage',
                        defaultValue: { // hide in table, show in setting
                            address: { show: false },
                            team: { show: false },
                            fatherName: { show: false },
                            fatherPhone: { show: false },
                            motherName: { show: false },
                            motherPhone: { show: false },
                            parish: { show: false },
                            deanery: { show: false },
                            spiritualDirectorName: { show: false },
                            sponsoringPriestName: { show: false },
                            university: { show: false },
                            major: { show: false },
                        }
                    }}
                />
            </Access>

            <ModalUser
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

            <ViewDetailUser
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />

            <ImportUser
                openModalImport={openModalImport}
                setOpenModalImport={setOpenModalImport}
                reloadTable={reloadTable}
            />
        </div >
    )
}

export default UserPage;