"use client";

import React, { useState, useEffect } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { apiUrls } from "../apis";
import apiClient from "../apis/apiClient";
import ViewSkeletonLoader from "../components/ViewSkeletonLoader";
import {
  UserCheck,
  Building,
  AlertCircle,
  Settings,
  ChevronRight,
  Users,
  UserPlus,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  Zap,
  Shield,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format, parseISO } from "date-fns";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number | {
      total: number;
      active: number;
    };
    agents: number;
    vendors: number | {
      total: number;
      active: number;
      pending: number;
    };
  };
  admins?: {
    total: number;
    active: number;
  };
  totalClients: { total: number; active: number };
  userActivity: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    last30Days: number;
  };
  recentActivities: {
    list: Array<{
      type: string;
      message: string;
      timestamp: string;
      status: string;
      user?: {
        name: string;
        email: string;
        mobile: string;
        role: string;
      };
    }>;
  };
  charts: {
    usersByRole: Array<{ _id: string; count: number }>;
    usersByStatus: Array<{ _id: boolean; count: number }>;
    usersByCreationDate: Array<{
      _id: { year: number; month: number; day: number };
      count: number;
    }>;
    monthlyUserRegistrations: Array<{
      _id: { year: number; month: number };
      count: number;
    }>;
    topRoles: Array<{
      _id: string;
      count: number;
      activeCount: number;
      activePercentage: number;
    }>;
    userActivity: {
      today: number;
      thisWeek: number;
      thisMonth: number;
      last30Days: number;
      totalActive: number;
      totalInactive: number;
    };
  };
}

