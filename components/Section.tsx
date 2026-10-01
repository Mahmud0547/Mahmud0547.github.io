export function Section({
  id,
  title,
  lead,
  dark = false,
  className = "",
  action,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  dark?: boolean;
  className?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-4 pb-[72px] pt-16 lg:pb-[120px] lg:pt-28 ${dark ? "dark-surface bg-deep text-white" : ""} ${className}`}
    >
      <div className="container-page">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="max-w-[720px]">
            <h2 id={`${id}-title`} className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] lg:text-5xl lg:leading-tight">
              {title}
            </h2>
            {lead && <p className={`mt-2.5 text-[17px] leading-normal lg:mt-3 lg:text-lg ${dark ? "text-mist" : "text-soft"}`}>{lead}</p>}
          </div>
          {action}
        </div>
        <div className="mt-7 lg:mt-10">{children}</div>
      </div>
    </section>
  );
}
