"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row gap-4",
                month: "flex flex-col gap-4",
                month_caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-theme-text",
                nav: "flex items-center gap-1",
                button_previous:
                    "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-theme-border text-theme-text hover:bg-theme-primary transition-colors",
                button_next:
                    "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-theme-border text-theme-text hover:bg-theme-primary transition-colors",
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday: "text-theme-text-muted rounded-md w-9 font-normal text-[0.8rem] text-center",
                week: "flex w-full mt-2",
                day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day_button: "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-md hover:bg-theme-accent/20 hover:text-theme-accent transition-colors text-theme-text cursor-pointer",
                selected:
                    "[&>.rdp-day_button]:bg-theme-accent [&>.rdp-day_button]:text-white [&>.rdp-day_button]:hover:bg-theme-accent [&>.rdp-day_button]:hover:text-white",
                today: "[&>.rdp-day_button]:bg-theme-primary [&>.rdp-day_button]:text-theme-accent [&>.rdp-day_button]:font-semibold",
                outside: "opacity-50",
                disabled: "opacity-50 [&>.rdp-day_button]:cursor-not-allowed",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) =>
                    orientation === "left" ? (
                        <ChevronLeft className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    ),
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
