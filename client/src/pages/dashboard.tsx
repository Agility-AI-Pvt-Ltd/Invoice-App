import { useEffect, useState } from 'react';
import ActionToolbar from '@/components/ActionToolBar';
import RecentActivityTable from '@/components/RecentActivity';
import SalesReportCard from '@/components/SalesReport';
import StatCard from '@/components/StatCard';
import { TopCustomersCard } from '@/components/TopCustomerCard';
import TopProductsCard from '@/components/TopProductCard';
import { useProfile } from '@/contexts/ProfileContext';
import Layout from '@/layouts/dashboard-layout';
import { Navigate } from 'react-router-dom';
import { getDashboardStats, type DashboardStat } from '@/services/api/dashboard';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const { profile, loading, error, isAuthenticated } = useProfile();
  const [stats, setStats] = useState<DashboardStat[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get('authToken');
        if (!token){
          console.error('No authentication token found');
          return;
        } 
        const data = await getDashboardStats(token);
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
    <>
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
            // @ts-expect-error - StatCard props type mismatch
            <StatCard
              key={index}
              {...stat}
              value={
                typeof stat.value === 'number'
                  ? stat.title === 'Total Sales'
                    ? `₹ ${stat.value.toLocaleString()}`
                    : stat.value.toLocaleString()
                  : stat.value
              }
            />
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
    </>
  );
};

export default Dashboard;
