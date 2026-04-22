import Sidebar from "./Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen p-6" style={{ background: "var(--bg-base)" }}>
        {children}
      </main>
    </div>
  );
}
