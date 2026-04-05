"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";
import { toast } from "sonner";

import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
} from "@/app/actions/product-actions";
import { CategoryCombobox } from "@/components/admin/category-combobox";
import { CollapsibleAdminCard } from "@/components/admin/collapsible-admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/lib/uploadthing";

const ALL_CATEGORY_NAME = "all";

type AdminProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
};

type AdminCategory = {
  id: string;
  name: string;
  key: string;
};

type ProductManagementClientProps = {
  products: AdminProduct[];
  categories: AdminCategory[];
};

export function ProductManagementClient({
  products,
  categories,
}: ProductManagementClientProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORY_NAME);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);
  const [pendingCategoryDelete, setPendingCategoryDelete] = useState<AdminCategory | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryOptions = useMemo(
    () => categories.map((item) => item.name),
    [categories],
  );

  const productCountByCategory = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [products]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory(ALL_CATEGORY_NAME);
    setPrice("");
    setImageUrl("");
  };

  const onCreateProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      let result;
      try {
        result = await createProduct({
          name,
          description,
          category,
          price: Number(price),
          imageUrl,
        });
      } catch {
        toast.error("Failed to create product.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      resetForm();
      router.refresh();
    });
  };

  const onCreateCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      let result;
      try {
        result = await createCategory({
          name: newCategoryName,
        });
      } catch {
        toast.error("Failed to save category.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setNewCategoryName("");
      router.refresh();
    });
  };

  const onConfirmDeleteProduct = () => {
    if (!pendingDelete) return;

    startTransition(async () => {
      let result;
      try {
        result = await deleteProduct({ productId: pendingDelete.id });
      } catch {
        toast.error("Failed to delete product.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setPendingDelete(null);
      router.refresh();
    });
  };

  const onConfirmDeleteCategory = () => {
    if (!pendingCategoryDelete) return;

    startTransition(async () => {
      let result;
      try {
        result = await deleteCategory({ categoryId: pendingCategoryDelete.id });
      } catch {
        toast.error("Failed to delete category.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setPendingCategoryDelete(null);
      router.refresh();
    });
  };

  return (
    <section className="space-y-4">
      <CollapsibleAdminCard title="Add Product" contentClassName="px-4 pb-4">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onCreateProduct}>
          <Input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Product name"
            className="h-10 rounded-md"
          />
          <CategoryCombobox
            value={category}
            options={categoryOptions}
            onChange={setCategory}
            disabled={isPending}
            placeholder="Choose or create a category"
          />
          <Input
            required
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Price"
            className="h-10 rounded-md"
          />
          <Textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            className="rounded-md md:col-span-2"
          />
          <div className="space-y-2 md:col-span-2">
            <UploadDropzone
              endpoint="productImage"
              appearance={{
                // container: "w-full border border-dashed rounded-md bg-background",
                button: "bg-primary text-primary-foreground p-2 w-sm mb-2",
              }}
              onClientUploadComplete={(res) => {
                const uploadedFile = res?.[0];
                const uploadedUrl = uploadedFile?.ufsUrl;

                if (!uploadedUrl) {
                  toast.error("Upload finished without a file URL.");
                  return;
                }

                setImageUrl(uploadedUrl);
                toast.success("Image uploaded.");
              }}
              onUploadError={(error) => {
                toast.error(error.message);
              }}
            />
            {imageUrl ? (
              <div className="rounded-lg border p-2">
                <img
                  src={imageUrl}
                  alt="Uploaded product"
                  className="h-28 w-full rounded-md object-cover"
                />
              </div>
            ) : null}
          </div>
          <Button type="submit" className="h-10 rounded-md md:col-span-2" disabled={isPending}>
            Create Product
          </Button>
        </form>
      </CollapsibleAdminCard>

      <CollapsibleAdminCard title="Manage Categories" contentClassName="space-y-4 px-4 pb-4">
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onCreateCategory}>
          <Input
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="Add new category"
            className="h-10 rounded-md"
            required
          />
          <Button type="submit" className="h-10 rounded-md" disabled={isPending}>
            Save Category
          </Button>
        </form>

        <Table className="border">
          <TableHeader className="bg-muted/60 text-muted-foreground">
            <TableRow>
              <TableHead className="px-4">Category</TableHead>
              <TableHead className="px-4">Products</TableHead>
              <TableHead className="px-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((item) => {
              const isAllCategory = item.key === ALL_CATEGORY_NAME;

              return (
                <TableRow key={item.id}>
                  <TableCell className="px-4">
                    <Badge variant="outline" className="rounded-full">
                      {item.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4">{productCountByCategory[item.name] ?? 0}</TableCell>
                  <TableCell className="px-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 rounded-md"
                      disabled={isPending || isAllCategory}
                      onClick={() => setPendingCategoryDelete(item)}
                    >
                      <Trash size={14} />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CollapsibleAdminCard>

      <CollapsibleAdminCard title="Products" contentClassName="px-0 pb-0">
        <Table>
          <TableHeader className="bg-muted/60 text-muted-foreground">
            <TableRow>
              <TableHead className="px-4">Product</TableHead>
              <TableHead className="px-4">Category</TableHead>
              <TableHead className="px-4">Price</TableHead>
              <TableHead className="px-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="px-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-medium">{product.name}</p>
                      <p className="truncate text-muted-foreground">{product.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <Badge variant="outline" className="rounded-full">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell className="px-4">LSL {product.price.toFixed(2)}</TableCell>
                <TableCell className="px-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-md"
                    disabled={isPending}
                    onClick={() => setPendingDelete(product)}
                  >
                    <Trash size={14} />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-6 text-muted-foreground" colSpan={4}>
                  No products yet. Add your first product above.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CollapsibleAdminCard>

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="max-w-md rounded-xl border p-5">
          <DialogHeader>
            <DialogTitle>Delete product</DialogTitle>
            <DialogDescription>
              Delete <span className="font-medium text-foreground">{pendingDelete?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onConfirmDeleteProduct} disabled={isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingCategoryDelete)}
        onOpenChange={(open) => !open && setPendingCategoryDelete(null)}
      >
        <DialogContent className="max-w-md rounded-xl border p-5">
          <DialogHeader>
            <DialogTitle>Delete category</DialogTitle>
            <DialogDescription>
              Deleting{" "}
              <span className="font-medium text-foreground">{pendingCategoryDelete?.name}</span>{" "}
              will leave all products under this category with category{" "}
              <span className="font-medium text-foreground">all</span>. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingCategoryDelete(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onConfirmDeleteCategory} disabled={isPending}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
