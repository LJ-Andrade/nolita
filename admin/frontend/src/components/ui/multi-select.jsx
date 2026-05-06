import * as React from "react"
import { Search, X, Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function MultiSelect({ 
  value, 
  onValueChange, 
  options, 
  placeholder = "Seleccionar...", 
  emptyText = "No se encontraron resultados",
  className 
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const triggerRef = React.useRef(null)

  const selectedOptions = options.filter(opt => value?.includes(opt.id))
  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (id) => {
    const newValue = value?.includes(id)
      ? value.filter(v => v !== id)
      : [...(value || []), id]
    onValueChange(newValue)
  }

  const handleRemove = (id, e) => {
    e.stopPropagation()
    onValueChange(value.filter(v => v !== id))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          className={cn(
            "w-full justify-between min-h-[42px] h-auto flex-wrap gap-1 px-3 py-1.5 text-left",
            selectedOptions.length === 0 && "text-muted-foreground"
          )}
        >
          {selectedOptions.length === 0 ? (
            <span>{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((opt) => (
                <Badge 
                  key={opt.id} 
                  variant="secondary" 
                  className="gap-1 pl-2 pr-1 h-6"
                >
                  {opt.hex_color && (
                    <div 
                      className="w-3 h-3 rounded-full border border-muted-foreground/20" 
                      style={{ backgroundColor: opt.hex_color }} 
                    />
                  )}
                  {opt.name}
                  <span
                    role="button"
                    onClick={(e) => handleRemove(opt.id, e)}
                    className="ml-1 rounded-md hover:bg-muted p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))}
            </div>
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto py-1">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value?.includes(opt.id) && "bg-accent"
                )}
              >
                <div className={cn(
                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                  value?.includes(opt.id) && "bg-primary text-primary-foreground"
                )}>
                  {value?.includes(opt.id) && (
                    <Check className="h-3 w-3" />
                  )}
                </div>
                {opt.hex_color && (
                  <div 
                    className="w-3 h-3 rounded-full border border-muted-foreground/20 mr-2" 
                    style={{ backgroundColor: opt.hex_color }} 
                  />
                )}
                {opt.name}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
