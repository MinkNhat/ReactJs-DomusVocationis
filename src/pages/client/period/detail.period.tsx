import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import { ICompany, IListSlots, IPeriod } from "@/types/backend";
import { callFetchCompanyById, callFetchPeriodById, callFetchSlotsByPeriod, callRegistrationSlot } from "@/config/api";
import { Col, Divider, Row, Skeleton, Badge, Typography, Card, Tag, Tooltip, Modal, Button, App } from "antd";
import { EnvironmentOutlined, CalendarOutlined, TeamOutlined, ClockCircleOutlined } from "@ant-design/icons";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import { FORMATE_DATE_VN, PERIOD_STATUS_LIST } from "@/config/utils";

const { Title, Text } = Typography;

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: {
        id: string,
        date: string;
        sessionTime: string;
        users: {
            id: string;
            full_name: string;
        }[];
        isAvailable: boolean;
    };
}

const ClientPeriodDetailPage = (props: any) => {
    const [periodDetail, setPeriodDetail] = useState<IPeriod | null>(null);
    const [listSlot, setListSlot] = useState<IListSlots | null>(null);
    const [eventInfo, setEventInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const calendarRef = useRef<FullCalendar | null>(null);
    const { message, notification } = App.useApp();

    useEffect(() => {
        if (id) {
            fetchPeriodDetail(id);
            fetchListSlot(id);
        }
    }, [id]);

    const fetchPeriodDetail = async (id: string) => {
        setIsLoading(true)

        const res = await callFetchPeriodById(id);
        if (res?.data) {
            setPeriodDetail(res.data);
        }

        setIsLoading(false)
    }

    const fetchListSlot = async (id: string) => {
        setIsLoading(true)

        const res = await callFetchSlotsByPeriod(id);
        if (res?.data) {
            setListSlot(res.data);
        }

        setIsLoading(false)
    }

    const getCalendarEvents = (): CalendarEvent[] => {
        if (!listSlot || !listSlot.slots) return [];

        const events: CalendarEvent[] = [];

        listSlot.slots.forEach((slot, index) => {
            const date = dayjs(slot.registrationDate).format('YYYY-MM-DD');
            const hasUsers = slot.users && slot.users.length > 0;
            const sessionTimeDisplay = getSessionTimeDisplay(slot.sessionTime);

            let title = `${sessionTimeDisplay}`;
            let backgroundColor = '#f0f0f0';
            let borderColor = '#d9d9d9';
            let textColor = '#8c8c8c';

            if (hasUsers) {
                title += `: ${slot.users.map(u => u.full_name).join(', ')}`;
                backgroundColor = '#f6ffed';
                borderColor = '#52c41a';
                textColor = '#389e0d';
            } else {
                // title += ': Available';
            }

            events.push({
                id: `slot-${slot.id}-${index}`,
                title,
                date,
                backgroundColor,
                borderColor,
                textColor,
                extendedProps: {
                    id: slot.id,
                    date: dayjs(slot.registrationDate).format(FORMATE_DATE_VN),
                    sessionTime: slot.sessionTime,
                    users: slot.users || [],
                    isAvailable: !hasUsers
                }
            });
        });

        return events;
    };

    const getSessionTimeDisplay = (sessionTime: string) => {
        switch (sessionTime) {
            case 'MORNING': return 'Buổi sáng';
            case 'AFTERNOON': return 'Buổi chiều';
            case 'EVENING': return 'Buổi tối';
            default: return sessionTime;
        }
    };

    const handleEventClick = (clickInfo: any) => {
        setEventInfo(clickInfo);
        setOpenModal(true);
    };

    const handleRegistration = async () => {
        setIsRegistering(true);

        // get view đang đứng -> sau khi reload vẫn ở lại view đó
        const api = calendarRef.current?.getApi();
        const currentView = api?.view;
        const currentDate = currentView?.currentStart || api?.getDate();


        const res = await callRegistrationSlot(eventInfo?.event?.extendedProps?.id);
        if (res.data && res.statusCode === 200) {
            message.success('Đăng ký thành công');

            if (id) fetchListSlot(id);

            setTimeout(() => {
                const apiAfterReload = calendarRef.current?.getApi();
                if (apiAfterReload && currentDate) {
                    apiAfterReload.gotoDate(currentDate);
                }
            }, 100);

        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }

        setIsRegistering(false);
        setOpenModal(false);
    }

    return (
        <>
            {isLoading ? (
                <Skeleton />
            ) : (
                <Row gutter={[20, 20]}>
                    {periodDetail && periodDetail.id && (
                        <>
                            <Col span={24}>
                                <Card>
                                    <div style={{ marginBottom: '20px' }}>
                                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                                            <CalendarOutlined style={{ marginRight: '8px' }} />
                                            {periodDetail.name}
                                        </Title>
                                        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                            <Tag color={PERIOD_STATUS_LIST.find(s => s.value === periodDetail.status)?.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                                                {periodDetail.status}
                                            </Tag>
                                            <Text>
                                                <TeamOutlined style={{ marginRight: '4px' }} />
                                                <strong>Participants:</strong> {periodDetail.currentUsers}/{periodDetail.maxSlots}
                                            </Text>
                                            <Text>
                                                <ClockCircleOutlined style={{ marginRight: '4px' }} />
                                                <strong>People per session:</strong> {periodDetail.peoplePerSession}
                                            </Text>
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary">
                                                <strong>Registration period:</strong> {' '}
                                                {periodDetail.registrationStartTime && dayjs(periodDetail.registrationStartTime).format('DD/MM/YYYY HH:mm')} - {' '}
                                                {periodDetail.registrationEndTime && dayjs(periodDetail.registrationEndTime).format('DD/MM/YYYY HH:mm')}
                                            </Text>
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary">
                                                <strong>Allowed sessions:</strong> {' '}
                                                {periodDetail.allowedSessions?.map(session => getSessionTimeDisplay(session)).join(', ')}
                                            </Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            <Col span={24}>
                                <Card
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                                <span>Registration Calendar</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        backgroundColor: '#f6ffed',
                                                        border: '1px solid #52c41a',
                                                        marginRight: '4px',
                                                        borderRadius: '2px'
                                                    }}></div>
                                                    <span>Registered</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        backgroundColor: '#f0f0f0',
                                                        border: '1px solid #d9d9d9',
                                                        marginRight: '4px',
                                                        borderRadius: '2px'
                                                    }}></div>
                                                    <span>Available</span>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div style={{ height: '600px' }}>
                                        <FullCalendar
                                            ref={calendarRef}
                                            plugins={[dayGridPlugin, interactionPlugin]}
                                            initialView="dayGridMonth"
                                            headerToolbar={{
                                                left: 'prev,next today',
                                                center: 'title',
                                                right: 'dayGridMonth,dayGridWeek'
                                            }}
                                            buttonText={{
                                                today: 'Hôm nay',
                                                month: 'Tháng',
                                                week: 'Tuần',
                                                day: 'Ngày',
                                            }}
                                            events={getCalendarEvents()}
                                            eventClick={handleEventClick}
                                            height="100%"
                                            eventDisplay="block"
                                            dayMaxEvents={false} // số sk tối đa được hiển thị
                                            eventBackgroundColor="#f6ffed"
                                            eventBorderColor="#52c41a"
                                            eventTextColor="#389e0d"
                                            dayHeaderFormat={{ weekday: 'short' }}
                                            locale="vi"
                                            firstDay={1}
                                            weekends={true}
                                            eventDidMount={(info) => {
                                                const { extendedProps } = info.event;

                                                if (extendedProps.isAvailable) {
                                                    info.el.style.backgroundColor = '#f0f0f0';
                                                    info.el.style.borderColor = '#d9d9d9';
                                                    info.el.style.color = '#8c8c8c';
                                                } else {
                                                    info.el.style.backgroundColor = '#f6ffed';
                                                    info.el.style.borderColor = '#52c41a';
                                                    info.el.style.color = '#389e0d';
                                                }
                                                info.el.style.fontSize = '12px';
                                                info.el.style.padding = '2px 4px';
                                                info.el.style.margin = '2px 6px';
                                                info.el.style.borderRadius = '4px';
                                                info.el.style.cursor = 'pointer';
                                            }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                        </>
                    )}

                    <Modal
                        open={openModal}
                        title="Xác nhận đăng ký"
                        onCancel={() => setOpenModal(false)}
                        width={600}
                        footer={[
                            <Button key="back" size="large" onClick={() => setOpenModal(false)}>
                                Hủy
                            </Button>,
                            <Button
                                key="submit"
                                type="primary"
                                size="large"
                                loading={isRegistering}
                                onClick={handleRegistration}
                            // disabled={!eventInfo?.event?.extendedProps?.isAvailable}
                            >
                                Đăng ký
                            </Button>
                        ]}
                    >
                        <div style={{ padding: '16px 0' }}>
                            {/* Session Info */}
                            <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f8f9fa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                    <Text strong>
                                        {getSessionTimeDisplay(eventInfo?.event?.extendedProps?.sessionTime)}
                                    </Text>

                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CalendarOutlined style={{ color: '#1890ff' }} />
                                    <Text strong>
                                        Ngày {eventInfo?.event?.extendedProps?.date}
                                    </Text>

                                </div>
                            </Card>

                            {/* User List */}
                            <div>
                                <div style={{ marginBottom: '6px' }}>
                                    <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                    <Text>Danh sách người đã đăng ký:</Text>
                                </div>

                                {eventInfo?.event?.extendedProps?.users?.length > 0 ? (
                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {eventInfo.event.extendedProps.users.map((user: any, index: number) => (
                                            <Card key={user.id} size="small" style={{ marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '50%',
                                                            backgroundColor: '#1890ff',
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <Text strong>{user.full_name}</Text>
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                ID: {user.id}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            border: '2px dashed #d9d9d9'
                                        }}
                                    >
                                        <TeamOutlined style={{ fontSize: '28px', color: '#bfbfbf', marginBottom: '12px' }} />
                                        <div>
                                            <Text type="secondary">
                                                Hãy là người đầu tiên đăng ký!
                                            </Text>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Modal>
                </Row>
            )}
        </>
    );
};

export default ClientPeriodDetailPage;