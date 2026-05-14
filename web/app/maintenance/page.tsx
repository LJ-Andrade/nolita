import LogoSquare from "components/logo-square";

export const metadata = {
  title: 'Mantenimiento | Nolita',
  description: 'Estamos trabajando para mejorar tu experiencia.',
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-[#1A1A1A]">
      <div className="flex flex-col items-center max-w-md text-center animate-in fade-in duration-1000 slide-in-from-bottom-4">
        <div className="mb-8 scale-150">
          <LogoSquare />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl mb-6 tracking-tight">
          Estamos en mantenimiento
        </h1>
        <div className="w-12 h-[1px] bg-[#1A1A1A] mb-8 opacity-20" />
        <p className="text-[#6B6B6B] leading-relaxed mb-10 text-lg">
          Actualmente estamos realizando tareas de mejora en nuestra plataforma. 
          Volveremos muy pronto con novedades.
        </p>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#9E9E9E] font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-200 animate-pulse" />
          <span>Trabajando en el sitio</span>
        </div>
      </div>
      <footer className="absolute bottom-8">
         <p className="text-[10px] uppercase tracking-[0.3em] text-[#9E9E9E] font-medium">
          Nolita &copy; {process.env.COPYRIGHT_YEAR || "2026"}
        </p>
      </footer>
    </div>
  );
}