export default function DashboardPage() {
  const { canAccessDashboard, currentUser } = usePermissions();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<any[]>([]);
  const router = useRouter();
  const [vendorsDaily, setVendorsDaily] = useState<Array<{ date: string; count: number }>>([]);
  const [vendorsDailyLoading, setVendorsDailyLoading] = useState<boolean>(true);
  const [totalVendorsCount, setTotalVendorsCount] = useState<number>(0);
  const [activeVendorsCount, setActiveVendorsCount] = useState<number>(0);
  const [pendingVendorsCount, setPendingVendorsCount] = useState<number>(0);


  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await apiClient.get(apiUrls.dashboardStats);
        if (response.data?.status === "success") {
          const statsData = response.data.stats;
          
          // Extract vendor counts from API response if available
          if (statsData?.vendors && typeof statsData.vendors === 'object') {
            setTotalVendorsCount(statsData.vendors.total || 0);
            setActiveVendorsCount(statsData.vendors.active || 0);
            setPendingVendorsCount(statsData.vendors.pending || 0);
            
            // Update users.vendors to match the structure
            if (statsData.users) {
              statsData.users.vendors = {
                total: statsData.vendors.total || 0,
                active: statsData.vendors.active || 0,
                pending: statsData.vendors.pending || 0,
              };
            }
          }
          
          // Handle admins object if it exists at top level
          if (statsData?.admins && typeof statsData.admins === 'object') {
            // Keep the top-level admins object
            // Also update users.admins if it's not already an object
            if (statsData.users && typeof statsData.users.admins !== 'object') {
              statsData.users.admins = {
                total: statsData.admins.total || 0,
                active: statsData.admins.active || 0,
              };
            }
          } else if (statsData?.users?.admins && typeof statsData.users.admins === 'object') {
            // If admins is an object in users, ensure it's properly structured
            // This is already handled by the interface
          }
          
          setStats({
            ...statsData,
            recentActivities: response.data.recentActivities || { list: [] },
            charts: response.data.charts || {
              usersByRole: [],
              usersByStatus: [],
              usersByCreationDate: [],
              monthlyUserRegistrations: [],
              topRoles: [],
              userActivity: {
                today: 0,
                thisWeek: 0,
                thisMonth: 0,
                last30Days: 0,
                totalActive: 0,
                totalInactive: 0,
              },
            },
          });
        } else {
          // API response not successful, set error
          setError("Failed to load dashboard stats. Please try again.");
          setStats(null);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        setError(error?.response?.data?.message || error?.message || "Failed to load dashboard stats. Please try again.");
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (canAccessDashboard()) {
      fetchDashboardStats();
    } else {
      setIsLoading(false);
    }
  }, [canAccessDashboard]);

  // Fetch vendor counts from API if not available in dashboard stats
  useEffect(() => {
    const fetchVendorCounts = async () => {
      // Only fetch if we don't have vendor counts from dashboard stats
      if (totalVendorsCount === 0 && activeVendorsCount === 0 && pendingVendorsCount === 0) {
        try {
          const response = await apiClient.get(apiUrls.getAllVendorsAll);
          const vendors = response?.data?.vendors || response?.data?.data?.vendors || response?.data?.data || [];
          const vendorsArray = Array.isArray(vendors) ? vendors : [];
          
          // Total vendors count
          const total = vendorsArray.length;
          setTotalVendorsCount(total);
          
          // Active vendors: vendors with status "approved" or with subscriptions
          const active = vendorsArray.filter((vendor: any) => {
            const status = vendor.status?.toLowerCase();
            const hasSubscription = vendor.currentSubscription || 
                                    (vendor.subscription && Array.isArray(vendor.subscription) && vendor.subscription.length > 0) ||
                                    (vendor.subscription && !Array.isArray(vendor.subscription));
            return status === "approved" || hasSubscription;
          }).length;
          setActiveVendorsCount(active);
          
          // Pending vendors: vendors with status "pending"
          const pending = vendorsArray.filter((vendor: any) => {
            const status = vendor.status?.toLowerCase();
            return status === "pending";
          }).length;
          setPendingVendorsCount(pending);
        } catch (error: any) {
          console.error("Error fetching vendor counts:", error);
          // Keep the count from stats if API fails
        }
      }
    };

    if (canAccessDashboard()) {
      fetchVendorCounts();
    }
  }, [canAccessDashboard, totalVendorsCount, activeVendorsCount, pendingVendorsCount]);

  // Fetch: Daily vendors acquired by Advisor
  useEffect(() => {
    const fetchDaily = async () => {
      try {
        setVendorsDailyLoading(true);
        const res = await apiClient.get(apiUrls.vendorsByAgentDaily);
        const raw = res?.data;
        let list: any[] = [];

        // Accept common shapes: {data: [...]}, {points: [...]}, direct array
        if (Array.isArray(raw)) list = raw;
        else if (Array.isArray(raw?.data)) list = raw.data;
        else if (Array.isArray(raw?.points)) list = raw.points;
        else if (Array.isArray(raw?.stats)) list = raw.stats;

        // Normalize: support {date, count} or {_id:{year,month,day}, count}
        const normalized = (list || [])
          .map((item) => {
            if (!item) return null;
            if (item.date && item.count != null) {
              return { date: item.date, count: Number(item.count) || 0 };
            }
            if (item._id && typeof item._id === "object" && item.count != null) {
              const y = item._id.year || item._id.y || item._id.Y;
              const m = (item._id.month || item._id.m || 1) - 1; // zero-based
              const d = item._id.day || item._id.d || 1;
              const dt = new Date(y, m, d);
              return { date: dt.toISOString(), count: Number(item.count) || 0 };
            }
            if (item.createdAt && item.count != null) {
              return { date: item.createdAt, count: Number(item.count) || 0 };
            }
            return null;
          })
          .filter(Boolean) as Array<{ date: string; count: number }>;

        // Aggregate by date string (YYYY-MM-DD)
        const map = new Map<string, number>();
        normalized.forEach((p) => {
          const key = format(parseISO(p.date), "yyyy-MM-dd");
          map.set(key, (map.get(key) || 0) + (p.count || 0));
        });

        const result = Array.from(map.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => (a.date < b.date ? -1 : 1));
        setVendorsDaily(result);
      } catch (e: any) {
        // Silently handle 404 errors for optional endpoint
        if (e?.response?.status !== 404) {
          console.error("Failed to load vendorsByAgentDaily:", e);
        }
        // Set empty array for 404 or other errors
        setVendorsDaily([]);
      } finally {
        setVendorsDailyLoading(false);
      }
    };

    if (canAccessDashboard()) fetchDaily();
  }, [canAccessDashboard]);

  // Only use stats from API, no fallback to mock data
  const displayStats = stats;

  // Debug log to see what data we're working with
  console.log("Dashboard Stats:", displayStats);

  if (isLoading) {
    return <ViewSkeletonLoader />;
  }

  if (!canAccessDashboard()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-500">
            You don't have permission to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-500 mb-4">{error || "Failed to load dashboard data. Please try again."}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening with your system.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors"
              >
                <RefreshCw size={20} />
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {format(new Date(), "MMM dd, yyyy HH:mm")}
              </div>
            </div>

            {/* Daily Vendors Acquired (by Advisor) */}
           
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernStatsCard
            title="Total Users"
            value={displayStats?.users?.total || 0}
            subtitle={`${displayStats?.users?.active || 0} active`}
            icon={<Users className="w-8 h-8" />}
            gradient="from-blue-500 to-blue-600"
            onClick={() => router.push("/dashboard/customermanagement")}
          />
          <ModernStatsCard
            title="Admins"
            value={(() => {
              // First try to get from topRoles array
              const adminRole = displayStats?.charts?.topRoles?.find((role: any) => role._id === 'admin');
              if (adminRole && adminRole.count !== undefined) {
                return Number(adminRole.count) || 0;
              }
              // Fallback to other sources
              if (typeof displayStats?.admins === 'object' && displayStats?.admins?.total !== undefined) {
                return Number(displayStats.admins.total) || 0;
              }
              if (typeof displayStats?.users?.admins === 'object' && displayStats?.users?.admins?.total !== undefined) {
                return Number(displayStats.users.admins.total) || 0;
              }
              if (typeof displayStats?.users?.admins === 'number') {
                return displayStats.users.admins;
              }
              return 0;
            })()}
            subtitle={`${(() => {
              // First try to get from topRoles array
              const adminRole = displayStats?.charts?.topRoles?.find((role: any) => role._id === 'admin');
              if (adminRole && adminRole.activeCount !== undefined) {
                return Number(adminRole.activeCount) || 0;
              }
              // Fallback to other sources
              if (typeof displayStats?.admins === 'object' && displayStats?.admins?.active !== undefined) {
                return Number(displayStats.admins.active) || 0;
              }
              if (typeof displayStats?.users?.admins === 'object' && displayStats?.users?.admins?.active !== undefined) {
                return Number(displayStats.users.admins.active) || 0;
              }
              return 0;
            })()} active`}
            icon={<Shield className="w-8 h-8" />}
            gradient="from-indigo-500 to-indigo-600"
            onClick={() => router.push("/dashboard/usermanagement")}
          />
          <ModernStatsCard
            title="Advisor"
            value={typeof displayStats?.totalClients === 'object' && displayStats?.totalClients?.total !== undefined 
              ? Number(displayStats.totalClients.total) || 0 
              : 0}
            subtitle={`${typeof displayStats?.totalClients === 'object' && displayStats?.totalClients?.active !== undefined 
              ? Number(displayStats.totalClients.active) || 0 
              : 0} active`}
            icon={<UserCheck className="w-8 h-8" />}
            gradient="from-emerald-500 to-emerald-600"
            onClick={() => router.push("/dashboard/clientmanagement")}
          />
          <ModernStatsCard
            title="Vendors"
            value={totalVendorsCount || (typeof displayStats?.users?.vendors === 'object' ? displayStats.users.vendors.total : (typeof displayStats?.users?.vendors === 'number' ? displayStats.users.vendors : 0))}
            subtitle={`${activeVendorsCount} active, ${pendingVendorsCount} pending`}
            icon={<Building className="w-8 h-8" />}
            gradient="from-purple-500 to-purple-600"
            onClick={() => router.push("/dashboard/vendormanagement")}
          />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <QuickStatCard
            title="Active Team"
            value={displayStats?.users?.active || 0}
            icon={<Activity className="w-6 h-6" />}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <QuickStatCard
            title="Inactive Team"
            value={displayStats?.users?.inactive || 0}
            icon={<XCircle className="w-6 h-6" />}
            color="text-red-600"
            bgColor="bg-red-100"
          />
          <QuickStatCard
            title="New This Month"
            value={displayStats?.userActivity?.thisMonth || 0}
            icon={<UserPlus className="w-6 h-6" />}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <QuickStatCard
            title="Registered Today"
            value={displayStats?.userActivity?.today || 0}
            icon={<Award className="w-6 h-6" />}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Charts and Analytics */}
          <div className="xl:col-span-2 space-y-8">
            {/* User Role Distribution */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  User Distribution
                </h3>
                <PieChart className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Total Users */}
                <div
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => router.push("/dashboard/customermanagement")}
                >
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {displayStats?.users?.total || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {displayStats?.users?.active ? `${displayStats.users.active} active` : ''}
                    </p>
                  </div>
                </div>

                {/* Admins */}
                <div
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => router.push("/dashboard/usermanagement")}
                >
                  <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      Admins
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        // First try to get from topRoles array
                        const adminRole = displayStats?.charts?.topRoles?.find((role: any) => role._id === 'admin');
                        if (adminRole && adminRole.count !== undefined) {
                          return Number(adminRole.count) || 0;
                        }
                        // Fallback to other sources
                        if (typeof displayStats?.admins === 'object' && displayStats?.admins?.total !== undefined) {
                          return Number(displayStats.admins.total) || 0;
                        }
                        if (typeof displayStats?.users?.admins === 'object' && displayStats?.users?.admins?.total !== undefined) {
                          return Number(displayStats.users.admins.total) || 0;
                        }
                        if (typeof displayStats?.users?.admins === 'number') {
                          return displayStats.users.admins;
                        }
                        return 0;
                      })()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        const adminRole = displayStats?.charts?.topRoles?.find((role: any) => role._id === 'admin');
                        if (adminRole && adminRole.activeCount !== undefined) {
                          return `${Number(adminRole.activeCount) || 0} active`;
                        }
                        return '';
                      })()}
                    </p>
                  </div>
                </div>

                {/* Advisor */}
                <div
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => router.push("/dashboard/clientmanagement")}
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      Advisor
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof displayStats?.totalClients === 'object' && displayStats?.totalClients?.total !== undefined 
                        ? Number(displayStats.totalClients.total) || 0 
                        : 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {typeof displayStats?.totalClients === 'object' && displayStats?.totalClients?.active !== undefined 
                        ? `${Number(displayStats.totalClients.active) || 0} active` 
                        : ''}
                    </p>
                  </div>
                </div>

                {/* Vendors */}
                <div
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => router.push("/dashboard/vendormanagement")}
                >
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      Vendors
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        // First try to use the same data source as main Vendors card
                        const vendorCount = totalVendorsCount || (typeof displayStats?.users?.vendors === 'object' ? displayStats.users.vendors.total : (typeof displayStats?.users?.vendors === 'number' ? displayStats.users.vendors : 0));
                        if (vendorCount > 0) {
                          return vendorCount;
                        }
                        // Fallback to topRoles array if no other data available
                        const vendorRole = displayStats?.charts?.topRoles?.find((role: any) => 
                          role._id?.toLowerCase() === 'vendor' || role._id?.toLowerCase() === 'vendors'
                        );
                        if (vendorRole && vendorRole.count !== undefined) {
                          return Number(vendorRole.count) || 0;
                        }
                        return 0;
                      })()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        // First try to use activeVendorsCount (same as main card)
                        if (activeVendorsCount > 0) {
                          return `${activeVendorsCount} active`;
                        }
                        // Fallback to topRoles if available
                        const vendorRole = displayStats?.charts?.topRoles?.find((role: any) => 
                          role._id?.toLowerCase() === 'vendor' || role._id?.toLowerCase() === 'vendors'
                        );
                        if (vendorRole && vendorRole.activeCount !== undefined) {
                          return `${Number(vendorRole.activeCount) || 0} active`;
                        }
                        // Also check displayStats.users.vendors.active
                        if (typeof displayStats?.users?.vendors === 'object' && displayStats.users.vendors.active !== undefined) {
                          return `${Number(displayStats.users.vendors.active) || 0} active`;
                        }
                        return '';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Activity Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  User Activity Overview
                </h3>
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-4">
                <UserActivityCard
                  label="Recently Registered"
                  count={displayStats?.userActivity?.thisMonth || 0}
                  color="text-blue-600"
                  bgColor="bg-blue-100"
                  icon={<UserPlus className="w-5 h-5" />}
                  description="New users this month"
                />
                <UserActivityCard
                  label="Active Users"
                  count={displayStats?.users?.active || 0}
                  color="text-green-600"
                  bgColor="bg-green-100"
                  icon={<CheckCircle className="w-5 h-5" />}
                  description="Currently active users"
                />
                <UserActivityCard
                  label="Inactive Users"
                  count={displayStats?.users?.inactive || 0}
                  color="text-red-600"
                  bgColor="bg-red-100"
                  icon={<XCircle className="w-5 h-5" />}
                  description="Currently inactive users"
                />
                <UserActivityCard
                  label="Total Admins"
                  count={(() => {
                    // First try to get from topRoles array
                    const adminRole = displayStats?.charts?.topRoles?.find((role: any) => role._id === 'admin');
                    if (adminRole && adminRole.count !== undefined) {
                      return Number(adminRole.count) || 0;
                    }
                    // Fallback to other sources
                    if (typeof displayStats?.admins === 'object' && displayStats?.admins?.total !== undefined) {
                      return Number(displayStats.admins.total) || 0;
                    }
                    if (typeof displayStats?.users?.admins === 'object' && displayStats?.users?.admins?.total !== undefined) {
                      return Number(displayStats.users.admins.total) || 0;
                    }
                    if (typeof displayStats?.users?.admins === 'number') {
                      return displayStats.users.admins;
                    }
                    return 0;
                  })()}
                  color="text-indigo-600"
                  bgColor="bg-indigo-100"
                  icon={<Shield className="w-5 h-5" />}
                  description="Administrative users"
                />
                <UserActivityCard
                  label="Total Advisor"
                  count={typeof displayStats?.totalClients === 'object' && displayStats?.totalClients?.total !== undefined 
                    ? Number(displayStats.totalClients.total) || 0 
                    : 0}
                  color="text-emerald-600"
                  bgColor="bg-emerald-100"
                  icon={<UserCheck className="w-5 h-5" />}
                  description="Advisor users"
                />
                <UserActivityCard
                  label="Total Vendors"
                  count={(() => {
                    // First try to get from topRoles array (check both 'vendor' and 'vendors')
                    const vendorRole = displayStats?.charts?.topRoles?.find((role: any) => 
                      role._id?.toLowerCase() === 'vendor' || role._id?.toLowerCase() === 'vendors'
                    );
                    if (vendorRole && vendorRole.count !== undefined) {
                      return Number(vendorRole.count) || 0;
                    }
                    // Fallback to other sources
                    return totalVendorsCount || (typeof displayStats?.users?.vendors === 'object' ? displayStats.users.vendors.total : (typeof displayStats?.users?.vendors === 'number' ? displayStats.users.vendors : 0));
                  })()}
                  color="text-purple-600"
                  bgColor="bg-purple-100"
                  icon={<Building className="w-5 h-5" />}
                  description="Total vendor users"
                />
                <UserActivityCard
                  label="Active Vendors"
                  count={(() => {
                    // First try to get from topRoles array (check both 'vendor' and 'vendors')
                    const vendorRole = displayStats?.charts?.topRoles?.find((role: any) => 
                      role._id?.toLowerCase() === 'vendor' || role._id?.toLowerCase() === 'vendors'
                    );
                    if (vendorRole && vendorRole.activeCount !== undefined) {
                      return Number(vendorRole.activeCount) || 0;
                    }
                    // Fallback to other sources
                    return typeof displayStats?.users?.vendors === 'object' ? displayStats.users.vendors.active : activeVendorsCount;
                  })()}
                  color="text-green-600"
                  bgColor="bg-green-100"
                  icon={<CheckCircle className="w-5 h-5" />}
                  description="Vendors with subscriptions (approved)"
                />
                <UserActivityCard
                  label="Pending Vendors"
                  count={typeof displayStats?.users?.vendors === 'object' ? displayStats.users.vendors.pending : pendingVendorsCount}
                  color="text-yellow-600"
                  bgColor="bg-yellow-100"
                  icon={<AlertCircle className="w-5 h-5" />}
                  description="Vendors pending approval"
                />
                <UserActivityCard
                  label="Registered Today"
                  count={displayStats?.userActivity?.today || 0}
                  color="text-cyan-600"
                  bgColor="bg-cyan-100"
                  icon={<Calendar className="w-5 h-5" />}
                  description="New users today"
                />
                <UserActivityCard
                  label="This Week"
                  count={displayStats?.userActivity?.thisWeek || 0}
                  color="text-orange-600"
                  bgColor="bg-orange-100"
                  icon={<TrendingUp className="w-5 h-5" />}
                  description="New users this week"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity and Quick Actions */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Recent Activity
                </h3>
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {displayStats?.recentActivities?.list &&
                displayStats.recentActivities.list.length > 0 ? (
                  displayStats.recentActivities.list
                    .slice(0, 8)
                    .map((activity: any, index: number) => {
                      // Determine navigation path based on activity content
                      const getNavigationPath = () => {
                        const message = (activity.message || '').toLowerCase();
                        const type = (activity.type || '').toLowerCase();
                        const userRole = activity.user?.role?.toLowerCase() || '';
                        const userId = activity.userId || activity.user?._id || activity._id || activity.id;
                        
                        // Check for advisor-related keywords
                        if (message.includes('advisor') || message.includes('agent') || type === 'advisor' || type === 'agent' || userRole === 'agent' || userRole === 'advisor') {
                          if (userId) {
                            return `/dashboard/clientmanagement/viewclient?id=${userId}`;
                          }
                          return '/dashboard/clientmanagement';
                        }
                        // Check for admin-related keywords
                        if (message.includes('admin') || type === 'admin' || userRole === 'admin') {
                          if (userId) {
                            return `/dashboard/clientmanagement/viewclient?id=${userId}`;
                          }
                          return '/dashboard/clientmanagement';
                        }
                        // Check for vendor-related keywords
                        if (message.includes('vendor') || type === 'vendor' || userRole === 'vendor') {
                          if (userId) {
                            return `/dashboard/vendormanagement/view?id=${userId}`;
                          }
                          return '/dashboard/vendormanagement';
                        }
                        // Check for user-related keywords
                        if (message.includes('user') || type === 'user') {
                          if (userId) {
                            return `/dashboard/customermanagement/viewclient?id=${userId}`;
                          }
                          return '/dashboard/customermanagement';
                        }
                        // Default to null if no match (no navigation)
                        return null;
                      };
                      
                      const handleClick = (e?: React.MouseEvent) => {
                        if (e) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                        const path = getNavigationPath();
                        if (path) {
                          router.push(path);
                        }
                      };
                      
                      return (
                        <ActivityItem
                          key={index}
                          type={activity.type}
                          message={activity.message}
                          timestamp={activity.timestamp}
                          status={activity.status}
                          onClick={handleClick}
                        />
                      );
                    })
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400">
                      User activities will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Quick Actions
                </h3>
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton
                  icon={<UserPlus className="w-5 h-5" />}
                  label="Add Admin"
                  onClick={() => router.push("/dashboard/usermanagement/add")}
                  color="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                />
                <QuickActionButton
                  icon={<Building className="w-5 h-5" />}
                  label="Add Advisor"
                  onClick={() => router.push("/dashboard/clientmanagement/add")}
                  color="bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                />
                <QuickActionButton
                  icon={<Settings className="w-5 h-5" />}
                  label="Add Vendor"
                  onClick={() => router.push("/dashboard/vendormanagement/add")}
                  color="bg-purple-500 hover:bg-purple-600 cursor-pointer"
                />
                <QuickActionButton
                  icon={<Award className="w-5 h-5" />}
                  label="Manage Roles"
                  onClick={() => router.push("/dashboard/rolemanagement")}
                  color="bg-indigo-500 hover:bg-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* User Management Health */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  User Management Health
                </h3>
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-4">
                <HealthMetric
                  label="Active User Rate"
                  value={`${(
                    ((displayStats?.users?.active || 0) /
                      (displayStats?.users?.total || 1)) *
                    100
                  ).toFixed(1)}%`}
                  color="text-green-600"
                  bgColor="bg-green-100"
                />
                <HealthMetric
                  label="Admin Coverage"
                  value={`${(
                    ((typeof displayStats?.admins === 'object' && displayStats?.admins?.total !== undefined
                      ? Number(displayStats.admins.total) || 0
                      : (typeof displayStats?.users?.admins === 'object' && displayStats?.users?.admins?.total !== undefined
                        ? Number(displayStats.users.admins.total) || 0
                        : (typeof displayStats?.users?.admins === 'number' ? displayStats.users.admins : 0))) /
                      (displayStats?.users?.total || 1)) *
                    100
                  ).toFixed(1)}%`}
                  color="text-indigo-600"
                  bgColor="bg-indigo-100"
                />
                <HealthMetric
                  label="Advisor Distribution"
                  value={`${(
                    ((typeof displayStats?.totalClients === 'object' && displayStats?.totalClients?.total !== undefined 
                      ? Number(displayStats.totalClients.total) || 0 
                      : 0) /
                      (displayStats?.users?.total || 1)) *
                    100
                  ).toFixed(1)}%`}
                  color="text-emerald-600"
                  bgColor="bg-emerald-100"
                />
                <HealthMetric
                  label="Vendor Distribution"
                  value={`${(
                    ((typeof displayStats?.users?.vendors === 'object' ? displayStats.users.vendors.total : (displayStats?.users?.vendors || 0)) /
                      (displayStats?.users?.total || 1)) *
                    100
                  ).toFixed(1)}%`}
                  color="text-purple-600"
                  bgColor="bg-purple-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modern Stats Card Component
function ModernStatsCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  onClick,
  trend,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-xl hover:shadow-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out group text-white`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm`}
          >
            {trend.isPositive ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{trend.value}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : Number(value) || 0}
        </p>
        <p className="text-sm text-white/70">{subtitle}</p>
      </div>
      <div className="mt-4 flex items-center text-white/60 group-hover:text-white transition-colors">
        <span className="text-sm">View Details</span>
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

// Quick Stat Card Component
function QuickStatCard({
  title,
  value,
  icon,
  color,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${bgColor} ${color}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value : Number(value) || 0}</p>
        </div>
      </div>
    </div>
  );
}

