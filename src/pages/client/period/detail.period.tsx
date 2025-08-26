import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ICompany, IListSlots, IPeriod } from "@/types/backend";
import { callFetchCompanyById, callFetchPeriodById, callFetchSlotsByPeriod } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Badge, Typography, Card, Tag } from "antd";
import { EnvironmentOutlined, CalendarOutlined, TeamOutlined, ClockCircleOutlined } from "@ant-design/icons";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface User {
    id: number;
    full_name: string;
}

interface Slot {
    id: number;
    registrationDate: string;
    sessionTime: string;
    users: User[];
}

interface SlotData {
    id: number;
    slots: Slot[];
}

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: {
        sessionTime: string;
        users: User[];
        isAvailable: boolean;
    };
}

const ClientPeriodDetailPage = (props: any) => {
    const [periodDetail, setPeriodDetail] = useState<IPeriod | null>(null);
    const [listSlot, setListSlot] = useState<IListSlots | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)

                const resPeriod = await callFetchPeriodById(id);
                if (resPeriod?.data) {
                    setPeriodDetail(resPeriod.data);
                }

                const resSlots = await callFetchSlotsByPeriod(id);
                if (resSlots?.data) {
                    setListSlot(resSlots.data);
                }

                setIsLoading(false)
            }
        }

        init();
    }, [id]);

    // Convert slots to FullCalendar events
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
                title += ': Available';
            }

            events.push({
                id: `slot-${slot.id}-${index}`,
                title,
                date,
                backgroundColor,
                borderColor,
                textColor,
                extendedProps: {
                    sessionTime: slot.sessionTime,
                    users: slot.users || [],
                    isAvailable: !hasUsers
                }
            });
        });

        return events;
    };

    // Get period status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPENING': return 'green';
            case 'CLOSED': return 'red';
            case 'PENDING': return 'orange';
            default: return 'default';
        }
    };

    // Get session time display
    const getSessionTimeDisplay = (sessionTime: string) => {
        switch (sessionTime) {
            case 'MORNING': return 'Buổi sáng';
            case 'AFTERNOON': return 'Buổi chiều';
            case 'EVENING': return 'Buổi tối';
            default: return sessionTime;
        }
    };

    // Handle event click
    const handleEventClick = (clickInfo: any) => {
        const { extendedProps } = clickInfo.event;
        const sessionTime = getSessionTimeDisplay(extendedProps.sessionTime);

        if (extendedProps.users.length > 0) {
            const userNames = extendedProps.users.map((u: User) => u.full_name).join('\n');
            alert(`${sessionTime}\n\nRegistered users:\n${userNames}`);
        } else {
            alert(`${sessionTime}\n\nThis session is available for registration.`);
        }
    };

    // Define valid date range
    const getValidRange = () => {
        if (!periodDetail || !periodDetail.startDate || !periodDetail.endDate) return {};

        return {
            start: dayjs(periodDetail.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
            end: dayjs(periodDetail.endDate, 'DD-MM-YYYY').add(1, 'day').format('YYYY-MM-DD')
        };
    };

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
                                            <Tag color={getStatusColor(periodDetail.status)} style={{ fontSize: '14px', padding: '4px 12px' }}>
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
                                            plugins={[dayGridPlugin, interactionPlugin]}
                                            initialView="dayGridMonth"
                                            headerToolbar={{
                                                left: 'prev,next today',
                                                center: 'title',
                                                right: 'dayGridMonth,dayGridWeek'
                                            }}
                                            events={getCalendarEvents()}
                                            eventClick={handleEventClick}
                                            validRange={getValidRange()}
                                            height="100%"
                                            eventDisplay="block"
                                            dayMaxEvents={false}
                                            eventBackgroundColor="#f6ffed"
                                            eventBorderColor="#52c41a"
                                            eventTextColor="#389e0d"
                                            dayHeaderFormat={{ weekday: 'short' }}
                                            locale="en"
                                            firstDay={1}
                                            weekends={true}
                                            eventDidMount={(info) => {
                                                // Add custom styling based on event properties
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
                                                info.el.style.margin = '1px 0';
                                                info.el.style.borderRadius = '4px';
                                                info.el.style.cursor = 'pointer';
                                            }}
                                            dayCellDidMount={(info) => {
                                                // Style disabled dates
                                                const validRange = getValidRange();
                                                const cellDate = dayjs(info.date).format('YYYY-MM-DD');
                                                const startDate = validRange.start;
                                                const endDate = validRange.end ? dayjs(validRange.end).subtract(1, 'day').format('YYYY-MM-DD') : undefined;

                                                if (
                                                    (startDate && cellDate < startDate) ||
                                                    (endDate && cellDate > endDate)
                                                ) {
                                                    info.el.style.backgroundColor = '#f5f5f5';
                                                    info.el.style.color = '#bfbfbf';
                                                }
                                            }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                        </>
                    )}
                </Row>
            )}
        </>
    );
};

export default ClientPeriodDetailPage;