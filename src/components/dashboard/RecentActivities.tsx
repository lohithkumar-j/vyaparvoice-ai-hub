import { ShoppingCart, User, Package, TrendingUp } from "lucide-react";

const RecentActivities = () => {
  const activities = [
    {
      icon: ShoppingCart,
      title: "New Sale",
      description: "Rice - 25kg sold to Rajesh Kumar",
      time: "2 minutes ago",
      color: "success",
    },
    {
      icon: Package,
      title: "Low Stock Alert",
      description: "Cooking Oil - 1L needs reorder",
      time: "15 minutes ago",
      color: "destructive",
    },
    {
      icon: User,
      title: "New Customer",
      description: "Sneha Reddy added to ledger",
      time: "1 hour ago",
      color: "secondary",
    },
    {
      icon: TrendingUp,
      title: "Revenue Milestone",
      description: "Crossed ₹28,000 today!",
      time: "2 hours ago",
      color: "primary",
    },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-6">Recent Activities</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors duration-200"
          >
            <div className={`w-10 h-10 rounded-lg bg-${activity.color}/10 flex items-center justify-center flex-shrink-0`}>
              <activity.icon className={`w-5 h-5 text-${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1">{activity.title}</h3>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;