"use client";

import { api } from "@/lib/api";
import PolicyEditor from "@/components/admin/PolicyEditor";

export default function AdminReturnsPage() {
  return (
    <PolicyEditor
      pageTitle="Returns & Exchanges"
      load={api.adminGetReturnsContent}
      save={api.adminUpdateReturnsContent}
    />
  );
}
