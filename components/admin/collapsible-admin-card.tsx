"use client";

import { type ReactNode, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CollapsibleAdminCardProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  contentClassName?: string;
};

export function CollapsibleAdminCard({
  title,
  children,
  defaultOpen = true,
  contentClassName,
}: CollapsibleAdminCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="rounded-xl border py-0">
        <CardHeader className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{title}</CardTitle>
            <CollapsibleTrigger
              render={<Button type="button" variant="outline" className="h-8 rounded-md px-2" />}
            >
              <CaretDown className={cn("size-4 transition-transform", open ? "rotate-180" : "")} />
              <span className="sr-only">{open ? "Collapse section" : "Expand section"}</span>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className={cn(contentClassName)}>{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
