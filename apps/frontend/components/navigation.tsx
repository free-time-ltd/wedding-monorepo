"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Heart } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { usePathname } from "next/navigation";
import { useAdminRedirect } from "@/hooks/useAdminRedirect";
import { useTotalUnread } from "@/store/chatStore";
import { Badge } from "@repo/ui/components/ui/badge";

export function Navigation() {
  useAdminRedirect();
  const pathname = usePathname();
  const totalUnreadCount = useTotalUnread();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navItems = [
    { href: "/", label: "Начало" },
    { href: "/guest-select", label: "Портал за Гости" },
    { href: "/chat", label: "Чат", chat: true },
    { href: "/venue", label: "Локация" },
    // { href: "/guests", label: "Списък Гости" },
    { href: "/gallery", label: "Галерия" },
    { href: "/live-feed", label: "Моменти на Живо" },
    { href: "/polls", label: "Познай!" },
    { href: "/guestbook", label: "Пожелания" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-accent fill-accent" />
              <span className="font-serif text-xl text-foreground">
                K &amp; L
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm transition-colors relative",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {!!item.chat && totalUnreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute rounded-full -top-1/2 -right-full"
                      >
                        {totalUnreadCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Off-canvas Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Off-canvas Menu */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-70 bg-background z-50 lg:hidden",
          "transform transition-transform duration-300 ease-in-out",
          "border-l border-border shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-accent fill-accent" />
              <span className="font-serif text-xl text-foreground">
                K &amp; L
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu Items */}
          <div className="flex flex-col py-6 px-4 gap-1 overflow-y-auto">
            {navItems.map((item, index) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-base transition-all py-3 px-4 rounded-lg relative",
                    "transform transition-all duration-300",
                    isActive
                      ? "text-foreground font-semibold bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/5",
                  )}
                  style={{
                    transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center justify-between">
                    {item.label}
                    {!!item.chat && totalUnreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {totalUnreadCount}
                      </Badge>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
