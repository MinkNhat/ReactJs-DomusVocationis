import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import { IListSessions, IPeriod } from "@/types/backend";
import { callFetchPeriodById, callFetchSessionsByPeriod } from "@/config/api";
import { Col, Row, Skeleton, Badge, Typography, Card, Tag, App } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import { FORMATE_DATE_VN, PERIOD_SESSION_LIST, PERIOD_STATUS_LIST } from "@/config/utils";
import RegistrationModal from "./modal.period";
import NotFound from "@/components/share/not.found";
import { useSelector } from "react-redux";
import { useAppSelector } from "@/redux/hooks";

const { Title, Text } = Typography;

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: {
        date: string;
        sessionTime: string;
        sessions: {
            id: string;
            activity: string;
            totalSlot: number;
            currentRegistrations: number;
            users: {
                id: string;
                full_name: string;
            }[];
        }[];
        totalRegistrations: number;
        totalSlots: number;
        hasAvailableSlots: boolean;
    };
}

interface SessionData {
    id: string;
    date: string;
    sessionTime: string;
    activity: string;
    totalSlot: number;
    currentRegistrations: number;
    users: {
        id: string;
        full_name: string;
    }[];
    isAvailable: boolean;
}

const ClientPeriodDetailPage = (props: any) => {
    const [periodDetail, setPeriodDetail] = useState<IPeriod | null>(null);
    const [listSession, setListSession] = useState<IListSessions | null>(null);
    const [selectedDaySessions, setSelectedDaySessions] = useState<SessionData[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const calendarRef = useRef<FullCalendar | null>(null);
    const { message, notification } = App.useApp();

    useEffect(() => {
        if (id) {
            fetchPeriodDetail(id);
            fetchListSession(id);
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

    const fetchListSession = async (id: string) => {
        const res = await callFetchSessionsByPeriod(id);
        if (res?.data) {
            setListSession(res.data);
        }
    }

    const getCalendarEvents = (): CalendarEvent[] => {
        if (!listSession || !listSession.sessions) return [];

        // Group sessions by date and sessionTime
        const groupedSessions = listSession.sessions.reduce((acc, session) => {
            const date = dayjs(session.registrationDate).format('YYYY-MM-DD');
            const key = `${date}_${session.sessionTime}`;

            if (!acc[key]) {
                acc[key] = {
                    date,
                    sessionTime: session.sessionTime,
                    sessions: []
                };
            }

            acc[key].sessions.push({
                id: session.id,
                activity: session.activity,
                totalSlot: session.totalSlot,
                currentRegistrations: session.currentRegistrations,
                users: session.users || []
            });

            return acc;
        }, {} as Record<string, {
            date: string;
            sessionTime: string;
            sessions: {
                id: string;
                activity: string;
                totalSlot: number;
                currentRegistrations: number;
                users: any[];
            }[];
        }>);

        // sort by session time 
        const sortedGroups = Object.values(groupedSessions).sort((a, b) => {
            const orderA = PERIOD_SESSION_LIST.findIndex(period => period.value === a.sessionTime);
            const orderB = PERIOD_SESSION_LIST.findIndex(period => period.value === b.sessionTime);

            return orderA - orderB;
        });

        const events: CalendarEvent[] = [];
        sortedGroups.forEach((group, index) => {
            const totalRegistrations = group.sessions.reduce((sum, session) => sum + session.currentRegistrations, 0);
            const totalSlots = group.sessions.reduce((sum, session) => sum + session.totalSlot, 0);
            const hasAvailableSlots = totalSlots > totalRegistrations;
            const sessionTimeDisplay = getSessionTimeDisplay(group.sessionTime);

            let title = `${sessionTimeDisplay}`;
            let backgroundColor = '#f6ffed';
            let borderColor = '#52c41a';
            let textColor = '#389e0d';

            if (totalRegistrations > 0) {

                if (hasAvailableSlots) {
                    backgroundColor = '#fff7e6';
                    borderColor = '#ffa940';
                    textColor = '#d46b08';
                } else {
                    backgroundColor = '#f0f0f0';
                    borderColor = '#d9d9d9';
                    textColor = '#8c8c8c';
                }
            }

            events.push({
                id: `${index}_${group.date}_${group.sessionTime}`,
                title,
                date: group.date,
                backgroundColor,
                borderColor,
                textColor,
                extendedProps: {
                    date: dayjs(group.date).format(FORMATE_DATE_VN),
                    sessionTime: group.sessionTime,
                    sessions: group.sessions,
                    totalRegistrations,
                    totalSlots,
                    hasAvailableSlots
                }
            });
        });
        return events;
    };

    const getSessionTimeDisplay = (sessionTime: string) => {
        return `Buổi ${PERIOD_SESSION_LIST.find(s => s.value === sessionTime)?.label}`;
    };

    const handleEventClick = (clickInfo: any) => {
        const { extendedProps } = clickInfo.event;

        const sessionsForModal: SessionData[] = extendedProps.sessions.map((session: any) => ({
            id: session.id,
            date: extendedProps.date,
            sessionTime: extendedProps.sessionTime,
            activity: session.activity,
            totalSlot: session.totalSlot,
            currentRegistrations: session.currentRegistrations,
            users: session.users,
            isAvailable: session.totalSlot > session.currentRegistrations
        }));

        setSelectedDaySessions(sessionsForModal);
        setOpenModal(true);
    };

    const handleRegistrationSuccess = () => {
        // lấy vị trí view hiện tại trong calender
        const api = calendarRef.current?.getApi();
        const currentView = api?.view;
        const currentDate = currentView?.currentStart || api?.getDate();

        if (id) {
            fetchListSession(id);
        }

        // trả về view đã lấy trước đó
        setTimeout(() => {
            const apiAfterReload = calendarRef.current?.getApi();
            if (apiAfterReload && currentDate) {
                apiAfterReload.gotoDate(currentDate);
            }
        }, 100);
    };

    if (!isLoading) {
        if (!periodDetail) return <NotFound />
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
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary">
                                                <strong>Thời gian đăng ký:</strong> {' '}
                                                {periodDetail.registrationStartTime && dayjs(periodDetail.registrationStartTime).format("HH:mm DD/MM/YYYY")} - {' '}
                                                {periodDetail.registrationEndTime && dayjs(periodDetail.registrationEndTime).format("HH:mm DD/MM/YYYY")}
                                            </Text>
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary">
                                                <strong>Thời gian thực hiện:</strong> {' '}
                                                {periodDetail.registrationStartTime && dayjs(periodDetail.startDate, "DD/MM/YYYY").format("DD/MM/YYYY")} - {' '}
                                                {periodDetail.registrationEndTime && dayjs(periodDetail.endDate, "DD/MM/YYYY").format("DD/MM/YYYY")}
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
                                                <span>Lịch đăng ký</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        backgroundColor: '#f0f0f0',
                                                        border: '1px solid #d9d9d9',
                                                        marginRight: '4px',
                                                        borderRadius: '2px'
                                                    }}></div>
                                                    <span>Đã đầy</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        backgroundColor: '#fff7e6',
                                                        border: '1px solid #ffa940',
                                                        marginRight: '4px',
                                                        borderRadius: '2px'
                                                    }}></div>
                                                    <span>Một phần</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        backgroundColor: '#f6ffed',
                                                        border: '1px solid #52c41a',
                                                        marginRight: '4px',
                                                        borderRadius: '2px'
                                                    }}></div>
                                                    <span>Có thể đăng ký</span>
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
                                            eventOrder="id"
                                            dayMaxEvents={false}
                                            dayHeaderFormat={{ weekday: 'short' }}
                                            locale="vi"
                                            firstDay={1}
                                            weekends={true}
                                            eventDidMount={(info) => {
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

                    <RegistrationModal
                        openModal={openModal}
                        setOpenModal={setOpenModal}
                        dataInit={selectedDaySessions}
                        setDataInit={setSelectedDaySessions}
                        onRegistrationSuccess={handleRegistrationSuccess}
                    />
                </Row>
            )}
        </>
    );
};

export default ClientPeriodDetailPage;