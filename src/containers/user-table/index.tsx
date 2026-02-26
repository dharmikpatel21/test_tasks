"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  TableHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { debounce } from "@/lib/debounce";
import { User } from "@/lib/user";
import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  users: User[];
};

const UserTable = ({ users }: Props) => {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchUsers, setFetchUsers] = useState<User[] | null>(users);

  const fetchSearchResults = useCallback(
    async (query: string) => {
      setIsLoading(true);
      try {
        const userData = await fetch(`/api/users?q=${query}`);

        if (!userData.ok) {
          throw new Error("No users found");
        }
        const { users } = await userData.json();
        setFetchUsers(users);
        if (users.length === 0) {
          throw new Error("No users found");
        }
      } catch (error: any) {
        setFetchUsers(users);
        toast.error(`${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [users],
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedFetch.current(query);
  };

  const debouncedFetch = useRef(
    debounce((q: string) => fetchSearchResults(q), 1000),
  );

  const handleClearSearch = () => {
    setSearchTerm(null);
    debouncedFetch.current("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by Name"
          value={searchTerm || ""}
          onChange={(e) => handleSearch(e)}
        />
        <Button onClick={() => handleClearSearch()}>Clear Search</Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      ) : (
        <Table className="rounded-3xl border-2 border-separate">
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>User Email</TableHead>
              <TableHead>User Company</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetchUsers?.map((user) => {
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.company.name}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default UserTable;
