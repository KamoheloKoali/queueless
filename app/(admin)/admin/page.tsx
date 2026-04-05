import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsersForAdmin } from "@/app/actions/admin-actions";

export default async function AdminUsersPage() {
  const users = await getUsersForAdmin();

  const superAdminCount = users.filter((user) => user.role === "super_admin").length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const memberCount = users.filter((user) => user.role === "users").length;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Card className="rounded-xl border py-0">
          <CardHeader className="px-4 py-3">
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="font-sans text-2xl font-semibold">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border py-0">
          <CardHeader className="px-4 py-3">
            <CardTitle>Super Admins</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="font-sans text-2xl font-semibold">{superAdminCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border py-0">
          <CardHeader className="px-4 py-3">
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="font-sans text-2xl font-semibold">{adminCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border py-0">
          <CardHeader className="px-4 py-3">
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="font-sans text-2xl font-semibold">{memberCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border py-0">
        <CardHeader className="px-4 py-3">
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Verified</th>
                  <th className="px-4 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-2 font-medium">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className="rounded-full">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      {user.emailVerified ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
