import ActionToolbar from '@/components/ActionToolBar';
import RecentActivityTable from '@/components/RecentActivity';
import SalesReportCard from '@/components/SalesReport';
import StatCard from '@/components/StatCard';
import { TopCustomersCard } from '@/components/TopCustomerCard';
import TopProductsCard from '@/components/TopProductCard';
import Layout from '@/layouts/dashboard-layout';

const stats = [
  {
    title: 'Total Sales',
    value: '₹ 23,345',
    change: 3.46,
    changeLabel: 'Since last month',
    trend: 'up',
  },
  {
    title: 'New Customers',
    value: '842',
    change: 2.1,
    changeLabel: 'Since last week',
    trend: 'up',
  },
  {
    title: 'Refund Requests',
    value: '12',
    change: -1.2,
    changeLabel: 'Since last week',
    trend: 'down',
  },
  {
    title: 'Total Orders',
    value: '1,204',
    change: 5.8,
    changeLabel: 'Since last month',
    trend: 'up',
  },
];

const Dashboard = () => {
  return (
    <Layout>
      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <section className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-lg sm:text-xl font-semibold">
            Hello! <span className="text-blue-600">Username</span>
          </h1>
          <ActionToolbar />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            //@ts-ignore
            <StatCard key={index} {...stat} />
          ))}
        </section>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5 h-full">
            <SalesReportCard />
          </div>
          <div className="col-span-12 lg:col-span-7 h-full">
            <RecentActivityTable />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4 h-full">
            <TopProductsCard />
          </div>
          <div className="col-span-12 lg:col-span-8 h-full">
            <TopCustomersCard />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;
