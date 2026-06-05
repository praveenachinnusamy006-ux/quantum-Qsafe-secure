import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "https://quantum-backend-vlp8.onrender.com";

async function apiFetch<T>(
  path: string,
  opts?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers || {}),
    },
    ...opts,
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ error: res.statusText }));

    throw new Error(err?.error ?? res.statusText);
  }

  return res.json();
}

// ============================================================================
// ========================= DASHBOARD MODULE =================================
// ============================================================================

export const getGetDashboardSummaryQueryKey = () => ["dashboard-summary"];
export const getGetThreatTimelineQueryKey = () => ["threat-timeline"];
export const getGetRiskDistributionQueryKey = () => ["risk-distribution"];
export const getGetCategoryBreakdownQueryKey = () => ["category-breakdown"];
export const getGetTopVendorsQueryKey = () => ["top-vendors"];

export const useGetDashboardSummary = (opts?: any) =>
  useQuery({
    queryKey: getGetDashboardSummaryQueryKey(),
    queryFn: () => apiFetch("/api/dashboard/summary"),
    ...opts?.query,
  });

export const useGetThreatTimeline = (opts?: any) =>
  useQuery({
    queryKey: getGetThreatTimelineQueryKey(),
    queryFn: () => apiFetch("/api/dashboard/threat-timeline"),
    ...opts?.query,
  });

export const useGetRiskDistribution = (opts?: any) =>
  useQuery({
    queryKey: getGetRiskDistributionQueryKey(),
    queryFn: () => apiFetch("/api/dashboard/risk-distribution"),
    ...opts?.query,
  });

export const useGetCategoryBreakdown = (opts?: any) =>
  useQuery({
    queryKey: getGetCategoryBreakdownQueryKey(),
    queryFn: () => apiFetch("/api/dashboard/category-breakdown"),
    ...opts?.query,
  });

export const useGetTopVendors = (opts?: any) =>
  useQuery({
    queryKey: getGetTopVendorsQueryKey(),
    queryFn: () => apiFetch("/api/dashboard/top-vendors"),
    ...opts?.query,
  });

// ============================================================================
// ========================= VENDORS MODULE ===================================
// ============================================================================

export interface VendorFilters {
  search?: string;
  category?: string;
  minTrustScore?: number;
}

export const getListVendorsQueryKey = (params?: VendorFilters) => ["vendors", params];
export const useListVendors = (params?: VendorFilters, opts?: any) =>
  useQuery({
    queryKey: getListVendorsQueryKey(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append("search", params.search);
      if (params?.category) searchParams.append("category", params.category);
      if (params?.minTrustScore) searchParams.append("minTrustScore", String(params.minTrustScore));
      
      const queryString = searchParams.toString();
      return apiFetch(`/api/vendors${queryString ? `?${queryString}` : ""}`);
    },
    ...opts?.query,
  });

export const getGetVendorQueryKey = (id: string | number) => ["vendor", id];
export const useGetVendor = (id: string | number, opts?: any) =>
  useQuery({
    queryKey: getGetVendorQueryKey(id),
    queryFn: () => apiFetch(`/api/vendors/${id}`),
    enabled: !!id,
    ...opts?.query,
  });

// Trust Score hook used by VendorDetail
export const getGetVendorTrustScoreQueryKey = (id: string | number) => ["vendor-trust-score", id];
export const useGetVendorTrustScore = (id: string | number, opts?: any) =>
  useQuery({
    queryKey: getGetVendorTrustScoreQueryKey(id),
    queryFn: () => apiFetch(`/api/vendors/${id}/trust-score`),
    enabled: !!id,
    ...opts?.query,
  });

// Create Vendor Mutation
export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newVendor: any) =>
      apiFetch("/api/vendors", {
        method: "POST",
        body: JSON.stringify(newVendor),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

// ============================================================================
// ========================= THREATS MODULE ===================================
// ============================================================================

export const getListThreatsQueryKey = (params?: any) => ["threats", params];
export const useListThreats = (params?: any, opts?: any) =>
  useQuery({
    queryKey: getListThreatsQueryKey(params),
    queryFn: () => {
      const searchParams = new URLSearchParams(params);
      const queryString = searchParams.toString();
      return apiFetch(`/api/threats${queryString ? `?${queryString}` : ""}`);
    },
    ...opts?.query,
  });

// ============================================================================
// ========================= DOCUMENTS MODULE =================================
// ============================================================================

export const getListVendorDocumentsQueryKey = (vendorId?: string | number) => ["vendor-documents", vendorId];
export const useListVendorDocuments = (vendorId?: string | number, opts?: any) =>
  useQuery({
    queryKey: getListVendorDocumentsQueryKey(vendorId),
    queryFn: () => {
      const path = vendorId ? `/api/documents?vendorId=${vendorId}` : "/api/documents";
      return apiFetch(path);
    },
    ...opts?.query,
  });

// Document Upload Mutation
export const useUploadVendorDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      apiFetch("/api/documents", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-documents"] });
    },
  });
};

// Certificate Scan Mutation
export const useScanVendorCertificate = () => {
  return useMutation({
    mutationFn: (vendorId: string | number) =>
      apiFetch(`/api/vendors/${vendorId}/scan-cert`, {
        method: "POST",
      }),
  });
};