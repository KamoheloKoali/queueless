"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updatePaymentSettings } from "@/app/actions/checkout-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PaymentSettingsClientProps = {
  ecocashNumber: string;
  mpesaNumber: string;
};

export function PaymentSettingsClient({
  ecocashNumber,
  mpesaNumber,
}: PaymentSettingsClientProps) {
  const [ecoCashValue, setEcoCashValue] = useState(ecocashNumber);
  const [mpesaValue, setMpesaValue] = useState(mpesaNumber);
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      let result;
      try {
        result = await updatePaymentSettings({
          ecocashNumber: ecoCashValue,
          mpesaNumber: mpesaValue,
        });
      } catch {
        toast.error("Failed to update payment settings.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  };

  return (
    <Card className="rounded-xl border py-0">
      <CardHeader className="px-4 py-3">
        <CardTitle>Payment Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        <div className="space-y-2">
          <label className="text-xs font-medium">EcoCash Number</label>
          <Input
            value={ecoCashValue}
            onChange={(event) => setEcoCashValue(event.target.value)}
            placeholder="6xxx xxxx"
            className="h-10 rounded-md"
          />
          <p className="text-xs text-muted-foreground">
            Checkout message: add 2 to amount sent to cover EcoCash charges.
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">M-Pesa Number</label>
          <Input
            value={mpesaValue}
            onChange={(event) => setMpesaValue(event.target.value)}
            placeholder="5xxx xxxx"
            className="h-10 rounded-md"
          />
          <p className="text-xs text-muted-foreground">
            Checkout message: use M-Pesa send option with withdrawal charges included.
          </p>
        </div>
        <Button type="button" className="rounded-md" disabled={isPending} onClick={onSave}>
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
