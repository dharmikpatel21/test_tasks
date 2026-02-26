import UserTable from "@/containers/user-table";
import { getALLUsers } from "@/lib/user";
import React from "react";

const UsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  // const { q } = await searchParams;

  const { error, users } = await getALLUsers({});

  return (
    <section className="container">
      {error && <div className="text-red-500">{error}</div>}

      {users && users.length > 0 && <UserTable users={users} />}
      {/* {users && users.length > 0 && (
        <div>
          {users.map((user) => (
            <div key={user.id} className="border p-4 mb-4">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p>Email: {user.email}</p>
              <p>Phone: {user.phone}</p>
              <p>Company: {user.company.name}</p>
            </div>
          ))}
        </div>
      )} */}
    </section>
  );
};

export default UsersPage;
