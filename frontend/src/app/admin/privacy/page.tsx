"use client";

import { api } from "@/lib/api";
import PolicyEditor from "@/components/admin/PolicyEditor";

export default function AdminPrivacyPage() {
  return (
    <PolicyEditor
      pageTitle="Privacy Policy"
      load={api.adminGetPrivacyContent}
      save={api.adminUpdatePrivacyContent}
    />
  );
}