// User Activity Card Component
function UserActivityCard({
  label,
  count,
  color,
  bgColor,
  icon,
  description,
}: {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${bgColor} ${color}`}>{icon}</div>
        <div>
          <span className="font-medium text-gray-700">{label}</span>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <span className={`text-xl font-bold ${color}`}>{typeof count === 'number' ? count : Number(count) || 0}</span>
    </div>
  );
}

// Activity Item Component
function ActivityItem({
  type,
  message,
  timestamp,
  status,
  onClick,
}: {
  type: string;
  message: string;
  timestamp: string;
  status: string;
  onClick?: (e?: React.MouseEvent) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return <UserPlus className="w-4 h-4" />;
      case "complaint":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div 
      className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className={`p-2 rounded-full ${getStatusColor(status)}`}>
        {getTypeIcon(type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{message}</p>
        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({
  icon,
  label,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white p-3 rounded-lg hover:shadow-lg transition-all duration-200 flex flex-col items-center space-y-2`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

// Health Metric Component
function HealthMetric({
  label,
  value,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 backdrop-blur-sm">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className={`px-3 py-1 rounded-full ${bgColor} ${color} font-bold`}>
        {value}
      </div>
    </div>
  );
}

// Helper function to get role colors
function getRoleColor(role: string) {
  switch (role?.toLowerCase()) {
    case "admin":
      return "bg-indigo-500";
    case "advisor":
      return "bg-emerald-500";
    case "vendor":
      return "bg-purple-500";
    case "user":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}
