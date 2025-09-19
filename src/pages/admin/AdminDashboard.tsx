import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
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
  Cell
} from 'recharts';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  BookOpen,
  ShoppingBag
} from 'lucide-react';

// Sample data for charts
const bookingData = [
  { name: 'Jan', bookings: 12 },
  { name: 'Feb', bookings: 19 },
  { name: 'Mar', bookings: 25 },
  { name: 'Apr', bookings: 32 },
  { name: 'May', bookings: 28 },
  { name: 'Jun', bookings: 35 }
];

const categoryData = [
  { name: 'Agriculture', value: 30, color: '#8884d8' },
  { name: 'Art & Craft', value: 25, color: '#82ca9d' },
  { name: 'Village Life', value: 25, color: '#ffc658' },
  { name: 'Food', value: 20, color: '#ff7300' }
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const quickStats = [
    {
      title: "Total Bookings",
      value: "151",
      change: "+12%",
      icon: Calendar,
      description: "This month"
    },
    {
      title: "Active Users",
      value: "89",
      change: "+8%",
      icon: Users,
      description: "Registered users"
    },
    {
      title: "Revenue",
      value: "₹45,231",
      change: "+23%",
      icon: DollarSign,
      description: "This month"
    },
    {
      title: "Experiences",
      value: "24",
      change: "+2",
      icon: BookOpen,
      description: "Active experiences"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Jatra admin dashboard
          </p>
        </div>
        <Button onClick={() => navigate('/admin/experiences')}>
          Add New Experience
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Booking Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Monthly booking statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Experience Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Experience Categories</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/admin/experiences')}
            >
              <BookOpen className="h-6 w-6 mb-2" />
              Manage Experiences
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/admin/bookings')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              View Bookings
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/admin/marketplace')}
            >
              <ShoppingBag className="h-6 w-6 mb-2" />
              Marketplace Items
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;