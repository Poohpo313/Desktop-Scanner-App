import { useEffect } from "react";
import { useForm } from "react-hook-form";
import TopBar from "../components/TopBar";
import { configApi } from "../api/config.api";
import { useSystemStore } from "../store/systemStore";
import { useNotificationStore } from "../store/notificationStore";
import type { SystemConfig } from "../types";

export default function SystemConfigPage() {
  const { config, setConfig } = useSystemStore();
  const push = useNotificationStore((s) => s.push);
  const { register, handleSubmit, reset } = useForm<SystemConfig>();

  useEffect(() => {
    configApi.get().then((c) => {
      setConfig(c);
      reset(c);
    });
  }, [reset, setConfig]);

  return (
    <>
      <TopBar title="System Configuration" />
      <main className="max-w-2xl space-y-6 p-6">
        <form
          onSubmit={handleSubmit(async (data) => {
            const updated = await configApi.patch(data);
            setConfig(updated);
            push("System config saved", "success");
          })}
          className="space-y-6"
        >
          <section className="rounded-xl border bg-white p-5 space-y-3">
            <h2 className="font-semibold">Policies</h2>
            <label className="block text-sm">
              Max failed login attempts
              <input type="number" {...register("maxFailedLoginAttempts", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="block text-sm">
              User session (minutes)
              <input type="number" {...register("policies.userSessionMinutes", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="block text-sm">
              Admin session (minutes)
              <input type="number" {...register("policies.adminSessionMinutes", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="block text-sm">
              Super Admin session (minutes)
              <input type="number" {...register("policies.superAdminSessionMinutes", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
          </section>

          <section className="rounded-xl border bg-white p-5 space-y-3">
            <h2 className="font-semibold">Locale</h2>
            <label className="block text-sm">
              Language
              <select {...register("language")} className="mt-1 w-full rounded-lg border px-3 py-2">
                <option value="en">English</option>
                <option value="fil">Filipino</option>
              </select>
            </label>
            <label className="block text-sm">
              Timezone
              <input {...register("timezone")} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
          </section>

          <section className="rounded-xl border bg-white p-5 space-y-3">
            <h2 className="font-semibold">Scanner defaults</h2>
            <label className="block text-sm">
              Default DPI
              <input type="number" {...register("scannerDefaults.dpi", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="block text-sm">
              Color mode
              <input {...register("scannerDefaults.colorMode")} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
            <label className="block text-sm">
              Page size
              <input {...register("scannerDefaults.pageSize")} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
          </section>

          <button type="submit" className="rounded-lg bg-brand-mid px-6 py-2 text-white text-sm">
            Save configuration
          </button>
        </form>
        {Object.keys(config).length > 0 && (
          <p className="text-xs text-slate-400">Cloud quota: {String(config.cloudStorageGb)} GB · Backup retention: {String(config.backupRetentionDays)} days</p>
        )}
      </main>
    </>
  );
}
