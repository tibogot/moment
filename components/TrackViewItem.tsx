"use client";

import { useEffect } from "react";
import { trackViewItem, type AnalyticsItem } from "@/lib/analytics";

/** Sends `view_item` once per product page, if and when analytics is allowed. */
export function TrackViewItem({ item }: { item: AnalyticsItem }) {
  const { item_id, item_name, price } = item;

  useEffect(() => {
    trackViewItem({ item_id, item_name, price });
  }, [item_id, item_name, price]);

  return null;
}
