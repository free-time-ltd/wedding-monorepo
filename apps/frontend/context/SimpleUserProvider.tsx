"use client";

import { createContext, ReactNode, useContext } from "react";

export type SimpleUser = {
  id: string;
  name: string;
  email: string;
  admin: boolean;
};

type UserContextType = {
  user: SimpleUser | null;
};

const SimpleUserContext = createContext<UserContextType | undefined>(undefined);

export function SimpleUserProvider({
  user,
  children,
}: {
  user: SimpleUser;
  children: ReactNode;
}) {
  return (
    <SimpleUserContext.Provider value={{ user }}>
      {children}
    </SimpleUserContext.Provider>
  );
}

export function useCurrentUser(): SimpleUser {
  const context = useContext(SimpleUserContext);
  if (!context) {
    throw new Error("useUser must be used within a <UserProvider>");
  }

  return context.user!;
}
