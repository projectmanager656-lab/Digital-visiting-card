import { GripIcon, TrashIcon, CheckIcon } from "./Icons";

export function Toggle({ checked, onChange }) {
  return (
    <span
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      className={`w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition shrink-0 ${
        checked ? "bg-indigo-500 justify-end" : "bg-white/10 justify-start"
      }`}
    >
      <span className="w-4 h-4 rounded-full bg-white block shadow" />
    </span>
  );
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-neutral-300">
      <span
        onClick={() => onChange(!checked)}
        className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition shrink-0 ${
          checked ? "bg-indigo-500 border-indigo-500 text-white" : "border-white/20 text-transparent"
        }`}
      >
        <CheckIcon width={12} height={12} strokeWidth={3} />
      </span>
      {label}
    </label>
  );
}

export function Field({ label, optional, on, onToggle, children, hint }) {
  return (
    <div className={`transition ${optional && !on ? "opacity-40" : ""}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-neutral-300">{label}</label>
        {optional && <Toggle checked={on} onChange={onToggle} />}
      </div>
      {(!optional || on) && children}
      {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
    </div>
  );
}

const inputBase =
  "w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40 transition disabled:opacity-40";

export function TextInput(props) {
  return <input {...props} className={`${inputBase} ${props.className || ""}`} />;
}

export function TextArea(props) {
  return <textarea {...props} className={`${inputBase} ${props.className || ""}`} />;
}

export function FileInput({ file, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <span className="text-xs font-medium bg-white/[0.08] hover:bg-white/[0.12] text-neutral-200 px-3 py-1.5 rounded-lg transition shrink-0">
        Choose file
      </span>
      <span className="text-xs text-neutral-500 truncate">{file || "No file chosen"}</span>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files[0])} />
    </label>
  );
}

export function Section({ title, subtitle, icon, action, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-[15px] font-semibold text-neutral-100">{title}</h2>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          {icon && <span className="text-neutral-500">{icon}</span>}
        </div>
      </div>
      {subtitle && <p className="text-xs text-neutral-500 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function TabButton({ index, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap text-sm px-1 pb-3 -mb-px border-b-2 transition ${
        active
          ? "border-indigo-400 text-white font-medium"
          : "border-transparent text-neutral-500 hover:text-neutral-300"
      }`}
    >
      {index}. {label}
    </button>
  );
}

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex items-center bg-white/[0.05] border border-white/10 rounded-lg p-0.5 text-xs">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition ${
            value === o.value ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function CustomFieldRow({ field, iconOptions, onChange, onDelete }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-xl border transition ${field.enabled ? "bg-white/[0.03] border-white/[0.08]" : "bg-white/[0.015] border-white/[0.05] opacity-50"}`}>
      <span className="text-neutral-600 cursor-grab shrink-0 px-0.5">
        <GripIcon />
      </span>
      <select
        value={field.icon}
        onChange={(e) => onChange({ ...field, icon: e.target.value })}
        className="shrink-0 w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 text-indigo-300 flex items-center justify-center text-center appearance-none cursor-pointer text-xs"
      >
        {iconOptions.map((o) => (
          <option key={o.value} value={o.value} className="bg-neutral-900 text-neutral-100">{o.label}</option>
        ))}
      </select>
      <TextInput
        value={field.label}
        onChange={(e) => onChange({ ...field, label: e.target.value })}
        placeholder="Label, e.g. UPI Instant Payment"
        className="flex-1 min-w-0"
      />
      <TextInput
        value={field.value}
        onChange={(e) => onChange({ ...field, value: e.target.value })}
        placeholder="Value or link"
        className="flex-1 min-w-0"
      />
      <Toggle checked={field.enabled} onChange={(v) => onChange({ ...field, enabled: v })} />
      <button type="button" onClick={onDelete} className="text-neutral-600 hover:text-red-400 transition shrink-0 p-1">
        <TrashIcon width={16} height={16} />
      </button>
    </div>
  );
}

export function AppearanceCard({ icon, title, description, checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`text-left flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
        checked ? "bg-indigo-500/[0.07] border-indigo-400/30" : "bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]"
      }`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${checked ? "bg-indigo-500/20 text-indigo-300" : "bg-white/[0.06] text-neutral-400"}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-neutral-100">{title}</span>
          <Toggle checked={checked} onChange={onChange} />
        </span>
        <span className="block text-xs text-neutral-500 mt-0.5">{description}</span>
      </span>
    </div>
  );
}
