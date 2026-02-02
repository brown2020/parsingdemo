"use client";

import ProfileComponent from "./ProfileComponent";
import AuthDataDisplay from "./AuthDataDisplay";
import PaymentsPage from "./PaymentsPage";

export default function Profile() {
  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto gap-6">
      <h1 className="text-3xl font-bold">User Profile</h1>
      <AuthDataDisplay />
      <ProfileComponent />
      <PaymentsPage showTitle={true} />
    </div>
  );
}
