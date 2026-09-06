import { padCount } from "@/lib/utils/format";

interface DirectoryProps {
  brandCount: number;
  totalProducts: number;
}

/** "El directorio" (1.4 del handoff): bloque de texto en dos columnas. */
export function Directory({ brandCount, totalProducts }: DirectoryProps) {
  return (
    <section className="hidden gap-[clamp(20px,4vw,32px)] border-b border-line px-page pb-[clamp(38px,6vw,64px)] pt-[clamp(46px,7vw,78px)] md:grid lg:grid-cols-2">
      <h2 className="display max-w-[12ch] text-fluid-section font-extrabold tracking-heading">
        El directorio
      </h2>
      <div className="flex max-w-[46ch] flex-col gap-[18px]">
        <p className="text-fluid-body text-text-2">
          Cada marca mantiene su propia dirección de arte y gestiona sus ventas en su web
          oficial. Aquí descubres la pieza; compras directamente en origen.
        </p>
        <div className="mono flex flex-wrap gap-[clamp(16px,4vw,32px)] border-t border-line pt-2 text-text-3">
          <span>{padCount(brandCount)} Marcas</span>
          <span>{padCount(totalProducts)} Referencias</span>
          <span>Selección editorial</span>
        </div>
      </div>
    </section>
  );
}
