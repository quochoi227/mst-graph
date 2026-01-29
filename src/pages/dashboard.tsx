import { AppSidebar } from "../components/sidebar";

function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen flex overflow-y-hidden">
      <AppSidebar />
      {children}
    </div>
  );
}

export default Dashboard;
