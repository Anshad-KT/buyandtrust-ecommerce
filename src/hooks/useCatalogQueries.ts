"use client";

import { useQuery } from "@tanstack/react-query";
import { EcomService } from "@/services/api/ecom-service";

const CATALOG_STALE_TIME = 60_000;
const CATALOG_GC_TIME = 10 * 60_000;

export function useAllProductsQuery() {
  return useQuery({
    queryKey: ["catalog", "products", "all"],
    queryFn: () => new EcomService().get_all_products(),
    staleTime: CATALOG_STALE_TIME,
    gcTime: CATALOG_GC_TIME,
  });
}

export function useAllCategoriesQuery() {
  return useQuery({
    queryKey: ["catalog", "categories", "all"],
    queryFn: () => new EcomService().get_all_categories(),
    staleTime: CATALOG_STALE_TIME,
    gcTime: CATALOG_GC_TIME,
  });
}
