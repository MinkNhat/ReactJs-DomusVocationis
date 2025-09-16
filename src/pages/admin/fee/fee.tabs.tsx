import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import JobPage from './job';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';
import FeeTypePage from './fee-type';

const FeeTabs = () => {
    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Các Thanh toán',
            children: <JobPage />,
        },
        {
            key: '2',
            label: 'Các Loại Phí',
            children: <FeeTypePage />,
        },

    ];
    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.FEE_TYPES.GET_PAGINATE}
            >
                <Tabs
                    defaultActiveKey="1"
                    items={items}
                    onChange={onChange}
                />
            </Access>
        </div>
    );
}

export default FeeTabs;