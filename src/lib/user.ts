export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
};

export const getALLUsers = async ({
  q,
}: {
  q?: string;
}): Promise<{
  users: User[] | null;
  error: string | null;
}> => {
  try {
    const userData = await fetch(
      `https://jsonplaceholder.typicode.com/users${q ? `?q=${q}` : ""}`,
    );

    if (!userData.ok) {
      throw new Error("Failed to fetch users");
    }
    const users = await userData.json();

    if (users.length === 0) {
      throw new Error("No users found");
    }

    return { users, error: null };
  } catch (error: any) {
    return { users: null, error: error.message };
  }
};
