import ActionToolbar from '@/components/ActionToolBar';
import RecentActivityTable from '@/components/RecentActivity';
import SalesReportCard from '@/components/SalesReport';
import StatCard from '@/components/StatCard';
import { TopCustomersCard } from '@/components/TopCustomerCard';
import TopProductsCard from '@/components/TopProductCard';
import { useProfile } from '@/contexts/ProfileContext';
import Layout from '@/layouts/dashboard-layout';
import { Navigate } from 'react-router-dom';

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
  const { profile, loading, error, isAuthenticated } = useProfile();

  // Redirect to login if not authenticated and not loading
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 ">
        {/* Header */}
        <section className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-lg sm:text-xl font-semibold">
            Hello! <span className="text-blue-600">{profile?.name || 'User'}</span>
          </h1>
          <ActionToolbar />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {stats.map((stat, index) => (
            //@ts-expect-error - StatCard props type mismatch
            <StatCard key={index} {...stat} />
          ))}
        </section>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5 h-full ">
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
