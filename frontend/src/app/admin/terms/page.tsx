"use client";

import { api } from "@/lib/api";
import PolicyEditor from "@/components/admin/PolicyEditor";

export default function AdminTermsPage() {
  return (
    <PolicyEditor
      pageTitle="Terms of Service"
      load={api.adminGetTermsContent}
      save={api.adminUpdateTermsContent}
    />
  );
}
