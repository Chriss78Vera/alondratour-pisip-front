import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from './ui/input';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectWithSearchProps {
  /** Etiqueta del campo (ej. "País *") */
  label: React.ReactNode;
  /** Opciones disponibles */
  options: SelectOption[];
  /** Opción seleccionada (null si ninguna) */
  value: SelectOption | null;
  /** Se llama al elegir una opción (siempre recibe la opción elegida, no null) */
  onChange: (option: SelectOption) => void;
  /** Placeholder del botón cuando no hay selección */
  triggerPlaceholder?: string;
  /** Placeholder del input de búsqueda */
  searchPlaceholder?: string;
  /** Mensaje cuando no hay resultados filtrados */
  emptyMessage?: string;
  /** Texto cuando el selector está deshabilitado (ej. "Seleccione primero un país") */
  disabledPlaceholder?: string;
  /** Deshabilita el selector */
  disabled?: boolean;
  /** Muestra "Cargando..." en el trigger */
  loading?: boolean;
  /** Clase adicional para el contenedor */
  className?: string;
}

export function SelectWithSearch({
  label,
  options,
  value,
  onChange,
  triggerPlaceholder = 'Buscar...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin resultados',
  disabledPlaceholder,
  disabled = false,
  loading = false,
  className = '',
}: SelectWithSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (open && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase().trim())
  );

  const displayTrigger =
    loading ? 'Cargando...' : disabled && disabledPlaceholder ? disabledPlaceholder : value ? value.label : triggerPlaceholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block mb-2 text-gray-700 text-sm font-medium">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-normal text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0"
      >
        <span className={value && !loading ? '' : 'text-gray-500'}>
          {displayTrigger}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[280px] flex flex-col rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="relative flex items-center shrink-0 border-b border-gray-200 bg-gray-100 rounded-t-md">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingInline: '2vw' }}
              className="h-10 py-2 flex-1 border-0 bg-transparent pl-4 pr-12 rounded-none focus-visible:ring-0 text-sm text-left placeholder:text-gray-500"
            />
            <span style={{ paddingInline: '0.5vw' }} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 pointer-events-none z-10">
              <Search className="h-4 w-4 text-[#1e40af]" />
            </span>
          </div>
          <div className="selector-list-scroll border-t border-gray-200 bg-white">
            <div className="py-1 pl-2 pr-2">
              {filtered.length === 0 ? (
                <p className="py-3 text-left text-sm text-gray-500">{emptyMessage}</p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="select-with-search-option"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
