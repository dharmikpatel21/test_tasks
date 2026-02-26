"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface Props {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function UserSelect({
  value,
  onValueChange,
  placeholder = "Assign to…",
}: Props) {
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="bg-white/5 border-white/10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {users.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] font-bold bg-primary/30 text-primary">
                  {u.avatar}
                </AvatarFallback>
              </Avatar>
              <span>{u.name}</span>
              <span className="text-muted-foreground text-xs capitalize">
                ({u.role})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
