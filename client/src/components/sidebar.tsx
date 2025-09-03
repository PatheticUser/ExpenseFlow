import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Home, 
  Receipt, 
  CheckSquare, 
  Tags, 
  Calendar, 
  BarChart3,
  MoreHorizontal 
} from "lucide-react";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Type the user data properly
  const userData = user as any;

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Financial Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Categories", href: "/categories", icon: Tags },
    { name: "Schedule", href: "/schedule", icon: Calendar },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">ExpenseFlow</h1>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src={userData?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32&crop=face"} 
            alt="User profile" 
            className="w-8 h-8 rounded-full object-cover"
            data-testid="img-user-avatar"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate" data-testid="text-user-name">
              {userData?.firstName && userData?.lastName 
                ? `${userData.firstName} ${userData.lastName}` 
                : userData?.email || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate" data-testid="text-user-email">
              {userData?.email || ""}
            </p>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-user-menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
