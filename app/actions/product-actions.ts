"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const ALL_CATEGORY_NAME = "all";

function toCategoryKey(name: string) {
  return name.trim().toLowerCase();
}

async function ensureAllCategory() {
  return prisma.category.upsert({
    where: { key: ALL_CATEGORY_NAME },
    update: { name: ALL_CATEGORY_NAME },
    create: { key: ALL_CATEGORY_NAME, name: ALL_CATEGORY_NAME },
  });
}

async function upsertCategoryByName(rawCategory: string) {
  const trimmed = rawCategory.trim();
  const key = toCategoryKey(trimmed || ALL_CATEGORY_NAME);
  const name = key === ALL_CATEGORY_NAME ? ALL_CATEGORY_NAME : trimmed;

  return prisma.category.upsert({
    where: { key },
    update: { name },
    create: { key, name },
  });
}

async function syncCategoriesFromProducts() {
  const distinctCategories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  const missingCategories = distinctCategories
    .map((item) => item.category.trim())
    .filter(Boolean)
    .map((name) => ({
      key: toCategoryKey(name),
      name: toCategoryKey(name) === ALL_CATEGORY_NAME ? ALL_CATEGORY_NAME : name,
    }));

  if (missingCategories.length > 0) {
    await prisma.category.createMany({
      data: missingCategories,
      skipDuplicates: true,
    });
  }
}

export async function getProductsForAdmin() {
  await requireAdmin("/admin/products");

  await ensureAllCategory();
  await syncCategoriesFromProducts();

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const sortedCategories = [
    ...categories.filter((category) => category.key === ALL_CATEGORY_NAME),
    ...categories.filter((category) => category.key !== ALL_CATEGORY_NAME),
  ];

  return { products, categories: sortedCategories };
}

export async function getProductsForConsumers() {
  return prisma.product.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createProduct(input: {
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
}) {
  await requireAdmin("/admin/products");

  const name = String(input.name ?? "").trim();
  const description = String(input.description ?? "").trim();
  const rawCategory = String(input.category ?? "").trim();
  const imageUrl = String(input.imageUrl ?? "").trim();
  const price = Number(input.price);

  if (!name || !description || !imageUrl) {
    return { success: false, message: "All product fields are required." };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { success: false, message: "Price must be greater than zero." };
  }

  const category = await upsertCategoryByName(rawCategory || ALL_CATEGORY_NAME);

  await prisma.product.create({
    data: {
      name,
      description,
      category: category.name,
      price,
      imageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/products");

  return { success: true, message: "Product created successfully." };
}

export async function createCategory(input: { name: string }) {
  await requireAdmin("/admin/products");

  const name = String(input.name ?? "").trim();
  if (!name) {
    return { success: false, message: "Category name is required." };
  }

  await upsertCategoryByName(name);

  revalidatePath("/admin/products");
  return { success: true, message: "Category saved." };
}

export async function updateCategory(input: {
  categoryId: string;
  name: string;
}) {
  await requireAdmin("/admin/products");

  const categoryId = String(input.categoryId ?? "").trim();
  const nextName = String(input.name ?? "").trim();

  if (!categoryId || !nextName) {
    return { success: false, message: "Category is required." };
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return { success: false, message: "Category not found." };
  }

  if (category.key === ALL_CATEGORY_NAME) {
    return { success: false, message: "The all category cannot be edited." };
  }

  const nextKey = toCategoryKey(nextName);
  if (nextKey === ALL_CATEGORY_NAME) {
    return { success: false, message: "The all category name is reserved." };
  }

  const conflictingCategory = await prisma.category.findUnique({
    where: { key: nextKey },
  });

  if (conflictingCategory && conflictingCategory.id !== category.id) {
    return { success: false, message: "A category with that name already exists." };
  }

  await prisma.$transaction([
    prisma.category.update({
      where: { id: category.id },
      data: {
        key: nextKey,
        name: nextName,
      },
    }),
    prisma.product.updateMany({
      where: {
        category: {
          equals: category.name,
          mode: "insensitive",
        },
      },
      data: {
        category: nextName,
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/products");

  return { success: true, message: "Category updated." };
}

export async function deleteCategory(input: { categoryId: string }) {
  await requireAdmin("/admin/products");

  const categoryId = String(input.categoryId ?? "").trim();
  if (!categoryId) {
    return { success: false, message: "Category is required." };
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return { success: false, message: "Category not found." };
  }

  if (category.key === ALL_CATEGORY_NAME) {
    return { success: false, message: "The all category cannot be deleted." };
  }

  await ensureAllCategory();

  await prisma.$transaction([
    prisma.product.updateMany({
      where: {
        category: {
          equals: category.name,
          mode: "insensitive",
        },
      },
      data: { category: ALL_CATEGORY_NAME },
    }),
    prisma.category.delete({
      where: { id: category.id },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/products");

  return {
    success: true,
    message: `Category "${category.name}" deleted. Products moved to all.`,
  };
}

export async function updateProduct(input: {
  productId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
}) {
  await requireAdmin("/admin/products");

  const productId = String(input.productId ?? "").trim();
  const name = String(input.name ?? "").trim();
  const description = String(input.description ?? "").trim();
  const rawCategory = String(input.category ?? "").trim();
  const imageUrl = String(input.imageUrl ?? "").trim();
  const price = Number(input.price);

  if (!productId) {
    return { success: false, message: "Product is required." };
  }

  if (!name || !description || !imageUrl) {
    return { success: false, message: "All product fields are required." };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { success: false, message: "Price must be greater than zero." };
  }

  const category = await upsertCategoryByName(rawCategory || ALL_CATEGORY_NAME);

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      description,
      category: category.name,
      price,
      imageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/products");

  return { success: true, message: "Product updated." };
}

export async function deleteProduct(input: { productId: string }) {
  await requireAdmin("/admin/products");

  const productId = String(input.productId ?? "").trim();
  if (!productId) {
    return { success: false, message: "Product is required." };
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/");
  revalidatePath("/admin/products");

  return { success: true, message: "Product deleted." };
}
