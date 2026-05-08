"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const DatePicker = React.forwardRef(({ className, ...props }, ref) => {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date) => {
    props.onSelect?.(date)
    setOpen(false)
  }

  const locale = props.locale || es

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !props.value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {props.value ? format(props.value, "PPP", { locale }) : <span>Seleccionar fecha</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={props.value}
          onSelect={handleSelect}
          disabled={(date) =>
            date < new Date("1900-01-01")
          }
          locale={locale}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
})
DatePicker.displayName = "DatePicker"

export { DatePicker }
