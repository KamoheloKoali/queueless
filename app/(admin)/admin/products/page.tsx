import { getProductsForAdmin } from "@/app/actions/product-actions";
import { ProductManagementClient } from "@/components/admin/product-management-client";

export default async function AdminProductsPage() {
  const { products, categories } = await getProductsForAdmin();

  return <ProductManagementClient products={products} categories={categories} />;
}
