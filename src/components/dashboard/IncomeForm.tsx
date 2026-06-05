"use client";

import { useState, type FormEvent } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { INCOME_SOURCES } from "@/types";
import { Plus } from "lucide-react";

interface IncomeFormProps {
  onSubmit: (data: { amount: number; source: string; description?: string; createdAt?: string }) => Promise<void>;
}

export default function IncomeForm({ onSubmit }: IncomeFormProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
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
    if (!source) errs.source = "Pilih sumber pemasukan";
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
        source,
        description: description || undefined,
        createdAt,
      });
      setAmount("");
      setSource("");
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
        Tambah Pemasukan
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Jumlah (Rp)"
          type="number"
          placeholder="5000000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          min="0"
          step="1000"
        />
        <Select
          label="Sumber"
          options={INCOME_SOURCES.map((s) => ({ value: s, label: s }))}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          error={errors.source}
        />
        <Input
          label="Tanggal Pemasukan"
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
        />
        <Input
          label="Deskripsi (opsional)"
          type="text"
          placeholder="Gaji bulan Mei"
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
          Simpan Pemasukan
        </Button>
      </form>
    </Card>
  );
}
