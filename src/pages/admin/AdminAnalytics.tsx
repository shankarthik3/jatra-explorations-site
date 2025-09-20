import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  Gift,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Sample seasonal data
const seasonalData = [
  { name: 'Winter', bookings: 45, revenue: 15000 },
  { name: 'Spring', bookings: 78, revenue: 26000 },
  { name: 'Summer', bookings: 120, revenue: 40000 },
  { name: 'Monsoon', bookings: 35, revenue: 12000 }
];

const ecoPointsData = [
  { name: 'Earned', value: 1250, color: '#22c55e' },
  { name: 'Redeemed', value: 890, color: '#f59e0b' },
  { name: 'Pending', value: 360, color: '#3b82f6' }
];

const popularExperiences = [
  { name: 'Village Life Experience', bookings: 85, rating: 4.8 },
  { name: 'Handicraft Workshop', bookings: 67, rating: 4.6 },
  { name: 'Agricultural Tourism', bookings: 52, rating: 4.7 },
  { name: 'Traditional Cooking', bookings: 41, rating: 4.9 }
];

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Load user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Load booking count and revenue
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_amount');

      const totalRevenue = bookings?.reduce((sum, booking) => 
        sum + (parseFloat(booking.total_amount?.toString() || '0')), 0) || 0;

      // Load average rating from reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating');

      const avgRating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
        : 0;

      setStats({
        totalUsers: userCount || 0,
        totalBookings: bookings?.length || 0,
        totalRevenue,
        avgRating
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyticsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      change: "+12%",
      trend: "up",
      icon: Users,
      description: "Registered users"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      change: "+8%",
      trend: "up",
      icon: Calendar,
      description: "All time bookings"
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: "+23%",
      trend: "up",
      icon: DollarSign,
      description: "All time revenue"
    },
    {
      title: "Average Rating",
      value: stats.avgRating.toFixed(1),
      change: "+0.2",
      trend: "up",
      icon: Star,
      description: "User satisfaction"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendIcon className={`h-3 w-3 ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={card.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {card.change}
                  </span>
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Seasonal Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Booking Trends</CardTitle>
            <CardDescription>Bookings and revenue by season</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={seasonalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Eco Points Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Eco Points Summary
            </CardTitle>
            <CardDescription>Points earned vs redeemed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ecoPointsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {ecoPointsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Experiences */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Experiences</CardTitle>
          <CardDescription>Most booked experiences with ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularExperiences.map((experience, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{experience.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {experience.bookings} bookings
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{experience.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Timeline</CardTitle>
          <CardDescription>Monthly revenue trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={seasonalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;