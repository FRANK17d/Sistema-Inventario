interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
    return (
        <header className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {subtitle && (
                    <p className="text-[#94A3B8] text-sm mt-1">{subtitle}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>
    );
}
