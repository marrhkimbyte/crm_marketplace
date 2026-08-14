'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import Link from 'next/link'
import {
  Eye,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'
import { DashboardShell } from '@/components/crm/dashboard-shell'

type Product = {
  id: number
  name: string
  category: string | null
  price: number
  stock: number
  description: string | null
  image: string | null
  created_at: string
  total_sold: number
  total_revenue: number
  total_orders: number
}

type ProductStats = {
  total_products: number
  available_products: number
  out_of_stock: number
  total_stock: number
  total_sold: number
  total_revenue: number
}

type ModalType =
  | 'add'
  | 'edit'
  | 'delete'
  | null

export default function ProdukPage() {
  const [products, setProducts] =
    useState<Product[]>([])

  const [stats, setStats] =
    useState<ProductStats>({
      total_products: 0,
      available_products: 0,
      out_of_stock: 0,
      total_stock: 0,
      total_sold: 0,
      total_revenue: 0,
    })

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [categoryFilter, setCategoryFilter] =
    useState('all')

  const [modal, setModal] =
    useState<ModalType>(null)

  const [selected, setSelected] =
    useState<Product | null>(null)

  const [name, setName] =
    useState('')

  const [category, setCategory] =
    useState('')

  const [price, setPrice] =
    useState('')

  const [stock, setStock] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [imageFile, setImageFile] =
    useState<File | null>(null)

  const [imagePreview, setImagePreview] =
    useState('')

  const [removeImage, setRemoveImage] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  /* =====================================================
     LOAD
  ===================================================== */

  const loadProducts =
    async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await fetch(
            '/api/products',
            {
              cache: 'no-store',
            },
          )

        const result =
          await response.json()

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              'Gagal mengambil data produk.',
          )
        }

        const data =
          result.data || {}

        setProducts(
          Array.isArray(
            data.products,
          )
            ? data.products
            : [],
        )

        setStats({
          total_products:
            Number(
              data.stats
                ?.total_products ||
                0,
            ),

          available_products:
            Number(
              data.stats
                ?.available_products ||
                0,
            ),

          out_of_stock:
            Number(
              data.stats
                ?.out_of_stock ||
                0,
            ),

          total_stock:
            Number(
              data.stats
                ?.total_stock ||
                0,
            ),

          total_sold:
            Number(
              data.stats
                ?.total_sold ||
                0,
            ),

          total_revenue:
            Number(
              data.stats
                ?.total_revenue ||
                0,
            ),
        })
      } catch (err) {
        console.error(err)

        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil data produk.',
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadProducts()
  }, [])

  /* =====================================================
     CATEGORY
  ===================================================== */

  const categories =
    useMemo(() => {
      const values =
        products
          .map(
            (item) =>
              item.category,
          )
          .filter(
            (
              item,
            ): item is string =>
              Boolean(item),
          )

      return Array.from(
        new Set(values),
      ).sort()
    }, [products])

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredProducts =
    useMemo(() => {
      const keyword =
        search
          .toLowerCase()
          .trim()

      return products.filter(
        (product) => {
          const matchSearch =
            !keyword ||
            product.name
              .toLowerCase()
              .includes(keyword) ||
            product.category
              ?.toLowerCase()
              .includes(keyword) ||
            product.description
              ?.toLowerCase()
              .includes(keyword)

          const matchCategory =
            categoryFilter ===
              'all' ||
            product.category ===
              categoryFilter

          return (
            matchSearch &&
            matchCategory
          )
        },
      )
    }, [
      products,
      search,
      categoryFilter,
    ])

  /* =====================================================
     FORM
  ===================================================== */

  const resetForm = () => {
    setName('')
    setCategory('')
    setPrice('')
    setStock('')
    setDescription('')
    setImageFile(null)
    setImagePreview('')
    setRemoveImage(false)
  }

  const openAdd = () => {
    resetForm()
    setSelected(null)
    setModal('add')
  }

  const openEdit = (
    product: Product,
  ) => {
    setSelected(product)

    setName(product.name)
    setCategory(
      product.category || '',
    )

    setPrice(
      String(product.price),
    )

    setStock(
      String(product.stock),
    )

    setDescription(
      product.description || '',
    )

    setImageFile(null)

    setImagePreview(
      product.image || '',
    )

    setRemoveImage(false)

    setModal('edit')
  }

  const openDelete = (
    product: Product,
  ) => {
    setSelected(product)
    setModal('delete')
  }

  const closeModal = () => {
    setModal(null)
    setSelected(null)
    resetForm()
  }

  /* =====================================================
     IMAGE
  ===================================================== */

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0]

    if (!file) return

    if (
      !file.type.startsWith(
        'image/',
      )
    ) {
      alert(
        'File harus berupa gambar.',
      )
      return
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        'Ukuran gambar maksimal 5 MB.',
      )
      return
    }

    setImageFile(file)
    setRemoveImage(false)

    const reader =
      new FileReader()

    reader.onload = () => {
      setImagePreview(
        String(
          reader.result || '',
        ),
      )
    }

    reader.readAsDataURL(file)
  }

  /* =====================================================
     SAVE
  ===================================================== */

  const saveProduct =
    async () => {
      if (!name.trim()) {
        alert(
          'Nama produk wajib diisi.',
        )
        return
      }

      if (
        price === '' ||
        Number(price) < 0
      ) {
        alert(
          'Harga produk tidak valid.',
        )
        return
      }

      if (
        stock === '' ||
        !Number.isInteger(
          Number(stock),
        ) ||
        Number(stock) < 0
      ) {
        alert(
          'Stok produk tidak valid.',
        )
        return
      }

      try {
        setSaving(true)

        const isEdit =
          modal === 'edit'

        const formData =
          new FormData()

        formData.append(
          'name',
          name.trim(),
        )

        formData.append(
          'category',
          category.trim(),
        )

        formData.append(
          'price',
          String(
            Number(price),
          ),
        )

        formData.append(
          'stock',
          String(
            Number(stock),
          ),
        )

        formData.append(
          'description',
          description.trim(),
        )

        if (isEdit) {
          formData.append(
            'id',
            String(
              selected?.id || '',
            ),
          )

          formData.append(
            'removeImage',
            String(
              removeImage,
            ),
          )
        }

        if (imageFile) {
          formData.append(
            'image',
            imageFile,
          )
        }

        const response =
          await fetch(
            '/api/products',
            {
              method: isEdit
                ? 'PUT'
                : 'POST',
              body: formData,
            },
          )

        const result =
          await response.json()

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              'Gagal menyimpan produk.',
          )
        }

        alert(
          isEdit
            ? 'Produk berhasil diperbarui.'
            : 'Produk berhasil ditambahkan.',
        )

        closeModal()

        await loadProducts()
      } catch (err) {
        console.error(err)

        alert(
          err instanceof Error
            ? err.message
            : 'Gagal menyimpan produk.',
        )
      } finally {
        setSaving(false)
      }
    }

  /* =====================================================
     DELETE
  ===================================================== */

  const deleteProduct =
    async () => {
      if (!selected) return

      try {
        setSaving(true)

        const response =
          await fetch(
            '/api/products',
            {
              method: 'DELETE',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                id: selected.id,
              }),
            },
          )

        const result =
          await response.json()

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              'Gagal menghapus produk.',
          )
        }

        alert(
          'Produk berhasil dihapus.',
        )

        closeModal()

        await loadProducts()
      } catch (err) {
        console.error(err)

        alert(
          err instanceof Error
            ? err.message
            : 'Gagal menghapus produk.',
        )
      } finally {
        setSaving(false)
      }
    }

  /* =====================================================
     FORMAT
  ===================================================== */

  const formatRupiah = (
    value: number,
  ) =>
    new Intl.NumberFormat(
      'id-ID',
      {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      },
    ).format(value)

  const formatDate = (
    value: string,
  ) => {
    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '-'
    }

    return date.toLocaleDateString(
      'id-ID',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
  }

  const stockStatus = (
    value: number,
  ) => {
    if (value === 0) {
      return {
        label: 'Habis',
        className:
          'bg-red-50 text-red-600',
      }
    }

    if (value <= 5) {
      return {
        label: 'Stok Menipis',
        className:
          'bg-amber-50 text-amber-600',
      }
    }

    return {
      label: 'Tersedia',
      className:
        'bg-emerald-50 text-emerald-600',
    }
  }

  return (
    <DashboardShell activeItem="produk">
      <div className="space-y-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>CRM</span>
              <span>/</span>
              <span>Produk</span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold">
              Produk
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Kelola seluruh produk marketplace.
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4" />
            Tambah Produk
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Produk"
            value={stats.total_products}
          />

          <StatCard
            label="Produk Tersedia"
            value={
              stats.available_products
            }
          />

          <StatCard
            label="Stok Habis"
            value={
              stats.out_of_stock
            }
            warning={
              stats.out_of_stock > 0
            }
          />

          <StatCard
            label="Total Terjual"
            value={
              stats.total_sold
            }
          />

        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground">
            Total Pendapatan Produk
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {formatRupiah(
              stats.total_revenue,
            )}
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">

          <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-sm font-semibold">
                Daftar Produk
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {filteredProducts.length}{' '}
                produk ditampilkan
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value,
                    )
                  }
                  placeholder="Cari produk..."
                  className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-xs outline-none focus:border-primary"
                />
              </div>

              <select
                value={
                  categoryFilter
                }
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value,
                  )
                }
                className="h-10 rounded-lg border bg-background px-3 text-xs outline-none"
              >
                <option value="all">
                  Semua Kategori
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ),
                )}
              </select>

            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}

              <button
                type="button"
                onClick={
                  loadProducts
                }
                className="ml-3 font-semibold underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />

              <p className="mt-3 text-xs text-muted-foreground">
                Memuat data produk...
              </p>
            </div>
          ) : filteredProducts.length ===
            0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto size-9 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                {search ||
                categoryFilter !==
                  'all'
                  ? 'Produk tidak ditemukan'
                  : 'Belum ada produk'}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {search ||
                categoryFilter !==
                  'all'
                  ? 'Coba ubah pencarian.'
                  : 'Tambahkan produk pertama kamu.'}
              </p>
            </div>
          ) : (
            <div className="divide-y">

              {filteredProducts.map(
                (product) => {
                  const status =
                    stockStatus(
                      product.stock,
                    )

                  return (
                    <div
                      key={
                        product.id
                      }
                      className="flex flex-col gap-4 p-5 hover:bg-muted/20 xl:flex-row xl:items-center"
                    >

                      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/30">

                        {product.image ? (
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="size-full object-cover"
                          />
                        ) : (
                          <Package className="size-7 text-muted-foreground" />
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-sm font-semibold">
                            {
                              product.name
                            }
                          </h3>

                          {product.category && (
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                              {
                                product.category
                              }
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${status.className}`}
                          >
                            {
                              status.label
                            }
                          </span>

                        </div>

                        <p className="mt-2 text-sm font-semibold">
                          {formatRupiah(
                            product.price,
                          )}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-5 text-[11px] text-muted-foreground">

                          <span>
                            Stok:{' '}
                            <strong className="text-foreground">
                              {
                                product.stock
                              }
                            </strong>
                          </span>

                          <span>
                            Terjual:{' '}
                            <strong className="text-foreground">
                              {
                                product.total_sold
                              }
                            </strong>
                          </span>

                          <span>
                            Order:{' '}
                            <strong className="text-foreground">
                              {
                                product.total_orders
                              }
                            </strong>
                          </span>

                        </div>
                      </div>

                      <div className="min-w-[140px]">

                        <p className="text-[10px] text-muted-foreground">
                          Pendapatan
                        </p>

                        <p className="mt-1 text-xs font-semibold">
                          {formatRupiah(
                            product.total_revenue,
                          )}
                        </p>

                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatDate(
                            product.created_at,
                          )}
                        </p>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        <Link
                          href={`/produk/detail?id=${product.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium hover:bg-muted"
                        >
                          <Eye className="size-3.5" />
                          Detail
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              product,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium hover:bg-muted"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDelete(
                              product,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" />
                          Hapus
                        </button>

                      </div>

                    </div>
                  )
                },
              )}

            </div>
          )}

        </section>
      </div>

      {/* =================================================
          ADD / EDIT
      ================================================= */}

      {(modal === 'add' ||
        modal === 'edit') && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

          <button
            type="button"
            onClick={
              closeModal
            }
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b p-5">

              <div>
                <h2 className="text-sm font-semibold">
                  {modal ===
                  'add'
                    ? 'Tambah Produk'
                    : 'Edit Produk'}
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Isi data produk dengan lengkap.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted"
              >
                <X className="size-4" />
              </button>

            </div>

            <div className="space-y-4 p-5">

              <Field
                label="Nama Produk"
                value={name}
                onChange={
                  setName
                }
                placeholder="Contoh: Sepatu Sneakers"
              />

              <Field
                label="Kategori"
                value={
                  category
                }
                onChange={
                  setCategory
                }
                placeholder="Contoh: Fashion"
              />

              <div className="grid gap-4 sm:grid-cols-2">

                <Field
                  label="Harga"
                  value={price}
                  onChange={
                    setPrice
                  }
                  type="number"
                  placeholder="150000"
                />

                <Field
                  label="Stok"
                  value={stock}
                  onChange={
                    setStock
                  }
                  type="number"
                  placeholder="10"
                />

              </div>

              <div>
                <label className="text-xs font-medium">
                  Gambar Produk
                </label>

                <label
                  htmlFor="product-image"
                  className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 px-5 py-8 text-center hover:bg-muted/40"
                >

                  {imagePreview ? (
                    <>
                      <img
                        src={
                          imagePreview
                        }
                        alt="Preview"
                        className="h-48 max-w-full rounded-xl object-contain"
                      />

                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
                        <Upload className="size-4" />
                        Ganti Gambar
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ImageIcon className="size-6" />
                      </div>

                      <p className="mt-3 text-xs font-semibold">
                        Pilih Gambar Produk
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        JPG, PNG, WEBP — maksimal 5 MB
                      </p>
                    </>
                  )}

                </label>

                <input
                  id="product-image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(
                        null,
                      )
                      setImagePreview(
                        '',
                      )
                      setRemoveImage(
                        true,
                      )
                    }}
                    className="mt-2 text-xs font-medium text-red-500 hover:underline"
                  >
                    Hapus gambar
                  </button>
                )}

              </div>

              <div>
                <label className="text-xs font-medium">
                  Deskripsi
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target
                        .value,
                    )
                  }
                  rows={4}
                  placeholder="Deskripsi produk..."
                  className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 border-t p-5">

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={
                  saveProduct
                }
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
              >
                {saving
                  ? 'Menyimpan...'
                  : modal ===
                      'add'
                    ? 'Simpan Produk'
                    : 'Simpan Perubahan'}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =================================================
          DELETE
      ================================================= */}

      {modal ===
        'delete' &&
        selected && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">

            <button
              type="button"
              onClick={
                closeModal
              }
              className="absolute inset-0 bg-black/30"
            />

            <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-5 shadow-2xl">

              <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Trash2 className="size-5" />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                Hapus Produk?
              </h3>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Produk{' '}
                <strong className="text-foreground">
                  {
                    selected.name
                  }
                </strong>{' '}
                akan dihapus.
              </p>

              <div className="mt-5 flex gap-2">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="flex-1 rounded-xl border py-2.5 text-xs font-medium"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    deleteProduct
                  }
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-medium text-white disabled:opacity-60"
                >
                  {saving
                    ? 'Menghapus...'
                    : 'Hapus'}
                </button>

              </div>

            </div>
          </div>
        )}

    </DashboardShell>
  )
}

/* =====================================================
   STAT
===================================================== */

function StatCard({
  label,
  value,
  warning = false,
}: {
  label: string
  value: number
  warning?: boolean
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">

      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold ${
          warning
            ? 'text-red-500'
            : ''
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Data dari database
      </p>

    </div>
  )
}

/* =====================================================
   FIELD
===================================================== */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (
    value: string,
  ) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value,
          )
        }
        placeholder={
          placeholder
        }
        min={
          type === 'number'
            ? '0'
            : undefined
        }
        className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:border-primary"
      />
    </div>
  )
}