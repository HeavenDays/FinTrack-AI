"use client";

import { useState, type FormEvent } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { EXPENSE_CATEGORIES } from "@/types";
import { Plus } from "lucide-react";

interface ExpenseFormProps {
  onSubmit: (data: { amount: number; category: string; description?: string; createdAt?: string }) => Promise<void>;
}

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [createdAt, setCreatedAt] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || Number(amount) <= 0) errs.amount = "Masukkan jumlah yang valid";
    if (!category) errs.category = "Pilih kategori";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: Number(amount),
        category,
        description: description || undefined,
        createdAt,
      });
      setAmount("");
      setCategory("");
      setDescription("");
      setCreatedAt(new Date().toISOString().slice(0, 10));
      setErrors({});
    } catch {
      setErrors({ form: "Gagal menyimpan. Coba lagi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h3
        className="text-base font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Tambah Pengeluaran
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Jumlah (Rp)"
          type="number"
          placeholder="50000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          min="0"
          step="1000"
        />
        <Select
          label="Kategori"
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          error={errors.category}
        />
        <Input
          label="Tanggal Transaksi"
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
        />
        <Input
          label="Deskripsi (opsional)"
          type="text"
          placeholder="Makan siang di kantin"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.form && (
          <p className="text-xs" style={{ color: "var(--danger)" }}>
            {errors.form}
          </p>
        )}
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Simpan Pengeluaran
        </Button>
      </form>
    </Card>
  );
}
