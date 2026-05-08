import { useEffect, useMemo, useState } from 'react';
import { Image, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProducts, updateProduct, type Product } from '@/lib/api';

type Draft = {
  price: string;
  image_url: string;
  stock_quantity: string;
};

function toDraft(product: Product): Draft {
  return {
    price: String(product.price ?? 0),
    image_url: product.image_url || '',
    stock_quantity: String(product.stock_quantity ?? 0),
  };
}

export default function InventoryEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    const items = await getProducts();
    setProducts(items);
    setDrafts(Object.fromEntries(items.map((product) => [product.id, toDraft(product)])));
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const dirtyIds = useMemo(() => {
    return products
      .filter((product) => {
        const draft = drafts[product.id];
        if (!draft) return false;
        return (
          draft.price !== String(product.price ?? 0) ||
          draft.image_url !== (product.image_url || '') ||
          draft.stock_quantity !== String(product.stock_quantity ?? 0)
        );
      })
      .map((product) => product.id);
  }, [drafts, products]);

  const updateDraft = (productId: number, patch: Partial<Draft>) => {
    setDrafts((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        ...patch,
      },
    }));
  };

  const saveProduct = async (product: Product) => {
    const draft = drafts[product.id];
    if (!draft) return;

    const price = parseInt(draft.price, 10);
    const stockQuantity = parseInt(draft.stock_quantity, 10);

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Price must be a valid non-negative number');
      return;
    }

    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      toast.error('Quantity must be a valid non-negative number');
      return;
    }

    setSavingId(product.id);
    const result = await updateProduct(product.id, {
      price,
      image_url: draft.image_url,
      stock_quantity: stockQuantity,
    });
    setSavingId(null);

    if (!result) {
      toast.error('Failed to save product');
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, price, image_url: draft.image_url, stock_quantity: stockQuantity }
          : item,
      ),
    );
    toast.success('Product updated');
  };

  const saveAll = async () => {
    for (const product of products.filter((item) => dirtyIds.includes(item.id))) {
      await saveProduct(product);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Editor</h1>
          <p className="text-sm text-gray-500 mt-1">Edit price, image URL, and quantity.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadProducts}>
            <RefreshCw className="w-4 h-4 ml-2" />
            Refresh
          </Button>
          <Button
            onClick={saveAll}
            disabled={dirtyIds.length === 0}
            className="bg-gold hover:bg-gold/90 text-white"
          >
            <Save className="w-4 h-4 ml-2" />
            Save all
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Image</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Quantity</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 min-w-[300px]">Image URL</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const draft = drafts[product.id] || toDraft(product);
                const isDirty = dirtyIds.includes(product.id);
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      {draft.image_url ? (
                        <img src={draft.image_url} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Image className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-400" dir="ltr">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        value={draft.price}
                        onChange={(event) => updateDraft(product.id, { price: event.target.value })}
                        className="w-28"
                        dir="ltr"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        value={draft.stock_quantity}
                        onChange={(event) => updateDraft(product.id, { stock_quantity: event.target.value })}
                        className="w-24"
                        dir="ltr"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={draft.image_url}
                        onChange={(event) => updateDraft(product.id, { image_url: event.target.value })}
                        placeholder="https://..."
                        dir="ltr"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant={isDirty ? 'default' : 'outline'}
                        disabled={!isDirty || savingId === product.id}
                        onClick={() => saveProduct(product)}
                        className={isDirty ? 'bg-gold hover:bg-gold/90 text-white' : ''}
                      >
                        <Save className="w-4 h-4 ml-1" />
                        {savingId === product.id ? 'Saving' : 'Save'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
