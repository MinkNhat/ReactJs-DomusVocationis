import { useState, useEffect, useRef } from 'react';
import { Col, Row, Card, Typography, Tag, App, Skeleton } from "antd";
import { CalendarOutlined, UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { ISession } from '@/types/backend';
import { callFetchSessionsByUser } from '@/config/api';
import { useAppSelector } from '@/redux/hooks';
import { PERIOD_SESSION_LIST } from '@/config/utils';

dayjs.locale('vi');

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: {
        activity: string;
        sessionTime: string;
        registrationDate: string;
    };
}

const SchedulePage = () => {
    const [userSessions, setUserSessions] = useState<ISession[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const calendarRef = useRef<FullCalendar | null>(null);
    const user = useAppSelector(state => state.account.user);
    const { message } = App.useApp();

    useEffect(() => {
        fetchUserSessions();
    }, []);

    const fetchUserSessions = async () => {
        setIsLoading(true);
        try {
            let res = await callFetchSessionsByUser("", user.id);
            if (res && res.data) {
                setUserSessions(res.data.result);
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu lịch cá nhân');
        } finally {
            setIsLoading(false);
        }
    };

    const getSessionTimeInfo = (sessionTime: string) => {
        return PERIOD_SESSION_LIST.find(s => s.value === sessionTime) || PERIOD_SESSION_LIST[0];
    };

    const getCalendarEvents = (): CalendarEvent[] => {
        return userSessions.map((session, index) => {
            const sessionInfo = getSessionTimeInfo(session.sessionTime);
            const sessionDate = dayjs(session.registrationDate);

            const startDateTime = sessionDate.format('YYYY-MM-DD') + 'T' + sessionInfo.startTime + ':00';
            const endDateTime = sessionDate.format('YYYY-MM-DD') + 'T' + sessionInfo.endTime + ':00';

            let backgroundColor = '#e6f7ff';
            let borderColor = '#1890ff';
            let textColor = '#1890ff';

            switch (session.sessionTime) {
                case 'ALL_DAY':
                    backgroundColor = '#f9f0ff';
                    borderColor = '#722ed1';
                    textColor = '#531dab';
                    break;
                case 'EXTRA':
                    backgroundColor = '#fff1f0';
                    borderColor = '#ff4d4f';
                    textColor = '#cf1322';
                    break;
            }

            return {
                id: `session_${session.id}`,
                title: `${session.activity}`,
                start: startDateTime,
                end: endDateTime,
                backgroundColor,
                borderColor,
                textColor,
                extendedProps: {
                    activity: session.activity,
                    sessionTime: session.sessionTime,
                    registrationDate: sessionDate.format('DD/MM/YYYY'),
                }
            };
        });
    };

    if (isLoading) {
        return <Skeleton active />;
    }

    return (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        <span>Lịch cá nhân</span>
                    </div>
                </div>
            }
        >
            <div style={{ height: '72vh' }}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'timeGridWeek,timeGridDay'
                    }}
                    buttonText={{
                        today: 'Hôm nay',
                        week: 'Tuần',
                        day: 'Ngày',
                    }}
                    events={getCalendarEvents()}
                    height="100%"
                    slotMinTime="05:00:00"
                    slotMaxTime="23:00:00"
                    allDaySlot={false}
                    locale="vi"
                    firstDay={1}
                    weekends={true}
                    nowIndicator={true}
                    eventDidMount={(info) => {
                        info.el.style.fontSize = '12px';
                        info.el.style.padding = '4px 8px';
                        info.el.style.borderRadius = '4px';
                        info.el.style.cursor = 'pointer';

                        const timeElement = info.el.querySelector('.fc-event-time') as HTMLElement;
                        if (timeElement) {
                            timeElement.style.display = 'none';
                        }

                        info.el.title = `${info.event.extendedProps.activity}\nBuổi: ${getSessionTimeInfo(info.event.extendedProps.sessionTime).label}`;
                    }}
                    dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'numeric' }}
                    slotLabelFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: false
                    }}
                />
            </div>
        </Card>
    );
};

export default SchedulePage;