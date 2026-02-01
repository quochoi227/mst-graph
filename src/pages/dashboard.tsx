import { AppSidebar } from "../components/sidebar";
import Header from "../components/header";
import Footer from "../components/footer";

function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;
