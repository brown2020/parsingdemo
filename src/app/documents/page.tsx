import AuthGuard from "@/components/AuthGuard";
import BrowseFiles from "@/components/BrowseFiles";

export default function DocumentsPage() {
  return (
    <AuthGuard>
      <BrowseFiles />
    </AuthGuard>
  );
}
