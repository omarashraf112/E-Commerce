import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAsync } from "@/hooks/useAsync";
import { CategoryApi } from "@/api/categories";

export function MainLayout() {
  const { data: categories } = useAsync(() => CategoryApi.getAll(), []);

  return (
    <>
      <Navbar categories={categories || []} />
      <main className="page-enter">
        <Outlet context={{ categories: categories || [] }} />
      </main>
      <Footer />
    </>
  );
}
