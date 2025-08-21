import { ModalForm, ProForm, ProFormDatePicker, ProFormSelect, ProFormSwitch, ProFormText, StepsForm } from "@ant-design/pro-components";
import { Button, Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useState, useEffect } from "react";
import { callCreateUser, callFetchRole, callUpdateUser } from "@/config/api";
import { IUser } from "@/types/backend";
import { DebounceSelect } from "./debouce.select";
import { sfLike } from "spring-filter-query-builder";
import { FORMATE_DATE_VN } from "@/config/utils";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IUser | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface ICompanySelect {
    label: string;
    value: string;
    key?: string;
}

const ModalUser = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [roles, setRoles] = useState<ICompanySelect[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const initialValues = dataInit?.id ? {
        ...dataInit,
        role: dataInit.role?.id ? { label: dataInit.role?.name, value: dataInit.role?.id } : null,
    } : {};

    useEffect(() => {
        if (dataInit?.role) {
            setRoles([
                {
                    label: dataInit.role?.name,
                    value: dataInit.role?.id,
                    key: dataInit.role?.id,
                }
            ]);
        } else {
            setRoles([]);
        }
    }, [dataInit]);

    const submitUser = async (valuesForm: any) => {
        const {
            fullName, email, password, address, gender, role, team,
            christianName, phone, birth, fatherName, fatherPhone,
            motherName, motherPhone, parish, deanery, spiritualDirectorName,
            sponsoringPriestName, university, major, active
        } = valuesForm;

        setLoading(true);

        if (dataInit?.id) {
            //update
            const user = {
                id: dataInit.id,
                christianName,
                fullName,
                email,
                phone,
                password,
                birth,
                gender,
                address,
                active,
                team,
                role: role && Object.keys(role).length > 0
                    ? { id: role.value, name: "" }
                    : null,
                fatherName,
                fatherPhone,
                motherName,
                motherPhone,
                parish,
                deanery,
                spiritualDirectorName,
                sponsoringPriestName,
                university,
                major,
            }

            const res = await callUpdateUser(user);
            if (res.data) {
                message.success("Cập nhật người dùng thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const user = {
                christianName,
                fullName,
                email,
                phone,
                password,
                birth,
                gender,
                address,
                active: true,
                team,
                role: role ? { id: role?.value, name: "" } : null,
                fatherName,
                fatherPhone,
                motherName,
                motherPhone,
                parish,
                deanery,
                spiritualDirectorName,
                sponsoringPriestName,
                university,
                major,
            }

            const res = await callCreateUser(user);
            if (res.data) {
                message.success("Thêm mới người dùng thành công");
                handleReset();
                reloadTable();
            } else {
                const descriptionText = typeof res.message === 'object' ? Object.values(res.message).join(", ") : res.message;

                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: descriptionText || 'Vui lòng kiểm tra lại thông tin'
                });
            }
        }
        setLoading(false);
    }

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setRoles([]);
        setOpenModal(false);
    }

    async function fetchRoleList(name: string): Promise<ICompanySelect[]> {
        let url = `page=1&size=100`;
        if (name !== "")
            url += `&filter=${sfLike("name", name)}`;

        const res = await callFetchRole(url);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: item.id as string
                }
            })
            return temp;
        } else return [];
    }

    const waitTime = (time: number = 100) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, time);
        });
    };

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật người dùng" : "Tạo mới người dùng"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => handleReset(),
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 1000,
                    keyboard: false,
                    maskClosable: false,
                    footer: null,
                }}
                submitter={false}
            >
                <StepsForm
                    onFinish={submitUser}
                    submitter={{
                        render: ({ form, onSubmit, step, onPre }) => {
                            return [
                                <Button
                                    key="reset"
                                    onClick={() => {
                                        form?.resetFields();
                                    }}
                                >
                                    Đặt lại
                                </Button>,
                                step > 0 && (
                                    <Button
                                        key="pre"
                                        onClick={() => {
                                            onPre?.();
                                        }}
                                    >
                                        Quay lại
                                    </Button>
                                ),
                                <Button
                                    key="next"
                                    loading={loading}
                                    type="primary"
                                    onClick={() => {
                                        onSubmit?.();
                                    }}
                                >
                                    {step === 2 ? (dataInit?.id ? "Cập nhật" : "Tạo mới") : "Tiếp tục"}
                                </Button>,
                            ];
                        },
                    }}
                >
                    {/* Step 1*/}
                    {!dataInit?.id &&
                        (<StepsForm.StepForm
                            name="auth"
                            title="Thông tin đăng nhập"
                            onFinish={async () => {
                                setLoading(true);
                                await waitTime(500);
                                setLoading(false);
                                return true;
                            }}
                        >
                            <Row gutter={24}>
                                <Col lg={24} md={24} sm={24} xs={24}>
                                    <ProFormText
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Vui lòng không bỏ trống' },
                                            { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                                        ]}
                                        placeholder="Nhập email"
                                    />
                                </Col>
                                <Col lg={24} md={24} sm={24} xs={24}>
                                    <ProFormText.Password
                                        disabled={dataInit?.id ? true : false}
                                        label="Password"
                                        name="password"
                                        rules={[{ required: dataInit?.id ? false : true, message: 'Vui lòng không bỏ trống' }]}
                                        placeholder="Nhập password"
                                    />
                                </Col>
                            </Row>
                        </StepsForm.StepForm>)
                    }

                    {/* Step 2 */}
                    <StepsForm.StepForm
                        name="user-info"
                        title="Thông tin cá nhân"
                        initialValues={initialValues}
                        onFinish={async () => {
                            setLoading(true);
                            await waitTime(500);
                            setLoading(false);
                            return true;
                        }}
                    >
                        <Row gutter={24}>
                            <Col lg={8} md={8} sm={24} xs={24}>
                                <ProFormText
                                    label="Tên thánh"
                                    name="christianName"
                                    placeholder="Nhập tên thánh"
                                />
                            </Col>

                            <Col lg={8} md={8} sm={24} xs={24}>
                                <ProFormText
                                    label="Họ và tên"
                                    name="fullName"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập họ và tên"
                                />
                            </Col>

                            <Col lg={8} md={8} sm={24} xs={24}>
                                <ProFormText
                                    label="Số điện thoại"
                                    name="phone"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập số điện thoại"
                                />
                            </Col>

                            <Col lg={8} md={8} sm={24} xs={24}>
                                <ProFormDatePicker
                                    label="Ngày sinh"
                                    name="birth"
                                    fieldProps={{
                                        format: FORMATE_DATE_VN,
                                    }}
                                />
                            </Col>

                            <Col lg={8} md={8} sm={24} xs={24}>
                                <ProFormSelect
                                    label="Giới tính"
                                    name="gender"
                                    valueEnum={{
                                        MALE: 'Nam',
                                        FEMALE: 'Nữ',
                                        OTHER: 'Khác',
                                    }}
                                    placeholder="Chọn giới tính"
                                />
                            </Col>

                            <Col lg={8} md={8} sm={24} xs={24}>
                                <ProForm.Item
                                    name="role"
                                    label="Vai trò ( để trống nếu là user thường )"
                                >
                                    <DebounceSelect
                                        allowClear
                                        showSearch
                                        defaultValue={roles}
                                        value={roles}
                                        placeholder="Chọn vai trò"
                                        fetchOptions={fetchRoleList}
                                        onChange={(newValue: any) => {
                                            if (newValue?.length === 0 || newValue?.length === 1) {
                                                setRoles(newValue as ICompanySelect[]);
                                            }
                                        }}
                                        style={{ width: '100%' }}
                                    />
                                </ProForm.Item>
                            </Col>

                            <Col lg={16} md={16} sm={24} xs={24}>
                                <ProFormText
                                    label="Địa chỉ"
                                    name="address"
                                    placeholder="Nhập địa chỉ"
                                />
                            </Col>

                            <Col lg={dataInit?.id ? 4 : 8} md={dataInit?.id ? 4 : 8} sm={24} xs={24}>
                                <ProFormText
                                    label="Tổ"
                                    name="team"
                                    placeholder="Nhập thông tin tổ"
                                />
                            </Col>

                            {dataInit?.id && (
                                <Col lg={dataInit?.id ? 4 : 8} md={dataInit?.id ? 4 : 8} sm={24} xs={24}>
                                    <ProFormSwitch
                                        label="Trạng thái"
                                        name="active"
                                    />
                                </Col>
                            )}
                        </Row>
                    </StepsForm.StepForm>

                    {/* Step 3: Thông tin khác */}
                    <StepsForm.StepForm
                        name="other-info"
                        title="Thông tin khác"
                        initialValues={initialValues}
                    >
                        <Row gutter={24}>
                            <Col lg={12} md={12} sm={24} xs={24}>
                                <ProFormText
                                    label="Tên cha"
                                    name="fatherName"
                                    placeholder="Nhập tên cha"
                                />
                            </Col>
                            <Col lg={12} md={12} sm={24} xs={24}>
                                <ProFormText
                                    label="SĐT cha"
                                    name="fatherPhone"
                                    placeholder="Nhập số điện thoại cha"
                                />
                            </Col>

                            <Col lg={12} md={12} sm={24} xs={24}>
                                <ProFormText
                                    label="Tên mẹ"
                                    name="motherName"
                                    placeholder="Nhập tên mẹ"
                                />
                            </Col>
                            <Col lg={12} md={12} sm={24} xs={24}>
                                <ProFormText
                                    label="SĐT mẹ"
                                    name="motherPhone"
                                    placeholder="Nhập số điện thoại mẹ"
                                />
                            </Col>

                            <Col lg={12} md={12} sm={24} xs={24}>
                                <ProFormText
                                    label="Giáo xứ"
                                    name="parish"
                                    placeholder="Nhập giáo xứ"
                                />
                            </Col>
                            <Col lg={12} md={12} sm={24} xs={24}>
                                <ProFormText
                                    label="Giáo hạt"
                                    name="deanery"
                                    placeholder="Nhập giáo hạt"
                                />
                            </Col>

                            <Col lg={12} md={12} sm={24} xs={24}>
                                <ProFormText
                                    label="Cha bảo trợ"
                                    name="spiritualDirectorName"
                                    placeholder="Nhập tên cha bảo trợ"
                                />
                            </Col>

                            <Col lg={12} md={12} sm={24} xs={24}>
                                <ProFormText
                                    label="Cha linh hướng"
                                    name="sponsoringPriestName"
                                    placeholder="Nhập tên cha linh hướng"
                                />
                            </Col>

                            <Col lg={12} md={12} sm={24} xs={24}>
                                <ProFormText
                                    label="Trường đại học"
                                    name="university"
                                    placeholder="Nhập tên trường đại học"
                                />
                            </Col>

                            <Col lg={12} md={12} sm={24} xs={24}>
                                <ProFormText
                                    label="Ngành học"
                                    name="major"
                                    placeholder="Nhập ngành học"
                                />
                            </Col>
                        </Row>
                    </StepsForm.StepForm>
                </StepsForm>
            </ModalForm>
        </>
    )
}

export default ModalUser;